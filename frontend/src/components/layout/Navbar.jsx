/* ============================================================
   CAMPUSNEST — Navbar
   - Fixed position, transparent → frosted glass on scroll
   - Mobile hamburger menu with smooth open/close
   - Active link highlighting via useLocation
   - Closes mobile menu on route change & outside click
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useScrollNav from '../../hooks/useScrollNav';
import { NAV_LINKS, ROUTES } from '../../utils/constants';
import './Navbar.css';

function Navbar() {
  const scrolled          = useScrollNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const location          = useLocation();
  const navigate          = useNavigate();
  const menuRef           = useRef(null);
  const hamburgerRef      = useRef(null);

  /* ── Close menu on route change ── */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ── Close menu on outside click ── */
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [menuOpen]);

  /* ── Close on Escape key ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  const handleGetStarted = useCallback(() => {
    navigate(ROUTES.PG_LISTINGS);
  }, [navigate]);

  return (
    <header
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--menu-open' : ''}`}
      role="banner"
    >
      {/* ── Logo ── */}
      <Link
        to={ROUTES.HOME}
        className="navbar__logo"
        aria-label="CampusNest — go to homepage"
      >
        <span className="navbar__logo-icon" aria-hidden="true">🏠</span>
        <span className="navbar__logo-text">CampusNest</span>
      </Link>

      {/* ── Desktop Nav Links ── */}
      <nav
        className="navbar__links"
        aria-label="Primary navigation"
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Desktop CTA ── */}
      <div className="navbar__actions hide-md">
        <Link to={ROUTES.LOGIN} className="navbar__signin">
          Sign In
        </Link>
        <button
          className="navbar__cta"
          onClick={handleGetStarted}
          type="button"
        >
          Get Started Free
        </button>
      </div>

      {/* ── Hamburger (mobile only) ── */}
      <button
        ref={hamburgerRef}
        className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        type="button"
      >
        <span className="navbar__hamburger-bar" />
        <span className="navbar__hamburger-bar" />
        <span className="navbar__hamburger-bar" />
      </button>

      {/* ── Mobile Menu Drawer ── */}
      <nav
        id="mobile-menu"
        ref={menuRef}
        className={`navbar__mobile-menu${menuOpen ? ' navbar__mobile-menu--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`
                }
                tabIndex={menuOpen ? 0 : -1}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__mobile-actions">
          <Link
            to={ROUTES.LOGIN}
            className="navbar__mobile-signin"
            tabIndex={menuOpen ? 0 : -1}
          >
            Sign In
          </Link>
          <button
            className="navbar__mobile-cta"
            onClick={handleGetStarted}
            type="button"
            tabIndex={menuOpen ? 0 : -1}
          >
            Get Started Free →
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;