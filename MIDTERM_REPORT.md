# CampusNest — Midterm Evaluation Report

> **Tagline:** "Find, tour, and trust your next campus stay."  
> **Scope:** Progressive Web App for student accommodations, food discovery, and campus safety  
> **Deliverable Type:** Midterm report (keeps advanced/experimental items reserved for the final evaluation)

## 1. Introduction (Literature Survey)
- **Problem landscape:** Student housing in India is fragmented across offline brokers, social media groups, and generic portals (OYO/Housing/99acres) that under-serve student-specific needs like safety validation, food transparency, and campus proximity context.
- **User pain:** First-year students and outstation learners struggle with trust (fake listings), safety (ragging/harassment), and clarity on mess/food quality; owners lack structured channels to reach verified students.
- **Prior work & gaps:** Existing real-estate apps emphasize inventory breadth, not student-centric features (virtual tours, emergency rails, mess visibility, offline-first UX). Research on PWAs shows improved engagement in bandwidth-constrained settings, but adoption in student housing remains low.
- **Positioning:** HorizonStay CampusOS is a verticalized, student-first platform integrating PG discovery, safety rails, mess insights, and virtual tours with an offline-capable PWA delivery model.

## 2. Motivation
- **Trust & safety first:** Verified listings, emergency contacts, and anonymous reporting reduce parental and student anxiety.
- **Speed to decision:** Virtual tours and rich filters shorten search-to-booking cycles from weeks to days.
- **Food transparency:** Daily/weekly mess menus and hygiene cues remove post-move-in friction.
- **Offline resilience:** PWA caching and background sync support intermittent connectivity common near campuses.
- **Community layer:** Notifications, saved preferences, and recommendations aim to move beyond transactional booking toward a student support network.

## 3. Objectives (Midterm Focus)
- **Unified PWA experience:** Ship PG discovery, booking requests, food visibility, and safety utilities in one installable app.
- **Robust identity & profiles:** JWT auth with access/refresh tokens, profile CRUD, and protected routes.
- **Search excellence:** Debounced multi-criteria search (location, price, rating, amenities) plus virtual scrolling for scale and map/grid toggles for spatial context.
- **Spatial awareness:** Leaflet maps with custom markers for colleges and PGs; distance/contextual cues in UI.
- **Virtual tours:** 360° viewer with hotspots, auto-rotate, fullscreen, and scene navigation to reduce physical visits.
- **PWA completeness:** Service worker, manifest, install prompts, offline fallback, update prompts, and background sync for queued actions.
- **UX quality:** Dark mode, responsive layouts, skeleton/loading states, optimistic UI, and error boundaries.

## 4. Technology Required (With Rationale)
- **Frontend:** React 19 + Vite for fast HMR/builds; React Router v7 for routing; Tailwind CSS 3.4 for rapid theming; Lucide icons for consistent UI language.
- **State:** Context API for app-wide concerns (theme, filters, notifications); React Query 5 for server state (caching, retries, background refetch, optimistic updates); React Window for virtualized lists.
- **Maps & Media:** Leaflet/React-Leaflet for interactive maps; custom markers for PGs/colleges; 360° viewer built in React for tours.
- **Backend:** Flask 3.1 with Flask-JWT-Extended, Flask-CORS; SQLAlchemy ORM; SQLite for dev, PostgreSQL-ready for production scale.
- **Auth & Security:** JWT (access/refresh), password hashing (Werkzeug), CORS hardening, input validation, and role enums (student/owner/admin).
- **PWA Stack:** Service worker (`public/sw.js`) combining cache-first for static assets and network-first for APIs; offline fallback; manifest with shortcuts; background sync hooks.
- **Tooling & Quality:** Vite build, ESLint + Prettier, PostCSS/Autoprefixer, Concurrently to run backend/frontend in dev; Lighthouse/Chrome DevTools for PWA and performance checks.

## 5. Research Progress (Midterm Snapshot)
- **Architecture & Base UX (done):** Routing, theming, responsive layouts, error boundaries, code splitting with React.lazy and custom LazyLoader HOC.
- **PWA Layer (done):** Service worker caching strategies, manifest, offline page, install prompts, update detection banner, background sync placeholders.
- **Data & API (done):** Auth (register/login/refresh), profile CRUD, PG and college listings, JWT-protected profile reads/updates; DB models for users/colleges/PG listings with enums for roles and property types.
- **Search & Listings (done):** Advanced filters, debounced search hook, map/grid toggle, virtual scroll option for large lists; favorites state client-side.
- **Virtual Tour (done):** 360° viewer with hotspots, auto-rotate, fullscreen, scene navigation, fallback scenes for PGs without custom tours.
- **Food System (done):** Mess/restaurant discovery pages, weekly menus, hygiene cues, cross-navigation between campus-wide food and PG-specific meal plans.
- **Safety Module (done):** Emergency contacts, anonymous complaint UI, alert surfaces; groundwork for scoring to follow.
- **Performance (done):** React Query caching (5m stale/10m cache), lazy loading, skeletons, bundle optimizations; theme persistence and minimized re-renders via memoization patterns.
- **In Progress (target final):** Automated tests (unit/integration), payments + booking lifecycle, analytics dashboards, richer notification pipelines (email/SMS/push), safety scoring, diet-aware recommendations.
- **Deferred to Final Report:** AI recommendations, blockchain-backed verification, IoT hooks, AR/VR enhancements; these are intentionally excluded from midterm scope to keep risk manageable.

## 6. Future Work (Post-Midterm Plan)
- **Payments & Bookings:** Razorpay/UPI integration, booking lifecycle states (requested/approved/paid/refunded), receipts, and audit logs.
- **Reliability & Quality:** Integration/unit tests, automated lint/format in CI, load/perf benchmarks, Lighthouse/PWA budgets.
- **Data Depth:** Reviews/ratings, safety scores per PG, diet preferences, historical price tracking, distance-based surfacing.
- **Notifications & Comms:** Email/SMS bridges, granular push categories, digests, and owner-student messaging channels.
- **Localization & Accessibility:** Add Hindi plus one regional language; WCAG 2.2 conformance, full keyboard support, ARIA coverage.
- **Owner/Admin Consoles:** Inventory management, approval workflows, dispute handling, revenue/occupancy analytics.
- **(Reserved for Final Report):** AI matching, blockchain audit trails, AR/VR tours, IoT-based access control and smart locks.

## References (Essentials for Midterm)
- React 19 Docs — https://react.dev
- TanStack Query v5 — https://tanstack.com/query
- Tailwind CSS 3.4 — https://tailwindcss.com
- Flask 3.1 — https://flask.palletsprojects.com
- MDN Service Workers — https://developer.mozilla.org/docs/Web/API/Service_Worker_API
- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/
