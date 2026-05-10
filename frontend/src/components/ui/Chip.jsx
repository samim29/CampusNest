/* ============================================================
   CAMPUSNEST — Chip
   Reusable small tag / chip element.

   Props:
   - variant: 'default' | 'terra' | 'sage' | 'gold' | 'navy'
   - size:    'sm' | 'md'
   - onRemove: function — if provided, renders an × button
   - children: ReactNode
   ============================================================ */

import './Chip.css';

function Chip({
  variant  = 'default',
  size     = 'md',
  onRemove,
  children,
  className = '',
}) {
  return (
    <span
      className={`chip chip--${variant} chip--${size} ${className}`.trim()}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          className="chip__remove"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Chip;