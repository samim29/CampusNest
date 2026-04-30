/* ============================================================
   CAMPUSNEST — PG Detail Page  (/pg/:id)
   Sections:
   - Hero image strip with badges + share + favourite
   - Info: name, location, rating, type chips
   - Amenities grid
   - Room types + pricing table
   - House rules
   - Reviews list
   - Sticky booking sidebar: price, move-in date, room type, CTA
   ============================================================ */

import {
  useState,
  useCallback,
  useRef,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import Button          from '../../components/ui/Button';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ROUTES }      from '../../utils/constants';
import './PGDetail.css';

/* ── Static PG detail data — replace with GET /api/pgs/:id ── */
const PG_DETAIL_DATA = {
  '1': {
    id:'1', name:'Sunrise Boys PG',
    type:'Boys PG', badge:'verified',
    location:'1.2 km from Delhi University',
    fullAddress:'23, Hudson Lane, GTB Nagar, New Delhi – 110009',
    college:'Delhi University', city:'New Delhi',
    rating:4.5, reviews:48, ratingBreakdown:{ 5:30, 4:12, 3:4, 2:1, 1:1 },
    gradient:'linear-gradient(135deg,#fde8d8,#f4a57a)',
    emoji:'🏠',
    description:
      'Sunrise Boys PG is a well-maintained, fully-furnished accommodation just 1.2 km from Delhi University North Campus. Ideal for students who value cleanliness, community, and convenience. Run by a friendly family for over 10 years.',
    amenities:[
      { icon:'📶', name:'High-Speed Wi-Fi' },
      { icon:'❄️', name:'Air Conditioning'  },
      { icon:'🍽️', name:'Meals Included'   },
      { icon:'🅿️', name:'Parking'          },
      { icon:'🔒', name:'24/7 Security'    },
      { icon:'📺', name:'TV in Room'        },
      { icon:'💧', name:'Hot Water'         },
      { icon:'🔌', name:'Power Backup'      },
      { icon:'📷', name:'CCTV'             },
      { icon:'🧹', name:'Housekeeping'     },
    ],
    roomTypes:[
      { type:'Single Occupancy', price:12000, deposit:24000, available:3 },
      { type:'Double Occupancy', price:8500,  deposit:17000, available:1 },
      { type:'Triple Occupancy', price:7000,  deposit:14000, available:0 },
    ],
    rules:[
      'No smoking on premises',
      'Guests allowed till 9:00 PM',
      'Gate closes at 11:00 PM',
      'No loud music after 10 PM',
      'Kitchen access 7 AM – 10 PM',
    ],
    reviewList:[
      { name:'Priya Sharma',  avatar:'👩‍🎓', college:'2nd Year, DU', rating:5, text:'Found my PG in 2 days! The virtual tour saved me. The room is exactly as described.', date:'Mar 2026' },
      { name:'Arjun Mehta',   avatar:'👨‍💻', college:'1st Year, DU', rating:4, text:'Good location, clean rooms. Food is decent. Management is responsive to issues.', date:'Feb 2026' },
      { name:'Siya Gupta',    avatar:'👩‍🔬', college:'3rd Year, DU', rating:5, text:'The Wi-Fi is excellent and the security is tight. Feel very safe here.', date:'Jan 2026' },
    ],
    ownerName:'Ramesh Kumar',
    ownerSince:'2014',
  },
  '3': {
    id:'3', name:'City Center Co-Living',
    type:'Co-Living', badge:'premium',
    location:'2.0 km from IIT Bombay',
    fullAddress:'45, Hiranandani Gardens, Powai, Mumbai – 400076',
    college:'IIT Bombay', city:'Mumbai',
    rating:4.7, reviews:89, ratingBreakdown:{ 5:60, 4:22, 3:5, 2:1, 1:1 },
    gradient:'linear-gradient(135deg,#e8d8f0,#a07ab8)',
    emoji:'🏢',
    description:
      'City Center Co-Living is a premium shared living space designed for students and young professionals near IIT Bombay. With high-speed internet, gym access, and a rooftop café, it offers a holistic living experience.',
    amenities:[
      { icon:'📶', name:'Gigabit Wi-Fi'    },
      { icon:'❄️', name:'Air Conditioning' },
      { icon:'🏋️', name:'Gym Access'      },
      { icon:'☕', name:'Rooftop Café'      },
      { icon:'🔒', name:'Smart Lock Entry' },
      { icon:'📺', name:'Common TV Lounge' },
      { icon:'💧', name:'Hot Water'        },
      { icon:'🔌', name:'Power Backup'     },
      { icon:'📷', name:'CCTV'            },
      { icon:'🛁', name:'Attached Bath'   },
    ],
    roomTypes:[
      { type:'Single Occupancy', price:15000, deposit:30000, available:2 },
      { type:'Double Occupancy', price:11000, deposit:22000, available:3 },
    ],
    rules:[
      'No smoking inside building',
      'Guests allowed — register at reception',
      'Gate closes at midnight',
      'Quiet hours after 11 PM',
      'Communal spaces kept clean',
    ],
    reviewList:[
      { name:'Rahul Verma', avatar:'👨‍💻', college:'3rd Year, IIT-B', rating:5, text:'Best co-living in Powai. The gym and café are game changers for study breaks.', date:'Apr 2026' },
      { name:'Ananya Reddy',avatar:'👩‍🔬', college:'1st Year, IIT-B', rating:5, text:'Safety features and smart locks are excellent. Parents feel reassured.', date:'Mar 2026' },
    ],
    ownerName:'Arun Mehta',
    ownerSince:'2019',
  },
};

