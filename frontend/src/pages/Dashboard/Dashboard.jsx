/* ============================================================
   CAMPUSNEST — Dashboard Page
   Protected route — assumes user is authenticated.
   Layout:
     - Fixed left sidebar (collapsible on mobile)
     - Main content area:
         · Greeting + date header
         · 4 stat cards
         · 2-column grid: Bookings + Quick Actions
         · Meal plan usage bars
         · Recent activity feed
   ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation }            from 'react-router-dom';
import ErrorBoundary                                 from '../../components/ui/ErrorBoundary';
import Loader                                        from '../../components/ui/Loader';
import usePageLoader                                 from '../../hooks/usePageLoader';
import useScrollReveal                               from '../../hooks/useScrollReveal';
import { ROUTES }                                    from '../../utils/constants';
import './Dashboard.css';

/* ── Sidebar nav items ── */
const SIDEBAR_MAIN = [
  { icon: '⊞',  label: 'Dashboard',    href: ROUTES.DASHBOARD,   id: 'dashboard'  },
  { icon: '🏠',  label: 'My PG',        href: ROUTES.PG_LISTINGS,  id: 'mypg'       },
  { icon: '🍛',  label: 'Mess & Food',  href: ROUTES.MESS_FOOD,    id: 'mess'       },
  { icon: '🛡️', label: 'Safety',       href: ROUTES.SAFETY,       id: 'safety'     },
];

const SIDEBAR_EXPLORE = [
  { icon: '🎓',  label: 'Colleges',     href: ROUTES.DISCOVER,     id: 'colleges'   },
  { icon: '📚',  label: 'Subject Hub',  href: ROUTES.SUBJECT_HUB,  id: 'subjecthub' },
];

const SIDEBAR_ACCOUNT = [
  { icon: '👤',  label: 'Profile',      href: ROUTES.PROFILE,      id: 'profile'    },
];

/* ── Static demo data
     In production replace with API calls / context data     ── */
const STATS = [
  { label: 'Saved PGs',     value: '12',  change: '↑ 3 this week',      changeType: 'up'      },
  { label: 'Active Booking',value: '1',   change: '✓ Confirmed',         changeType: 'success' },
  { label: 'Meals Today',   value: '2',   change: 'Lunch + Dinner',      changeType: 'neutral' },
  { label: 'Safety Score',  value: '9.2', change: 'Area: Safe ✓',        changeType: 'success' },
];

const BOOKINGS = [
  {
    id:     '1',
    icon:   '🏠',
    name:   'Sunrise Boys PG',
    meta:   'Delhi University · ₹12,000/mo',
    status: 'Active',
    type:   'active',
    href:   `${ROUTES.PG_DETAIL.replace(':id','1')}`,
    bg:     'rgba(200,88,58,0.10)',
  },
  {
    id:     '2',
    icon:   '🏡',
    name:   'Green Valley PG',
    meta:   'Tour scheduled · April 25',
    status: 'Pending',
    type:   'pending',
    href:   `${ROUTES.PG_DETAIL.replace(':id','2')}`,
    bg:     'rgba(212,168,83,0.10)',
  },
];

const MEAL_PLANS = [
  { label: 'Meals used this month', used: 18, total: 30, color: 'var(--terracotta)'  },
  { label: 'Budget spent',          used: 21, total: 35, color: 'var(--gold)'        },
];

const QUICK_ACTIONS = [
  { icon: '🔍', title: 'Search PGs',       sub: 'Near your college',  href: ROUTES.PG_LISTINGS,  bg: 'rgba(200,88,58,0.10)' },
  { icon: '🍛', title: "Today's Menu",     sub: 'See what\'s cooking', href: ROUTES.MESS_FOOD,    bg: 'rgba(122,158,126,0.10)' },
  { icon: '📚', title: 'Subject Hub',      sub: 'Study resources',    href: ROUTES.SUBJECT_HUB,  bg: 'rgba(212,168,83,0.10)' },
  { icon: '🛡️', title: 'Safety Network', sub: 'Contacts & SOS',     href: ROUTES.SAFETY,       bg: 'rgba(200,88,58,0.08)' },
  { icon: '🎓', title: 'Find College',     sub: 'Discover campuses',  href: ROUTES.DISCOVER,     bg: 'rgba(15,27,45,0.06)'   },
  { icon: '👤', title: 'My Profile',       sub: 'Edit your details',  href: ROUTES.PROFILE,      bg: 'rgba(15,27,45,0.06)'   },
];

