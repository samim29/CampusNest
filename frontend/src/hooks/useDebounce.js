/* ============================================================
   CAMPUSNEST — useDebounce
   Delays updating a value until the user stops typing.
   Extracted as a standalone hook since it's used in
   5+ components across the app.

   Usage:
     const debouncedQuery = useDebounce(searchQuery, 300);
   ============================================================ */

import { useState, useEffect } from 'react';

/**
 * @template T
 * @param {T}      value  - The value to debounce
 * @param {number} delay  - Delay in milliseconds (default: 300)
 * @returns {T} Debounced value
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;