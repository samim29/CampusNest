/* ============================================================
   CAMPUSNEST — PGShowcase Section
   Trending PG cards pulled from static data.
   In production, replace SHOWCASE_PGS with an API call.
   ============================================================ */

import { useState, useCallback } from 'react';
import { Link }         from 'react-router-dom';
import PGCard           from '../../components/common/PGCard';
import SectionHeader    from '../../components/common/SectionHeader';
import Button           from '../../components/ui/Button';
import ScrollReveal     from '../../components/ui/ScrollReveal';
import { ROUTES }       from '../../utils/constants';
import './PGShowcase.css';

const SHOWCASE_PGS = [
  {
    id:          '1',
    name:        'Sunrise Boys PG',
    type:        'Boys PG · Single Room',
    location:    '1.2 km · Delhi University',
    price:       12000,
    rating:      4.5,
    reviewCount: 48,
    amenities:   ['📶 Wi-Fi', '❄️ AC', '🍽️ Meals', '🅿️ Parking'],
    badge:       'verified',
    gradient:    'linear-gradient(135deg, #fde8d8, #f4a57a)',
    emoji:       '🏠',
  },
  {
    id:          '2',
    name:        'Green Valley Girls PG',
    type:        'Girls PG · Double Room',
    location:    '0.8 km · Delhi University',
    price:       10000,
    rating:      4.2,
    reviewCount: 31,
    amenities:   ['📶 Wi-Fi', '🍽️ Meals', '🔒 Security', '👗 Laundry'],
    badge:       'verified',
    gradient:    'linear-gradient(135deg, #d8f0e8, #7ab88a)',
    emoji:       '🏡',
  },
  {
    id:          '3',
    name:        'City Center Co-Living',
    type:        'Co-Living · Single Room',
    location:    '2.0 km · IIT Bombay',
    price:       15000,
    rating:      4.7,
    reviewCount: 89,
    amenities:   ['📶 Wi-Fi', '❄️ AC', '🏋️ Gym', '📺 TV'],
    badge:       'premium',
    gradient:    'linear-gradient(135deg, #e8d8f0, #a07ab8)',
    emoji:       '🏢',
  },
];

function PGShowcase() {
  const [favorites, setFavorites] = useState(new Set());

  const handleFavoriteToggle = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <section
      className="pg-showcase"
      id="pgs"
      aria-labelledby="pg-showcase-title"
    >
      <ScrollReveal className="pg-showcase__header">
        <SectionHeader
          eyebrow="Popular Listings"
          title={
            <>
              Trending <em>near</em>
              <br />
              top colleges
            </>
          }
        />
        <Button
          as="link"
          to={ROUTES.PG_LISTINGS}
          variant="secondary"
          size="sm"
          className="pg-showcase__view-all"
          aria-label="View all PG listings"
        >
          View All PGs →
        </Button>
      </ScrollReveal>

      <div
        className="pg-showcase__grid"
        role="list"
        aria-label="Trending PG listings"
      >
        {SHOWCASE_PGS.map((pg, i) => (
          <div key={pg.id} role="listitem">
            <PGCard
              {...pg}
              isFavorited={favorites.has(pg.id)}
              onFavoriteToggle={handleFavoriteToggle}
              delay={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default PGShowcase;