const FALLBACK_PG = {
  id:'0', name:'PG Not Found', type:'', badge:'verified',
  location:'', fullAddress:'', college:'', city:'',
  rating:0, reviews:0, ratingBreakdown:{},
  gradient:'linear-gradient(135deg,#f0ece8,#d4c8bc)',
  emoji:'🏠', description:'This PG listing could not be found.',
  amenities:[], roomTypes:[], rules:[], reviewList:[],
  ownerName:'', ownerSince:'',
};

/* ── Rating bar ── */
function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="pgd-rating-bar">
      <span className="pgd-rating-bar__label">{stars}★</span>
      <div
        className="pgd-rating-bar__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${stars} star: ${count} reviews`}
      >
        <div
          className="pgd-rating-bar__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="pgd-rating-bar__count">{count}</span>
    </div>
  );
}

/* ── Review card ── */
function ReviewCard({ review }) {
  return (
    <article
      className="pgd-review"
      aria-label={`Review by ${review.name}`}
    >
      <div className="pgd-review__header">
        <div
          className="pgd-review__avatar"
          aria-hidden="true"
        >
          {review.avatar}
        </div>
        <div>
          <p className="pgd-review__name">{review.name}</p>
          <p className="pgd-review__college">{review.college}</p>
        </div>
        <div className="pgd-review__meta">
          <span className="pgd-review__stars" aria-label={`${review.rating} out of 5 stars`}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </span>
          <span className="pgd-review__date">{review.date}</span>
        </div>
      </div>
      <p className="pgd-review__text">{review.text}</p>
    </article>
  );
}

