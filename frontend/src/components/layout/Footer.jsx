/* ============================================================
   CAMPUSNEST — Footer
   Full site footer with links, brand, socials, legal.
   All href values come from ROUTES constants — no magic strings.
   ============================================================ */

import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import './Footer.css';

/* ── Static data — no magic strings in JSX ── */
const FOOTER_FIND_PG = [
  { label: 'Boys PG',              href: `${ROUTES.PG_LISTINGS}?type=boys`    },
  { label: 'Girls PG',             href: `${ROUTES.PG_LISTINGS}?type=girls`   },
  { label: 'Co-Living Spaces',     href: `${ROUTES.PG_LISTINGS}?type=coliving` },
  { label: 'Hostels',              href: `${ROUTES.PG_LISTINGS}?type=hostel`  },
  { label: 'Near Delhi University',href: `${ROUTES.PG_LISTINGS}?college=du`   },
  { label: 'Near IIT Bombay',      href: `${ROUTES.PG_LISTINGS}?college=iitb` },
];

const FOOTER_PLATFORM = [
  { label: 'Mess & Food',           href: ROUTES.MESS_FOOD  },
  { label: 'Safety Network',        href: ROUTES.SAFETY     },
  { label: 'Academic Hub',          href: ROUTES.SUBJECT_HUB},
  { label: 'College Discovery',     href: ROUTES.DISCOVER   },
  { label: 'AI Recommendations',    href: ROUTES.PG_LISTINGS },
];

const FOOTER_COMPANY = [
  { label: 'Help & FAQ',            href: ROUTES.HELP       },
  { label: 'For PG Owners',         href: ROUTES.OWNER_DASHBOARD },
  { label: 'Privacy Policy',        href: ROUTES.PRIVACY    },
  { label: 'Terms of Service',      href: ROUTES.TERMS      },
];

const SOCIAL_LINKS = [
  { label: 'X (Twitter)', icon: '𝕏', href: 'https://twitter.com'  },
  { label: 'LinkedIn',    icon: 'in', href: 'https://linkedin.com' },
  { label: 'Instagram',   icon: 'ig', href: 'https://instagram.com'},
  { label: 'YouTube',     icon: 'yt', href: 'https://youtube.com'  },
];

/* ── Sub-component: a column of links ── */
function FooterColumn({ title, links }) {
  return (
    <div className="footer__col">
      <p className="footer__col-title">{title}</p>
      <ul className="footer__links" aria-label={title}>
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="footer__link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Main component ── */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">

        {/* ── Top grid ── */}
        <div className="footer__top">

          {/* Brand column */}
          <div className="footer__brand">
            <Link
              to={ROUTES.HOME}
              className="footer__logo"
              aria-label="CampusNest homepage"
            >
              <span className="footer__logo-icon" aria-hidden="true">🏠</span>
              <span className="footer__logo-text">CampusNest</span>
            </Link>
            <p className="footer__desc">
              India's #1 student accommodation platform. Helping first-year
              students find safe, affordable homes near their colleges since 2023.
            </p>

            {/* Social links */}
            <div className="footer__socials" aria-label="Social media links">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer__social-btn"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <FooterColumn title="Find PG"   links={FOOTER_FIND_PG}  />
          <FooterColumn title="Platform"  links={FOOTER_PLATFORM} />
          <FooterColumn title="Company"   links={FOOTER_COMPANY}  />
        </div>

        {/* ── Divider ── */}
        <div className="footer__divider" role="separator" />

        {/* ── Bottom row ── */}
        <div className="footer__bottom">
          <p className="footer__copy">
            © {currentYear} CampusNest. Made with ❤️ for Indian students.
          </p>
          <div className="footer__legal-links">
            <Link to={ROUTES.PRIVACY} className="footer__legal-link">
              Privacy Policy
            </Link>
            <span className="footer__legal-dot" aria-hidden="true">·</span>
            <Link to={ROUTES.TERMS} className="footer__legal-link">
              Terms of Service
            </Link>
            <span className="footer__legal-dot" aria-hidden="true">·</span>
            <Link to={ROUTES.HELP} className="footer__legal-link">
              Help
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;