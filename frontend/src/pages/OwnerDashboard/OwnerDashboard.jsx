/* ============================================================
   CAMPUSNEST — Owner Dashboard  (/owner-dashboard)
   Features:
   - Sidebar matching student dashboard pattern
   - Overview stats
   - Listings manager
   - Inquiry inbox
   - Revenue bar chart
   - Review summary
   ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation }            from 'react-router-dom';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ROUTES }      from '../../utils/constants';
import './OwnerDashboard.css';

/* ── Static data ── */
const OWNER_STATS = [
  { label:'Total Listings',  value:'3',    change:'All verified',        icon:'🏠', type:'neutral'  },
  { label:'Total Tenants',   value:'28',   change:'↑ 2 this month',     icon:'👥', type:'up'       },
  { label:'Monthly Revenue', value:'₹3.2L',change:'↑ 14% vs last mo',  icon:'💰', type:'up'       },
  { label:'New Inquiries',   value:'7',    change:'Needs response',      icon:'📋', type:'alert'    },
];

const LISTINGS = [
  { id:'1', name:'Sunrise Boys PG',       type:'Boys PG',  tenants:12, capacity:15, rating:4.5, status:'Active',   monthly:144000, emoji:'🏠' },
  { id:'2', name:'Green Valley Girls PG', type:'Girls PG', tenants:8,  capacity:10, rating:4.2, status:'Active',   monthly:80000,  emoji:'🏡' },
  { id:'3', name:'City Hostel Block A',   type:'Hostel',   tenants:8,  capacity:12, rating:4.0, status:'Pending',  monthly:68000,  emoji:'🏢' },
];

const INQUIRIES = [
  { id:'i1', name:'Priya Sharma',  college:'Delhi University', room:'Single', date:'May 1',  status:'New',       avatar:'👩', pg:'Sunrise Boys PG'      },
  { id:'i2', name:'Rahul Verma',   college:'IIT Bombay',       room:'Double', date:'Apr 25', status:'Tour Set',   avatar:'👨', pg:'Green Valley Girls PG' },
  { id:'i3', name:'Ananya Reddy',  college:'AIIMS Delhi',      room:'Single', date:'May 5',  status:'Confirmed',  avatar:'👩', pg:'Sunrise Boys PG'      },
  { id:'i4', name:'Arjun Mehta',   college:'Delhi University', room:'Triple', date:'May 10', status:'New',        avatar:'👨', pg:'City Hostel Block A'  },
];

const REVENUE_DATA = [
  { month:'Nov', amount:190000 },
  { month:'Dec', amount:210000 },
  { month:'Jan', amount:240000 },
  { month:'Feb', amount:260000 },
  { month:'Mar', amount:280000 },
  { month:'Apr', amount:320000 },
];

const SIDEBAR_ITEMS = [
  { id:'overview',   icon:'⊞',  label:'Overview',   href: ROUTES.OWNER_DASHBOARD },
  { id:'listings',   icon:'🏠',  label:'My Listings', href: ROUTES.OWNER_DASHBOARD },
  { id:'inquiries',  icon:'📋',  label:'Inquiries',   href: ROUTES.OWNER_DASHBOARD },
  { id:'bookings',   icon:'📅',  label:'Bookings',    href: ROUTES.OWNER_DASHBOARD },
  { id:'revenue',    icon:'💰',  label:'Revenue',     href: ROUTES.OWNER_DASHBOARD },
  { id:'reviews',    icon:'⭐',  label:'Reviews',     href: ROUTES.OWNER_DASHBOARD },
  { id:'settings',   icon:'⚙️', label:'Settings',    href: ROUTES.OWNER_DASHBOARD },
];

const INQUIRY_STYLES = {
  'New':       { bg:'rgba(200,88,58,0.10)',   color:'var(--terracotta-dark)' },
  'Tour Set':  { bg:'rgba(212,168,83,0.12)',  color:'var(--gold-dark)'       },
  'Confirmed': { bg:'rgba(122,158,126,0.12)', color:'var(--sage)'            },
};

