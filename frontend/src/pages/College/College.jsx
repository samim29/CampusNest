/* ============================================================
   CAMPUSNEST — College Detail Page  (/college/:id)
   Shows:
   - Hero banner with college info + key stats
   - Nearby PG listings (mini grid)
   - Mess options
   - Area stats bars
   - Map placeholder
   - Nearby colleges
   ============================================================ */

import { useState, useCallback, useRef }  from 'react';
import { useParams, useNavigate, Link }   from 'react-router-dom';
import Navbar            from '../../components/layout/Navbar';
import Footer            from '../../components/layout/Footer';
import ErrorBoundary     from '../../components/ui/ErrorBoundary';
import Loader            from '../../components/ui/Loader';
import ScrollReveal      from '../../components/ui/ScrollReveal';
import Badge             from '../../components/ui/Badge';
import Button            from '../../components/ui/Button';
import usePageLoader     from '../../hooks/usePageLoader';
import useScrollReveal   from '../../hooks/useScrollReveal';
import { ROUTES }        from '../../utils/constants';
import './College.css';

/* ── Static data map — keyed by college id
     Replace with API call: GET /api/colleges/:id   ── */
const COLLEGE_DATA = {
  '1': {
    id: '1', name: 'Delhi University', city: 'New Delhi', state: 'Delhi',
    emoji: '🎓', established: 1922, type: 'Central University',
    pgs: 340, mess: 80, rating: 4.5, priceRange: '₹6K–₹18K',
    safetyScore: 8.7, pgAvailability: 78, verifiedPct: 92,
    description:
      'Delhi University, one of India\'s premier central universities, is located in the heart of New Delhi. With over 300,000 students across 90 colleges, finding the right PG nearby is crucial.',
    nearbyPgs: [
      { id:'1', name:'Sunrise Boys PG', type:'Boys PG', distance:'1.2 km', price:12000, rating:4.5, gradient:'linear-gradient(135deg,#fde8d8,#f4a57a)', emoji:'🏠', badge:'verified' },
      { id:'2', name:'Green Valley Girls PG', type:'Girls PG', distance:'0.8 km', price:10000, rating:4.2, gradient:'linear-gradient(135deg,#d8f0e8,#7ab88a)', emoji:'🏡', badge:'verified' },
      { id:'3', name:'City Co-Living', type:'Co-Living', distance:'2.0 km', price:14000, rating:4.6, gradient:'linear-gradient(135deg,#e8d8f0,#a07ab8)', emoji:'🏢', badge:'premium' },
      { id:'4', name:'Metro Hostel', type:'Hostel', distance:'0.5 km', price:8500, rating:4.0, gradient:'linear-gradient(135deg,#fef0d8,#e8b860)', emoji:'🏠', badge:'verified' },
    ],
    messOptions: [
      { name:'Central Mess Hall', hygiene:9.2, price:'₹150–₹250/meal', timing:'7AM–9:30PM' },
      { name:'Annapurna Dining', hygiene:8.7, price:'₹120–₹200/meal', timing:'8AM–9PM' },
      { name:'Student Canteen',  hygiene:8.1, price:'₹80–₹150/meal',  timing:'9AM–8PM'  },
    ],
    nearbyColleges: [
      { name:'AIIMS Delhi',   distance:'3.2 km' },
      { name:'JNU',           distance:'5.0 km' },
      { name:'IIT Delhi',     distance:'8.5 km' },
    ],
  },
  '2': {
    id: '2', name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra',
    emoji: '🏛️', established: 1958, type: 'Institute of National Importance',
    pgs: 210, mess: 55, rating: 4.7, priceRange: '₹8K–₹20K',
    safetyScore: 9.1, pgAvailability: 65, verifiedPct: 95,
    description:
      'IIT Bombay, situated in the scenic Powai area of Mumbai, is one of India\'s premier engineering institutes. Its vibrant campus life and excellent academic environment attract students from across the country.',
    nearbyPgs: [
      { id:'1', name:'City Center PG',  type:'Boys PG',  distance:'1.0 km', price:15000, rating:4.7, gradient:'linear-gradient(135deg,#fde8d8,#f4a57a)', emoji:'🏠', badge:'verified' },
      { id:'2', name:'Powai Heights PG',type:'Girls PG', distance:'1.5 km', price:12000, rating:4.5, gradient:'linear-gradient(135deg,#d8f0e8,#7ab88a)', emoji:'🏡', badge:'verified' },
    ],
    messOptions: [
      { name:'Powai Central Mess', hygiene:9.4, price:'₹180–₹300/meal', timing:'7AM–10PM' },
      { name:'Hiranandani Dining', hygiene:8.9, price:'₹150–₹250/meal', timing:'8AM–9PM'  },
    ],
    nearbyColleges: [
      { name:'VJTI Mumbai',       distance:'3.2 km' },
      { name:'ICT Mumbai',        distance:'4.1 km' },
      { name:'Tata Institute',    distance:'5.0 km' },
    ],
  },
};

