/* ============================================================
   CAMPUSNEST — useToast
   Lightweight in-memory toast notification system.
   Returns { toasts, showToast, dismissToast }.

   Usage:
     const { showToast } = useToast();
     showToast('PG saved!', 'success');
     showToast('Something went wrong.', 'error');

   Pair with <ToastContainer /> (see component below).
   ============================================================ */

import {
  useState,
  useCallback,
  useRef,
  createContext,
  useContext,
  useMemo,
} from 'react';

/* ── Types: 'success' | 'error' | 'warning' | 'info' ── */

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismissToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((
    message,
    type    = 'info',
    duration = 4000
  ) => {
    const id = ++toastIdCounter;

    setToasts(prev => [
      ...prev,
      { id, message, type },
    ]);

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({
    toasts,
    showToast,
    dismissToast,
  }), [toasts, showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

/* ── Toast container — renders at bottom of screen ── */
const TOAST_ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const TOAST_COLORS = {
  success: { bg: 'rgba(122,158,126,0.95)',  text: 'white'            },
  error:   { bg: 'rgba(200,88,58,0.95)',    text: 'white'            },
  warning: { bg: 'rgba(212,168,83,0.95)',   text: 'var(--navy)'      },
  info:    { bg: 'rgba(15,27,45,0.92)',     text: 'white'            },
};

function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      style={{
        position:      'fixed',
        bottom:        '24px',
        right:         '24px',
        zIndex:        'var(--z-toast)',
        display:       'flex',
        flexDirection: 'column',
        gap:           '10px',
        maxWidth:      '360px',
        width:         'calc(100vw - 48px)',
      }}
    >
      {toasts.map(toast => {
        const colors = TOAST_COLORS[toast.type] ?? TOAST_COLORS.info;
        const icon   = TOAST_ICONS[toast.type]  ?? TOAST_ICONS.info;

        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="assertive"
            style={{
              display:      'flex',
              alignItems:   'flex-start',
              gap:          '10px',
              padding:      '14px 16px',
              borderRadius: '14px',
              background:   colors.bg,
              color:        colors.text,
              boxShadow:    '0 8px 32px rgba(0,0,0,0.25)',
              animation:    'fadeSlideUp 0.3s ease forwards',
              fontFamily:   'var(--font-body)',
              fontSize:     '0.88rem',
              lineHeight:   '1.5',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
              {icon}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border:     'none',
                color:      colors.text,
                opacity:    0.65,
                cursor:     'pointer',
                fontSize:   '14px',
                padding:    '0 0 0 4px',
                flexShrink: 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}