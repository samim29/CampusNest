/* ============================================================
   CAMPUSNEST — Mess & Food Page  (/mess-food)
   Sections:
   - Dark hero with tab navigation
   - Campus Mess listings with hygiene bars
   - Nearby Restaurants grid
   - PG Meal Plans
   - Online Delivery partners
   - Today's menu modal
   ============================================================ */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { useSearchParams }  from 'react-router-dom';
import Navbar               from '../../components/layout/Navbar';
import Footer               from '../../components/layout/Footer';
import ErrorBoundary        from '../../components/ui/ErrorBoundary';
import Loader               from '../../components/ui/Loader';
import ScrollReveal         from '../../components/ui/ScrollReveal';
import usePageLoader        from '../../hooks/usePageLoader';
import useScrollReveal      from '../../hooks/useScrollReveal';
import { sanitizeSearch }   from '../../utils/sanitize';
import './MessFood.css';

/* ── Static data ── */
const MESS_LIST = [
  {
    id: '1', name: 'Campus Central Mess',
    type: 'campus', emoji: '🏫',
    hygiene: 9.2, rating: 4.6, reviews: 120,
    timing: '7:00 AM – 9:30 PM',
    price: '₹150 – ₹250 / meal',
    tags: ['Veg & Non-Veg', 'Daily Menu', 'Certified'],
    menu: {
      Breakfast: { time: '7:00 AM – 9:30 AM', price: '₹60',  items: 'Poha, Idli, Chai, Bread Butter' },
      Lunch:     { time: '12:00 PM – 2:00 PM', price: '₹80',  items: 'Dal Makhani, Jeera Rice, Roti, Sabzi, Salad' },
      Snacks:    { time: '4:30 PM – 6:00 PM',  price: '₹30',  items: 'Samosa, Tea / Coffee' },
      Dinner:    { time: '7:00 PM – 9:30 PM',  price: '₹90',  items: 'Paneer Sabzi, Dal Tadka, Rice, Roti, Dessert' },
    },
  },
  {
    id: '2', name: 'Annapurna Dining Hall',
    type: 'campus', emoji: '🍱',
    hygiene: 8.7, rating: 4.3, reviews: 88,
    timing: '8:00 AM – 9:00 PM',
    price: '₹120 – ₹200 / meal',
    tags: ['Pure Veg', 'Monthly Plans', 'Homestyle'],
    menu: {
      Breakfast: { time: '8:00 AM – 10:00 AM', price: '₹50',  items: 'Upma, Paratha, Chai, Fruit' },
      Lunch:     { time: '12:30 PM – 2:30 PM', price: '₹70',  items: 'Rajma, Rice, Roti, Aloo Sabzi, Buttermilk' },
      Dinner:    { time: '7:30 PM – 9:00 PM',  price: '₹75',  items: 'Mix Veg, Dal, Rice, Roti, Kheer' },
    },
  },
  {
    id: '3', name: 'Student Canteen Block C',
    type: 'campus', emoji: '🥘',
    hygiene: 8.1, rating: 4.0, reviews: 64,
    timing: '9:00 AM – 8:00 PM',
    price: '₹80 – ₹150 / meal',
    tags: ['Quick Bites', 'Affordable', 'Snacks'],
    menu: {
      Breakfast: { time: '9:00 AM – 11:00 AM', price: '₹40',  items: 'Vada Pav, Bun Maska, Tea' },
      Lunch:     { time: '1:00 PM – 3:00 PM',  price: '₹65',  items: 'Thali — Roti, Dal, Sabzi, Rice, Papad' },
      Snacks:    { time: '4:00 PM – 6:30 PM',  price: '₹25',  items: 'Maggi, Samosa, Chai, Cold Drinks' },
    },
  },
];

