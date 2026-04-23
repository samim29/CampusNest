/* ============================================================
   CAMPUSNEST — Button
   Handles all button/link variants in one component.

   Props:
   - variant:   'primary' | 'secondary' | 'ghost' | 'white' | 'ghost-white'
   - size:      'sm' | 'md' | 'lg'
   - as:        'button' | 'a' | 'link'  (renders as anchor or React Router Link)
   - href:      string  (for as='a' external links)
   - to:        string  (for as='link' internal nav)
   - disabled:  boolean
   - loading:   boolean  (shows spinner, disables interaction)
   - type:      'button' | 'submit' | 'reset'
   - onClick:   function
   - children:  ReactNode
   - className: string   (allow extra classes from parent)
   ============================================================ */

import { Link } from 'react-router-dom';
import './Button.css';

function Button({
  variant   = 'primary',
  size      = 'md',
  as        = 'button',
  href,
  to,
  disabled  = false,
  loading   = false,
  type      = 'button',
  onClick,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    loading  ? 'btn--loading'  : '',
    disabled ? 'btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isInteractive = !disabled && !loading;

  const handleClick = (e) => {
    if (!isInteractive) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  /* ── Spinner shown when loading ── */
  const spinner = loading ? (
    <span className="btn__spinner" aria-hidden="true" />
  ) : null;

  const content = (
    <>
      {spinner}
      <span className={loading ? 'btn__label--loading' : ''}>{children}</span>
    </>
  );

  /* ── Render as external anchor ── */
  if (as === 'a') {
    return (
      <a
        href={isInteractive ? href : undefined}
        className={classes}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!isInteractive}
        tabIndex={isInteractive ? 0 : -1}
        {...rest}
      >
        {content}
      </a>
    );
  }

  /* ── Render as React Router Link ── */
  if (as === 'link') {
    return (
      <Link
        to={isInteractive ? to ?? '/' : '#'}
        className={classes}
        onClick={handleClick}
        aria-disabled={!isInteractive}
        tabIndex={isInteractive ? 0 : -1}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  /* ── Default: render as <button> ── */
  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={!isInteractive}
      aria-busy={loading}
      {...rest}
    >
      {content}
    </button>
  );
}

export default Button;