const ACTIVITY = [
  { icon: '🏠', text: 'You saved Sunrise Boys PG',           time: '2h ago',  type: 'save'    },
  { icon: '📅', text: 'Tour booked at Green Valley PG',      time: '5h ago',  type: 'booking' },
  { icon: '🍛', text: 'Checked today\'s mess menu',          time: '8h ago',  type: 'food'    },
  { icon: '🛡️', text: 'Safety contact Priya added',         time: '1d ago',  type: 'safety'  },
  { icon: '📚', text: 'Calculus notes downloaded',           time: '2d ago',  type: 'study'   },
];

/* ── Greeting based on time of day ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Format today's date ── */
function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/* ════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════ */

function SidebarItem({ item, isActive, onClick }) {
  return (
    <Link
      to={item.href}
      className={`dash-sidebar__item${isActive ? ' dash-sidebar__item--active' : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="dash-sidebar__icon" aria-hidden="true">{item.icon}</span>
      <span className="dash-sidebar__label">{item.label}</span>
    </Link>
  );
}

function StatCard({ label, value, change, changeType }) {
  return (
    <div
      className="dash-stat"
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <p className="dash-stat__label">{label}</p>
      <p className="dash-stat__value">{value}</p>
      <p className={`dash-stat__change dash-stat__change--${changeType}`}>
        {change}
      </p>
    </div>
  );
}

function BookingItem({ booking }) {
  return (
    <Link
      to={booking.href}
      className="dash-booking"
      aria-label={`${booking.name} — ${booking.status}`}
    >
      <div
        className="dash-booking__icon"
        style={{ background: booking.bg }}
        aria-hidden="true"
      >
        {booking.icon}
      </div>
      <div className="dash-booking__info">
        <p className="dash-booking__name">{booking.name}</p>
        <p className="dash-booking__meta">{booking.meta}</p>
      </div>
      <span className={`dash-booking__status dash-booking__status--${booking.type}`}>
        {booking.status}
      </span>
    </Link>
  );
}

function MealBar({ label, used, total, color }) {
  const pct = Math.min(Math.round((used / total) * 100), 100);
  return (
    <div className="dash-meal-bar">
      <div className="dash-meal-bar__meta">
        <span className="dash-meal-bar__label">{label}</span>
        <span className="dash-meal-bar__count">
          {used}/{total}
        </span>
      </div>
      <div
        className="dash-meal-bar__track"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${label}: ${used} of ${total}`}
      >
        <div
          className="dash-meal-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function QuickAction({ action }) {
  return (
    <Link
      to={action.href}
      className="dash-qa"
      aria-label={action.title}
    >
      <div
        className="dash-qa__icon"
        style={{ background: action.bg }}
        aria-hidden="true"
      >
        {action.icon}
      </div>
      <div className="dash-qa__text">
        <p className="dash-qa__title">{action.title}</p>
        <p className="dash-qa__sub">{action.sub}</p>
      </div>
      <span className="dash-qa__arrow" aria-hidden="true">→</span>
    </Link>
  );
}

function ActivityItem({ item }) {
  return (
    <li className="dash-activity__item">
      <span
        className={`dash-activity__icon dash-activity__icon--${item.type}`}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      <span className="dash-activity__text">{item.text}</span>
      <span className="dash-activity__time">{item.time}</span>
    </li>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
function Dashboard() {
  const loading   = usePageLoader();
  const location  = useLocation();
  const navigate  = useNavigate();
  const mainRef   = useRef(null);

  useScrollReveal(mainRef);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Close sidebar on route change (mobile) */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* Lock body scroll when mobile sidebar open */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  /* Close sidebar on Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);

  const activeId = 'dashboard';

  return (
    <>
      <Loader loading={loading} />

      <div className="dash-page">

        {/* ── Sidebar overlay (mobile) ── */}
        {sidebarOpen && (
          <div
            className="dash-sidebar__overlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* ════ SIDEBAR ════ */}
        <aside
          className={`dash-sidebar${sidebarOpen ? ' dash-sidebar--open' : ''}`}
          aria-label="Dashboard navigation"
        >
          {/* Logo */}
          <div className="dash-sidebar__logo-wrap">
            <Link
              to={ROUTES.HOME}
              className="dash-sidebar__logo"
              aria-label="CampusNest home"
              onClick={closeSidebar}
            >
              <span className="dash-sidebar__logo-icon" aria-hidden="true">🏠</span>
              <span className="dash-sidebar__logo-text">CampusNest</span>
            </Link>
          </div>

          {/* Nav */}
          <nav aria-label="Sidebar navigation">
            <p className="dash-sidebar__section-label">Main</p>
            {SIDEBAR_MAIN.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={item.id === activeId}
                onClick={closeSidebar}
              />
            ))}

            <p className="dash-sidebar__section-label">Explore</p>
            {SIDEBAR_EXPLORE.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={item.id === activeId}
                onClick={closeSidebar}
              />
            ))}

            <p className="dash-sidebar__section-label">Account</p>
            {SIDEBAR_ACCOUNT.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={item.id === activeId}
                onClick={closeSidebar}
              />
            ))}
          </nav>

          {/* Sign out */}
          <button
            className="dash-sidebar__signout"
            onClick={() => navigate(ROUTES.LOGIN)}
            type="button"
            aria-label="Sign out"
          >
            <span aria-hidden="true">↩</span> Sign Out
          </button>
        </aside>

        {/* ════ MAIN CONTENT ════ */}
        <div className="dash-main" ref={mainRef}>

          {/* ── Top bar (mobile) ── */}
          <header className="dash-topbar">
            <button
              className="dash-topbar__hamburger"
              onClick={toggleSidebar}
              aria-expanded={sidebarOpen}
              aria-controls="dashboard-sidebar"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              type="button"
            >
              <span /><span /><span />
            </button>
            <Link
              to={ROUTES.HOME}
              className="dash-topbar__logo"
              aria-label="CampusNest home"
            >
              <span aria-hidden="true">🏠</span> CampusNest
            </Link>
            <Link
              to={ROUTES.PROFILE}
              className="dash-topbar__avatar"
              aria-label="My profile"
            >
              👤
            </Link>
          </header>

          {/* ── Page content ── */}
          <div className="dash-content">

            {/* Greeting */}
            <div className="dash-greeting reveal">
              <div>
                <h1 className="dash-greeting__text">
                  {getGreeting()},{' '}
                  <em className="dash-greeting__name">Priya</em> 👋
                </h1>
                <p className="dash-greeting__date">{formatDate()}</p>
              </div>
              <Link
                to={ROUTES.PG_LISTINGS}
                className="dash-greeting__cta"
                aria-label="Find a new PG"
              >
                + Find New PG
              </Link>
            </div>

            {/* Stats row */}
            <ErrorBoundary>
              <div
                className="dash-stats reveal reveal-delay-1"
                role="list"
                aria-label="Dashboard statistics"
              >
                {STATS.map((s) => (
                  <div key={s.label} role="listitem">
                    <StatCard {...s} />
                  </div>
                ))}
              </div>
            </ErrorBoundary>

            {/* Middle grid */}
            <div className="dash-grid reveal reveal-delay-2">

              {/* ── Bookings panel ── */}
              <ErrorBoundary>
                <section
                  className="dash-panel"
                  aria-labelledby="bookings-title"
                >
                  <h2
                    id="bookings-title"
                    className="dash-panel__title"
                  >
                    📋 My Bookings
                  </h2>

                  <div
                    className="dash-bookings"
                    role="list"
                    aria-label="My PG bookings"
                  >
                    {BOOKINGS.map((b) => (
                      <div key={b.id} role="listitem">
                        <BookingItem booking={b} />
                      </div>
                    ))}
                  </div>

                  {/* Meal plan usage */}
                  <div className="dash-meal-section">
                    <h3 className="dash-meal-section__title">
                      🍽️ Meal Plan Usage
                    </h3>
                    {MEAL_PLANS.map((mp) => (
                      <MealBar key={mp.label} {...mp} />
                    ))}
                  </div>
                </section>
              </ErrorBoundary>

              {/* ── Quick actions ── */}
              <ErrorBoundary>
                <section
                  className="dash-panel"
                  aria-labelledby="qa-title"
                >
                  <h2
                    id="qa-title"
                    className="dash-panel__title"
                  >
                    ⚡ Quick Actions
                  </h2>
                  <div
                    className="dash-qa-grid"
                    role="list"
                    aria-label="Quick actions"
                  >
                    {QUICK_ACTIONS.map((qa) => (
                      <div key={qa.title} role="listitem">
                        <QuickAction action={qa} />
                      </div>
                    ))}
                  </div>
                </section>
              </ErrorBoundary>
            </div>

            {/* ── Recent Activity ── */}
            <ErrorBoundary>
              <section
                className="dash-panel dash-panel--full reveal reveal-delay-3"
                aria-labelledby="activity-title"
              >
                <h2
                  id="activity-title"
                  className="dash-panel__title"
                >
                  🕐 Recent Activity
                </h2>
                <ul
                  className="dash-activity"
                  aria-label="Recent activity"
                >
                  {ACTIVITY.map((a, i) => (
                    <ActivityItem key={i} item={a} />
                  ))}
                </ul>
              </section>
            </ErrorBoundary>

          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;