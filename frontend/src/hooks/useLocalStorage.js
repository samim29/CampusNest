/* ============================================================
   CAMPUSNEST — useLocalStorage
   Persists state in localStorage with JSON serialisation.
   Falls back gracefully if localStorage is blocked.

   Usage:
     const [favorites, setFavorites] = useLocalStorage('cn_favorites', []);
   ============================================================ */

import { useState, useCallback, useEffect } from 'react';

/**
 * @template T
 * @param {string} key         - localStorage key
 * @param {T}      initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
function useLocalStorage(key, initialValue) {
  /* Read from localStorage, fall back to initialValue */
  const readValue = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback((value) => {
    try {
      const newValue =
        typeof value === 'function' ? value(storedValue) : value;

      localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);

      /* Sync across tabs */
      window.dispatchEvent(new Event('local-storage'));
    } catch {
      /* localStorage unavailable — update state only */
      setStoredValue(
        typeof value === 'function' ? value(storedValue) : value
      );
    }
  }, [key, storedValue]);

  /* Sync state when another tab writes to the same key */
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e instanceof StorageEvent && e.key !== key) return;
      setStoredValue(readValue());
    };

    window.addEventListener('storage',       handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage',       handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;