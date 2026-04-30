/* ============================================================
   CAMPUSNEST — College Discovery Page
   Features:
   - Hero search band
   - State/city filter chips
   - College card grid with PG count, mess count, rating
   - Sort dropdown
   - Empty state when no results match
   - Debounced search input to avoid excessive filtering
   ============================================================ */

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useNavigate }      from 'react-router-dom';
import Navbar               from '../../components/layout/Navbar';
import Footer               from '../../components/layout/Footer';
import ErrorBoundary        from '../../components/ui/ErrorBoundary';
import Loader               from '../../components/ui/Loader';
import ScrollReveal         from '../../components/ui/ScrollReveal';
import usePageLoader        from '../../hooks/usePageLoader';
import useScrollReveal      from '../../hooks/useScrollReveal';
import { ROUTES }           from '../../utils/constants';
import { sanitizeSearch }   from '../../utils/sanitize';
import { validateSearch }   from '../../utils/validators';
import './CollegeDiscovery.css';

/* ── Static college data
     Replace with API call in production               ── */
const ALL_COLLEGES = [
  { id:'1',  name:'Delhi University',    city:'New Delhi',    state:'Delhi',        emoji:'🎓', pgs:340, mess:80,  rating:4.5, priceRange:'₹6K–₹18K', established:1922 },
  { id:'2',  name:'IIT Bombay',          city:'Mumbai',       state:'Maharashtra',  emoji:'🏛️', pgs:210, mess:55,  rating:4.7, priceRange:'₹8K–₹20K', established:1958 },
  { id:'3',  name:'AIIMS Delhi',         city:'New Delhi',    state:'Delhi',        emoji:'⚕️', pgs:180, mess:40,  rating:4.6, priceRange:'₹7K–₹16K', established:1956 },
  { id:'4',  name:'IISc Bangalore',      city:'Bengaluru',    state:'Karnataka',    emoji:'🔬', pgs:160, mess:35,  rating:4.4, priceRange:'₹7K–₹17K', established:1909 },
  { id:'5',  name:'IIT Kharagpur',       city:'Kharagpur',    state:'West Bengal',  emoji:'📐', pgs:140, mess:28,  rating:4.3, priceRange:'₹5K–₹14K', established:1951 },
  { id:'6',  name:'Jadavpur University', city:'Kolkata',      state:'West Bengal',  emoji:'🏫', pgs:125, mess:22,  rating:4.2, priceRange:'₹5K–₹12K', established:1905 },
  { id:'7',  name:'VIT Vellore',         city:'Vellore',      state:'Tamil Nadu',   emoji:'💻', pgs:200, mess:48,  rating:4.1, priceRange:'₹6K–₹15K', established:1984 },
  { id:'8',  name:'Manipal University',  city:'Manipal',      state:'Karnataka',    emoji:'🏥', pgs:175, mess:42,  rating:4.3, priceRange:'₹7K–₹18K', established:1953 },
  { id:'9',  name:'BHU Varanasi',        city:'Varanasi',     state:'Uttar Pradesh',emoji:'🕌', pgs:130, mess:30,  rating:4.0, priceRange:'₹4K–₹11K', established:1916 },
  { id:'10', name:'Pune University',     city:'Pune',         state:'Maharashtra',  emoji:'🎭', pgs:220, mess:60,  rating:4.2, priceRange:'₹6K–₹16K', established:1949 },
  { id:'11', name:'Anna University',     city:'Chennai',      state:'Tamil Nadu',   emoji:'⚙️', pgs:190, mess:45,  rating:4.1, priceRange:'₹5K–₹14K', established:1978 },
  { id:'12', name:'Amity University',    city:'Noida',        state:'Uttar Pradesh',emoji:'🏢', pgs:145, mess:32,  rating:3.9, priceRange:'₹8K–₹20K', established:2005 },
];

const STATES = [
  'All India',
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Uttar Pradesh',
];

const SORT_OPTIONS = [
  { value: 'rating',  label: 'Highest Rated'   },
  { value: 'pgs',     label: 'Most PGs'         },
  { value: 'mess',    label: 'Most Mess Options' },
  { value: 'name',    label: 'A – Z'             },
];

