/* ============================================================
   CAMPUSNEST — Help & FAQ Page  (/help-faq)
   Sections:
   - Dark hero with search
   - Category cards (4 categories)
   - Expandable FAQ accordion
   - Contact support section
   ============================================================ */

import {
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Link }        from 'react-router-dom';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ROUTES }      from '../../utils/constants';
import { sanitizeSearch } from '../../utils/sanitize';
import './HelpFAQ.css';

/* ── Static data ── */
const CATEGORIES = [
  {
    id: 'pg',
    icon: '🏠',
    title: 'Finding a PG',
    count: 24,
    desc: 'Search tips, filters, virtual tours',
    color: 'rgba(200,88,58,0.10)',
    border: 'rgba(200,88,58,0.20)',
  },
  {
    id: 'payment',
    icon: '💳',
    title: 'Payments & Booking',
    count: 18,
    desc: 'Deposits, refunds, secure payment',
    color: 'rgba(122,158,126,0.10)',
    border: 'rgba(122,158,126,0.20)',
  },
  {
    id: 'safety',
    icon: '🛡️',
    title: 'Safety Features',
    count: 12,
    desc: 'SOS, trusted contacts, reports',
    color: 'rgba(212,168,83,0.10)',
    border: 'rgba(212,168,83,0.20)',
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Account & Profile',
    count: 15,
    desc: 'Login, password, settings',
    color: 'rgba(15,27,45,0.06)',
    border: 'var(--border)',
  },
];

const FAQS = [
  {
    id: 'faq1',
    category: 'pg',
    question: 'How do I verify a PG listing before booking?',
    answer:
      'All PGs on CampusNest go through a physical verification by our team before receiving the green "✓ Verified" badge. You can also read genuine student reviews, view high-quality photos, and book a free virtual or physical tour directly through the platform before committing to anything.',
  },
  {
    id: 'faq2',
    category: 'payment',
    question: 'Is there a brokerage fee to book through CampusNest?',
    answer:
      'No — CampusNest is completely free for students. We never charge brokerage or service fees for finding or booking a PG. The only payment is directly to the PG owner: your monthly rent and refundable security deposit.',
  },
  {
    id: 'faq3',
    category: 'safety',
    question: 'How does the SOS / Safety Network work?',
    answer:
      'When you tap the Emergency SOS button, CampusNest sends an instant alert (SMS + app notification) to all your trusted contacts with your current location. There is a 3-second countdown so you can cancel an accidental trigger. You can add up to 5 trusted contacts — parents, friends, or your warden — in the Safety section.',
  },
  {
    id: 'faq4',
    category: 'pg',
    question: 'Can I schedule a virtual tour before visiting in person?',
    answer:
      'Yes — every verified listing on CampusNest supports virtual tours. You can book a live video walkthrough with the PG owner directly through the listing page at a time that suits you. This is especially useful for students relocating from other cities.',
  },
  {
    id: 'faq5',
    category: 'account',
    question: 'I forgot my password. How do I reset it?',
    answer:
      'Click "Forgot password?" on the login page. Enter your registered email and we will send you a 6-digit OTP valid for 15 minutes. Enter the OTP, then set a strong new password. If you don\'t receive the email, check your spam folder or try resending after 30 seconds.',
  },
  {
    id: 'faq6',
    category: 'payment',
    question: 'How is the security deposit refunded?',
    answer:
      'The security deposit is held by the PG owner and is typically refunded within 7–10 working days after you vacate, provided there is no damage to the property. CampusNest provides a documented digital receipt for all deposits paid through the platform to protect both parties.',
  },
  {
    id: 'faq7',
    category: 'pg',
    question: 'Can I list my PG on CampusNest as an owner?',
    answer:
      'Absolutely. Visit the Owner Dashboard page and click "Add New PG". Our team will schedule a physical verification visit within 48 hours. Once verified, your listing goes live immediately. There is no listing fee — we only charge a small commission on successful bookings.',
  },
  {
    id: 'faq8',
    category: 'safety',
    question: 'Is my anonymous safety report really anonymous?',
    answer:
      'Yes. Anonymous reports are stripped of all personally identifiable information before they are reviewed by our moderation team. We never share reporter identity with PG owners or third parties. Your report helps keep the community safe without any risk to you.',
  },
  {
    id: 'faq9',
    category: 'account',
    question: 'What cities does CampusNest currently support?',
    answer:
      'CampusNest currently covers Delhi NCR, Mumbai, Bengaluru, Pune, Chennai, Kolkata, Hyderabad, and Varanasi — with 500+ colleges mapped across these cities. We are expanding rapidly. If your college isn\'t listed, use the "Suggest a College" feature in the College Discovery page.',
  },
  {
    id: 'faq10',
    category: 'payment',
    question: 'What payment methods are accepted?',
    answer:
      'CampusNest supports all major payment methods: UPI (Google Pay, PhonePe, Paytm), Net Banking, Debit/Credit Cards (Visa, Mastercard, RuPay), and EMI options for security deposits. All payments are processed through a PCI-DSS compliant payment gateway.',
  },
];

