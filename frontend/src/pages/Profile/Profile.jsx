/* ============================================================
   CAMPUSNEST — Profile Page  (/profile)
   Sections:
   - Sidebar: avatar, name, college, badges, nav tabs
   - Main: Personal info, saved PGs, bookings, settings
   ============================================================ */

import {
  useState,
  useCallback,
  useRef,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import Button          from '../../components/ui/Button';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ROUTES }      from '../../utils/constants';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '../../utils/sanitize';
import { validateEmail, validateRequired } from '../../utils/validators';
import './Profile.css';

/* ── Static profile data — replace with auth context ── */
const USER = {
  name:    'Priya Sharma',
  email:   'priya@du.ac.in',
  phone:   '+91 98765 43210',
  college: 'Delhi University, Miranda House',
  year:    '2nd Year — B.Sc Hons',
  city:    'New Delhi',
  avatar:  '👩‍🎓',
  badges:  ['✓ Verified', '⭐ Trusted Member', '📚 Active Learner'],
  joined:  'March 2024',
};

const SAVED_PGS = [
  { id:'1', name:'Sunrise Boys PG',       location:'Delhi University · 1.2 km', price:12000, rating:4.5, gradient:'linear-gradient(135deg,#fde8d8,#f4a57a)', emoji:'🏠' },
  { id:'2', name:'Green Valley Girls PG', location:'Delhi University · 0.8 km', price:10000, rating:4.2, gradient:'linear-gradient(135deg,#d8f0e8,#7ab88a)', emoji:'🏡' },
  { id:'3', name:'City Center Co-Living', location:'IIT Bombay · 2.0 km',       price:15000, rating:4.7, gradient:'linear-gradient(135deg,#e8d8f0,#a07ab8)', emoji:'🏢' },
];

const BOOKINGS = [
  { id:'1', name:'Sunrise Boys PG', status:'Active',    date:'Since Jan 2025', price:12000, emoji:'🏠' },
  { id:'2', name:'Green Valley PG', status:'Tour Set',  date:'April 25, 2026', price:10000, emoji:'🏡' },
];

const NAV_TABS = [
  { id:'info',     label:'Personal Info', icon:'👤' },
  { id:'saved',    label:'Saved PGs',     icon:'❤️' },
  { id:'bookings', label:'Bookings',      icon:'📅' },
  { id:'settings', label:'Settings',      icon:'⚙️' },
];

const STATUS_STYLES = {
  'Active':    { bg:'rgba(122,158,126,0.12)', color:'var(--sage)'      },
  'Tour Set':  { bg:'rgba(212,168,83,0.12)',  color:'var(--gold-dark)' },
  'Pending':   { bg:'rgba(200,88,58,0.10)',   color:'var(--terracotta)'},
};

