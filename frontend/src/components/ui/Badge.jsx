/* ============================================================
   CAMPUSNEST — Badge
   Small inline label chip.

   Props:
   - variant: 'verified' | 'premium' | 'sage' | 'gold' | 'navy' | 'terra'
   - children: ReactNode
   - className: string
   ============================================================ */

import './Badge.css';

function Badge({ variant = 'verified', children, className = '' }) {
  return (
    <span className={`badge badge--${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Badge;