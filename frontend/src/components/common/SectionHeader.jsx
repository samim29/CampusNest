/* ============================================================
   CAMPUSNEST — SectionHeader
   Reusable section eyebrow + headline + subtitle block.

   Props:
   - eyebrow:    string
   - title:      ReactNode  (can contain <em> for italic accent)
   - subtitle:   string
   - align:      'left' | 'center'
   - light:      boolean   (white text — for dark section backgrounds)
   - className:  string
   ============================================================ */

import './SectionHeader.css';

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align     = 'left',
  light     = false,
  className = '',
}) {
  return (
    <header
      className={[
        'section-header',
        `section-header--${align}`,
        light ? 'section-header--light' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow && (
        <p className="section-header__eyebrow" aria-label={eyebrow}>
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="section-header__title display-md">{title}</h2>
      )}
      {subtitle && (
        <p className="section-header__subtitle">{subtitle}</p>
      )}
    </header>
  );
}

export default SectionHeader;