/* ── Personal info form ── */
function PersonalInfoTab({ user }) {
  const [form, setForm] = useState({
    name:    user.name,
    email:   user.email,
    phone:   user.phone,
    college: user.college,
    year:    user.year,
    city:    user.city,
  });
  const [editing, setEditing]   = useState(false);
  const [errors,  setErrors ]   = useState({});
  const [saved,   setSaved  ]   = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let clean = value;
    if (name === 'email') clean = sanitizeEmail(value);
    else if (name === 'phone') clean = sanitizePhone(value);
    else clean = sanitizeText(value, 200);

    setForm(prev => ({ ...prev, [name]: clean }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSave = useCallback((e) => {
    e.preventDefault();
    const nameResult  = validateRequired(form.name, 'Name', 100);
    const emailResult = validateEmail(form.email);

    if (!nameResult.valid || !emailResult.valid) {
      setErrors({
        name:  !nameResult.valid  ? nameResult.message  : '',
        email: !emailResult.valid ? emailResult.message : '',
      });
      return;
    }

    /* TODO: PATCH /api/profile with form data */
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [form]);

  const FIELDS = [
    { key:'name',    label:'Full Name',    type:'text', maxLen:100 },
    { key:'email',   label:'Email',        type:'email',maxLen:254 },
    { key:'phone',   label:'Phone',        type:'tel',  maxLen:17  },
    { key:'college', label:'College',      type:'text', maxLen:200 },
    { key:'year',    label:'Year / Course',type:'text', maxLen:100 },
    { key:'city',    label:'City',         type:'text', maxLen:100 },
  ];

  return (
    <section className="profile-tab-section" aria-labelledby="info-title">
      <div className="profile-tab-section__header">
        <h2 id="info-title" className="profile-tab-section__title">
          Personal Information
        </h2>
        {!editing ? (
          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => setEditing(true)}
            aria-label="Edit personal information"
          >
            ✏️ Edit
          </button>
        ) : (
          <button
            type="button"
            className="profile-cancel-btn"
            onClick={() => { setEditing(false); setErrors({}); }}
          >
            Cancel
          </button>
        )}
      </div>

      {saved && (
        <div className="profile-saved-msg" role="status" aria-live="polite">
          ✅ Profile updated successfully.
        </div>
      )}

      <form
        onSubmit={handleSave}
        noValidate
        aria-label="Edit profile form"
      >
        <div className="profile-fields-grid">
          {FIELDS.map(field => (
            <div key={field.key} className="profile-field">
              <label
                htmlFor={`profile-${field.key}`}
                className="profile-field__label"
              >
                {field.label}
              </label>
              {editing ? (
                <>
                  <input
                    id={`profile-${field.key}`}
                    type={field.type}
                    name={field.key}
                    className={`profile-field__input${errors[field.key] ? ' profile-field__input--error' : ''}`}
                    value={form[field.key]}
                    onChange={handleChange}
                    maxLength={field.maxLen}
                    aria-invalid={!!errors[field.key]}
                  />
                  {errors[field.key] && (
                    <p className="profile-field__error" role="alert">
                      {errors[field.key]}
                    </p>
                  )}
                </>
              ) : (
                <p
                  id={`profile-${field.key}`}
                  className="profile-field__value"
                >
                  {form[field.key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="profile-form-actions">
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>

      <div className="profile-joined-note">
        <span>📅</span>
        <span>Member since {user.joined}</span>
      </div>
    </section>
  );
}

/* ── Saved PGs tab ── */
function SavedPGsTab() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(new Set(SAVED_PGS.map(p => p.id)));

  const handleRemove = useCallback((id) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const visiblePGs = SAVED_PGS.filter(p => saved.has(p.id));

  return (
    <section
      className="profile-tab-section"
      aria-labelledby="saved-title"
    >
      <div className="profile-tab-section__header">
        <h2 id="saved-title" className="profile-tab-section__title">
          ❤️ Saved PGs
        </h2>
        <Link
          to={ROUTES.PG_LISTINGS}
          className="profile-tab-section__link"
        >
          Browse More →
        </Link>
      </div>

      {visiblePGs.length === 0 ? (
        <div className="profile-tab-empty">
          <span aria-hidden="true">🏠</span>
          <p>No saved PGs. Start browsing to save your favourites.</p>
          <Button as="link" to={ROUTES.PG_LISTINGS} variant="primary" size="sm">
            Find PGs
          </Button>
        </div>
      ) : (
        <div
          className="profile-saved-list"
          role="list"
          aria-label="Saved PG listings"
        >
          {visiblePGs.map(pg => (
            <div
              key={pg.id}
              className="profile-saved-row"
              role="listitem"
            >
              <div
                className="profile-saved-row__img"
                style={{ background: pg.gradient }}
                aria-hidden="true"
              >
                {pg.emoji}
              </div>
              <div className="profile-saved-row__info">
                <p className="profile-saved-row__name">{pg.name}</p>
                <p className="profile-saved-row__location">
                  📍 {pg.location}
                </p>
                <p className="profile-saved-row__rating">
                  ★ {pg.rating}
                </p>
              </div>
              <div className="profile-saved-row__right">
                <p className="profile-saved-row__price">
                  ₹{pg.price.toLocaleString('en-IN')}
                  <span>/mo</span>
                </p>
                <div className="profile-saved-row__actions">
                  <button
                    type="button"
                    className="profile-saved-row__view"
                    onClick={() => navigate(ROUTES.PG_DETAIL.replace(':id', pg.id))}
                    aria-label={`View ${pg.name}`}
                  >
                    View →
                  </button>
                  <button
                    type="button"
                    className="profile-saved-row__remove"
                    onClick={() => handleRemove(pg.id)}
                    aria-label={`Remove ${pg.name} from saved`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Bookings tab ── */
function BookingsTab() {
  return (
    <section
      className="profile-tab-section"
      aria-labelledby="bookings-title"
    >
      <h2 id="bookings-title" className="profile-tab-section__title">
        📅 My Bookings
      </h2>

      {BOOKINGS.length === 0 ? (
        <div className="profile-tab-empty">
          <span aria-hidden="true">📅</span>
          <p>No bookings yet.</p>
        </div>
      ) : (
        <div
          className="profile-bookings-list"
          role="list"
          aria-label="My bookings"
        >
          {BOOKINGS.map(b => {
            const style = STATUS_STYLES[b.status] ?? STATUS_STYLES['Pending'];
            return (
              <div
                key={b.id}
                className="profile-booking-row"
                role="listitem"
              >
                <div
                  className="profile-booking-row__icon"
                  aria-hidden="true"
                >
                  {b.emoji}
                </div>
                <div className="profile-booking-row__info">
                  <p className="profile-booking-row__name">{b.name}</p>
                  <p className="profile-booking-row__date">{b.date}</p>
                </div>
                <div className="profile-booking-row__right">
                  <p className="profile-booking-row__price">
                    ₹{b.price.toLocaleString('en-IN')}
                    <span>/mo</span>
                  </p>
                  <span
                    className="profile-booking-row__status"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Settings tab ── */
function SettingsTab() {
  const navigate = useNavigate();

  const TOGGLES = [
    { label:'Email notifications for new PGs',         id:'notif-pgs',   default:true  },
    { label:'Daily mess menu reminders',               id:'notif-mess',  default:true  },
    { label:'Safety alerts for your area',             id:'notif-safety',default:true  },
    { label:'Weekly academic resource digest',         id:'notif-study', default:false },
    { label:'Promotional offers from partners',        id:'notif-promo', default:false },
  ];

  const [toggles, setToggles] = useState(
    Object.fromEntries(TOGGLES.map(t => [t.id, t.default]))
  );

  return (
    <section
      className="profile-tab-section"
      aria-labelledby="settings-title"
    >
      <h2 id="settings-title" className="profile-tab-section__title">
        ⚙️ Settings
      </h2>

      {/* Notifications */}
      <div className="profile-settings-group">
        <p className="profile-settings-group__title">
          🔔 Notifications
        </p>
        {TOGGLES.map(t => (
          <div key={t.id} className="profile-toggle-row">
            <label
              htmlFor={t.id}
              className="profile-toggle-row__label"
            >
              {t.label}
            </label>
            <button
              type="button"
              id={t.id}
              role="switch"
              aria-checked={toggles[t.id]}
              className={`profile-toggle${toggles[t.id] ? ' profile-toggle--on' : ''}`}
              onClick={() =>
                setToggles(prev => ({ ...prev, [t.id]: !prev[t.id] }))
              }
              aria-label={`${t.label}: ${toggles[t.id] ? 'on' : 'off'}`}
            >
              <span className="profile-toggle__knob" />
            </button>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="profile-settings-group profile-settings-group--danger">
        <p className="profile-settings-group__title">
          ⚠️ Account
        </p>
        <div className="profile-danger-actions">
          <button
            type="button"
            className="profile-danger-btn profile-danger-btn--mild"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Sign Out
          </button>
          <button
            type="button"
            className="profile-danger-btn profile-danger-btn--danger"
            onClick={() =>
              window.confirm(
                'Are you sure you want to delete your account? This cannot be undone.'
              )
            }
          >
            Delete Account
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
function Profile() {
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const [activeTab, setActiveTab] = useState('info');

  return (
    <>
      <Loader loading={loading} />
      <div className="profile-page" ref={pageRef}>
        <Navbar />

        <main id="main-content" className="profile-main">
          <div className="profile-layout">

            {/* ── Sidebar ── */}
            <aside
              className="profile-sidebar"
              aria-label="Profile navigation"
            >
              {/* Avatar */}
              <div className="profile-sidebar__avatar-wrap">
                <div
                  className="profile-sidebar__avatar"
                  aria-label={`${USER.name}'s avatar`}
                >
                  {USER.avatar}
                </div>
                <button
                  type="button"
                  className="profile-sidebar__avatar-edit"
                  aria-label="Change profile photo"
                >
                  📷
                </button>
              </div>

              <h1 className="profile-sidebar__name">{USER.name}</h1>
              <p className="profile-sidebar__college">{USER.college}</p>
              <p className="profile-sidebar__year">{USER.year}</p>

              {/* Badges */}
              <div
                className="profile-sidebar__badges"
                aria-label="Profile badges"
              >
                {USER.badges.map(b => (
                  <span key={b} className="profile-sidebar__badge">
                    {b}
                  </span>
                ))}
              </div>

              {/* Nav */}
              <nav
                className="profile-sidebar__nav"
                aria-label="Profile sections"
              >
                {NAV_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`profile-sidebar__nav-item${activeTab === tab.id ? ' profile-sidebar__nav-item--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* ── Main content ── */}
            <div className="profile-content">
              <ErrorBoundary>
                <ScrollReveal>
                  {activeTab === 'info'     && <PersonalInfoTab user={USER} />}
                  {activeTab === 'saved'    && <SavedPGsTab />}
                  {activeTab === 'bookings' && <BookingsTab />}
                  {activeTab === 'settings' && <SettingsTab />}
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

export default Profile;