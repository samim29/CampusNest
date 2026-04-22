/* ============================================================
   CAMPUSNEST — Input Sanitization
   Strips dangerous characters before any value is used
   in the DOM, API calls, or URL params.
   This is a FIRST LINE of defence — backend must also validate.
   ============================================================ */

import { INPUT_LIMITS } from './constants';

/**
 * Strips HTML tags and dangerous characters from a string.
 * Use on every user-supplied text value before rendering or sending.
 *
 * @param {string} value  - Raw user input
 * @param {number} [maxLen] - Max allowed length (defaults to 500)
 * @returns {string} Sanitized string
 */
export function sanitizeText(value, maxLen = 500) {
  if (typeof value !== 'string') return '';

  return value
    .slice(0, maxLen)                       // enforce length cap first
    .replace(/<[^>]*>/g, '')               // strip HTML tags
    .replace(/[<>"'`]/g, (c) => ({         // encode remaining dangerous chars
      '<':  '&lt;',
      '>':  '&gt;',
      '"':  '&quot;',
      "'":  '&#x27;',
      '`':  '&#x60;',
    }[c]))
    .trim();
}

/**
 * Sanitize a search query — allows letters, digits, spaces,
 * commas, hyphens. Everything else is stripped.
 *
 * @param {string} value
 * @returns {string}
 */
export function sanitizeSearch(value) {
  if (typeof value !== 'string') return '';

  return value
    .slice(0, INPUT_LIMITS.SEARCH_QUERY)
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s,\-'.]/g, '') // allow Devanagari
    .trim();
}

/**
 * Sanitize an email address (basic normalisation).
 * Full validation happens in validators.js.
 *
 * @param {string} value
 * @returns {string}
 */
export function sanitizeEmail(value) {
  if (typeof value !== 'string') return '';

  return value
    .slice(0, INPUT_LIMITS.EMAIL)
    .toLowerCase()
    .trim()
    .replace(/\s/g, ''); // remove any whitespace
}

/**
 * Sanitize a phone number — keep only digits and + prefix.
 *
 * @param {string} value
 * @returns {string}
 */
export function sanitizePhone(value) {
  if (typeof value !== 'string') return '';

  return value
    .slice(0, INPUT_LIMITS.PHONE + 2)
    .replace(/[^\d+\-\s()]/g, '')
    .trim();
}

/**
 * Strip all HTML from a string (for safe innerHTML use).
 * Prefer React's JSX rendering over innerHTML wherever possible.
 *
 * @param {string} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (typeof html !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}