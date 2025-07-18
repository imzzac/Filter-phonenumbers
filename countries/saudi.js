// Saudi Arabia country code constant
export const countryCode = '+966';

/**
 * Validates and formats a Saudi Arabian phone number.
 * Valid Saudi mobile numbers start with '05' and have 10 digits in total,
 * or start with '5' and have 9 digits in total.
 * @param {string} number - The phone number to validate and format
 * @returns {string|null} The formatted number with country code or null if invalid
 */
export function validateSaudiNumber(number) {
    // Remove any non-digit characters except +
    number = number.replace(/[^\d+]/g, '');
    
    // If number already has country code in international format, validate and return it
    if (number.startsWith('+966')) {
        // Check if it matches Saudi mobile number format after the country code
        if (/^\+966(5\d{8})$/.test(number)) {
            return number;
        }
        return null;
    }

    // Handle local format starting with 05
    if (number.startsWith('05')) {
        number = number.substring(1); // Remove the 0, keep the 5
    }
    
    // For Saudi numbers:
    // - Must start with 5
    // - Must be 9 digits in total after removing prefix
    if (/^5\d{8}$/.test(number)) {
        return '+966' + number;
    }
    
    return null;
}
