import { validateEgyptNumber, countryCode as egyptCode } from './countries/egypt.js';
import { validateSaudiNumber, countryCode as saudiCode } from './countries/saudi.js';
import { i18n } from './i18n/i18n.js';

// Initialize language switcher
const langToggle = document.getElementById('langToggle');
const currentLangSpan = document.getElementById('currentLang');

langToggle.addEventListener('click', () => {
    const newLang = i18n.currentLang === 'en' ? 'ar' : 'en';
    i18n.setLanguage(newLang);
    currentLangSpan.textContent = newLang === 'en' ? 'English' : 'العربية';
});

// Update initial language display
currentLangSpan.textContent = i18n.currentLang === 'en' ? 'English' : 'العربية';

// Map country codes to their validation functions
const countryValidators = {
    [egyptCode]: validateEgyptNumber,
    [saudiCode]: validateSaudiNumber
};

let currentData = [];
let headers = [];
let phoneColumns = [];

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
            alert('Error reading file: ' + error.message);
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
            data.push(row);
        }
    }
    
    if (data.length > 0) {
        headers = data[0];
        currentData = data.slice(1);
        identifyPhoneColumns();
        displayData();
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
        displayData();
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

function displayData() {
    const container = document.getElementById('dataContainer');
    
    if (currentData.length === 0) {
        container.innerHTML = '<div class="no-data">No data found in the file.</div>';
        return;
    }

    let html = '<table class="data-table"><thead><tr>';
    headers.forEach((header, index) => {
        const isPhone = phoneColumns.includes(index);
        html += `<th style="${isPhone ? 'background: linear-gradient(45deg, #28a745, #20c997);' : ''}">${header} ${isPhone ? '📱' : ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    currentData.slice(0, 20).forEach(row => {
        html += '<tr>';
        row.forEach((cell, index) => {
            const isPhone = phoneColumns.includes(index);
            const displayCell = isPhone && cell ? `<span class="phone-highlight">${cell}</span>` : cell || '';
            html += `<td>${displayCell}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    
    if (currentData.length > 20) {
        html += `<p style="text-align: center; margin-top: 15px; color: #666;">Showing first 20 rows of ${currentData.length} total rows</p>`;
    }

    container.innerHTML = html;
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadFilteredBtn').style.display = 'block';
    document.getElementById('stats').style.display = 'flex';
}

function updateStats() {
    document.getElementById('totalRows').textContent = currentData.length;
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
    if (!selectedPrefix) {
        alert('Please select a country first!');
        return;
    }

    if (currentData.length === 0) {
        alert('Please upload data first!');
        return;
    }

    console.log('Starting prefix application...');
    console.log('Phone columns found:', phoneColumns);
    console.log('Total rows:', currentData.length);
    
    let updatedCount = 0;
    currentData.forEach((row, rowIndex) => {
        phoneColumns.forEach(colIndex => {
            if (row[colIndex]) {
                let phoneNumber = row[colIndex].toString().trim();
                console.log(`\nProcessing number: ${phoneNumber}`);
                
                // First, remove all non-digit characters except +
                phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
                console.log('After removing non-digits:', phoneNumber);

                // Check if the number already has an international prefix
                if (phoneNumber.startsWith('+')) {
                    // Only modify if it's the same country code we're updating
                    if (phoneNumber.startsWith(selectedPrefix)) {
                        // Keep the number as is, it's already correct
                        return;
                    }
                    // Skip numbers with other country codes
                    return;
                }

                // Use country-specific validation if available
                const validator = countryValidators[selectedPrefix];
                if (validator) {
                    const validatedNumber = validator(phoneNumber);
                    if (validatedNumber) {
                        row[colIndex] = validatedNumber;
                        updatedCount++;
                    }
                } else if (selectedPrefix === '+971') { // UAE (legacy code - should be moved to its own module)
                    if (phoneNumber.startsWith('00971')) {
                        phoneNumber = '+971' + phoneNumber.substring(5);
                        row[colIndex] = phoneNumber;
                        updatedCount++;
                    } else if (phoneNumber.startsWith('0')) {
                        phoneNumber = '+971' + phoneNumber.substring(1);
                        row[colIndex] = phoneNumber;
                        updatedCount++;
                    } else {
                        row[colIndex] = '+971' + phoneNumber;
                        updatedCount++;
                    }
                }
                // Add more country-specific patterns here by creating new country modules
            }
        });
    });

    displayData();
    updateStats();
    alert(`✅ Successfully updated ${updatedCount} phone numbers with ${selectedPrefix} prefix!`);
}

function downloadData() {
    if (currentData.length === 0) {
        alert('No data to download!');
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
        alert('No data to download!');
        return;
    }

    // Filter rows that have at least one formatted phone number
    const filteredData = currentData.filter(row => {
        return phoneColumns.some(colIndex => {
            return row[colIndex] && row[colIndex].toString().startsWith('+');
        });
    });

    if (filteredData.length === 0) {
        alert('No formatted numbers found!');
        return;
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...filteredData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formatted Numbers Only');
    
    const fileName = `formatted_numbers_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
