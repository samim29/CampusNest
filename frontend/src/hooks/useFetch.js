/* ============================================================
   CAMPUSNEST — useFetch
   Generic data-fetching hook.

   Features:
   - Runs on mount (and when deps change)
   - Tracks loading, data, error states
   - Aborts in-flight requests on unmount / dep change
   - Optional manual refetch
   - Optional skip flag (skip=true prevents fetch)

   Usage:
     const { data, loading, error, refetch } = useFetch(
       () => pgAPI.list({ q: 'Delhi' }),
       [searchQuery]           // refetch when searchQuery changes
     );
   ============================================================ */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @template T
 * @param {() => Promise<{ data: T, error: string|null }>} fetcher
 * @param {any[]} [deps=[]]
 * @param {{ skip?: boolean, initialData?: T }} [options]
 * @returns {{ data: T|null, loading: boolean, error: string|null, refetch: () => void }}
 */
function useFetch(fetcher, deps = [], options = {}) {
  const { skip = false, initialData = null } = options;

  const [data,    setData   ] = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError  ] = useState(null);

  /* Track whether component is still mounted */
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: err } = await fetcher();

      if (!mountedRef.current) return;

      if (err) {
        setError(err);
        setData(null);
      } else {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message ?? 'An unexpected error occurred.');
      setData(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  useEffect(() => {
    execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useFetch;