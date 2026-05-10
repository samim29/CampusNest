/* ============================================================
   CAMPUSNEST — useMediaQuery
   Returns true when the given CSS media query matches.
   Server-safe (defaults to false on non-browser environments).

   Usage:
     const isMobile  = useMediaQuery('(max-width: 640px)');
     const isTablet  = useMediaQuery('(max-width: 1024px)');
     const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
   ============================================================ */

import { useState, useEffect } from 'react';

/**
 * @param {string} query - CSS media query string
 * @returns {boolean}
 */
function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const mq      = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    /* Modern browsers */
    mq.addEventListener('change', handler);

    /* Ensure state is correct after mount */
    setMatches(mq.matches);

    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default useMediaQuery;