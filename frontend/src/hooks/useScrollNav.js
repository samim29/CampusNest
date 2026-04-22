/* ============================================================
   CAMPUSNEST — useScrollNav
   Returns `scrolled: boolean` — true when the page has scrolled
   past the threshold. Use to toggle the `.scrolled` class on
   the Navbar for the frosted-glass effect.
   ============================================================ */

import { useState, useEffect } from 'react';
import { NAV_SCROLL_THRESHOLD } from '../utils/constants';

/**
 * @returns {boolean} scrolled
 */
function useScrollNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
    };

    // Run once on mount in case page loads mid-scroll
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrolled;
}

export default useScrollNav;