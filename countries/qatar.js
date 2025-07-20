// Qatar country code constant
export const countryCode = '+974';

// Known valid Qatar mobile prefixes by carrier
const validQatarPrefixes = [
    '030', '033', '050', '055', // Ooredoo
    '066', '070', '077'         // Vodafone Qatar
];

/**
 * Formats Qatar phone numbers according to the following rules:
 * 1. Returns as-is if starts with +974 and matches valid mobile pattern
 * 2. Converts local numbers (starting with 0) to +974 format
 * 3. If starts with valid prefix without 0, adds 0 and converts to +974 format
 * 4. If starts with 974 and is followed by 8 digits, adds + and returns
 * 5. Returns null if not a valid Qatar mobile number
 * @param {string} number - The phone number to format
 * @returns {string|null} The formatted number or null if invalid
 */
export function validateQatarNumber(number) {
    // Remove all non-digit characters except +
    number = number.replace(/[^\d+]/g, '');

    // 1. Already in +974 format and valid prefix
    if (/^\+974\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(4, 6);
        if (validQatarPrefixes.includes(prefix)) {
            return number;
        }
    }

    // 2. Local Qatar format starting with 0XXXXXXXX
    if (/^0\d{8}$/.test(number)) {
        const prefix = number.slice(0, 3);
        if (validQatarPrefixes.includes(prefix)) {
            return '+974' + number.slice(1);
        }
    }

    // 3. Missing 0, starts with valid prefix (30, 33, 50, 55, 66, 70, 77)
    if (/^(30|33|50|55|66|70|77)\d{6}$/.test(number)) {
        const prefix = '0' + number.slice(0, 2);
        if (validQatarPrefixes.includes(prefix)) {
            return '+974' + number;
        }
    }

    // 4. Missing +, starts with 974XXXXXXXX
    if (/^974\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(3, 5);
        if (validQatarPrefixes.includes(prefix)) {
            return '+' + number;
        }
    }

    // 5. International format without plus (00974)
    if (/^00974\d{8}$/.test(number)) {
        const prefix = '0' + number.slice(5, 7);
        if (validQatarPrefixes.includes(prefix)) {
            return '+974' + number.slice(5);
        }
    }

    // 6. Not a valid Qatar mobile number
    return null;
} 