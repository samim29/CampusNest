/* ============================================================
   CAMPUSNEST — Formatters
   Pure functions for displaying data consistently.
   No side effects, no imports.
   ============================================================ */

/**
 * Format a price in Indian Rupees.
 * @param {number} amount
 * @param {boolean} [compact=false]  — use ₹1.2L instead of ₹1,20,000
 * @returns {string}
 */
export function formatPrice(amount, compact = false) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹—';

  if (compact) {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
  }

  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format a price range.
 * @param {number} min
 * @param {number} max
 * @returns {string}  e.g. "₹8,000 – ₹15,000"
 */
export function formatPriceRange(min, max) {
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/**
 * Format a distance in kilometres.
 * @param {number} km
 * @returns {string}  e.g. "1.2 km" or "800 m"
 */
export function formatDistance(km) {
  if (typeof km !== 'number' || isNaN(km)) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(/\.0$/, '')} km`;
}

/**
 * Format a star rating to one decimal place.
 * @param {number} rating
 * @returns {string}  e.g. "4.5"
 */
export function formatRating(rating) {
  if (typeof rating !== 'number' || isNaN(rating)) return '—';
  return rating.toFixed(1);
}

/**
 * Format a date string for display.
 * @param {string|Date} date
 * @param {'short'|'long'|'relative'} [style='short']
 * @returns {string}
 */
export function formatDate(date, style = 'short') {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';

    if (style === 'relative') {
      const diffMs  = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr  = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);

      if (diffMin < 1)   return 'Just now';
      if (diffMin < 60)  return `${diffMin}m ago`;
      if (diffHr  < 24)  return `${diffHr}h ago`;
      if (diffDay < 7)   return `${diffDay}d ago`;
    }

    if (style === 'long') {
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day:     'numeric',
        month:   'long',
        year:    'numeric',
      });
    }

    /* short */
    return d.toLocaleDateString('en-IN', {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Truncate a string to a max length, appending '…'.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 80) {
  if (typeof str !== 'string') return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1).trimEnd() + '…';
}

/**
 * Pluralise a word based on count.
 * @param {number}  count
 * @param {string}  singular
 * @param {string}  [plural]   defaults to singular + 's'
 * @returns {string}  e.g. "1 PG" / "3 PGs"
 */
export function pluralise(count, singular, plural) {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Convert a rating number to a star string.
 * @param {number} rating  0–5
 * @returns {string}  e.g. "★★★★☆"
 */
export function ratingToStars(rating) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}