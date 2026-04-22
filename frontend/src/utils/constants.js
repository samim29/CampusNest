/* ============================================================
   CAMPUSNEST — App-wide Constants
   Never hard-code these values in components.
   ============================================================ */

/** Client-side route paths — mirrors your <Routes> config */
export const ROUTES = Object.freeze({
  HOME:             '/',
  LOGIN:            '/login',
  FORGOT_PASSWORD:  '/forgot-password',
  DASHBOARD:        '/dashboard',
  DISCOVER:         '/discover',
  COLLEGE_DISCOVERY:'/college-discovery',
  COLLEGE:          '/college',
  COLLEGE_BY_ID:    '/college/:id',
  PG_LISTINGS:      '/pg-listings',
  PG_DETAIL:        '/pg/:id',
  MESS_FOOD:        '/mess-food',
  SAFETY:           '/safety',
  SUBJECT_HUB:      '/subject-hub',
  ADMIN:            '/admin',
  OWNER_DASHBOARD:  '/owner-dashboard',
  PROFILE:          '/profile',
  TERMS:            '/terms-of-service',
  PRIVACY:          '/privacy-policy',
  HELP:             '/help-faq',
  PWA_TEST:         '/pwa-test',
});

/** Input length limits — enforce on both client and server */
export const INPUT_LIMITS = Object.freeze({
  SEARCH_QUERY:  200,
  EMAIL:         254,    // RFC 5321 max
  PASSWORD_MIN:  8,
  PASSWORD_MAX:  128,
  NAME:          100,
  MESSAGE:       2000,
  PHONE:         15,     // E.164 max
});

/** Accommodation types */
export const PG_TYPES = Object.freeze([
  { value: 'all',       label: 'All Types'    },
  { value: 'boys',      label: 'Boys PG'      },
  { value: 'girls',     label: 'Girls PG'     },
  { value: 'coliving',  label: 'Co-Living'    },
  { value: 'hostel',    label: 'Hostel'       },
]);

/** Budget range options */
export const BUDGET_RANGES = Object.freeze([
  { value: 'any',       label: 'Any Budget',          min: 0,     max: Infinity },
  { value: 'under8k',   label: 'Under ₹8,000',         min: 0,     max: 8000    },
  { value: '8k-12k',    label: '₹8,000 – ₹12,000',     min: 8000,  max: 12000   },
  { value: '12k-18k',   label: '₹12,000 – ₹18,000',    min: 12000, max: 18000   },
  { value: 'above18k',  label: '₹18,000+',             min: 18000, max: Infinity },
]);

/** Nav links shown in Navbar */
export const NAV_LINKS = Object.freeze([
  { label: 'How It Works', href: '/#how'      },
  { label: 'Find PG',      href: ROUTES.PG_LISTINGS },
  { label: 'Mess & Food',  href: ROUTES.MESS_FOOD   },
  { label: 'Safety',       href: ROUTES.SAFETY      },
]);

/** Scroll threshold (px) before nav becomes sticky-styled */
export const NAV_SCROLL_THRESHOLD = 50;

/** IntersectionObserver options for scroll reveal */
export const REVEAL_OBSERVER_OPTIONS = Object.freeze({
  threshold:   0.12,
  rootMargin: '0px 0px -50px 0px',
});

/** Page loader hide delay (ms) */
export const LOADER_HIDE_DELAY = 800;