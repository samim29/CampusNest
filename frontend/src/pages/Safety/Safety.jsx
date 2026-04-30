/* ============================================================
   CAMPUSNEST — Safety Page  (/safety)
   Sections:
   - Dark hero with pulsing SOS button
   - Safety score for current area
   - Safety feature cards (contacts, reporting, watch, map)
   - Trusted contacts manager (add/remove)
   - Community incident feed
   - Emergency numbers list
   ============================================================ */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { sanitizeText, sanitizePhone } from '../../utils/sanitize';
import { validateRequired, validatePhone } from '../../utils/validators';
import './Safety.css';

/* ── Static data ── */
const SAFETY_FEATURES = [
  {
    id: 'contacts',
    icon: '📞',
    title: 'Trusted Contacts',
    desc: 'Add up to 5 trusted contacts — parents, friends, warden. All notified instantly when you trigger SOS.',
    action: 'Manage Contacts',
    color: 'rgba(200,88,58,0.12)',
    iconBg: 'rgba(200,88,58,0.15)',
  },
  {
    id: 'score',
    icon: '📊',
    title: 'Area Safety Score',
    desc: 'Live crowd-sourced safety data for your locality. Updated hourly from verified community reports.',
    action: 'View Full Map',
    color: 'rgba(122,158,126,0.12)',
    iconBg: 'rgba(122,158,126,0.15)',
  },
  {
    id: 'report',
    icon: '🔕',
    title: 'Anonymous Report',
    desc: 'Report unsafe PGs, suspicious activity, or incidents — fully anonymous. We review within 24 hours.',
    action: 'File a Report',
    color: 'rgba(212,168,83,0.12)',
    iconBg: 'rgba(212,168,83,0.15)',
  },
  {
    id: 'watch',
    icon: '🌐',
    title: 'Community Watch',
    desc: 'Connect with nearby students and alumni. Share safety tips and receive real-time area alerts.',
    action: 'Join Community',
    color: 'rgba(15,27,45,0.08)',
    iconBg: 'rgba(15,27,45,0.10)',
  },
];

const INCIDENTS = [
  { type: 'safe',    icon: '✅', text: 'Street lighting repaired near Gate 3',                        time: '2h ago'  },
  { type: 'warning', icon: '⚠️', text: 'Stray dogs reported near Andheri station — caution advised',   time: '5h ago'  },
  { type: 'alert',   icon: '🚨', text: 'Unverified PG listing flagged — scam on Goregaon Link Rd',     time: '1d ago'  },
  { type: 'safe',    icon: '✅', text: 'Police patrol increased near North Campus after reports',        time: '1d ago'  },
  { type: 'warning', icon: '⚠️', text: 'Waterlogging on Main Road — avoid after heavy rain',            time: '2d ago'  },
];

const EMERGENCY_NUMBERS = [
  { name: 'Police',             number: '100',  emoji: '👮' },
  { name: 'Ambulance',          number: '108',  emoji: '🚑' },
  { name: 'Women Helpline',     number: '1091', emoji: '👩' },
  { name: 'Fire Brigade',       number: '101',  emoji: '🚒' },
  { name: 'CampusNest Support', number: '1800-XXX-XXXX', emoji: '🏠' },
];

const INITIAL_CONTACTS = [
  { id: 'c1', name: 'Mom', phone: '+91 98765 43210', relation: 'Parent' },
  { id: 'c2', name: 'Rahul',phone: '+91 87654 32109', relation: 'Friend' },
];

/* ── Safety score ring ── */
function SafetyRing({ score }) {
  const pct   = (score / 10) * 100;
  const r     = 52;
  const circ  = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;
  const color = score >= 8 ? 'var(--sage)' : score >= 6 ? 'var(--gold)' : 'var(--terracotta)';

  return (
    <div className="safety-ring" aria-label={`Safety score: ${score} out of 10`}>
      <svg
        className="safety-ring__svg"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="safety-ring__inner">
        <span
          className="safety-ring__score"
          style={{ color }}
        >
          {score}
        </span>
        <span className="safety-ring__label">/10</span>
      </div>
    </div>
  );
}