const CONTACT_OPTIONS = [
  {
    icon: '💬',
    title: 'Live Chat',
    desc: 'Chat with a support agent',
    availability: 'Mon–Sat, 9AM–9PM',
    action: 'Start Chat',
    color: 'var(--terracotta)',
  },
  {
    icon: '📧',
    title: 'Email Support',
    desc: 'support@campusnest.in',
    availability: 'Response within 24 hours',
    action: 'Send Email',
    color: 'var(--navy)',
  },
  {
    icon: '📞',
    title: 'Phone',
    desc: '1800-XXX-XXXX (Toll free)',
    availability: 'Mon–Fri, 10AM–6PM',
    action: 'Call Now',
    color: 'var(--sage)',
  },
];

/* ── FAQ item (accordion) ── */
function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
    >
      <button
        type="button"
        className="faq-item__question"
        onClick={() => onToggle(faq.id)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
        id={`faq-btn-${faq.id}`}
      >
        <span className="faq-item__q-text">{faq.question}</span>
        <span
          className={`faq-item__chevron${isOpen ? ' faq-item__chevron--open' : ''}`}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      <div
        id={`faq-answer-${faq.id}`}
        role="region"
        aria-labelledby={`faq-btn-${faq.id}`}
        className="faq-item__answer-wrap"
        hidden={!isOpen}
      >
        <p className="faq-item__answer">{faq.answer}</p>
      </div>
    </div>
  );
}