/* Fallback for unknown IDs */
const FALLBACK_COLLEGE = {
  id: '0', name: 'College Not Found', city: '', state: '',
  emoji: '🏫', established: 0, type: '',
  pgs: 0, mess: 0, rating: 0, priceRange: '',
  safetyScore: 0, pgAvailability: 0, verifiedPct: 0,
  description: 'This college could not be found.',
  nearbyPgs: [], messOptions: [], nearbyColleges: [],
};

/* ── Stat bar ── */
function StatBar({ label, value, pct, color }) {
  return (
    <div className="college-stat-bar">
      <div className="college-stat-bar__meta">
        <span className="college-stat-bar__label">{label}</span>
        <span className="college-stat-bar__value">{value}</span>
      </div>
      <div
        className="college-stat-bar__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}`}
      >
        <div
          className="college-stat-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ── Mini PG card ── */
function MiniPGCard({ pg }) {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    navigate(ROUTES.PG_DETAIL.replace(':id', pg.id));
  }, [pg.id, navigate]);

  return (
    <article
      className="college-pg-mini"
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }}}
      role="button"
      tabIndex={0}
      aria-label={`${pg.name} — ₹${pg.price.toLocaleString('en-IN')}/month`}
    >
      <div
        className="college-pg-mini__img"
        style={{ background: pg.gradient }}
        aria-hidden="true"
      >
        <span className="college-pg-mini__emoji">{pg.emoji}</span>
        <span
          className={`college-pg-mini__badge${pg.badge === 'premium' ? ' college-pg-mini__badge--premium' : ''}`}
        >
          {pg.badge === 'verified' ? '✓ Verified' : '⭐ Premium'}
        </span>
      </div>
      <div className="college-pg-mini__body">
        <p className="college-pg-mini__type">{pg.type}</p>
        <h3 className="college-pg-mini__name">{pg.name}</h3>
        <p className="college-pg-mini__distance">📍 {pg.distance}</p>
        <div className="college-pg-mini__footer">
          <span className="college-pg-mini__price">
            ₹{pg.price.toLocaleString('en-IN')}
            <span>/mo</span>
          </span>
          <span className="college-pg-mini__rating">
            ★ {pg.rating}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ── Mess row ── */