/* ── Revenue bar chart ── */
function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.amount));

  return (
    <div
      className="owner-revenue-chart"
      role="img"
      aria-label="Monthly revenue bar chart"
    >
      {data.map(d => {
        const pct = (d.amount / max) * 100;
        return (
          <div
            key={d.month}
            className="owner-revenue-chart__bar-wrap"
          >
            <div className="owner-revenue-chart__bar-outer">
              <div
                className="owner-revenue-chart__bar-fill"
                style={{ height: `${pct}%` }}
                role="presentation"
                aria-label={`${d.month}: ₹${(d.amount/1000).toFixed(0)}K`}
              />
            </div>
            <span className="owner-revenue-chart__month">
              {d.month}
            </span>
            <span className="owner-revenue-chart__amount">
              ₹{(d.amount / 1000).toFixed(0)}K
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ── */
function OwnerDashboard() {
  const loading   = usePageLoader();
  const location  = useLocation();
  const navigate  = useNavigate();
  const pageRef   = useRef(null);
  useScrollReveal(pageRef);

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen,   setSidebarOpen  ] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const [inquiries, setInquiries] = useState(INQUIRIES);

  const handleInquiryAction = useCallback((id, action) => {
    setInquiries(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, status: action === 'accept' ? 'Tour Set' : 'Declined' }
          : i
      )
    );
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <div className="owner-page" ref={pageRef}>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="owner-sidebar__overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ════ SIDEBAR ════ */}
        <aside
          className={`owner-sidebar${sidebarOpen ? ' owner-sidebar--open' : ''}`}
          aria-label="Owner dashboard navigation"
        >
          <div className="owner-sidebar__logo-wrap">
            <Link
              to={ROUTES.HOME}
              className="owner-sidebar__logo"
            >
              <span className="owner-sidebar__logo-icon" aria-hidden="true">🏠</span>
              <span>Owner Panel</span>
            </Link>
          </div>

          <nav aria-label="Owner navigation">
            <p className="owner-sidebar__section-label">Manage</p>
            {SIDEBAR_ITEMS.slice(0, 6).map(item => (
              <button
                key={item.id}
                type="button"
                className={`owner-sidebar__item${activeSection === item.id ? ' owner-sidebar__item--active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="owner-sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
            <p className="owner-sidebar__section-label">System</p>
            {SIDEBAR_ITEMS.slice(6).map(item => (
              <button
                key={item.id}
                type="button"
                className={`owner-sidebar__item${activeSection === item.id ? ' owner-sidebar__item--active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="owner-sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="owner-sidebar__signout"
            onClick={() => navigate(ROUTES.LOGIN)}
            type="button"
          >
            <span aria-hidden="true">↩</span> Sign Out
          </button>
        </aside>

        {/* ════ MAIN ════ */}
        <div className="owner-main">

          {/* Top bar */}
          <header className="owner-topbar">
            <button
              className="owner-topbar__hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              type="button"
            >
              <span /><span /><span />
            </button>
            <span className="owner-topbar__title">Owner Panel</span>
            <Link to={ROUTES.PROFILE} className="owner-topbar__avatar" aria-label="Profile">
              👤
            </Link>
          </header>

          {/* Content */}
          <div className="owner-content">

            {/* Greeting */}
            <div className="owner-greeting reveal">
              <div>
                <h1 className="owner-greeting__text">
                  Owner <em>Dashboard</em>
                </h1>
                <p className="owner-greeting__sub">
                  Manage your PG listings, inquiries &amp; revenue
                </p>
              </div>
              <button
                type="button"
                className="owner-add-btn"
                aria-label="Add a new PG listing"
              >
                + Add New PG
              </button>
            </div>

            {/* Stats */}
            <ErrorBoundary>
              <div
                className="owner-stats reveal reveal-delay-1"
                role="list"
                aria-label="Owner statistics"
              >
                {OWNER_STATS.map(s => (
                  <div
                    key={s.label}
                    className="owner-stat-card"
                    role="listitem"
                  >
                    <div className="owner-stat-card__icon" aria-hidden="true">
                      {s.icon}
                    </div>
                    <p className="owner-stat-card__label">{s.label}</p>
                    <p className="owner-stat-card__value">{s.value}</p>
                    <p className={`owner-stat-card__change owner-stat-card__change--${s.type}`}>
                      {s.change}
                    </p>
                  </div>
                ))}
              </div>
            </ErrorBoundary>

            {/* Listings + Revenue */}
            <div className="owner-grid reveal reveal-delay-2">

              {/* Listings */}
              <ErrorBoundary>
                <section
                  className="owner-panel"
                  aria-labelledby="owner-listings-title"
                >
                  <div className="owner-panel__header">
                    <h2
                      id="owner-listings-title"
                      className="owner-panel__title"
                    >
                      🏠 My Listings
                    </h2>
                    <button
                      type="button"
                      className="owner-panel__link"
                      aria-label="Add new listing"
                    >
                      + Add Listing
                    </button>
                  </div>

                  <div
                    className="owner-listings-list"
                    role="list"
                    aria-label="My PG listings"
                  >
                    {LISTINGS.map(listing => (
                      <div
                        key={listing.id}
                        className="owner-listing-row"
                        role="listitem"
                      >
                        <div
                          className="owner-listing-row__icon"
                          aria-hidden="true"
                        >
                          {listing.emoji}
                        </div>
                        <div className="owner-listing-row__info">
                          <p className="owner-listing-row__name">
                            {listing.name}
                          </p>
                          <p className="owner-listing-row__meta">
                            {listing.type} · {listing.tenants}/{listing.capacity} occupied · ★{listing.rating}
                          </p>
                          {/* Occupancy bar */}
                          <div
                            className="owner-listing-row__occ-track"
                            role="progressbar"
                            aria-valuenow={listing.tenants}
                            aria-valuemax={listing.capacity}
                            aria-label={`${listing.tenants} of ${listing.capacity} rooms occupied`}
                          >
                            <div
                              className="owner-listing-row__occ-fill"
                              style={{
                                width: `${(listing.tenants / listing.capacity) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="owner-listing-row__right">
                          <p className="owner-listing-row__revenue">
                            ₹{(listing.monthly / 1000).toFixed(0)}K
                            <span>/mo</span>
                          </p>
                          <span
                            className={`owner-listing-row__status${listing.status === 'Pending' ? ' owner-listing-row__status--pending' : ''}`}
                          >
                            {listing.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </ErrorBoundary>

              {/* Revenue chart */}
              <ErrorBoundary>
                <section
                  className="owner-panel"
                  aria-labelledby="owner-revenue-title"
                >
                  <div className="owner-panel__header">
                    <h2
                      id="owner-revenue-title"
                      className="owner-panel__title"
                    >
                      💰 Revenue
                    </h2>
                    <span className="owner-panel__sub">Last 6 months</span>
                  </div>
                  <RevenueChart data={REVENUE_DATA} />
                </section>
              </ErrorBoundary>
            </div>

            {/* Inquiries */}
            <ErrorBoundary>
              <section
                className="owner-panel owner-panel--full reveal reveal-delay-3"
                aria-labelledby="owner-inquiries-title"
              >
                <div className="owner-panel__header">
                  <h2
                    id="owner-inquiries-title"
                    className="owner-panel__title"
                  >
                    📋 Recent Inquiries
                  </h2>
                  <span className="owner-panel__badge">
                    {inquiries.filter(i => i.status === 'New').length} new
                  </span>
                </div>

                <div
                  className="owner-inquiries-list"
                  role="list"
                  aria-label="Tenant inquiries"
                >
                  {inquiries.map(inq => {
                    const style = INQUIRY_STYLES[inq.status] ?? INQUIRY_STYLES['New'];
                    return (
                      <div
                        key={inq.id}
                        className="owner-inquiry-row"
                        role="listitem"
                      >
                        <div
                          className="owner-inquiry-row__avatar"
                          aria-hidden="true"
                        >
                          {inq.avatar}
                        </div>
                        <div className="owner-inquiry-row__info">
                          <p className="owner-inquiry-row__name">
                            {inq.name}
                          </p>
                          <p className="owner-inquiry-row__meta">
                            {inq.college} · {inq.room} room · Move-in {inq.date}
                          </p>
                          <p className="owner-inquiry-row__pg">
                            📍 {inq.pg}
                          </p>
                        </div>
                        <div className="owner-inquiry-row__right">
                          <span
                            className="owner-inquiry-row__status"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {inq.status}
                          </span>
                          {inq.status === 'New' && (
                            <div className="owner-inquiry-row__actions">
                              <button
                                type="button"
                                className="owner-inquiry-btn owner-inquiry-btn--accept"
                                onClick={() => handleInquiryAction(inq.id, 'accept')}
                                aria-label={`Accept inquiry from ${inq.name}`}
                              >
                                ✓ Accept
                              </button>
                              <button
                                type="button"
                                className="owner-inquiry-btn owner-inquiry-btn--decline"
                                onClick={() => handleInquiryAction(inq.id, 'decline')}
                                aria-label={`Decline inquiry from ${inq.name}`}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </ErrorBoundary>

          </div>
        </div>
      </div>
    </>
  );
}

export default OwnerDashboard;