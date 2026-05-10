# CampusNest 🏠

> India's #1 student accommodation platform — find verified PGs, hostels, and mess facilities near your college.

---

## Tech Stack

| Layer       | Technology                         |
|-------------|-----------------------------------|
| Frontend    | React 18, React Router DOM v6     |
| Styling     | Vanilla CSS (scoped per component)|
| Build       | Vite 5                            |
| State       | Context API (Auth, Theme, Toast)  |
| HTTP        | Native `fetch` (custom API client)|
| Fonts       | Fraunces + DM Sans (Google Fonts) |

---

## Project Structure

```
src/
├── assets/               # Static files
├── styles/               # Global CSS tokens & utilities
│   ├── variables.css     # Design tokens (colors, spacing, shadows)
│   ├── animations.css    # Reusable @keyframes
│   ├── typography.css    # Base text styles
│   ├── utilities.css     # Helper classes (reveal, sr-only, etc.)
│   └── index.css         # Global entry (imports all above)
├── components/
│   ├── layout/           # Navbar, Footer, Sidebar
│   ├── ui/               # Button, Badge, Chip, Loader, ErrorBoundary, etc.
│   └── common/           # PGCard, SearchBar, SectionHeader
├── pages/                # One folder per route
│   ├── Home/             # HeroSection, HowItWorks, Features, etc.
│   ├── Login/
│   ├── ForgotPassword/
│   ├── Dashboard/
│   ├── CollegeDiscovery/
│   ├── College/
│   ├── PGListings/
│   ├── PGDetail/
│   ├── MessFood/
│   ├── Safety/
│   ├── SubjectHub/
│   ├── Profile/
│   ├── OwnerDashboard/
│   ├── Admin/
│   ├── HelpFAQ/
│   ├── TermsOfService/
│   ├── PrivacyPolicy/
│   └── PWATest/
├── context/
│   ├── AuthContext.jsx   # Auth state + RequireAuth guard
│   └── ThemeContext.jsx  # Light/dark theme
├── hooks/
│   ├── useScrollReveal.js
│   ├── useScrollNav.js
│   ├── usePageLoader.js
│   ├── useFetch.js
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   ├── useMediaQuery.js
│   ├── useOnClickOutside.js
│   ├── useIntersectionObserver.js
│   └── useToast.js
├── utils/
│   ├── api.js            # Fetch client + all endpoint helpers
│   ├── constants.js      # Routes, input limits, static config
│   ├── sanitize.js       # XSS prevention helpers
│   ├── validators.js     # Form validation
│   └── formatters.js     # Currency, date, distance formatters
├── App.jsx               # Route config
└── main.jsx              # React entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/campusnest.git
cd campusnest

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your API keys
```

### Development

```bash
npm run dev
# Opens at http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

| Variable                  | Description                            | Required |
|---------------------------|----------------------------------------|----------|
| `VITE_API_BASE_URL`       | Backend API base URL                   | Yes      |
| `VITE_GOOGLE_CLIENT_ID`   | Google OAuth client ID                 | No       |
| `VITE_GITHUB_CLIENT_ID`   | GitHub OAuth client ID                 | No       |
| `VITE_RAZORPAY_KEY_ID`    | Razorpay public key                    | No       |
| `VITE_GOOGLE_MAPS_KEY`    | Google Maps API key                    | No       |
| `VITE_SENTRY_DSN`         | Sentry error tracking DSN              | No       |

---

## Architecture Decisions

### CSS Strategy
Every component has a co-located `.css` file. No CSS-in-JS, no Tailwind — pure CSS with custom properties defined in `variables.css`. This makes theming simple and keeps bundle size minimal.

### Security
- All user input is sanitized via `src/utils/sanitize.js` before use
- Form validation via `src/utils/validators.js` on every submit
- `Authorization: Bearer` token attached automatically by `api.js`
- 401 responses clear the session and redirect to login
- No sensitive data stored in `localStorage` — session in `sessionStorage` only
- `.env` secrets never committed (`.gitignore` enforced)

### Performance
- All pages are `React.lazy()` loaded — zero pages in initial bundle
- Images use `will-change: transform` only on hover-animated elements
- Scroll reveal uses `IntersectionObserver` (no scroll event listeners)
- Debounced search inputs prevent excessive filtering/API calls

### Accessibility
- All interactive elements have `aria-label` or visible labels
- Keyboard navigation tested for all dropdowns, modals, and accordions
- `role="alert"` and `aria-live` on all error/success messages
- Color contrast ratios meet WCAG AA standards
- Skip-to-content link on every page

---

## Routes Reference

| Path                   | Component           | Auth Required | Role        |
|------------------------|---------------------|---------------|-------------|
| `/`                    | Home                | No            | Public      |
| `/login`               | Login               | No            | Public      |
| `/forgot-password`     | ForgotPassword      | No            | Public      |
| `/dashboard`           | Dashboard           | Yes           | Any         |
| `/discover`            | CollegeDiscovery    | No            | Public      |
| `/college/:id`         | College             | No            | Public      |
| `/pg-listings`         | PGListings          | No            | Public      |
| `/pg/:id`              | PGDetail            | No            | Public      |
| `/mess-food`           | MessFood            | No            | Public      |
| `/safety`              | Safety              | No            | Public      |
| `/subject-hub`         | SubjectHub          | No            | Public      |
| `/profile`             | Profile             | Yes           | Any         |
| `/owner-dashboard`     | OwnerDashboard      | Yes           | owner/admin |
| `/admin`               | Admin               | Yes           | admin only  |
| `/terms-of-service`    | TermsOfService      | No            | Public      |
| `/privacy-policy`      | PrivacyPolicy       | No            | Public      |
| `/help-faq`            | HelpFAQ             | No            | Public      |
| `/pwa-test`            | PWATestPage         | No            | Public      |

---

## Design System

### Color Palette

| Token                  | Value      | Usage                        |
|------------------------|------------|------------------------------|
| `--cream`              | `#FAF6F0`  | Page backgrounds             |
| `--terracotta`         | `#C8583A`  | Primary brand / CTAs         |
| `--navy`               | `#0F1B2D`  | Headings, dark sections      |
| `--sage`               | `#7A9E7E`  | Success, verified badges     |
| `--gold`               | `#D4A853`  | Premium, ratings             |
| `--text-muted`         | `#8B7355`  | Secondary text               |

### Typography

| Font         | Usage                         |
|--------------|-------------------------------|
| Fraunces     | All headings, prices, numbers |
| DM Sans      | Body, UI, labels, buttons     |

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Follow the existing CSS naming convention: `block__element--modifier`
3. Every new component needs a co-located `.css` file
4. All inputs must use `sanitize.js` helpers before processing
5. Test keyboard navigation for any new interactive component
6. Open a pull request with a clear description of changes

---

## License

© 2026 CampusNest Technologies Pvt. Ltd. All rights reserved.