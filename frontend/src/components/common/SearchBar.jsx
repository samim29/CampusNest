/* ============================================================
   CAMPUSNEST — SearchBar
   Used on the Home page hero section and reused on PG Listings.

   Props:
   - onSearch: function({ location, type, budget }) => void
   - loading:  boolean  (disables submit while searching)
   - className: string
   ============================================================ */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PG_TYPES, BUDGET_RANGES, ROUTES } from '../../utils/constants';
import { sanitizeSearch } from '../../utils/sanitize';
import { validateSearch } from '../../utils/validators';
import './SearchBar.css';

function SearchBar({ onSearch, loading = false, className = '' }) {
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [type,     setType    ] = useState('all');
  const [budget,   setBudget  ] = useState('any');
  const [error,    setError   ] = useState('');

  /* ── Sanitize location input on every keystroke ── */
  const handleLocationChange = useCallback((e) => {
    const clean = sanitizeSearch(e.target.value);
    setLocation(clean);
    if (error) setError('');
  }, [error]);

  /* ── Submit ── */
  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();

      const result = validateSearch(location);
      if (!result.valid) {
        setError(result.message);
        return;
      }

      setError('');

      /* If parent passed onSearch, call it; otherwise navigate */
      if (typeof onSearch === 'function') {
        onSearch({ location, type, budget });
      } else {
        const params = new URLSearchParams({ q: location, type, budget });
        navigate(`${ROUTES.PG_LISTINGS}?${params.toString()}`);
      }
    },
    [location, type, budget, onSearch, navigate],
  );

  /* ── Allow Enter key to submit from the input ── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  return (
    <div className={`searchbar ${className}`.trim()}>
      <p className="searchbar__title">
        Find PGs near your <span className="searchbar__title-accent">college</span>
      </p>

      <form
        className="searchbar__form"
        onSubmit={handleSubmit}
        noValidate
        role="search"
        aria-label="Search for PGs"
      >
        {/* Location */}
        <div className="searchbar__field">
          <label
            htmlFor="search-location"
            className="searchbar__label"
          >
            College / Location
          </label>
          <input
            id="search-location"
            type="text"
            className={`searchbar__input${error ? ' searchbar__input--error' : ''}`}
            placeholder="e.g. Delhi University, IIT Bombay…"
            value={location}
            onChange={handleLocationChange}
            onKeyDown={handleKeyDown}
            aria-describedby={error ? 'search-error' : undefined}
            aria-invalid={!!error}
            autoComplete="off"
            spellCheck="false"
            maxLength={200}
          />
          {error && (
            <p
              id="search-error"
              className="searchbar__error"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}
        </div>

        {/* Type */}
        <div className="searchbar__field">
          <label htmlFor="search-type" className="searchbar__label">
            Accommodation Type
          </label>
          <select
            id="search-type"
            className="searchbar__select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {PG_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="searchbar__field">
          <label htmlFor="search-budget" className="searchbar__label">
            Budget (per month)
          </label>
          <select
            id="search-budget"
            className="searchbar__select"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="searchbar__btn"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="searchbar__btn-spinner" aria-hidden="true" />
          ) : (
            '🔍'
          )}
          <span>{loading ? 'Searching…' : 'Search PGs'}</span>
        </button>
      </form>
    </div>
  );
}

export default SearchBar;