/**
 * Utility functions for phone number handling
 */

/**
 * Normalizes phone number by adding default country code if missing
 * @param input - Email or phone number input from user
 * @param defaultCountryCode - Default country code to use (default: '+91' for India)
 * @returns Normalized identifier (email unchanged, phone with country code)
 */
export const normalizePhoneNumber = (input: string, defaultCountryCode: string = '+91'): string => {
  // If it's an email, return as is
  if (input.includes('@')) {
    return input;
  }
  
  // If it's a phone number
  const cleanedInput = input.replace(/\s+/g, ''); // Remove spaces
  
  // If it already starts with +, return as is
  if (cleanedInput.startsWith('+')) {
    return cleanedInput;
  }
  
  // If it's just digits, check if it needs country code
  if (/^\d+$/.test(cleanedInput)) {
    // If it's 10 digits, likely local number without country code
    if (cleanedInput.length === 10) {
      return defaultCountryCode + cleanedInput;
    }
    // If it's more than 10 digits, might already include country code without +
    if (cleanedInput.length > 10) {
      return '+' + cleanedInput;
    }
  }
  
  return cleanedInput;
};

/**
 * Validates if the input is a valid phone number or email
 * @param input - The input to validate
 * @returns boolean indicating if input is valid
 */
export const isValidIdentifier = (input: string): boolean => {
  // Email validation
  if (input.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }
  
  // Phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(input.replace(/\s+/g, ''));
};

/**
 * Formats phone number for display
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneForDisplay = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // If it's an email, return as is
  if (phoneNumber.includes('@')) {
    return phoneNumber;
  }
  
  // Basic phone formatting (can be enhanced based on country)
  const cleaned = phoneNumber.replace(/\s+/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    // Indian number formatting: +91 XXXXX XXXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  
  return cleaned;
};

export default {
  normalizePhoneNumber,
  isValidIdentifier,
  formatPhoneForDisplay,
};