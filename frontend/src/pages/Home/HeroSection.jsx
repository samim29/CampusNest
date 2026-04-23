/* ============================================================
   CAMPUSNEST — HeroSection
   Full-viewport hero with animated headline, stats,
   floating cards, and ambient background orbs.
   ============================================================ */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button    from '../../components/ui/Button';
import SearchBar from '../../components/common/SearchBar';
import { ROUTES } from '../../utils/constants';
import './HeroSection.css';

/* ── Static hero stats ── */
const HERO_STATS = [
  { num: '50K+',  label: 'Happy Students' },
  { num: '2000+', label: 'Verified PGs'   },
  { num: '500+',  label: 'Food Partners'  },
];

function HeroSection() {
  const navigate = useNavigate();

  const handleWatchDemo = useCallback(() => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback(
    ({ location, type, budget }) => {
      const params = new URLSearchParams({ q: location, type, budget });
      navigate(`${ROUTES.PG_LISTINGS}?${params.toString()}`);
    },
    [navigate],
  );

  return (
    <section className="hero" aria-labelledby="hero-headline">
      {/* ── Ambient orbs ── */}
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__orb hero__orb--a" />
        <span className="hero__orb hero__orb--b" />
      </div>

      <div className="hero__inner">
        {/* ── Left — Text ── */}
        <div className="hero__text">
          {/* Badge */}
          <div className="hero__badge" aria-label="India's number 1 student life platform">
            <span className="hero__badge-dot" aria-hidden="true" />
            India's #1 Student Life Platform
          </div>

          {/* Headline */}
          <h1
            id="hero-headline"
            className="hero__headline display-xl"
          >
            Your <em>perfect</em>
            <br />
            home, near
            <br />
            <span className="hero__underline-wrap">
              campus
              <span className="hero__underline-line" aria-hidden="true" />
            </span>
          </h1>

          {/* Sub */}
          <p className="hero__sub">
            Find verified PGs, hostels &amp; mess facilities near your
            college — trusted by 50,000+ students across India.
          </p>

          {/* Actions */}
          <div className="hero__actions">
            <Button
              as="link"
              to={ROUTES.PG_LISTINGS}
              variant="primary"
              size="lg"
            >
              🔍 Find My PG &nbsp;→
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleWatchDemo}
              type="button"
            >
              ▶ How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="hero__stats" role="list" aria-label="Platform statistics">
            {HERO_STATS.map((stat, i) => (
              <div key={stat.label} role="listitem" className="hero__stats-item-wrap">
                {i > 0 && (
                  <div className="hero__stats-divider" aria-hidden="true" />
                )}
                <div className="hero__stat">
                  <span className="hero__stat-num">{stat.num}</span>
                  <span className="hero__stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Visual card ── */}
        <div className="hero__visual" aria-hidden="true">
          {/* Main card */}
          <div className="hero__card">
            <div className="hero__card-img">
              <span className="hero__card-emoji">🏠</span>
            </div>
            <div className="hero__card-badge">✓ Verified</div>
            <div className="hero__card-overlay">
              <h3 className="hero__card-name">Sunrise Boys PG</h3>
              <p className="hero__card-meta">
                📍 0.8km from Delhi University · Wi-Fi · AC · Meals
              </p>
            </div>
          </div>

          {/* Float card 1 — meal */}
          <div className="hero__float hero__float--1">
            <div className="hero__float-icon">🍽️</div>
            <div>
              <p className="hero__float-label">Today's Meal</p>
              <p className="hero__float-value">Dal &amp; Rice</p>
            </div>
          </div>

          {/* Float card 2 — rating */}
          <div className="hero__float hero__float--2">
            <p className="hero__float-big">4.8</p>
            <p className="hero__float-label">⭐ Avg Rating</p>
          </div>

          {/* Float card 3 — verified count */}
          <div className="hero__float hero__float--3">
            <p className="hero__float-label">PGs Near You</p>
            <p className="hero__float-value">340 verified</p>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="hero__search-wrap" id="get-started">
        <SearchBar onSearch={handleSearch} />
      </div>
    </section>
  );
}

export default HeroSection;