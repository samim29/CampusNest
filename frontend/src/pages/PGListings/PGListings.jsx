/* ============================================================
   CAMPUSNEST — PG Listings Page  (/pg-listings)
   Features:
   - URL search params sync (q, type, budget)
   - Filter sidebar (type, budget, amenities, distance)
   - Sort dropdown
   - Grid / List view toggle
   - Debounced search
   - Favorites toggle
   - Empty state
   - Mobile filter drawer
   ============================================================ */

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  useSearchParams,
  useNavigate,
} from 'react-router-dom';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import Badge           from '../../components/ui/Badge';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ROUTES, PG_TYPES, BUDGET_RANGES } from '../../utils/constants';
import { sanitizeSearch }                   from '../../utils/sanitize';
import './PGListings.css';

/* ── Static PG data — replace with API call ── */
const ALL_PGS = [
  { id:'1',  name:'Sunrise Boys PG',      type:'boys',     college:'Delhi University', city:'New Delhi',   distance:1.2, price:12000, rating:4.5, reviews:48,  amenities:['Wi-Fi','AC','Meals','Parking'],     badge:'verified', gradient:'linear-gradient(135deg,#fde8d8,#f4a57a)', emoji:'🏠' },
  { id:'2',  name:'Green Valley Girls PG',type:'girls',    college:'Delhi University', city:'New Delhi',   distance:0.8, price:10000, rating:4.2, reviews:31,  amenities:['Wi-Fi','Meals','Security','Laundry'],badge:'verified', gradient:'linear-gradient(135deg,#d8f0e8,#7ab88a)', emoji:'🏡' },
  { id:'3',  name:'City Center Co-Living',type:'coliving', college:'IIT Bombay',       city:'Mumbai',      distance:2.0, price:15000, rating:4.7, reviews:89,  amenities:['Wi-Fi','AC','Gym','TV'],             badge:'premium',  gradient:'linear-gradient(135deg,#e8d8f0,#a07ab8)', emoji:'🏢' },
  { id:'4',  name:'Metro Hostel Block A', type:'hostel',   college:'IIT Bombay',       city:'Mumbai',      distance:0.5, price:8500,  rating:4.0, reviews:22,  amenities:['Wi-Fi','Meals','Parking'],           badge:'verified', gradient:'linear-gradient(135deg,#fef0d8,#e8b860)', emoji:'🏠' },
  { id:'5',  name:'Pearl Girls Residency',type:'girls',    college:'IIT Bombay',       city:'Mumbai',      distance:1.8, price:11500, rating:4.6, reviews:67,  amenities:['Wi-Fi','AC','Laundry'],              badge:'verified', gradient:'linear-gradient(135deg,#d8e8f0,#7ab0c8)', emoji:'🏡' },
  { id:'6',  name:'Nexus Co-Living Hub',  type:'coliving', college:'IIT Bombay',       city:'Mumbai',      distance:2.5, price:13000, rating:4.8, reviews:104, amenities:['Wi-Fi','Games','Café','AC'],         badge:'premium',  gradient:'linear-gradient(135deg,#f0e8d8,#c8a068)', emoji:'🏠' },
  { id:'7',  name:'Scholars Boys PG',     type:'boys',     college:'BHU Varanasi',     city:'Varanasi',    distance:0.9, price:7000,  rating:3.9, reviews:14,  amenities:['Wi-Fi','Meals'],                     badge:'verified', gradient:'linear-gradient(135deg,#fde8d8,#c47a5a)', emoji:'🏠' },
  { id:'8',  name:'VIT Girls Hostel',     type:'girls',    college:'VIT Vellore',      city:'Vellore',     distance:0.3, price:9000,  rating:4.4, reviews:55,  amenities:['Wi-Fi','Meals','Security','Laundry'],badge:'verified', gradient:'linear-gradient(135deg,#d8f0e8,#5ab07a)', emoji:'🏡' },
  { id:'9',  name:'Tech Park Co-Living',  type:'coliving', college:'IISc Bangalore',   city:'Bengaluru',   distance:3.0, price:16000, rating:4.6, reviews:78,  amenities:['Wi-Fi','AC','Gym','Café','Parking'], badge:'premium',  gradient:'linear-gradient(135deg,#e8d8f0,#806ab0)', emoji:'🏢' },
];

