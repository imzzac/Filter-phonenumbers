// UAE country code constant
export const countryCode = '+971';

// Known valid UAE mobile prefixes by carrier
const validUAEPrefixes = [
    '050', '052', '055', '056', // Etisalat
    '054', '058'                // du
];

/**
 * Formats UAE phone numbers according to the following rules:
 * 1. Returns as-is if starts with +971 and matches valid mobile pattern
 * 2. Converts local numbers (starting with 05) to +971 format
 * 3. If starts with 5 and is 8 digits long, adds 0 and converts to +971 format
 * 4. If starts with 9715 and is followed by 8 digits, adds + and returns
 * 5. Returns null if not a valid UAE mobile number
 * @param {string} number - The phone number to format
 * @returns {string|null} The formatted number or null if invalid
 */
export function validateUAENumber(number) {
    // Remove all non-digit characters except +
    number = number.replace(/[^\d+]/g, '');

    // 1. Already in +971 format and valid prefix
    if (/^\+9715\d{8}$/.test(number)) {
        const prefix = number.slice(4, 7);
        if (validUAEPrefixes.includes('0' + prefix)) {
            return number;
        }
    }

    // 2. Local UAE format starting with 05XXXXXXXX
    if (/^05\d{8}$/.test(number)) {
        const prefix = number.slice(0, 3);
        if (validUAEPrefixes.includes(prefix)) {
            return '+971' + number.slice(1);
        }
    }

    // 3. Missing 0, starts with 5XXXXXXXX
    if (/^5\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(0, 2);
        if (validUAEPrefixes.includes(prefix)) {
            return '+971' + number;
        }
    }

    // 4. Missing +, starts with 9715XXXXXXXX
    if (/^9715\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(3, 5);
        if (validUAEPrefixes.includes(prefix)) {
            return '+' + number;
        }
    }

    // 5. International format without plus (00971)
    if (/^009715\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(5, 7);
        if (validUAEPrefixes.includes(prefix)) {
            return '+971' + number.slice(5);
        }
    }

    // 6. Not a valid UAE mobile number
    return null;
}
