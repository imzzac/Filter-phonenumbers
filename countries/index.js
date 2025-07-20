// Central export file for all country modules
export { validateEgyptNumber, countryCode as egyptCode } from './egypt.js';
export { validateSaudiNumber, countryCode as saudiCode } from './saudi.js';
export { validateUAENumber, countryCode as uaeCode } from './uae.js';
export { validateQatarNumber, countryCode as qatarCode } from './qatar.js';

// Country validators mapping
export const countryValidators = {
    '+20': 'validateEgyptNumber',
    '+966': 'validateSaudiNumber', 
    '+971': 'validateUAENumber',
    '+974': 'validateQatarNumber'
}; 