const RESTAURANT_LIST = [
  { id:'r1', name:"Domino's Pizza",     emoji:'🍕', distance:'0.8 km', rating:4.2, priceFor2:'₹400', cuisine:'Pizza, Fast Food',        tags:['Delivery','Dine-in'] },
  { id:'r2', name:"McDonald's",         emoji:'🍔', distance:'1.2 km', rating:4.0, priceFor2:'₹350', cuisine:'Burgers, Fast Food',       tags:['Delivery','Drive-thru'] },
  { id:'r3', name:"Shree Dhaba",        emoji:'🍛', distance:'0.3 km', rating:4.5, priceFor2:'₹200', cuisine:'North Indian, Thali',      tags:['Dine-in','Affordable'] },
  { id:'r4', name:"South Spice Corner", emoji:'🥘', distance:'0.6 km', rating:4.3, priceFor2:'₹250', cuisine:'South Indian, Dosa',       tags:['Breakfast','Dine-in'] },
  { id:'r5', name:"Café Coffee Day",    emoji:'☕', distance:'0.9 km', rating:3.9, priceFor2:'₹300', cuisine:'Coffee, Snacks, Sandwiches',tags:['Café','Wi-Fi'] },
  { id:'r6', name:"Biryani Blues",      emoji:'🍚', distance:'1.5 km', rating:4.6, priceFor2:'₹450', cuisine:'Biryani, Mughlai',         tags:['Delivery','Popular'] },
];

const MEAL_PLANS = [
  {
    id:'mp1', name:'Full Board Plan',     emoji:'🍽️',
    price:4500, duration:'/ month',
    includes:['Breakfast', 'Lunch', 'Dinner', '30 meals'],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id:'mp2', name:'Two-Meal Plan',       emoji:'🥗',
    price:3200, duration:'/ month',
    includes:['Lunch + Dinner', '24 meals', 'Weekend flex'],
    highlight: false,
    badge: null,
  },
  {
    id:'mp3', name:'Dinner-Only Plan',    emoji:'🌙',
    price:2000, duration:'/ month',
    includes:['Dinner only', '26 meals', 'Best for hostelites'],
    highlight: false,
    badge: 'Budget Pick',
  },
];

const DELIVERY_PARTNERS = [
  { name:'Swiggy',       emoji:'🛵', color:'#FC8019', desc:'30-min delivery, live tracking' },
  { name:'Zomato',       emoji:'🍴', color:'#E23744', desc:'1000+ restaurants, Zomato Pro' },
  { name:'Local Dabba',  emoji:'📦', color:'#7A9E7E', desc:'Home-cooked meals, subscription' },
  { name:'Dunzo',        emoji:'⚡', color:'#D4A853', desc:'Quick commerce, groceries too' },
];

const TABS = [
  { id:'mess',      label:'🏫 Campus Mess'   },
  { id:'restaurants',label:'🍕 Restaurants'  },
  { id:'plans',     label:'📦 Meal Plans'    },
  { id:'delivery',  label:'🚴 Delivery'      },
];

/* ── Hygiene color ── */
function hygieneColor(score) {
  if (score >= 9) return 'var(--sage)';
  if (score >= 8) return 'var(--gold)';
  return 'var(--terracotta)';
}

