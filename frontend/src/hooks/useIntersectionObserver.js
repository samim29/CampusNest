/* ============================================================
   CAMPUSNEST — useIntersectionObserver
   Low-level hook that wraps IntersectionObserver.
   Used by useScrollReveal internally, but also useful for
   lazy-loading images and infinite scroll.

   Usage:
     const [ref, isIntersecting] = useIntersectionObserver({
       threshold: 0.1,
       once: true,
     });
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {{
 *   threshold?:   number | number[],
 *   rootMargin?:  string,
 *   root?:        Element | null,
 *   once?:        boolean,
 * }} options
 * @returns {[React.RefCallback<Element>, boolean]}
 */
function useIntersectionObserver({
  threshold  = 0,
  rootMargin = '0px',
  root       = null,
  once       = false,
} = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef(null);
  const elementRef  = useRef(null);

  const ref = useCallback((node) => {
    /* Disconnect previous observer */
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    elementRef.current = node;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const entering = entry.isIntersecting;
        setIsIntersecting(entering);

        /* Unobserve after first intersection if once=true */
        if (once && entering && observerRef.current) {
          observerRef.current.unobserve(node);
        }
      },
      { threshold, rootMargin, root }
    );

    observerRef.current.observe(node);
  }, [threshold, rootMargin, root, once]);

  /* Clean up on unmount */
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isIntersecting];
}

export default useIntersectionObserver;