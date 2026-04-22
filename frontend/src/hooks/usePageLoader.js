/* ============================================================
   CAMPUSNEST — usePageLoader
   Manages the full-page loading overlay.
   Returns `loading: boolean` — false after the window `load`
   event fires + the configured delay.
   ============================================================ */

import { useState, useEffect } from 'react';
import { LOADER_HIDE_DELAY } from '../utils/constants';

/**
 * @returns {boolean} loading
 */
function usePageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer;

    const hide = () => {
      timer = setTimeout(() => setLoading(false), LOADER_HIDE_DELAY);
    };

    if (document.readyState === 'complete') {
      // Fonts / assets already loaded (e.g. hot-reload)
      hide();
    } else {
      window.addEventListener('load', hide, { once: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', hide);
    };
  }, []);

  return loading;
}

export default usePageLoader;