/* ── Today's menu modal ── */
function MenuModal({ mess, onClose }) {
  const dialogRef = useRef(null);

  /* Trap focus */
  useEffect(() => {
    dialogRef.current?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="mf-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="mf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="mf-modal__close"
          onClick={onClose}
          aria-label="Close menu"
          type="button"
        >
          ✕
        </button>

        <div className="mf-modal__header">
          <span className="mf-modal__emoji" aria-hidden="true">
            {mess.emoji}
          </span>
          <div>
            <h2 id="menu-modal-title" className="mf-modal__title">
              {mess.name}
            </h2>
            <p className="mf-modal__sub">Today's Full Menu</p>
          </div>
        </div>

        <div className="mf-modal__meals">
          {Object.entries(mess.menu).map(([meal, detail]) => (
            <div key={meal} className="mf-modal__meal-row">
              <div className="mf-modal__meal-info">
                <p className="mf-modal__meal-name">{meal}</p>
                <p className="mf-modal__meal-time">{detail.time}</p>
                <p className="mf-modal__meal-items">{detail.items}</p>
              </div>
              <span className="mf-modal__meal-price">{detail.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mess card ── */
function MessCard({ mess, onViewMenu }) {
  return (
    <ScrollReveal>
      <article
        className="mf-mess-card"
        aria-label={`${mess.name} — hygiene score ${mess.hygiene}`}
      >
        <div className="mf-mess-card__header">
          <span className="mf-mess-card__emoji" aria-hidden="true">
            {mess.emoji}
          </span>
          <div className="mf-mess-card__info">
            <h3 className="mf-mess-card__name">{mess.name}</h3>
            <p className="mf-mess-card__timing">{mess.timing}</p>
          </div>
          <div className="mf-mess-card__rating">
            <span className="mf-mess-card__rating-num">★ {mess.rating}</span>
            <span className="mf-mess-card__reviews">{mess.reviews} reviews</span>
          </div>
        </div>

        {/* Hygiene bar */}
        <div className="mf-mess-card__hygiene">
          <div className="mf-mess-card__hygiene-meta">
            <span className="mf-mess-card__hygiene-label">Hygiene Score</span>
            <span
              className="mf-mess-card__hygiene-score"
              style={{ color: hygieneColor(mess.hygiene) }}
            >
              {mess.hygiene}/10
            </span>
          </div>
          <div
            className="mf-mess-card__hygiene-track"
            role="progressbar"
            aria-valuenow={mess.hygiene * 10}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Hygiene: ${mess.hygiene} out of 10`}
          >
            <div
              className="mf-mess-card__hygiene-fill"
              style={{
                width: `${mess.hygiene * 10}%`,
                background: hygieneColor(mess.hygiene),
              }}
            />
          </div>
        </div>

        {/* Tags */}
        <ul className="mf-mess-card__tags" aria-label="Features">
          {mess.tags.map(t => (
            <li key={t} className="mf-mess-card__tag">{t}</li>
          ))}
        </ul>

        <div className="mf-mess-card__footer">
          <span className="mf-mess-card__price">{mess.price}</span>
          <button
            type="button"
            className="mf-mess-card__menu-btn"
            onClick={() => onViewMenu(mess)}
            aria-label={`View today's menu for ${mess.name}`}
          >
            View Today's Menu →
          </button>
        </div>
      </article>
    </ScrollReveal>
  );
}

/* ── Restaurant card ── */
function RestaurantCard({ r, delay }) {
  return (
    <ScrollReveal delay={delay % 3}>
      <article
        className="mf-rest-card"
        aria-label={`${r.name} — ${r.cuisine}`}
      >
        <div className="mf-rest-card__img" aria-hidden="true">
          <span className="mf-rest-card__emoji">{r.emoji}</span>
        </div>
        <div className="mf-rest-card__body">
          <h3 className="mf-rest-card__name">{r.name}</h3>
          <p className="mf-rest-card__cuisine">{r.cuisine}</p>
          <div className="mf-rest-card__meta">
            <span>📍 {r.distance}</span>
            <span>★ {r.rating}</span>
            <span>👥 {r.priceFor2} for 2</span>
          </div>
          <ul className="mf-rest-card__tags" aria-label="Options">
            {r.tags.map(t => (
              <li key={t} className="mf-rest-card__tag">{t}</li>
            ))}
          </ul>
        </div>
      </article>
    </ScrollReveal>
  );
}

/* ── Meal plan card ── */
function MealPlanCard({ plan, delay }) {
  return (
    <ScrollReveal delay={delay}>
      <article
        className={`mf-plan-card${plan.highlight ? ' mf-plan-card--featured' : ''}`}
        aria-label={`${plan.name} — ₹${plan.price} per month`}
      >
        {plan.badge && (
          <span className="mf-plan-card__badge">{plan.badge}</span>
        )}
        <span className="mf-plan-card__emoji" aria-hidden="true">
          {plan.emoji}
        </span>
        <h3 className="mf-plan-card__name">{plan.name}</h3>
        <p className="mf-plan-card__price">
          ₹{plan.price.toLocaleString('en-IN')}
          <span>{plan.duration}</span>
        </p>
        <ul className="mf-plan-card__includes" aria-label="What's included">
          {plan.includes.map(item => (
            <li key={item} className="mf-plan-card__include-item">
              <span aria-hidden="true">✓</span> {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mf-plan-card__btn"
          aria-label={`Subscribe to ${plan.name}`}
        >
          Subscribe Now
        </button>
      </article>
    </ScrollReveal>
  );
}

/* ── Main component ── */
function MessFood() {
  const loading        = usePageLoader();
  const pageRef        = useRef(null);
  useScrollReveal(pageRef);

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') ?? 'mess'
  );
  const [searchRaw, setSearchRaw] = useState('');
  const [activeMenu, setActiveMenu] = useState(null); // mess object for modal

  /* Close modal and restore scroll */
  const handleCloseMenu = useCallback(() => {
    setActiveMenu(null);
    document.body.classList.remove('no-scroll');
  }, []);

  const handleOpenMenu = useCallback((mess) => {
    setActiveMenu(mess);
    document.body.classList.add('no-scroll');
  }, []);

  /* Filter mess by search */
  const filteredMess = MESS_LIST.filter(m =>
    searchRaw.length < 2 ||
    m.name.toLowerCase().includes(searchRaw.toLowerCase())
  );

  const filteredRest = RESTAURANT_LIST.filter(r =>
    searchRaw.length < 2 ||
    r.name.toLowerCase().includes(searchRaw.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchRaw.toLowerCase())
  );

  return (
    <>
      <Loader loading={loading} />

      {/* Menu modal */}
      {activeMenu && (
        <MenuModal mess={activeMenu} onClose={handleCloseMenu} />
      )}

      <div className="mf-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Dark hero ── */}
          <section className="mf-hero" aria-labelledby="mf-hero-title">
            <div className="mf-hero__orb mf-hero__orb--a" aria-hidden="true" />
            <div className="mf-hero__orb mf-hero__orb--b" aria-hidden="true" />
            <span className="mf-hero__watermark" aria-hidden="true">🍛</span>

            <div className="mf-hero__inner">
              <p className="mf-hero__eyebrow">Mess &amp; Food</p>
              <h1 id="mf-hero-title" className="mf-hero__title">
                Never go <em>hungry</em>
                <br /> on campus
              </h1>
              <p className="mf-hero__sub">
                500+ food partners · Daily menus · Hygiene certified ·
                30-min delivery
              </p>

              {/* Search */}
              <div
                className="mf-hero__search"
                role="search"
                aria-label="Search mess and restaurants"
              >
                <label htmlFor="mf-search" className="sr-only">
                  Search by mess or restaurant name
                </label>
                <span aria-hidden="true">🔍</span>
                <input
                  id="mf-search"
                  type="text"
                  className="mf-hero__search-input"
                  placeholder="Search mess, restaurant, cuisine…"
                  value={searchRaw}
                  onChange={e =>
                    setSearchRaw(sanitizeSearch(e.target.value))
                  }
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={200}
                />
              </div>

              {/* Stats strip */}
              <div className="mf-hero__strip" aria-label="Quick stats">
                <span>🏫 50+ Mess Partners</span>
                <span aria-hidden="true">·</span>
                <span>🍕 300+ Restaurants</span>
                <span aria-hidden="true">·</span>
                <span>📦 5 Meal Plan Types</span>
                <span aria-hidden="true">·</span>
                <span>🚴 30-min Delivery</span>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="mf-tabs"
              role="tablist"
              aria-label="Food category tabs"
            >
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  className={`mf-tab${activeTab === tab.id ? ' mf-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {/* ════ TAB PANELS ════ */}

          {/* ── Campus Mess ── */}
          <div
            id="panel-mess"
            role="tabpanel"
            aria-labelledby="tab-mess"
            className={`mf-panel${activeTab === 'mess' ? ' mf-panel--active' : ''}`}
          >
            <div className="mf-panel__inner">
              <div className="mf-panel__header">
                <div>
                  <p className="mf-panel__eyebrow">Campus Facilities</p>
                  <h2 className="mf-panel__title">
                    Mess &amp; Dining Halls
                  </h2>
                </div>
                <p className="mf-panel__count">
                  {filteredMess.length} mess
                  {filteredMess.length !== 1 ? 'es' : ''} found
                </p>
              </div>
              <ErrorBoundary>
                <div
                  className="mf-mess-grid"
                  role="list"
                  aria-label="Campus mess listings"
                >
                  {filteredMess.map(m => (
                    <div key={m.id} role="listitem">
                      <MessCard mess={m} onViewMenu={handleOpenMenu} />
                    </div>
                  ))}
                </div>
                {filteredMess.length === 0 && (
                  <div className="mf-empty" role="status">
                    <span aria-hidden="true">🔍</span>
                    <p>No mess found for &ldquo;{searchRaw}&rdquo;</p>
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </div>

          {/* ── Restaurants ── */}
          <div
            id="panel-restaurants"
            role="tabpanel"
            aria-labelledby="tab-restaurants"
            className={`mf-panel${activeTab === 'restaurants' ? ' mf-panel--active' : ''}`}
          >
            <div className="mf-panel__inner">
              <div className="mf-panel__header">
                <div>
                  <p className="mf-panel__eyebrow">Eat Out</p>
                  <h2 className="mf-panel__title">Nearby Restaurants</h2>
                </div>
                <p className="mf-panel__count">
                  {filteredRest.length} restaurants found
                </p>
              </div>
              <ErrorBoundary>
                <div
                  className="mf-rest-grid"
                  role="list"
                  aria-label="Nearby restaurants"
                >
                  {filteredRest.map((r, i) => (
                    <div key={r.id} role="listitem">
                      <RestaurantCard r={r} delay={i} />
                    </div>
                  ))}
                </div>
                {filteredRest.length === 0 && (
                  <div className="mf-empty" role="status">
                    <span aria-hidden="true">🔍</span>
                    <p>No restaurants found for &ldquo;{searchRaw}&rdquo;</p>
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </div>

          {/* ── Meal Plans ── */}
          <div
            id="panel-plans"
            role="tabpanel"
            aria-labelledby="tab-plans"
            className={`mf-panel${activeTab === 'plans' ? ' mf-panel--active' : ''}`}
          >
            <div className="mf-panel__inner">
              <div className="mf-panel__header">
                <div>
                  <p className="mf-panel__eyebrow">Subscription</p>
                  <h2 className="mf-panel__title">PG Meal Plans</h2>
                </div>
              </div>
              <ErrorBoundary>
                <div
                  className="mf-plans-grid"
                  role="list"
                  aria-label="Meal plan options"
                >
                  {MEAL_PLANS.map((plan, i) => (
                    <div key={plan.id} role="listitem">
                      <MealPlanCard plan={plan} delay={i} />
                    </div>
                  ))}
                </div>
              </ErrorBoundary>

              {/* Comparison note */}
              <ScrollReveal className="mf-plans-note">
                <p>
                  💡 All meal plans include a 3-day free trial. Cancel anytime
                  before the billing date. Plans are per-PG and subject to
                  availability.
                </p>
              </ScrollReveal>
            </div>
          </div>

          {/* ── Delivery ── */}
          <div
            id="panel-delivery"
            role="tabpanel"
            aria-labelledby="tab-delivery"
            className={`mf-panel${activeTab === 'delivery' ? ' mf-panel--active' : ''}`}
          >
            <div className="mf-panel__inner">
              <div className="mf-panel__header">
                <div>
                  <p className="mf-panel__eyebrow">Order Online</p>
                  <h2 className="mf-panel__title">Delivery Partners</h2>
                </div>
              </div>
              <ErrorBoundary>
                <div
                  className="mf-delivery-grid"
                  role="list"
                  aria-label="Food delivery partners"
                >
                  {DELIVERY_PARTNERS.map((dp, i) => (
                    <ScrollReveal
                      key={dp.name}
                      delay={i % 4}
                      as="article"
                      role="listitem"
                      className="mf-delivery-card"
                      aria-label={`${dp.name} — ${dp.desc}`}
                    >
                      <div
                        className="mf-delivery-card__icon"
                        style={{ background: `${dp.color}18` }}
                        aria-hidden="true"
                      >
                        <span style={{ color: dp.color }}>
                          {dp.emoji}
                        </span>
                      </div>
                      <h3
                        className="mf-delivery-card__name"
                        style={{ color: dp.color }}
                      >
                        {dp.name}
                      </h3>
                      <p className="mf-delivery-card__desc">{dp.desc}</p>
                      <button
                        type="button"
                        className="mf-delivery-card__btn"
                        style={{
                          background: dp.color,
                          color: 'white',
                        }}
                        aria-label={`Order via ${dp.name}`}
                      >
                        Order Now →
                      </button>
                    </ScrollReveal>
                  ))}
                </div>
              </ErrorBoundary>
            </div>
          </div>

        </main>
        <Footer />
      </div>
    </>
  );
}

export default MessFood;