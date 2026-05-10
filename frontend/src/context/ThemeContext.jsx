/* ============================================================
   CAMPUSNEST — ThemeContext
   Manages light / dark mode preference.
   - Reads from localStorage on mount
   - Falls back to system preference
   - Applies 'data-theme' attribute to <html>
   Note: CampusNest currently ships light-only.
   This context is scaffolded for future dark mode support.
   ============================================================ */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

const THEME_KEY     = 'cn_theme';
const VALID_THEMES  = ['light', 'dark'];

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (VALID_THEMES.includes(stored)) return stored;
  } catch { /* localStorage blocked */ }
  return getSystemTheme();
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadTheme);

  /* Apply to <html> element */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch { /* ignore */ }
  }, [theme]);

  /* Listen for system preference changes */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      /* Only follow system if user hasn't manually set a theme */
      const stored = (() => {
        try { return localStorage.getItem(THEME_KEY); } catch { return null; }
      })();
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme  = useCallback(() => setTheme('dark'),  []);

  const value = useMemo(() => ({
    theme,
    isDark:      theme === 'dark',
    isLight:     theme === 'light',
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  }), [theme, toggleTheme, setLightTheme, setDarkTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}