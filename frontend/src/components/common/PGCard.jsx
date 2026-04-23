/* ============================================================
   CAMPUSNEST — PGCard
   Used in PG Showcase (Home), PG Listings, and College pages.

   Props:
   - id:         string | number
   - name:       string
   - type:       string  ("Boys PG · Single Room")
   - location:   string
   - distance:   string  ("1.2 km")
   - college:    string  ("Delhi University")
   - price:      number  (monthly rent in ₹)
   - rating:     number
   - reviewCount: number
   - amenities:  string[]
   - badge:      'verified' | 'premium' | null
   - gradient:   string  (CSS gradient for placeholder image)
   - emoji:      string  (placeholder icon)
   - isFavorited: boolean
   - onFavoriteToggle: function(id) => void
   - delay:      number  (reveal delay 0-5)
   ============================================================ */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import ScrollReveal from '../ui/ScrollReveal';
import { ROUTES } from '../../utils/constants';
import './PGCard.css';

function PGCard({
  id,
  name          = 'PG Name',
  type          = 'PG',
  location      = '',
  distance      = '',
  college       = '',
  price         = 0,
  rating        = 0,
  reviewCount   = 0,
  amenities     = [],
  badge         = null,
  gradient      = 'linear-gradient(135deg, #f5e6d3, #d4a87a)',
  emoji         = '🏠',
  isFavorited   = false,
  onFavoriteToggle,
  delay         = 0,
}) {
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    if (!id) return;
    navigate(ROUTES.PG_DETAIL.replace(':id', id));
  }, [id, navigate]);

  const handleFavoriteClick = useCallback(
    (e) => {
      e.stopPropagation(); // prevent card navigation
      onFavoriteToggle?.(id);
    },
    [id, onFavoriteToggle],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick],
  );

  const formattedPrice = typeof price === 'number'
    ? `₹${price.toLocaleString('en-IN')}`
    : price;

  const locationStr = [distance && `${distance}`, college]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollReveal delay={delay}>
      <article
        className="pg-card"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${name}, ${formattedPrice} per month`}
      >
        {/* ── Image area ── */}
        <div className="pg-card__img" style={{ background: gradient }}>
          <span className="pg-card__emoji" aria-hidden="true">{emoji}</span>

          {/* Badge */}
          {badge === 'verified' && (
            <Badge variant="verified" className="pg-card__badge">
              ✓ Verified
            </Badge>
          )}
          {badge === 'premium' && (
            <Badge variant="premium" className="pg-card__badge">
              ⭐ Premium
            </Badge>
          )}

          {/* Favorite button */}
          <button
            className="pg-card__fav"
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
            aria-pressed={isFavorited}
            type="button"
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        </div>

        {/* ── Body ── */}
        <div className="pg-card__body">
          <p className="pg-card__type">{type}</p>
          <h3 className="pg-card__name">{name}</h3>
          {locationStr && (
            <p className="pg-card__location">
              <span aria-hidden="true">📍</span> {locationStr}
            </p>
          )}

          {/* Amenity chips */}
          {amenities.length > 0 && (
            <ul
              className="pg-card__amenities"
              aria-label="Amenities"
            >
              {amenities.slice(0, 4).map((amenity) => (
                <li key={amenity} className="pg-card__amenity-chip">
                  {amenity}
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="pg-card__footer">
            <p className="pg-card__price">
              {formattedPrice}
              <span className="pg-card__price-unit">/month</span>
            </p>
            {rating > 0 && (
              <p className="pg-card__rating" aria-label={`Rated ${rating} out of 5`}>
                <span className="pg-card__star" aria-hidden="true">★</span>
                {rating.toFixed(1)}
                {reviewCount > 0 && (
                  <span className="pg-card__review-count">
                    · {reviewCount} reviews
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

export default PGCard;