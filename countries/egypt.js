// Egypt country code constant
export const countryCode = '+20';
/**
 * Formats Egyptian phone numbers according to the following rules:
 * 1. Returns as-is if starts with +20
 * 2. Converts local numbers (starting with 010, 011, 012, 015) to +20 format
 * 3. If starts with 10, 11, 12, or 15, adds a 0 and converts to +20 format
 * 4. If not matching Egyptian mobile patterns, returns null
 * @param {string} number - The phone number to format
 * @returns {string|null} The formatted number or null if invalid
 */
export function validateEgyptNumber(number) {
    // Remove any non-digit characters except +
    number = number.replace(/[^\d+]/g, '');

    // 1. Return as-is if starts with +20 and matches mobile pattern
    if (/^\+20(1[0-2]|15)\d{8}$/.test(number)) {
        return number;
    }

    // 2. Local Egyptian numbers: 010, 011, 012, 015
    if (/^01[0-2,5]\d{8}$/.test(number)) {
        return '+20' + number.substring(1);
    }

    // 3. If starts with 10, 11, 12, or 15, add a 0 and convert
    if (/^(10|11|12|15)\d{8}$/.test(number)) {
        return '+20' + number;
    }

    // 4. If starts with 201 and is followed by 9 digits, add +
    if (/^201[0-2,5]\d{8}$/.test(number)) {
        return '+' + number;
    }

    // 5. Not matching Egyptian mobile patterns
    return null;
}
