// Egypt country code constant
export const countryCode = '+20';

/**
 * Validates and formats an Egyptian phone number.
 * Valid Egyptian mobile numbers start with '01' and have 11 digits in total.
 * @param {string} number - The phone number to validate and format
 * @returns {string|null} The formatted number with country code or null if invalid
 */
export function validateEgyptNumber(number) {
    // Remove any non-digit characters except +
    number = number.replace(/[^\d+]/g, '');
    
    // If number already has country code in international format, validate and return it
    if (number.startsWith('+20')) {
        // Check if it matches Egyptian mobile number format after the country code
        if (/^\+20(1[0-2]|15)\d{8}$/.test(number)) {
            return number;
        }
        return null;
    }
    
    // Remove leading 0 if present
    if (number.startsWith('0')) {
        number = number.substring(1);
    }
    
    // For Egyptian numbers:
    // - Must start with 1
    // - Must be followed by 0, 1, 2, or 5
    // - Must be 10 digits in total after removing prefix
    if (/^1[0-2,5]\d{8}$/.test(number)) {
        return '+20' + number;
    }
    
    return null;
}
