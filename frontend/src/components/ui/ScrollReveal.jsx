/* ============================================================
   CAMPUSNEST — ScrollReveal wrapper
   Wraps any child in a div with `.reveal` + optional delay class.
   The useScrollReveal hook (called in the page) picks this up.

   Props:
   - delay: 0 | 1 | 2 | 3 | 4 | 5  (maps to reveal-delay-N)
   - className: string
   - as: HTML tag string  (default 'div')
   - children: ReactNode
   ============================================================ */

function ScrollReveal({
  delay     = 0,
  className = '',
  as: Tag   = 'div',
  children,
  ...rest
}) {
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';
  const classes    = ['reveal', delayClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export default ScrollReveal;