/* ============================================================
   CAMPUSNEST — PageTransition
   Wraps page content in a fade-in animation on mount.
   Lightweight — CSS-only, no library needed.

   Usage:
     <PageTransition>
       <YourPageContent />
     </PageTransition>
   ============================================================ */

import './PageTransition.css';

function PageTransition({ children, className = '' }) {
  return (
    <div className={`page-transition ${className}`.trim()}>
      {children}
    </div>
  );
}

export default PageTransition;