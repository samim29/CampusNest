/* ============================================================
   CAMPUSNEST — FoodSection
   Dark background food & mess highlight section.
   ============================================================ */

import { Link }        from 'react-router-dom';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import SectionHeader   from '../../components/common/SectionHeader';
import Button          from '../../components/ui/Button';
import { ROUTES }      from '../../utils/constants';
import './FoodSection.css';

const FOOD_CARDS = [
  {
    icon:  '🏫',
    title: 'Campus Central Mess',
    desc:  'Daily changing menu, hygiene certified, nutritional info available',
    price: '₹150 – ₹250 / meal',
  },
  {
    icon:  '🍕',
    title: 'Nearby Restaurants',
    desc:  "Domino's, McDonald's, local dhabas — sorted by distance & rating",
    price: '₹120+ / order',
  },
  {
    icon:  '📦',
    title: 'PG Meal Plans',
    desc:  'Monthly full board, two-meal, or dinner-only plans for residents',
    price: '₹2,000 – ₹4,500 / mo',
  },
  {
    icon:  '🚴',
    title: 'Online Delivery',
    desc:  'Integrated with Swiggy, Zomato & local platforms for quick orders',
    price: '30 min delivery',
  },
];

const MEAL_TIMES = [
  { name: 'Breakfast', time: '7:00 AM – 9:30 AM', price: '₹60',  color: 'var(--gold-light)' },
  { name: 'Lunch',     time: '12:00 PM – 2:00 PM', price: '₹80',  color: 'var(--sage)'       },
  { name: 'Dinner',    time: '7:00 PM – 9:30 PM',  price: '₹90',  color: 'var(--terracotta-light)' },
];

function FoodSection() {
  return (
    <section
      className="food"
      id="food"
      aria-labelledby="food-title"
    >
      {/* Decorative emoji watermark */}
      <span className="food__watermark" aria-hidden="true">🍛</span>

      <div className="food__inner">
        {/* ── Left — cards grid ── */}
        <ScrollReveal className="food__cards-grid" as="ul" aria-label="Food options">
          {FOOD_CARDS.map((card) => (
            <li key={card.title} className="food__card">
              <span className="food__card-icon" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="food__card-title">{card.title}</h3>
              <p className="food__card-desc">{card.desc}</p>
              <p className="food__card-price">{card.price}</p>
            </li>
          ))}
        </ScrollReveal>

        {/* ── Right — info + meal times ── */}
        <ScrollReveal delay={2} className="food__info">
          <SectionHeader
            eyebrow="Mess & Food"
            title={
              <>
                Never go <em>hungry</em>
                <br />
                on campus
              </>
            }
            subtitle="A complete food ecosystem — from your PG's home-cooked meals to campus cafeterias and restaurant delivery."
            light
          />

          <nav
            className="food__meal-list"
            aria-label="Daily meal schedule"
          >
            {MEAL_TIMES.map((meal) => (
              <div key={meal.name} className="food__meal-row">
                <span
                  className="food__meal-dot"
                  style={{ background: meal.color }}
                  aria-hidden="true"
                />
                <div className="food__meal-info">
                  <span className="food__meal-name">{meal.name}</span>
                  <span className="food__meal-time">{meal.time}</span>
                </div>
                <span className="food__meal-price">{meal.price}</span>
              </div>
            ))}
          </nav>

          <div className="food__cta">
            <Button
              as="link"
              to={ROUTES.MESS_FOOD}
              variant="primary"
              size="md"
            >
              🍽️ Explore Mess &amp; Food
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default FoodSection;