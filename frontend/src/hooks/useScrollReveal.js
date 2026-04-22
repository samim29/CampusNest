/* ============================================================
   CAMPUSNEST — useScrollReveal
   Attaches an IntersectionObserver to all elements that have
   the `.reveal` class inside the given containerRef.
   Call once per page in the page component's useEffect.
   ============================================================ */

import { useEffect } from 'react';
import { REVEAL_OBSERVER_OPTIONS } from '../utils/constants';

/**
 * @param {React.RefObject<HTMLElement>} [containerRef]
 * Pass a ref to scope the observer to a subtree.
 * Defaults to the entire document if omitted.
 */
function useScrollReveal(containerRef) {
  useEffect(() => {
    const root = containerRef?.current ?? document;

    const elements = root.querySelectorAll('.reveal');

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once visible, no need to keep observing
          observer.unobserve(entry.target);
        }
      });
    }, REVEAL_OBSERVER_OPTIONS);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);
}

export default useScrollReveal;