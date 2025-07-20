import { 
    validateEgyptNumber, egyptCode,
    validateSaudiNumber, saudiCode,
    validateUAENumber, uaeCode,
    validateQatarNumber, qatarCode
} from './countries/index.js';
import { i18n } from './i18n/i18n.js';

// Initialize language switcher
const langToggle = document.getElementById('langToggle');
const currentLangSpan = document.getElementById('currentLang');

langToggle.addEventListener('click', () => {
    const newLang = i18n.currentLang === 'en' ? 'ar' : 'en';
    i18n.setLanguage(newLang);
    currentLangSpan.textContent = newLang === 'en' ? '🇺🇸' : '🇪🇬';
});

// Update initial language display
currentLangSpan.textContent = i18n.currentLang === 'en' ? '🇺🇸' : '🇪🇬';

// Map country codes to their validation functions
const countryValidators = {
    [egyptCode]: validateEgyptNumber,
    [saudiCode]: validateSaudiNumber,
    [uaeCode]: validateUAENumber,
    [qatarCode]: validateQatarNumber
};

let currentData = [];
let headers = [];
let phoneColumns = [];

// Message card system
function showMessage(message, type = 'info') {
    const container = document.getElementById('dataContainer');
    
    // For warnings, remove existing warning messages to replace with new one
    if (type === 'warning') {
        const existingWarnings = container.querySelectorAll('.message-warning');
        existingWarnings.forEach(warning => warning.remove());
    }
    
    // Check if this exact message is already displayed
    const existingMessages = container.querySelectorAll('.message-card');
    for (let existingMsg of existingMessages) {
        const existingText = existingMsg.querySelector('.message-text').textContent;
        const existingType = existingMsg.classList.contains(`message-${type}`);
        
        if (existingText === message && existingType) {
            // Message already exists, don't show duplicate
            return;
        }
    }
    
    const messageCard = document.createElement('div');
    messageCard.className = `message-card message-${type}`;
    
    const messageIcon = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    messageCard.innerHTML = `
        <div class="message-icon">${messageIcon[type] || messageIcon.info}</div>
        <div class="message-text">${message}</div>
        <button class="message-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Insert at the top of the container
    container.insertBefore(messageCard, container.firstChild);
    
    // Auto-remove after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            if (messageCard.parentElement) {
                messageCard.remove();
            }
        }, 5000);
    }
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.querySelector('.apply-btn').addEventListener('click', applyPrefix);
    document.getElementById('downloadBtn').addEventListener('click', downloadData);
    document.getElementById('downloadFilteredBtn').addEventListener('click', downloadFilteredData);
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = `Selected: ${file.name}`;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (file.name.endsWith('.csv')) {
                parseCSV(e.target.result);
            } else {
                parseExcel(e.target.result);
            }
        } catch (error) {
            showMessage('Error reading file: ' + error.message, 'error');
        }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
            // Skip row if all cells are non-numeric (likely header)
            const hasNumber = row.some(cell => /\d{6,}/.test(cell));
            if (hasNumber) {
                data.push(row);
            }
        }
    }

    if (data.length > 0) {
        // If first row is header (contains no numbers), skip it
        const firstRowIsHeader = data[0].every(cell => !/\d{6,}/.test(cell));
        if (firstRowIsHeader) {
            data.shift();
        }
        headers = [];
        currentData = data;
        identifyPhoneColumns();
        displayData(false); // Don't show formatted numbers initially
        updateStats();
    }
}

function parseExcel(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length > 0) {
        headers = jsonData[0];
        currentData = jsonData.slice(1);
        identifyPhoneColumns();
        displayData(false); // Don't show formatted numbers initially
        updateStats();
    }
}

function identifyPhoneColumns() {
    phoneColumns = [];
    console.log('Headers found:', headers);
    headers.forEach((header, index) => {
        if (!header) return;
        const headerLower = header.toString().toLowerCase();
        console.log(`Checking header [${index}]:`, header, headerLower);
        
        // If the header itself is a number or the column contains numbers
        if (/^\d/.test(header) || currentData.some(row => row[index] && /^\d{10,}/.test(row[index].toString()))) {
            console.log('Column contains phone numbers, treating as phone column:', index);
            phoneColumns.push(index);
            return;
        }
        
        if (headerLower.includes('phone') || 
            headerLower.includes('mobile') || 
            headerLower.includes('number') ||
            headerLower.includes('tel') ||
            headerLower.includes('رقم') ||
            headerLower.includes('هاتف') ||
            headerLower.includes('جوال') ||
            headerLower.includes('contact') ||
            /^\s*phones?\s*$/i.test(headerLower)) {  // Match exact "phone" or "phones"
            console.log('Found phone column:', header);
            phoneColumns.push(index);
        }
    });
}

function displayData(showFormatted = true) {
    const container = document.getElementById('dataContainer');
    const statsContainer = document.getElementById('stats');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadFilteredBtn = document.getElementById('downloadFilteredBtn');
    
    if (currentData.length === 0) {
        container.innerHTML = '<div class="no-data" data-i18n="noData">No data found in the file.</div>';
        statsContainer.style.display = 'none';
        downloadBtn.style.display = 'none';
        downloadFilteredBtn.style.display = 'none';
        return;
    }

    // Always show stats and download buttons when we have data
    statsContainer.style.display = 'flex';
    downloadBtn.style.display = 'block';
    downloadFilteredBtn.style.display = 'block';
    
    // When first loading the file, just show success message
    if (!showFormatted) {
        container.innerHTML = '<div class="success-message" style="text-align: center; padding: 20px; color: #28a745;"><span>✅ File loaded successfully!</span></div>';
        return;
    }

    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadFilteredBtn').style.display = 'block';
    document.getElementById('stats').style.display = 'flex';
}

function updateStats() {
    // Count total phone numbers (not just rows)
    let totalNumbers = 0;
    currentData.forEach(row => {
        phoneColumns.forEach(colIndex => {
            if (row[colIndex] && row[colIndex].toString().trim()) {
                totalNumbers++;
            }
        });
    });
    document.getElementById('totalRows').textContent = totalNumbers;
    document.getElementById('phoneColumns').textContent = phoneColumns.length;
    
    let prefixedCount = 0;
    currentData.forEach(row => {
        phoneColumns.forEach(colIndex => {
            if (row[colIndex] && row[colIndex].toString().startsWith('+')) {
                prefixedCount++;
            }
        });
    });
    document.getElementById('prefixedRows').textContent = prefixedCount;
}

function applyPrefix() {
    const selectedPrefix = document.getElementById('countrySelect').value;
    const hasData = currentData.length > 0;
    
    if (!selectedPrefix && !hasData) {
        showMessage('Please upload data and select a country first!', 'warning');
        return;
    } else if (!hasData) {
        showMessage('Please upload data first!', 'warning');
        return;
    } else if (!selectedPrefix) {
        showMessage('Please select a country first!', 'warning');
        return;
    }

    console.log('Starting prefix application...');
    console.log('Phone columns found:', phoneColumns);
    console.log('Total rows:', currentData.length);
    
    let updatedCount = 0;
    let changedNumbers = []; // Track changed numbers

    currentData.forEach((row, rowIndex) => {
        phoneColumns.forEach(colIndex => {
            if (row[colIndex]) {
                let phoneNumber = row[colIndex].toString().trim();
                const originalNumber = phoneNumber; // Store original number
                console.log(`\nProcessing number: ${phoneNumber}`);
                
                // First, remove all non-digit characters except +
                phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
                console.log('After removing non-digits:', phoneNumber);

                // Check if the number already has an international prefix
                if (phoneNumber.startsWith('+')) {
                    console.log('Number already has prefix:', phoneNumber);
                    return; // Skip numbers that already have a prefix
                }

                let wasUpdated = false;
                // Use country-specific validation if available
                const validator = countryValidators[selectedPrefix];
                if (validator) {
                    const validatedNumber = validator(phoneNumber);
                    if (validatedNumber) {
                        row[colIndex] = validatedNumber;
                        wasUpdated = true;
                    }
                }

                if (wasUpdated) {
                    updatedCount++;
                    changedNumbers.push({
                        original: originalNumber,
                        formatted: row[colIndex]
                    });
                }
            }
        });
    });

    // Update stats first to show the current numbers
    updateStats();
    document.getElementById('stats').style.display = 'flex';
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadFilteredBtn').style.display = 'block';

    // Show preview of changed numbers
    const container = document.getElementById('dataContainer');
    let previewHtml = '<div class="preview-container">';
    
    if (changedNumbers.length > 0) {
        const numberToShow = Math.min(10, changedNumbers.length);
        previewHtml += `
            <div class="preview-title">📱 Preview of Changed Numbers (${numberToShow} of ${changedNumbers.length})</div>
            <div class="preview-table">
                <div class="preview-header">
                    <div class="preview-col">Original Number</div>
                    <div class="preview-col">Formatted Number</div>
                </div>`;

        changedNumbers.slice(0, 10).forEach(number => {
            previewHtml += `
                <div class="preview-row">
                    <div class="preview-col">${number.original}</div>
                    <div class="preview-col formatted">${number.formatted}</div>
                </div>`;
        });

        previewHtml += '</div></div>';
    } else {
        previewHtml = '<div class="no-changes">No numbers were changed. They might already have the correct format.</div>';
    }

    container.innerHTML = previewHtml;
    
    if (updatedCount > 0) {
        showMessage(`Successfully updated ${updatedCount} phone numbers with ${selectedPrefix} prefix!`, 'success');
    } else {
        showMessage('No numbers were updated. They might already have the correct format.', 'info');
    }
}

function downloadData() {
    if (currentData.length === 0) {
        showMessage('No data to download!', 'warning');
        return;
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...currentData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Updated Data');
    
    const fileName = `updated_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function downloadFilteredData() {
    if (currentData.length === 0) {
        showMessage('No data to download!', 'warning');
        return;
    }

    // Filter rows that have at least one formatted phone number
    const filteredData = currentData.filter(row => {
        return phoneColumns.some(colIndex => {
            return row[colIndex] && row[colIndex].toString().startsWith('+');
        });
    });

    if (filteredData.length === 0) {
        showMessage('No formatted numbers found!', 'info');
        return;
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...filteredData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formatted Numbers Only');
    
    const fileName = `formatted_numbers_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
