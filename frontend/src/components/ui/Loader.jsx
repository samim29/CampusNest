/* ============================================================
   CAMPUSNEST — Loader
   Full-screen page loading overlay.
   Receives `loading` boolean from usePageLoader hook.
   Uses aria-live so screen readers announce it.
   ============================================================ */

import './Loader.css';

function Loader({ loading }) {
  return (
    <div
      className={`loader${loading ? '' : ' loader--hidden'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading CampusNest"
    >
      <div className="loader__inner">
        <div className="loader__icon" aria-hidden="true">🏠</div>
        <span className="loader__brand">CampusNest</span>
        <div className="loader__dots" aria-hidden="true">
          <span className="loader__dot" />
          <span className="loader__dot" />
          <span className="loader__dot" />
        </div>
      </div>
    </div>
  );
}

export default Loader;