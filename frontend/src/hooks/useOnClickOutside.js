/* ============================================================
   CAMPUSNEST — useOnClickOutside
   Fires a callback when a click occurs outside the given ref.
   Used by dropdowns, modals, and the mobile nav drawer.

   Usage:
     const ref = useRef(null);
     useOnClickOutside(ref, () => setOpen(false));
   ============================================================ */

import { useEffect } from 'react';

/**
 * @param {React.RefObject<HTMLElement>} ref
 * @param {(event: MouseEvent | TouchEvent) => void} handler
 * @param {boolean} [enabled=true]
 */
function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener('mousedown',  listener, { passive: true });
    document.addEventListener('touchstart', listener, { passive: true });

    return () => {
      document.removeEventListener('mousedown',  listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

export default useOnClickOutside;