/* ── Trusted contact row ── */
function ContactRow({ contact, onRemove }) {
  return (
    <div className="safety-contact-row">
      <div className="safety-contact-row__avatar" aria-hidden="true">
        {contact.name.charAt(0).toUpperCase()}
      </div>
      <div className="safety-contact-row__info">
        <p className="safety-contact-row__name">{contact.name}</p>
        <p className="safety-contact-row__meta">
          {contact.phone} · {contact.relation}
        </p>
      </div>
      <button
        type="button"
        className="safety-contact-row__remove"
        onClick={() => onRemove(contact.id)}
        aria-label={`Remove ${contact.name} from trusted contacts`}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Main component ── */
function Safety() {
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const [sosActive,   setSosActive  ] = useState(false);
  const [sosCount,    setSosCount   ] = useState(3); // countdown seconds
  const [contacts,    setContacts   ] = useState(INITIAL_CONTACTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName,     setNewName    ] = useState('');
  const [newPhone,    setNewPhone   ] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [addErrors,   setAddErrors  ] = useState({});
  const [reportText,  setReportText ] = useState('');
  const [reportSent,  setReportSent ] = useState(false);

  const sosTimerRef = useRef(null);

  /* SOS countdown */
  useEffect(() => {
    if (!sosActive) {
      setSosCount(3);
      clearInterval(sosTimerRef.current);
      return;
    }

    sosTimerRef.current = setInterval(() => {
      setSosCount(prev => {
        if (prev <= 1) {
          clearInterval(sosTimerRef.current);
          setSosActive(false);
          /* TODO: trigger actual SOS API call here */
          alert('SOS ALERT SENT to all trusted contacts!');
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(sosTimerRef.current);
  }, [sosActive]);

  const handleSOS = useCallback(() => {
    if (contacts.length === 0) {
      alert('Please add at least one trusted contact before using SOS.');
      return;
    }
    setSosActive(true);
  }, [contacts]);

  const handleCancelSOS = useCallback(() => {
    setSosActive(false);
  }, []);

  /* Add contact */
  const handleAddContact = useCallback((e) => {
    e.preventDefault();

    const nameClean     = sanitizeText(newName, 100);
    const phoneClean    = sanitizePhone(newPhone);
    const relationClean = sanitizeText(newRelation, 50);

    const nameResult    = validateRequired(nameClean, 'Name', 100);
    const phoneResult   = validatePhone(phoneClean);

    if (!nameResult.valid || !phoneResult.valid) {
      setAddErrors({
        name:  !nameResult.valid  ? nameResult.message  : '',
        phone: !phoneResult.valid ? phoneResult.message : '',
      });
      return;
    }

    if (contacts.length >= 5) {
      setAddErrors({ general: 'Maximum 5 trusted contacts allowed.' });
      return;
    }

    setContacts(prev => [
      ...prev,
      {
        id:       `c${Date.now()}`,
        name:     nameClean,
        phone:    phoneClean,
        relation: relationClean || 'Contact',
      },
    ]);

    setNewName('');
    setNewPhone('');
    setNewRelation('');
    setAddErrors({});
    setShowAddForm(false);
  }, [newName, newPhone, newRelation, contacts.length]);

  const handleRemoveContact = useCallback((id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  /* Anonymous report */
  const handleReport = useCallback((e) => {
    e.preventDefault();
    const clean = sanitizeText(reportText, 2000);
    if (clean.trim().length < 10) return;
    /* TODO: POST /api/safety/report { text: clean } */
    setReportSent(true);
    setReportText('');
    setTimeout(() => setReportSent(false), 5000);
  }, [reportText]);

  return (
    <>
      <Loader loading={loading} />
      <div className="safety-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Dark hero ── */}
          <section className="safety-hero" aria-labelledby="safety-title">
            <div className="safety-hero__orb safety-hero__orb--a" aria-hidden="true" />
            <div className="safety-hero__orb safety-hero__orb--b" aria-hidden="true" />

            <div className="safety-hero__inner">
              <div className="safety-hero__text">
                <p className="safety-hero__eyebrow">Safety Network</p>
                <h1 id="safety-title" className="safety-hero__title">
                  Your <em>safety</em>,<br />
                  our priority
                </h1>
                <p className="safety-hero__sub">
                  Real-time monitoring · SOS alerts · Anonymous reporting ·
                  Community watch
                </p>
              </div>

              {/* Safety score */}
              <div className="safety-hero__score-block">
                <SafetyRing score={8.9} />
                <div className="safety-hero__score-info">
                  <p className="safety-hero__score-label">Your Area Score</p>
                  <p className="safety-hero__score-area">
                    North Campus, Delhi
                  </p>
                  <p className="safety-hero__score-status">
                    ✓ Generally Safe
                  </p>
                </div>
              </div>
            </div>

            {/* ── SOS button ── */}
            <div className="safety-sos-wrap">
              {!sosActive ? (
                <button
                  type="button"
                  className="safety-sos-btn"
                  onClick={handleSOS}
                  aria-label="Activate emergency SOS alert"
                >
                  <span
                    className="safety-sos-btn__icon"
                    aria-hidden="true"
                  >
                    🆘
                  </span>
                  <div>
                    <p className="safety-sos-btn__label">
                      Emergency SOS
                    </p>
                    <p className="safety-sos-btn__sub">
                      Hold to alert your trusted contacts
                    </p>
                  </div>
                </button>
              ) : (
                <div
                  className="safety-sos-active"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="safety-sos-active__text">
                    🆘 Sending SOS in{' '}
                    <span className="safety-sos-active__count">
                      {sosCount}
                    </span>
                    s…
                  </p>
                  <button
                    type="button"
                    className="safety-sos-active__cancel"
                    onClick={handleCancelSOS}
                    aria-label="Cancel SOS alert"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── Feature cards ── */}
          <section
            className="safety-features-section"
            aria-labelledby="safety-features-title"
          >
            <div className="safety-features-section__inner">
              <h2
                id="safety-features-title"
                className="sr-only"
              >
                Safety Features
              </h2>
              <div
                className="safety-features-grid reveal"
                role="list"
                aria-label="Safety features"
              >
                {SAFETY_FEATURES.map((f, i) => (
                  <ScrollReveal
                    key={f.id}
                    delay={i % 4}
                    as="article"
                    role="listitem"
                    className="safety-feat-card"
                    style={{ '--feat-color': f.color }}
                    aria-label={f.title}
                  >
                    <div
                      className="safety-feat-card__icon"
                      style={{ background: f.iconBg }}
                      aria-hidden="true"
                    >
                      {f.icon}
                    </div>
                    <h3 className="safety-feat-card__title">{f.title}</h3>
                    <p className="safety-feat-card__desc">{f.desc}</p>
                    <button
                      type="button"
                      className="safety-feat-card__action"
                      aria-label={f.action}
                    >
                      {f.action} →
                    </button>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── Body grid ── */}
          <div className="safety-body">

            {/* ── Left column ── */}
            <div className="safety-body__left">

              {/* Trusted contacts */}
              <ErrorBoundary>
                <ScrollReveal>
                  <section
                    className="safety-panel"
                    aria-labelledby="contacts-title"
                  >
                    <div className="safety-panel__header">
                      <h2
                        id="contacts-title"
                        className="safety-panel__title"
                      >
                        📞 Trusted Contacts
                      </h2>
                      <span className="safety-panel__count">
                        {contacts.length}/5
                      </span>
                    </div>

                    {contacts.length === 0 && (
                      <p className="safety-panel__empty">
                        No contacts added yet. Add up to 5 trusted contacts
                        who will be notified during an SOS.
                      </p>
                    )}

                    <div
                      className="safety-contacts-list"
                      role="list"
                      aria-label="Trusted contacts"
                    >
                      {contacts.map(c => (
                        <div key={c.id} role="listitem">
                          <ContactRow
                            contact={c}
                            onRemove={handleRemoveContact}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Add form */}
                    {showAddForm ? (
                      <form
                        className="safety-add-form"
                        onSubmit={handleAddContact}
                        noValidate
                        aria-label="Add trusted contact"
                      >
                        {addErrors.general && (
                          <p
                            className="safety-add-form__error"
                            role="alert"
                          >
                            {addErrors.general}
                          </p>
                        )}

                        <div className="safety-add-form__row">
                          <div className="safety-add-form__field">
                            <label
                              htmlFor="contact-name"
                              className="safety-add-form__label"
                            >
                              Name
                            </label>
                            <input
                              id="contact-name"
                              type="text"
                              className={`safety-add-form__input${addErrors.name ? ' safety-add-form__input--error' : ''}`}
                              placeholder="e.g. Mom, Rahul"
                              value={newName}
                              onChange={e => {
                                setNewName(sanitizeText(e.target.value, 100));
                                if (addErrors.name) setAddErrors(p => ({ ...p, name: '' }));
                              }}
                              maxLength={100}
                              autoFocus
                            />
                            {addErrors.name && (
                              <p className="safety-add-form__field-error" role="alert">
                                {addErrors.name}
                              </p>
                            )}
                          </div>

                          <div className="safety-add-form__field">
                            <label
                              htmlFor="contact-phone"
                              className="safety-add-form__label"
                            >
                              Phone
                            </label>
                            <input
                              id="contact-phone"
                              type="tel"
                              className={`safety-add-form__input${addErrors.phone ? ' safety-add-form__input--error' : ''}`}
                              placeholder="+91 98765 43210"
                              value={newPhone}
                              onChange={e => {
                                setNewPhone(sanitizePhone(e.target.value));
                                if (addErrors.phone) setAddErrors(p => ({ ...p, phone: '' }));
                              }}
                              maxLength={17}
                            />
                            {addErrors.phone && (
                              <p className="safety-add-form__field-error" role="alert">
                                {addErrors.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="safety-add-form__field">
                          <label
                            htmlFor="contact-relation"
                            className="safety-add-form__label"
                          >
                            Relation (optional)
                          </label>
                          <input
                            id="contact-relation"
                            type="text"
                            className="safety-add-form__input"
                            placeholder="e.g. Parent, Friend, Warden"
                            value={newRelation}
                            onChange={e =>
                              setNewRelation(
                                sanitizeText(e.target.value, 50)
                              )
                            }
                            maxLength={50}
                          />
                        </div>

                        <div className="safety-add-form__actions">
                          <button
                            type="submit"
                            className="safety-add-form__submit"
                          >
                            Add Contact
                          </button>
                          <button
                            type="button"
                            className="safety-add-form__cancel"
                            onClick={() => {
                              setShowAddForm(false);
                              setAddErrors({});
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      contacts.length < 5 && (
                        <button
                          type="button"
                          className="safety-add-btn"
                          onClick={() => setShowAddForm(true)}
                          aria-label="Add a trusted contact"
                        >
                          + Add Trusted Contact
                        </button>
                      )
                    )}
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Anonymous report */}
              <ErrorBoundary>
                <ScrollReveal delay={1}>
                  <section
                    className="safety-panel"
                    aria-labelledby="report-title"
                  >
                    <h2
                      id="report-title"
                      className="safety-panel__title"
                    >
                      🔕 File Anonymous Report
                    </h2>
                    <p className="safety-panel__desc">
                      Report unsafe PGs, suspicious activity, or
                      incidents in your area. Your identity is fully
                      protected.
                    </p>

                    {reportSent ? (
                      <div
                        className="safety-report-success"
                        role="status"
                        aria-live="polite"
                      >
                        ✅ Your report has been submitted anonymously.
                        Our team will review it within 24 hours.
                      </div>
                    ) : (
                      <form
                        onSubmit={handleReport}
                        noValidate
                        aria-label="Submit anonymous safety report"
                      >
                        <label
                          htmlFor="report-text"
                          className="safety-add-form__label"
                        >
                          Describe the issue
                        </label>
                        <textarea
                          id="report-text"
                          className="safety-report-textarea"
                          rows={4}
                          placeholder="Describe what happened, where, and when…"
                          value={reportText}
                          onChange={e =>
                            setReportText(
                              sanitizeText(e.target.value, 2000)
                            )
                          }
                          maxLength={2000}
                          aria-describedby="report-char-count"
                        />
                        <div className="safety-report-meta">
                          <p
                            id="report-char-count"
                            className="safety-report-chars"
                            aria-live="polite"
                          >
                            {reportText.length}/2000
                          </p>
                          <button
                            type="submit"
                            className="safety-report-submit"
                            disabled={reportText.trim().length < 10}
                            aria-disabled={reportText.trim().length < 10}
                          >
                            Submit Anonymously →
                          </button>
                        </div>
                      </form>
                    )}
                  </section>
                </ScrollReveal>
              </ErrorBoundary>
            </div>

            {/* ── Right column ── */}
            <div className="safety-body__right">

              {/* Community incidents */}
              <ErrorBoundary>
                <ScrollReveal>
                  <section
                    className="safety-panel"
                    aria-labelledby="incidents-title"
                  >
                    <h2
                      id="incidents-title"
                      className="safety-panel__title"
                    >
                      📡 Community Reports
                    </h2>
                    <ul
                      className="safety-incidents"
                      aria-label="Recent community safety reports"
                    >
                      {INCIDENTS.map((item, i) => (
                        <li
                          key={i}
                          className={`safety-incident safety-incident--${item.type}`}
                        >
                          <span
                            className="safety-incident__icon"
                            aria-hidden="true"
                          >
                            {item.icon}
                          </span>
                          <span className="safety-incident__text">
                            {item.text}
                          </span>
                          <span className="safety-incident__time">
                            {item.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Map placeholder */}
              <ErrorBoundary>
                <ScrollReveal delay={1}>
                  <section
                    className="safety-panel"
                    aria-labelledby="map-title"
                  >
                    <h2
                      id="map-title"
                      className="safety-panel__title"
                    >
                      🗺️ Live Safety Heatmap
                    </h2>
                    <div
                      className="safety-map"
                      role="img"
                      aria-label="Safety heatmap showing green zone for current area"
                    >
                      {/* Animated map dots */}
                      <div className="safety-map__pulse" aria-hidden="true">
                        <span className="safety-map__dot" />
                        <span className="safety-map__ring" />
                        <span className="safety-map__ring safety-map__ring--2" />
                      </div>
                      <div className="safety-map__label">
                        <span aria-hidden="true">🗺️</span>
                        <p>Your area: <strong>Green Zone</strong></p>
                        <p>Safety heatmap — updated hourly</p>
                      </div>
                    </div>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Emergency numbers */}
              <ErrorBoundary>
                <ScrollReveal delay={2}>
                  <section
                    className="safety-panel"
                    aria-labelledby="emergency-title"
                  >
                    <h2
                      id="emergency-title"
                      className="safety-panel__title"
                    >
                      🚨 Emergency Numbers
                    </h2>
                    <ul
                      className="safety-emergency-list"
                      aria-label="Emergency contact numbers"
                    >
                      {EMERGENCY_NUMBERS.map(e => (
                        <li
                          key={e.name}
                          className="safety-emergency-item"
                        >
                          <span
                            className="safety-emergency-item__emoji"
                            aria-hidden="true"
                          >
                            {e.emoji}
                          </span>
                          <span className="safety-emergency-item__name">
                            {e.name}
                          </span>
                          <a
                            href={`tel:${e.number}`}
                            className="safety-emergency-item__number"
                            aria-label={`Call ${e.name}: ${e.number}`}
                          >
                            {e.number}
                          </a>
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

export default Safety;