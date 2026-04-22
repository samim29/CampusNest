/* ============================================================
   CAMPUSNEST — Form Validators
   Each function returns { valid: boolean, message: string }.
   Use in form onSubmit and onChange handlers.
   ============================================================ */

import { INPUT_LIMITS } from './constants';

/** @typedef {{ valid: boolean, message: string }} ValidationResult */

/**
 * Validate email address.
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validateEmail(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Email is required.' };
  }
  if (value.length > INPUT_LIMITS.EMAIL) {
    return { valid: false, message: `Email must be under ${INPUT_LIMITS.EMAIL} characters.` };
  }
  // RFC 5322-inspired — good enough for client-side
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(value)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate password strength.
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validatePassword(value) {
  if (!value) {
    return { valid: false, message: 'Password is required.' };
  }
  if (value.length < INPUT_LIMITS.PASSWORD_MIN) {
    return { valid: false, message: `Password must be at least ${INPUT_LIMITS.PASSWORD_MIN} characters.` };
  }
  if (value.length > INPUT_LIMITS.PASSWORD_MAX) {
    return { valid: false, message: `Password must be under ${INPUT_LIMITS.PASSWORD_MAX} characters.` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate a non-empty text field.
 * @param {string} value
 * @param {string} fieldName - Human-readable name for error message
 * @param {number} [max]
 * @returns {ValidationResult}
 */
export function validateRequired(value, fieldName = 'This field', max = 500) {
  if (!value || !value.trim()) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  if (value.trim().length > max) {
    return { valid: false, message: `${fieldName} must be under ${max} characters.` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate an Indian phone number.
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validatePhone(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Phone number is required.' };
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    return { valid: false, message: 'Enter a valid 10-digit phone number.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate a search query — must not be empty and within limit.
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validateSearch(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Please enter a college or location to search.' };
  }
  if (value.trim().length < 2) {
    return { valid: false, message: 'Search must be at least 2 characters.' };
  }
  return { valid: true, message: '' };
}