/* ── Main component ── */
function HelpFAQ() {
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const [searchRaw,     setSearchRaw    ] = useState('');
  const [activeCategory,setActiveCategory] = useState('all');
  const [openFaq,       setOpenFaq      ] = useState(null);

  const handleToggle = useCallback((id) => {
    setOpenFaq(prev => (prev === id ? null : id));
  }, []);

  /* Filter FAQs */
  const filteredFaqs = useMemo(() => {
    let list = [...FAQS];

    if (activeCategory !== 'all') {
      list = list.filter(f => f.category === activeCategory);
    }

    const q = searchRaw.trim().toLowerCase();
    if (q.length >= 2) {
      list = list.filter(
        f =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchRaw]);

  return (
    <>
      <Loader loading={loading} />
      <div className="help-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Hero ── */}
          <section className="help-hero" aria-labelledby="help-hero-title">
            <div className="help-hero__orb help-hero__orb--a" aria-hidden="true" />
            <div className="help-hero__orb help-hero__orb--b" aria-hidden="true" />

            <div className="help-hero__inner">
              <p className="help-hero__eyebrow">Help Center</p>
              <h1 id="help-hero-title" className="help-hero__title">
                How can we <em>help</em> you?
              </h1>
              <p className="help-hero__sub">
                Search our knowledge base or browse categories below.
              </p>

              {/* Search */}
              <div
                className="help-hero__search"
                role="search"
                aria-label="Search help articles"
              >
                <label htmlFor="help-search" className="sr-only">
                  Search FAQs and help articles
                </label>
                <span aria-hidden="true" className="help-hero__search-icon">
                  🔍
                </span>
                <input
                  id="help-search"
                  type="text"
                  className="help-hero__search-input"
                  placeholder="Search FAQs, guides, troubleshooting…"
                  value={searchRaw}
                  onChange={e => setSearchRaw(sanitizeSearch(e.target.value))}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={200}
                />
                {searchRaw && (
                  <button
                    type="button"
                    className="help-hero__search-clear"
                    onClick={() => setSearchRaw('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick links */}
              <div className="help-hero__quick-links">
                <span className="help-hero__quick-label">
                  Popular:
                </span>
                {['PG verification', 'Security deposit', 'SOS feature', 'Password reset'].map(q => (
                  <button
                    key={q}
                    type="button"
                    className="help-hero__quick-chip"
                    onClick={() => setSearchRaw(q)}
                    aria-label={`Search for ${q}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Categories ── */}
          <ErrorBoundary>
            <section
              className="help-categories-section"
              aria-labelledby="help-categories-title"
            >
              <div className="help-categories-section__inner">
                <h2
                  id="help-categories-title"
                  className="sr-only"
                >
                  Help Categories
                </h2>

                <div
                  className="help-categories-grid"
                  role="list"
                  aria-label="Help categories"
                >
                  {/* All category */}
                  <ScrollReveal>
                    <button
                      type="button"
                      className={`help-cat-card${activeCategory === 'all' ? ' help-cat-card--active' : ''}`}
                      onClick={() => setActiveCategory('all')}
                      aria-pressed={activeCategory === 'all'}
                      role="listitem"
                      style={{
                        '--cat-color': 'rgba(15,27,45,0.06)',
                        '--cat-border': 'var(--border)',
                      }}
                    >
                      <span className="help-cat-card__icon" aria-hidden="true">
                        📚
                      </span>
                      <h3 className="help-cat-card__title">All Topics</h3>
                      <p className="help-cat-card__count">
                        {FAQS.length} articles
                      </p>
                    </button>
                  </ScrollReveal>

                  {CATEGORIES.map((cat, i) => (
                    <ScrollReveal key={cat.id} delay={(i + 1) % 4}>
                      <button
                        type="button"
                        className={`help-cat-card${activeCategory === cat.id ? ' help-cat-card--active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        aria-pressed={activeCategory === cat.id}
                        role="listitem"
                        style={{
                          '--cat-color': cat.color,
                          '--cat-border': cat.border,
                        }}
                      >
                        <span
                          className="help-cat-card__icon"
                          aria-hidden="true"
                        >
                          {cat.icon}
                        </span>
                        <h3 className="help-cat-card__title">{cat.title}</h3>
                        <p className="help-cat-card__desc">{cat.desc}</p>
                        <p className="help-cat-card__count">
                          {cat.count} articles
                        </p>
                      </button>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* ── FAQ Accordion ── */}
          <ErrorBoundary>
            <section
              className="help-faq-section"
              aria-labelledby="faq-section-title"
            >
              <div className="help-faq-section__inner">
                <div className="help-faq-section__header">
                  <div>
                    <p className="help-section-eyebrow">
                      {activeCategory === 'all'
                        ? 'All Questions'
                        : CATEGORIES.find(c => c.id === activeCategory)?.title ?? ''}
                    </p>
                    <h2
                      id="faq-section-title"
                      className="help-section-title"
                    >
                      Frequently Asked Questions
                    </h2>
                  </div>
                  <p
                    className="help-faq-section__count"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {filteredFaqs.length} question
                    {filteredFaqs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {filteredFaqs.length === 0 ? (
                  <div className="help-empty" role="status">
                    <span aria-hidden="true">🔍</span>
                    <h3>No results found</h3>
                    <p>
                      Try different keywords or{' '}
                      <button
                        type="button"
                        className="help-empty__reset"
                        onClick={() => {
                          setSearchRaw('');
                          setActiveCategory('all');
                        }}
                      >
                        clear all filters
                      </button>
                    </p>
                  </div>
                ) : (
                  <div
                    className="help-faq-list"
                    role="list"
                    aria-label="FAQ accordion"
                  >
                    {filteredFaqs.map(faq => (
                      <ScrollReveal key={faq.id} as="div" role="listitem">
                        <FAQItem
                          faq={faq}
                          isOpen={openFaq === faq.id}
                          onToggle={handleToggle}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </ErrorBoundary>

          {/* ── Contact Support ── */}
          <ErrorBoundary>
            <section
              className="help-contact-section"
              aria-labelledby="help-contact-title"
            >
              <div className="help-contact-section__inner">
                <ScrollReveal>
                  <div className="help-contact-section__header">
                    <p className="help-section-eyebrow">Still need help?</p>
                    <h2
                      id="help-contact-title"
                      className="help-section-title"
                    >
                      Contact our support team
                    </h2>
                    <p className="help-section-sub">
                      Our team is here to help you find the perfect
                      student accommodation.
                    </p>
                  </div>
                </ScrollReveal>

                <div
                  className="help-contact-grid"
                  role="list"
                  aria-label="Support contact options"
                >
                  {CONTACT_OPTIONS.map((opt, i) => (
                    <ScrollReveal
                      key={opt.title}
                      delay={i}
                      as="article"
                      role="listitem"
                      className="help-contact-card"
                    >
                      <div
                        className="help-contact-card__icon"
                        style={{ background: `${opt.color}18` }}
                        aria-hidden="true"
                      >
                        <span style={{ color: opt.color }}>
                          {opt.icon}
                        </span>
                      </div>
                      <h3 className="help-contact-card__title">
                        {opt.title}
                      </h3>
                      <p className="help-contact-card__desc">{opt.desc}</p>
                      <p className="help-contact-card__availability">
                        {opt.availability}
                      </p>
                      <button
                        type="button"
                        className="help-contact-card__btn"
                        style={{ background: opt.color }}
                        aria-label={`${opt.action} via ${opt.title}`}
                      >
                        {opt.action} →
                      </button>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          </ErrorBoundary>

        </main>
        <Footer />
      </div>
    </>
  );
}

export default HelpFAQ;