// Saudi Arabia country code constant
export const countryCode = '+966';

// Known valid Saudi mobile prefixes by carrier
const validSaudiPrefixes = [
    '050', '053', '055', // STC
    '054', '056',        // Mobily
    '058', '059'         // Zain
];

/**
 * Formats Saudi Arabian phone numbers according to the following rules:
 * 1. Returns as-is if starts with +966 and matches valid mobile pattern
 * 2. Converts local numbers (starting with 05) to +966 format
 * 3. If starts with 5 and is 9 digits long, adds 0 and converts to +966 format
 * 4. If starts with 9665 and is followed by 8 digits, adds + and returns
 * 5. Returns null if not a valid Saudi mobile number
 * @param {string} number - The phone number to format
 * @returns {string|null} The formatted number or null if invalid
 */
export function validateSaudiNumber(number) {
    // Remove all non-digit characters except +
    number = number.replace(/[^\d+]/g, '');

    // 1. Already in +966 format and valid prefix
    if (/^\+9665\d{8}$/.test(number)) {
        const prefix = number.slice(4, 7);
        if (validSaudiPrefixes.includes('0' + prefix)) {
            return number;
        }
    }

    // 2. Local Saudi format starting with 05XXXXXXXX
    if (/^05\d{8}$/.test(number)) {
        const prefix = number.slice(0, 3);
        if (validSaudiPrefixes.includes(prefix)) {
            return '+966' + number.slice(1);
        }
    }

    // 3. Missing 0, starts with 5XXXXXXXX
    if (/^5\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(0, 2);
        if (validSaudiPrefixes.includes(prefix)) {
            return '+966' + number;
        }
    }

    // 4. Missing +, starts with 9665XXXXXXXX
    if (/^9665\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(3, 5);
        if (validSaudiPrefixes.includes(prefix)) {
            return '+' + number;
        }
    }

    // 5. Not a valid Saudi mobile number
    return null;
}