/* ── Debounce helper ── */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ── College card ── */
function CollegeCard({ college, delay }) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`${ROUTES.COLLEGE}/${college.id}`);
  }, [college.id, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <ScrollReveal delay={delay % 4}>
      <article
        className="cd-card"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${college.name}, ${college.city} — ${college.pgs} PGs nearby`}
      >
        {/* Logo placeholder */}
        <div className="cd-card__logo" aria-hidden="true">
          {college.emoji}
        </div>

        <div className="cd-card__body">
          <h3 className="cd-card__name">{college.name}</h3>
          <p className="cd-card__location">
            <span aria-hidden="true">📍</span>{' '}
            {college.city}, {college.state}
          </p>

          {/* Stats row */}
          <div
            className="cd-card__stats"
            aria-label={`${college.pgs} PGs, ${college.mess} mess options, rated ${college.rating}`}
          >
            <div className="cd-card__stat">
              <span className="cd-card__stat-num">{college.pgs}</span>
              <span className="cd-card__stat-label">PGs</span>
            </div>
            <div className="cd-card__stat-divider" aria-hidden="true" />
            <div className="cd-card__stat">
              <span className="cd-card__stat-num">{college.mess}</span>
              <span className="cd-card__stat-label">Mess</span>
            </div>
            <div className="cd-card__stat-divider" aria-hidden="true" />
            <div className="cd-card__stat">
              <span className="cd-card__stat-num">
                {college.rating}
                <span className="cd-card__star" aria-hidden="true">⭐</span>
              </span>
              <span className="cd-card__stat-label">Rating</span>
            </div>
          </div>

          {/* Price range */}
          <div className="cd-card__footer">
            <span className="cd-card__price-range">
              {college.priceRange} / month
            </span>
            <span className="cd-card__arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

/* ── Empty state ── */
function EmptyState({ query }) {
  return (
    <div className="cd-empty" role="status" aria-live="polite">
      <span className="cd-empty__icon" aria-hidden="true">🔍</span>
      <h3 className="cd-empty__title">No colleges found</h3>
      <p className="cd-empty__sub">
        {query
          ? `No results for "${query}". Try a different search term or state.`
          : 'No colleges match your current filters. Try clearing the state filter.'}
      </p>
    </div>
  );
}

/* ── Main component ── */
function CollegeDiscovery() {
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const [searchRaw,    setSearchRaw   ] = useState('');
  const [activeState,  setActiveState ] = useState('All India');
  const [sortBy,       setSortBy      ] = useState('rating');
  const [searchError,  setSearchError ] = useState('');

  const debouncedSearch = useDebounce(searchRaw, 300);

  /* Sanitize + validate search input */
  const handleSearchChange = useCallback((e) => {
    const clean = sanitizeSearch(e.target.value);
    setSearchRaw(clean);
    if (searchError) setSearchError('');
  }, [searchError]);

  /* Filter + sort colleges */
  const filteredColleges = useMemo(() => {
    let list = [...ALL_COLLEGES];

    /* State filter */
    if (activeState !== 'All India') {
      list = list.filter((c) => c.state === activeState);
    }

    /* Search filter */
    const q = debouncedSearch.trim().toLowerCase();
    if (q.length >= 2) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)  ||
          c.state.toLowerCase().includes(q),
      );
    }

    /* Sort */
    list.sort((a, b) => {
      if (sortBy === 'name')   return a.name.localeCompare(b.name);
      if (sortBy === 'pgs')    return b.pgs  - a.pgs;
      if (sortBy === 'mess')   return b.mess - a.mess;
      return b.rating - a.rating; // default: rating
    });

    return list;
  }, [debouncedSearch, activeState, sortBy]);

  return (
    <>
      <Loader loading={loading} />
      <div className="cd-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">
          {/* ── Hero band ── */}
          <section className="cd-hero" aria-labelledby="cd-hero-title">
            <div className="cd-hero__orb cd-hero__orb--a" aria-hidden="true" />
            <div className="cd-hero__orb cd-hero__orb--b" aria-hidden="true" />

            <div className="cd-hero__inner">
              <p className="cd-hero__eyebrow">College Discovery</p>
              <h1
                id="cd-hero-title"
                className="cd-hero__title"
              >
                Find PGs near your{' '}
                <em>college</em>
              </h1>
              <p className="cd-hero__sub">
                Search 500+ colleges across India — instantly see PG
                options, mess ratings, and safety scores.
              </p>

              {/* Search */}
              <div
                className="cd-hero__search"
                role="search"
                aria-label="Search colleges"
              >
                <label
                  htmlFor="cd-search"
                  className="sr-only"
                >
                  Search by college name or city
                </label>
                <input
                  id="cd-search"
                  type="text"
                  className={`cd-hero__search-input${searchError ? ' cd-hero__search-input--error' : ''}`}
                  placeholder="Search college name, city, state…"
                  value={searchRaw}
                  onChange={handleSearchChange}
                  aria-describedby={searchError ? 'cd-search-error' : undefined}
                  aria-invalid={!!searchError}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={200}
                />
                <button
                  className="cd-hero__search-btn"
                  type="button"
                  aria-label="Search colleges"
                >
                  🔍 Search
                </button>
              </div>
              {searchError && (
                <p
                  id="cd-search-error"
                  className="cd-hero__search-error"
                  role="alert"
                >
                  {searchError}
                </p>
              )}

              {/* Stats strip */}
              <div className="cd-hero__strip" aria-label="Platform stats">
                <span>🏛️ 500+ Colleges</span>
                <span aria-hidden="true">·</span>
                <span>🏠 2000+ Verified PGs</span>
                <span aria-hidden="true">·</span>
                <span>🍛 500+ Mess Partners</span>
              </div>
            </div>
          </section>

          {/* ── Filters row ── */}
          <ErrorBoundary>
            <div className="cd-filters">
              {/* State chips */}
              <div
                className="cd-filters__states"
                role="group"
                aria-label="Filter by state"
              >
                {STATES.map((state) => (
                  <button
                    key={state}
                    type="button"
                    className={`cd-filters__chip${activeState === state ? ' cd-filters__chip--active' : ''}`}
                    onClick={() => setActiveState(state)}
                    aria-pressed={activeState === state}
                  >
                    {state}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="cd-filters__sort">
                <label
                  htmlFor="cd-sort"
                  className="cd-filters__sort-label"
                >
                  Sort by
                </label>
                <select
                  id="cd-sort"
                  className="cd-filters__sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort colleges by"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </ErrorBoundary>

          {/* ── Results ── */}
          <ErrorBoundary>
            <section className="cd-results" aria-label="College listings">
              {/* Result count */}
              <p
                className="cd-results__count"
                aria-live="polite"
                aria-atomic="true"
              >
                {filteredColleges.length > 0
                  ? `Showing ${filteredColleges.length} college${filteredColleges.length !== 1 ? 's' : ''}`
                  : ''}
              </p>

              {filteredColleges.length === 0 ? (
                <EmptyState query={debouncedSearch} />
              ) : (
                <div
                  className="cd-grid"
                  role="list"
                  aria-label="College cards"
                >
                  {filteredColleges.map((college, i) => (
                    <div key={college.id} role="listitem">
                      <CollegeCard college={college} delay={i} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default CollegeDiscovery;