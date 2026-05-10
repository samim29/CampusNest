/* ============================================================
   CAMPUSNEST — main.jsx
   React entry point.
   - StrictMode enabled in development
   - Root element validated before mounting
   - Global error handler for uncaught errors
   ============================================================ */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App            from './App';

/* ── Validate root element ── */
const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error(
    '[CampusNest] Fatal: #root element not found in index.html. ' +
    'Check that your index.html contains <div id="root"></div>.'
  );
}

/* ── Global uncaught error handler ──
   In production, pipe these to your error tracker (e.g. Sentry).
── */
window.addEventListener('error', (event) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[CampusNest] Uncaught error:', event.error);
  }
  /* TODO: Sentry.captureException(event.error); */
});

window.addEventListener('unhandledrejection', (event) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[CampusNest] Unhandled promise rejection:', event.reason);
  }
  /* TODO: Sentry.captureException(event.reason); */
});

/* ── Mount ── */
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);