/* ── Main component ── */
function PGDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const pg       = PG_DETAIL_DATA[id] ?? FALLBACK_PG;
  const notFound = pg.id === '0';

  const [isFav,       setIsFav      ] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(
    pg.roomTypes.length > 0 ? pg.roomTypes[0].type : ''
  );
  const [moveInDate,  setMoveInDate ] = useState('');
  const [bookingMsg,  setBookingMsg ] = useState('');

  const totalReviews = Object.values(pg.ratingBreakdown).reduce((a,b) => a+b, 0);

  const selectedRoomData = pg.roomTypes.find(r => r.type === selectedRoom);

  const handleBookVisit = useCallback(() => {
    if (!moveInDate) {
      setBookingMsg('Please select a move-in date first.');
      return;
    }
    setBookingMsg('');
    /*
     * TODO: Navigate to booking flow or open booking modal
     * navigate(`/booking/${pg.id}?room=${selectedRoom}&date=${moveInDate}`)
     */
    alert(`Booking visit for ${selectedRoom} on ${moveInDate}`);
  }, [moveInDate, selectedRoom, pg.id]);

  const handleShare = useCallback(async () => {
    const url  = window.location.href;
    const text = `Check out ${pg.name} on CampusNest — ${pg.location}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: pg.name, text, url });
      } catch {
        /* User cancelled share — ignore */
      }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setBookingMsg('Link copied to clipboard!');
      setTimeout(() => setBookingMsg(''), 3000);
    }
  }, [pg.name, pg.location]);

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="pgd-not-found">
          <span aria-hidden="true">🏠</span>
          <h1>PG Not Found</h1>
          <p>This listing may have been removed or the link is incorrect.</p>
          <Button as="link" to={ROUTES.PG_LISTINGS} variant="primary">
            Browse All PGs
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Loader loading={loading} />
      <div className="pgd-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Hero strip ── */}
          <div
            className="pgd-hero"
            style={{ background: pg.gradient }}
            aria-label={`Photo of ${pg.name}`}
          >
            {/* Back button */}
            <button
              className="pgd-hero__back"
              onClick={() => navigate(-1)}
              type="button"
              aria-label="Go back to listings"
            >
              ← Back to Listings
            </button>

            {/* Emoji placeholder */}
            <span
              className="pgd-hero__emoji"
              aria-hidden="true"
            >
              {pg.emoji}
            </span>

            {/* Badges */}
            <div className="pgd-hero__badges">
              <span
                className={`pgd-hero__badge${pg.badge === 'premium' ? ' pgd-hero__badge--premium' : ''}`}
              >
                {pg.badge === 'verified' ? '✓ Verified' : '⭐ Premium'}
              </span>
              {pg.rating >= 4.5 && (
                <span className="pgd-hero__badge pgd-hero__badge--top">
                  🏆 Top Rated
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pgd-hero__actions">
              <button
                className="pgd-hero__action-btn"
                onClick={handleShare}
                aria-label="Share this listing"
                type="button"
              >
                📤 Share
              </button>
              <button
                className={`pgd-hero__action-btn${isFav ? ' pgd-hero__action-btn--fav' : ''}`}
                onClick={() => setIsFav(v => !v)}
                aria-pressed={isFav}
                aria-label={isFav ? 'Remove from saved' : 'Save listing'}
                type="button"
              >
                {isFav ? '❤️ Saved' : '🤍 Save'}
              </button>
            </div>
          </div>

          {/* ── Content grid ── */}
          <div className="pgd-body">

            {/* ══ LEFT — Details ══ */}
            <div className="pgd-left">

              {/* Title block */}
              <ScrollReveal>
                <div className="pgd-title-block">
                  <p className="pgd-type">{pg.type}</p>
                  <h1 className="pgd-name">{pg.name}</h1>
                  <div className="pgd-meta-row">
                    <span className="pgd-location">
                      <span aria-hidden="true">📍</span> {pg.location}
                    </span>
                    <span className="pgd-meta-dot" aria-hidden="true">·</span>
                    <span
                      className="pgd-rating-inline"
                      aria-label={`Rated ${pg.rating} from ${pg.reviews} reviews`}
                    >
                      ★ {pg.rating} ({pg.reviews} reviews)
                    </span>
                  </div>
                  <p className="pgd-address">
                    <span aria-hidden="true">🏠</span> {pg.fullAddress}
                  </p>
                </div>
              </ScrollReveal>

              {/* Description */}
              <ErrorBoundary>
                <ScrollReveal delay={1}>
                  <section
                    className="pgd-section"
                    aria-labelledby="pgd-about"
                  >
                    <h2 id="pgd-about" className="pgd-section__title">
                      About this PG
                    </h2>
                    <p className="pgd-section__desc">{pg.description}</p>
                    <div className="pgd-owner-note">
                      <span aria-hidden="true">👤</span>
                      <span>
                        Managed by <strong>{pg.ownerName}</strong> since{' '}
                        {pg.ownerSince}
                      </span>
                    </div>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Amenities */}
              <ErrorBoundary>
                <ScrollReveal delay={1}>
                  <section
                    className="pgd-section"
                    aria-labelledby="pgd-amenities"
                  >
                    <h2 id="pgd-amenities" className="pgd-section__title">
                      🏠 What's included
                    </h2>
                    <ul
                      className="pgd-amenities"
                      aria-label="Amenities list"
                    >
                      {pg.amenities.map(a => (
                        <li key={a.name} className="pgd-amenity">
                          <span aria-hidden="true">{a.icon}</span>
                          <span>{a.name}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Room types */}
              <ErrorBoundary>
                <ScrollReveal delay={2}>
                  <section
                    className="pgd-section"
                    aria-labelledby="pgd-rooms"
                  >
                    <h2 id="pgd-rooms" className="pgd-section__title">
                      🛏️ Room Types &amp; Pricing
                    </h2>
                    <div
                      className="pgd-room-list"
                      role="list"
                      aria-label="Available room types"
                    >
                      {pg.roomTypes.map(r => (
                        <div
                          key={r.type}
                          className={`pgd-room-row${selectedRoom === r.type ? ' pgd-room-row--selected' : ''}${r.available === 0 ? ' pgd-room-row--unavailable' : ''}`}
                          onClick={() => r.available > 0 && setSelectedRoom(r.type)}
                          onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && r.available > 0) { e.preventDefault(); setSelectedRoom(r.type); }}}
                          role="radio"
                          aria-checked={selectedRoom === r.type}
                          aria-disabled={r.available === 0}
                          tabIndex={r.available > 0 ? 0 : -1}
                        >
                          <div className="pgd-room-row__select" aria-hidden="true">
                            {selectedRoom === r.type
                              ? <span className="pgd-room-row__radio pgd-room-row__radio--on" />
                              : <span className="pgd-room-row__radio" />
                            }
                          </div>
                          <div className="pgd-room-row__info">
                            <p className="pgd-room-row__type">{r.type}</p>
                            <p className="pgd-room-row__deposit">
                              ₹{r.deposit.toLocaleString('en-IN')} deposit
                            </p>
                          </div>
                          <div className="pgd-room-row__right">
                            <p className="pgd-room-row__price">
                              ₹{r.price.toLocaleString('en-IN')}
                              <span>/mo</span>
                            </p>
                            <p className={`pgd-room-row__avail${r.available === 0 ? ' pgd-room-row__avail--none' : ''}`}>
                              {r.available === 0 ? 'Full' : `${r.available} left`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* House rules */}
              <ErrorBoundary>
                <ScrollReveal delay={2}>
                  <section
                    className="pgd-section"
                    aria-labelledby="pgd-rules"
                  >
                    <h2 id="pgd-rules" className="pgd-section__title">
                      📋 House Rules
                    </h2>
                    <ul className="pgd-rules" aria-label="House rules">
                      {pg.rules.map((r, i) => (
                        <li key={i} className="pgd-rule-item">
                          <span className="pgd-rule-item__dot" aria-hidden="true" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

              {/* Reviews */}
              <ErrorBoundary>
                <ScrollReveal delay={3}>
                  <section
                    className="pgd-section"
                    aria-labelledby="pgd-reviews"
                  >
                    <h2 id="pgd-reviews" className="pgd-section__title">
                      ⭐ Student Reviews
                    </h2>

                    {/* Rating summary */}
                    <div className="pgd-rating-summary">
                      <div className="pgd-rating-summary__big">
                        <span className="pgd-rating-summary__num">
                          {pg.rating}
                        </span>
                        <span className="pgd-rating-summary__stars">
                          {'★'.repeat(Math.round(pg.rating))}
                        </span>
                        <span className="pgd-rating-summary__total">
                          {pg.reviews} reviews
                        </span>
                      </div>
                      <div className="pgd-rating-summary__bars">
                        {[5,4,3,2,1].map(s => (
                          <RatingBar
                            key={s}
                            stars={s}
                            count={pg.ratingBreakdown[s] ?? 0}
                            total={totalReviews}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review cards */}
                    <div
                      className="pgd-reviews-list"
                      role="list"
                      aria-label="Student reviews"
                    >
                      {pg.reviewList.map((r, i) => (
                        <div key={i} role="listitem">
                          <ReviewCard review={r} />
                        </div>
                      ))}
                    </div>
                  </section>
                </ScrollReveal>
              </ErrorBoundary>

            </div>

            {/* ══ RIGHT — Booking sidebar ══ */}
            <aside
              className="pgd-sidebar"
              aria-label="Booking panel"
            >
              {/* Price */}
              <div className="pgd-sidebar__price-row">
                <div>
                  <span className="pgd-sidebar__price">
                    ₹{(selectedRoomData?.price ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="pgd-sidebar__price-unit">/month</span>
                </div>
                {selectedRoomData?.available > 0 && (
                  <span className="pgd-sidebar__avail">
                    ✓ {selectedRoomData.available} room{selectedRoomData.available > 1 ? 's' : ''} left
                  </span>
                )}
              </div>

              {/* Rating */}
              <p className="pgd-sidebar__rating">
                ★ {pg.rating} · {pg.reviews} reviews
              </p>

              {/* Room type selector */}
              <div className="pgd-sidebar__field">
                <label
                  htmlFor="sidebar-room"
                  className="pgd-sidebar__label"
                >
                  Room Type
                </label>
                <select
                  id="sidebar-room"
                  className="pgd-sidebar__select"
                  value={selectedRoom}
                  onChange={e => setSelectedRoom(e.target.value)}
                  aria-label="Select room type"
                >
                  {pg.roomTypes.map(r => (
                    <option
                      key={r.type}
                      value={r.type}
                      disabled={r.available === 0}
                    >
                      {r.type}{r.available === 0 ? ' (Full)' : ` — ₹${r.price.toLocaleString('en-IN')}/mo`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Move-in date */}
              <div className="pgd-sidebar__field">
                <label
                  htmlFor="sidebar-date"
                  className="pgd-sidebar__label"
                >
                  Move-in Date
                </label>
                <input
                  id="sidebar-date"
                  type="date"
                  className="pgd-sidebar__input"
                  value={moveInDate}
                  onChange={e => {
                    setMoveInDate(e.target.value);
                    setBookingMsg('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  aria-label="Select move-in date"
                />
              </div>

              {/* Feedback message */}
              {bookingMsg && (
                <p
                  className="pgd-sidebar__msg"
                  role="alert"
                  aria-live="polite"
                >
                  {bookingMsg}
                </p>
              )}

              {/* Book CTA */}
              <Button
                variant="primary"
                size="md"
                onClick={handleBookVisit}
                className="pgd-sidebar__book-btn"
                type="button"
              >
                📅 Book a Visit
              </Button>

              {/* Contact row */}
              <div className="pgd-sidebar__contact">
                <button
                  type="button"
                  className="pgd-sidebar__contact-btn"
                  aria-label="Call the PG owner"
                >
                  📞 Call Owner
                </button>
                <button
                  type="button"
                  className="pgd-sidebar__contact-btn"
                  aria-label="WhatsApp the PG owner"
                >
                  💬 WhatsApp
                </button>
              </div>

              {/* Trust badges */}
              <div className="pgd-sidebar__trust">
                <p className="pgd-sidebar__trust-item">🔒 No brokerage fee</p>
                <p className="pgd-sidebar__trust-item">✓ Verified listing</p>
                <p className="pgd-sidebar__trust-item">🛡️ Safe payment</p>
              </div>

              {/* Deposit note */}
              {selectedRoomData && (
                <p className="pgd-sidebar__deposit-note">
                  Security deposit:{' '}
                  <strong>
                    ₹{selectedRoomData.deposit.toLocaleString('en-IN')}
                  </strong>{' '}
                  (refundable)
                </p>
              )}
            </aside>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default PGDetail;