const AMENITY_FILTERS = ['Wi-Fi','AC','Meals','Gym','Laundry','Parking','Security','Café'];
const DISTANCE_OPTIONS = [
  { label:'Any Distance', value:'any'  },
  { label:'Within 1 km', value:'1'    },
  { label:'Within 2 km', value:'2'    },
  { label:'Within 5 km', value:'5'    },
];
const SORT_OPTIONS = [
  { label:'Best Rated',    value:'rating'   },
  { label:'Lowest Price',  value:'price_asc'},
  { label:'Highest Price', value:'price_desc'},
  { label:'Nearest First', value:'distance' },
];

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ── Single PG card (list mode & grid mode) ── */
function PGCard({ pg, view, isFav, onFavToggle }) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(ROUTES.PG_DETAIL.replace(':id', pg.id));
  }, [pg.id, navigate]);

  const handleFav = useCallback((e) => {
    e.stopPropagation();
    onFavToggle(pg.id);
  }, [pg.id, onFavToggle]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  }, [handleClick]);

  return (
    <article
      className={`pgl-card pgl-card--${view}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`${pg.name} — ₹${pg.price.toLocaleString('en-IN')} per month`}
    >
      {/* Image */}
      <div
        className="pgl-card__img"
        style={{ background: pg.gradient }}
        aria-hidden="true"
      >
        <span className="pgl-card__emoji">{pg.emoji}</span>
        <span
          className={`pgl-card__badge${pg.badge === 'premium' ? ' pgl-card__badge--premium' : ''}`}
        >
          {pg.badge === 'verified' ? '✓ Verified' : '⭐ Premium'}
        </span>
        <button
          className="pgl-card__fav"
          onClick={handleFav}
          aria-label={isFav ? `Remove ${pg.name} from favourites` : `Save ${pg.name}`}
          aria-pressed={isFav}
          type="button"
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Body */}
      <div className="pgl-card__body">
        <p className="pgl-card__type">
          {PG_TYPES.find(t => t.value === pg.type)?.label ?? pg.type}
        </p>
        <h3 className="pgl-card__name">{pg.name}</h3>
        <p className="pgl-card__location">
          <span aria-hidden="true">📍</span>{' '}
          {pg.distance} km · {pg.college}
        </p>

        <ul className="pgl-card__amenities" aria-label="Amenities">
          {pg.amenities.slice(0, 4).map(a => (
            <li key={a} className="pgl-card__amenity">{a}</li>
          ))}
        </ul>

        <div className="pgl-card__footer">
          <p className="pgl-card__price">
            ₹{pg.price.toLocaleString('en-IN')}
            <span>/month</span>
          </p>
          <p
            className="pgl-card__rating"
            aria-label={`Rated ${pg.rating} out of 5`}
          >
            <span className="pgl-card__star" aria-hidden="true">★</span>
            {pg.rating} · {pg.reviews} reviews
          </p>
        </div>
      </div>
    </article>
  );
}

/* ── Filter sidebar ── */
function FilterSidebar({
  typeFilter, setTypeFilter,
  budgetFilter, setBudgetFilter,
  amenityFilter, toggleAmenity,
  distanceFilter, setDistanceFilter,
  onReset,
}) {
  const activeCount = [
    typeFilter !== 'all' ? 1 : 0,
    budgetFilter !== 'any' ? 1 : 0,
    amenityFilter.length,
    distanceFilter !== 'any' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <aside className="pgl-filters" aria-label="Filter PG listings">
      <div className="pgl-filters__header">
        <h2 className="pgl-filters__title">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            className="pgl-filters__reset"
            onClick={onReset}
            aria-label={`Clear all ${activeCount} filters`}
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Type */}
      <div className="pgl-filters__group">
        <p className="pgl-filters__group-title">Accommodation Type</p>
        {PG_TYPES.map(t => (
          <label key={t.value} className="pgl-filters__radio">
            <input
              type="radio"
              name="pg-type"
              value={t.value}
              checked={typeFilter === t.value}
              onChange={() => setTypeFilter(t.value)}
              className="pgl-filters__radio-input"
            />
            <span className="pgl-filters__radio-label">{t.label}</span>
          </label>
        ))}
      </div>

      {/* Budget */}
      <div className="pgl-filters__group">
        <p className="pgl-filters__group-title">Budget (per month)</p>
        {BUDGET_RANGES.map(b => (
          <label key={b.value} className="pgl-filters__radio">
            <input
              type="radio"
              name="pg-budget"
              value={b.value}
              checked={budgetFilter === b.value}
              onChange={() => setBudgetFilter(b.value)}
              className="pgl-filters__radio-input"
            />
            <span className="pgl-filters__radio-label">{b.label}</span>
          </label>
        ))}
      </div>

      {/* Distance */}
      <div className="pgl-filters__group">
        <p className="pgl-filters__group-title">Distance from College</p>
        {DISTANCE_OPTIONS.map(d => (
          <label key={d.value} className="pgl-filters__radio">
            <input
              type="radio"
              name="pg-distance"
              value={d.value}
              checked={distanceFilter === d.value}
              onChange={() => setDistanceFilter(d.value)}
              className="pgl-filters__radio-input"
            />
            <span className="pgl-filters__radio-label">{d.label}</span>
          </label>
        ))}
      </div>

      {/* Amenities */}
      <div className="pgl-filters__group">
        <p className="pgl-filters__group-title">Amenities</p>
        {AMENITY_FILTERS.map(a => (
          <label key={a} className="pgl-filters__check">
            <input
              type="checkbox"
              checked={amenityFilter.includes(a)}
              onChange={() => toggleAmenity(a)}
              className="pgl-filters__check-input"
              aria-label={`Filter by ${a}`}
            />
            <span className="pgl-filters__check-label">{a}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}

/* ── Main component ── */
function PGListings() {
  const loading       = usePageLoader();
  const pageRef       = useRef(null);
  useScrollReveal(pageRef);

  const [searchParams, setSearchParams] = useSearchParams();

  /* Initialise filters from URL params */
  const [searchRaw,      setSearchRaw     ] = useState(searchParams.get('q')      || '');
  const [typeFilter,     setTypeFilter    ] = useState(searchParams.get('type')   || 'all');
  const [budgetFilter,   setBudgetFilter  ] = useState(searchParams.get('budget') || 'any');
  const [distanceFilter, setDistanceFilter] = useState('any');
  const [amenityFilter,  setAmenityFilter ] = useState([]);
  const [sortBy,         setSortBy        ] = useState('rating');
  const [view,           setView          ] = useState('grid'); // 'grid' | 'list'
  const [favorites,      setFavorites     ] = useState(new Set());
  const [filterOpen,     setFilterOpen    ] = useState(false);

  const debouncedSearch = useDebounce(searchRaw, 300);

  /* Sync filters → URL */
  useEffect(() => {
    const params = {};
    if (searchRaw)          params.q      = searchRaw;
    if (typeFilter !== 'all')  params.type   = typeFilter;
    if (budgetFilter !== 'any') params.budget = budgetFilter;
    setSearchParams(params, { replace: true });
  }, [searchRaw, typeFilter, budgetFilter]);

  /* Close mobile filter on escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setFilterOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', filterOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [filterOpen]);

  const toggleAmenity = useCallback((a) => {
    setAmenityFilter(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }, []);

  const toggleFav = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setTypeFilter('all');
    setBudgetFilter('any');
    setDistanceFilter('any');
    setAmenityFilter([]);
    setSortBy('rating');
  }, []);

  /* Filter + sort */
  const results = useMemo(() => {
    let list = [...ALL_PGS];

    /* Type */
    if (typeFilter !== 'all') {
      list = list.filter(p => p.type === typeFilter);
    }

    /* Budget */
    const budgetRange = BUDGET_RANGES.find(b => b.value === budgetFilter);
    if (budgetRange && budgetFilter !== 'any') {
      list = list.filter(
        p => p.price >= budgetRange.min && p.price <= budgetRange.max
      );
    }

    /* Distance */
    if (distanceFilter !== 'any') {
      const maxKm = parseFloat(distanceFilter);
      if (!isNaN(maxKm)) {
        list = list.filter(p => p.distance <= maxKm);
      }
    }

    /* Amenities (must have ALL selected) */
    if (amenityFilter.length > 0) {
      list = list.filter(p =>
        amenityFilter.every(a => p.amenities.includes(a))
      );
    }

    /* Search */
    const q = debouncedSearch.trim().toLowerCase();
    if (q.length >= 2) {
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q)    ||
          p.college.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    /* Sort */
    list.sort((a, b) => {
      if (sortBy === 'price_asc')  return a.price    - b.price;
      if (sortBy === 'price_desc') return b.price    - a.price;
      if (sortBy === 'distance')   return a.distance - b.distance;
      return b.rating - a.rating;
    });

    return list;
  }, [typeFilter, budgetFilter, distanceFilter, amenityFilter, debouncedSearch, sortBy]);

  const filterProps = {
    typeFilter, setTypeFilter,
    budgetFilter, setBudgetFilter,
    amenityFilter, toggleAmenity,
    distanceFilter, setDistanceFilter,
    onReset: resetFilters,
  };

  return (
    <>
      <Loader loading={loading} />
      <div className="pgl-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Page header ── */}
          <div className="pgl-header">
            <div className="pgl-header__inner">
              <div>
                <p className="pgl-header__eyebrow">PG Listings</p>
                <h1 className="pgl-header__title">
                  Find your{' '}
                  <em>perfect stay</em>
                </h1>
              </div>

              {/* Search input */}
              <div
                className="pgl-header__search"
                role="search"
                aria-label="Search PG listings"
              >
                <label htmlFor="pgl-search" className="sr-only">
                  Search PGs by name, college, or city
                </label>
                <span className="pgl-header__search-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  id="pgl-search"
                  type="text"
                  className="pgl-header__search-input"
                  placeholder="Search by name, college or city…"
                  value={searchRaw}
                  onChange={e => setSearchRaw(sanitizeSearch(e.target.value))}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="pgl-toolbar">
            <div className="pgl-toolbar__inner">
              {/* Mobile filter toggle */}
              <button
                type="button"
                className="pgl-toolbar__filter-btn"
                onClick={() => setFilterOpen(true)}
                aria-expanded={filterOpen}
                aria-controls="pgl-filter-drawer"
              >
                ⚙ Filters
                {[typeFilter !== 'all', budgetFilter !== 'any', distanceFilter !== 'any', amenityFilter.length > 0].filter(Boolean).length > 0 && (
                  <span className="pgl-toolbar__filter-dot" aria-hidden="true" />
                )}
              </button>

              {/* Result count */}
              <p
                className="pgl-toolbar__count"
                aria-live="polite"
                aria-atomic="true"
              >
                {results.length}{' '}
                {results.length === 1 ? 'PG' : 'PGs'} found
              </p>

              <div className="pgl-toolbar__right">
                {/* Sort */}
                <label htmlFor="pgl-sort" className="sr-only">Sort by</label>
                <select
                  id="pgl-sort"
                  className="pgl-toolbar__sort"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  aria-label="Sort PG listings"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* View toggle */}
                <div
                  className="pgl-toolbar__view"
                  role="group"
                  aria-label="View layout"
                >
                  <button
                    type="button"
                    className={`pgl-toolbar__view-btn${view === 'grid' ? ' pgl-toolbar__view-btn--active' : ''}`}
                    onClick={() => setView('grid')}
                    aria-pressed={view === 'grid'}
                    aria-label="Grid view"
                  >
                    ⊞
                  </button>
                  <button
                    type="button"
                    className={`pgl-toolbar__view-btn${view === 'list' ? ' pgl-toolbar__view-btn--active' : ''}`}
                    onClick={() => setView('list')}
                    aria-pressed={view === 'list'}
                    aria-label="List view"
                  >
                    ≡
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="pgl-body">

            {/* Desktop sidebar */}
            <ErrorBoundary>
              <FilterSidebar {...filterProps} />
            </ErrorBoundary>

            {/* Mobile filter drawer overlay */}
            {filterOpen && (
              <div
                className="pgl-drawer-overlay"
                onClick={() => setFilterOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Mobile filter drawer */}
            <div
              id="pgl-filter-drawer"
              className={`pgl-drawer${filterOpen ? ' pgl-drawer--open' : ''}`}
              aria-label="Filter options"
              aria-hidden={!filterOpen}
            >
              <div className="pgl-drawer__header">
                <span className="pgl-drawer__title">Filters</span>
                <button
                  type="button"
                  className="pgl-drawer__close"
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>
              <FilterSidebar {...filterProps} />
            </div>

            {/* Results */}
            <div className="pgl-results">
              {results.length === 0 ? (
                <div className="pgl-empty" role="status">
                  <span className="pgl-empty__icon" aria-hidden="true">🏠</span>
                  <h3 className="pgl-empty__title">No PGs found</h3>
                  <p className="pgl-empty__sub">
                    Try adjusting your filters or search term to find more options.
                  </p>
                  <button
                    type="button"
                    className="pgl-empty__reset"
                    onClick={resetFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div
                  className={`pgl-grid pgl-grid--${view}`}
                  role="list"
                  aria-label="PG listings"
                >
                  {results.map((pg, i) => (
                    <ScrollReveal key={pg.id} delay={i % 3} as="div" role="listitem">
                      <PGCard
                        pg={pg}
                        view={view}
                        isFav={favorites.has(pg.id)}
                        onFavToggle={toggleFav}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
        <Footer />
      </div>
    </>
  );
}

export default PGListings;