function MessRow({ mess }) {
  const hygieneWidth = `${mess.hygiene * 10}%`;
  const hygieneColor = mess.hygiene >= 9 ? 'var(--sage)' : mess.hygiene >= 8 ? 'var(--gold)' : 'var(--terracotta)';

  return (
    <div className="college-mess-row">
      <div className="college-mess-row__info">
        <p className="college-mess-row__name">{mess.name}</p>
        <p className="college-mess-row__meta">
          {mess.timing} · {mess.price}
        </p>
      </div>
      <div className="college-mess-row__hygiene">
        <span className="college-mess-row__hygiene-score">{mess.hygiene}/10</span>
        <div className="college-mess-row__hygiene-bar">
          <div
            className="college-mess-row__hygiene-fill"
            style={{ width: hygieneWidth, background: hygieneColor }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
function College() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  /* Safely retrieve college data */
  const college = COLLEGE_DATA[id] ?? FALLBACK_COLLEGE;
  const notFound = college.id === '0';

  return (
    <>
      <Loader loading={loading} />
      <div className="college-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Hero banner ── */}
          <section
            className="college-hero"
            aria-labelledby="college-name"
          >
            <div className="college-hero__orb college-hero__orb--a" aria-hidden="true" />
            <div className="college-hero__orb college-hero__orb--b" aria-hidden="true" />

            <div className="college-hero__inner">
              {/* Back */}
              <button
                className="college-hero__back"
                onClick={() => navigate(-1)}
                type="button"
                aria-label="Go back to college discovery"
              >
                ← Back
              </button>

              {/* Logo + info */}
              <div className="college-hero__card">
                <div
                  className="college-hero__logo"
                  aria-hidden="true"
                >
                  {college.emoji}
                </div>

                <div className="college-hero__info">
                  <p className="college-hero__type">{college.type}</p>
                  <h1
                    id="college-name"
                    className="college-hero__name"
                  >
                    {college.name}
                  </h1>
                  <p className="college-hero__location">
                    <span aria-hidden="true">📍</span>{' '}
                    {college.city}, {college.state}
                    {college.established > 0 && (
                      <span className="college-hero__est">
                        · Est. {college.established}
                      </span>
                    )}
                  </p>

                  {/* Key stat pills */}
                  <div
                    className="college-hero__stats"
                    aria-label="College at a glance"
                  >
                    <div className="college-hero__stat">
                      <span className="college-hero__stat-num">{college.pgs}</span>
                      <span className="college-hero__stat-label">PGs Nearby</span>
                    </div>
                    <div className="college-hero__stat-div" aria-hidden="true" />
                    <div className="college-hero__stat">
                      <span className="college-hero__stat-num">{college.mess}</span>
                      <span className="college-hero__stat-label">Mess Options</span>
                    </div>
                    <div className="college-hero__stat-div" aria-hidden="true" />
                    <div className="college-hero__stat">
                      <span className="college-hero__stat-num">{college.rating}⭐</span>
                      <span className="college-hero__stat-label">Avg Rating</span>
                    </div>
                    <div className="college-hero__stat-div" aria-hidden="true" />
                    <div className="college-hero__stat">
                      <span className="college-hero__stat-num">{college.priceRange}</span>
                      <span className="college-hero__stat-label">Price Range</span>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="college-hero__actions">
                  <Button
                    as="link"
                    to={`${ROUTES.PG_LISTINGS}?college=${college.id}`}
                    variant="primary"
                    size="sm"
                  >
                    🔍 View All PGs
                  </Button>
                  <Button
                    as="link"
                    to={`${ROUTES.MESS_FOOD}?college=${college.id}`}
                    variant="ghost-white"
                    size="sm"
                  >
                    🍛 Nearby Mess
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Body content ── */}
          <div className="college-body">

            {/* Left column */}
            <div className="college-body__left">

              {/* Description */}
              <ErrorBoundary>
                <ScrollReveal>
                  <section
                    className="college-section"
                    aria-labelledby="college-about"
                  >
                    <h2 id="college-about" className="college-section__title">
                      About {college.name}
                    </h2>
                    <p className="college-section__desc">
                      {college.description}
                    </p>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Nearby PGs */}
              <ErrorBoundary>
                <ScrollReveal delay={1}>
                  <section
                    className="college-section"
                    aria-labelledby="nearby-pgs-title"
                  >
                    <div className="college-section__header">
                      <h2
                        id="nearby-pgs-title"
                        className="college-section__title"
                      >
                        🏠 PGs Near {college.name}
                      </h2>
                      <Link
                        to={`${ROUTES.PG_LISTINGS}?college=${college.id}`}
                        className="college-section__link"
                      >
                        View all →
                      </Link>
                    </div>

                    {college.nearbyPgs.length > 0 ? (
                      <div
                        className="college-pg-grid"
                        role="list"
                        aria-label="Nearby PG listings"
                      >
                        {college.nearbyPgs.map((pg) => (
                          <div key={pg.id} role="listitem">
                            <MiniPGCard pg={pg} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="college-section__empty">
                        No PG listings found for this college yet.
                      </p>
                    )}
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Mess options */}
              <ErrorBoundary>
                <ScrollReveal delay={2}>
                  <section
                    className="college-section"
                    aria-labelledby="mess-title"
                  >
                    <h2 id="mess-title" className="college-section__title">
                      🍛 Mess & Food Options
                    </h2>
                    <div
                      className="college-mess-list"
                      role="list"
                      aria-label="Mess options with hygiene ratings"
                    >
                      {college.messOptions.map((m) => (
                        <div key={m.name} role="listitem">
                          <MessRow mess={m} />
                        </div>
                      ))}
                    </div>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>
            </div>

            {/* Right column */}
            <div className="college-body__right">

              {/* Area stats */}
              <ErrorBoundary>
                <ScrollReveal>
                  <section
                    className="college-section college-section--card"
                    aria-labelledby="area-stats-title"
                  >
                    <h2
                      id="area-stats-title"
                      className="college-section__title"
                    >
                      📊 Area Stats
                    </h2>
                    <StatBar
                      label="PG Availability"
                      value={`${college.pgAvailability}%`}
                      pct={college.pgAvailability}
                      color="var(--sage)"
                    />
                    <StatBar
                      label="Verified Listings"
                      value={`${college.verifiedPct}%`}
                      pct={college.verifiedPct}
                      color="var(--terracotta)"
                    />
                    <StatBar
                      label="Safety Score"
                      value={`${college.safetyScore}/10`}
                      pct={college.safetyScore * 10}
                      color="var(--gold)"
                    />
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Map placeholder */}
              <ErrorBoundary>
                <ScrollReveal delay={1}>
                  <section
                    className="college-section college-section--card"
                    aria-labelledby="map-title"
                  >
                    <h2 id="map-title" className="college-section__title">
                      🗺️ Area Map
                    </h2>
                    <div
                      className="college-map-placeholder"
                      role="img"
                      aria-label="Interactive map showing PGs and mess options near the college"
                    >
                      <span className="college-map-placeholder__icon" aria-hidden="true">
                        🗺️
                      </span>
                      <p className="college-map-placeholder__text">
                        Interactive map — PGs, mess & transport shown
                      </p>
                      <p className="college-map-placeholder__sub">
                        Map integration coming soon
                      </p>
                    </div>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Nearby colleges */}
              <ErrorBoundary>
                <ScrollReveal delay={2}>
                  <section
                    className="college-section college-section--card"
                    aria-labelledby="nearby-colleges-title"
                  >
                    <h2
                      id="nearby-colleges-title"
                      className="college-section__title"
                    >
                      🎓 Nearby Colleges
                    </h2>
                    <ul
                      className="college-nearby-list"
                      aria-label="Other colleges in the area"
                    >
                      {college.nearbyColleges.map((nc) => (
                        <li key={nc.name} className="college-nearby-item">
                          <span className="college-nearby-item__name">
                            {nc.name}
                          </span>
                          <span className="college-nearby-item__dist">
                            {nc.distance}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

            </div>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}

export default College;