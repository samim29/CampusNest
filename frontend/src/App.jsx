/* ============================================================
   CAMPUSNEST — App.jsx
   Root routing configuration.
   - All routes use React.lazy for code splitting
   - Protected routes wrapped in <RequireAuth>
   - Role-based guards for admin and owner routes
   - Suspense fallback uses Loader component
   - ErrorBoundary wraps every lazy page
   ============================================================ */

import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, RequireAuth } from './context/AuthContext';
import { ThemeProvider }             from './context/ThemeContext';
import ErrorBoundary                 from './components/ui/ErrorBoundary';
import Loader                        from './components/ui/Loader';
import { ROUTES }                    from './utils/constants';
import { ToastProvider } from './hooks/useToast.jsx';                                                                                               
import './styles/index.css';

/* ── Lazy page imports — one chunk per page ── */
const LazyHome             = lazy(() => import('./pages/Home/Home'));
const LazyLogin            = lazy(() => import('./pages/Login/Login'));
const LazyForgotPassword   = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const LazyDashboard        = lazy(() => import('./pages/Dashboard/Dashboard'));
const LazyCollegeDiscovery = lazy(() => import('./pages/CollegeDiscovery/CollegeDiscovery'));
const LazyCollege          = lazy(() => import('./pages/College/College'));
const LazyPGListings       = lazy(() => import('./pages/PGListings/PGListings'));
const LazyPGDetail         = lazy(() => import('./pages/PGDetail/PGDetail'));
const LazyMessFood         = lazy(() => import('./pages/MessFood/MessFood'));
const LazySafety           = lazy(() => import('./pages/Safety/Safety'));
const LazySubjectHub       = lazy(() => import('./pages/SubjectHub/SubjectHub'));
const LazyAdmin            = lazy(() => import('./pages/Admin/Admin'));
const LazyOwnerDashboard   = lazy(() => import('./pages/OwnerDashboard/OwnerDashboard'));
const LazyProfile          = lazy(() => import('./pages/Profile/Profile'));
const LazyTermsOfService   = lazy(() => import('./pages/TermsOfService/TermsOfService'));
const LazyPrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const LazyHelpFAQ          = lazy(() => import('./pages/HelpFAQ/HelpFAQ'));
const LazyPWATestPage      = lazy(() => import('./pages/PWATest/PWATestPage'));

/* ── Global Suspense fallback ── */
function PageSuspense({ children }) {
  return (
    <Suspense fallback={<Loader loading />}>
      {children}
    </Suspense>
  );
}

/* ── Wrap every page in ErrorBoundary + Suspense ── */
function Page({ component: Component }) {
  return (
    <ErrorBoundary>
      <PageSuspense>
        <Component />
      </PageSuspense>
    </ErrorBoundary>
  );
}

/* ── Protected page helper ── */
function ProtectedPage({ component: Component, roles }) {
  return (
    <RequireAuth roles={roles}>
      <Page component={Component} />
    </RequireAuth>
  );
}

/* ── 404 inline component ── */
function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--cream)',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <span style={{ fontSize: '56px' }}>🏠</span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'var(--navy)',
          fontWeight: 700,
        }}
      >
        404 — Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        This page doesn't exist or has been moved.
      </p>
      <a
        href={ROUTES.HOME}
        style={{
          marginTop: '8px',
          padding: '12px 28px',
          background: 'var(--terracotta)',
          color: 'white',
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '0.9rem',
          textDecoration: 'none',
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

/* ════════════════════════════════════════
   APP ROOT
   ════════════════════════════════════════ */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <Router>
          <Routes>

            {/* ── Public routes ── */}
            <Route
              path={ROUTES.HOME}
              element={<Page component={LazyHome} />}
            />
            <Route
              path={ROUTES.LOGIN}
              element={<Page component={LazyLogin} />}
            />
            <Route
              path={ROUTES.FORGOT_PASSWORD}
              element={<Page component={LazyForgotPassword} />}
            />

            {/* ── Public info routes ── */}
            <Route
              path={ROUTES.PG_LISTINGS}
              element={<Page component={LazyPGListings} />}
            />
            <Route
              path={ROUTES.PG_DETAIL}
              element={<Page component={LazyPGDetail} />}
            />
            <Route
              path={ROUTES.MESS_FOOD}
              element={<Page component={LazyMessFood} />}
            />
            <Route
              path={ROUTES.SAFETY}
              element={<Page component={LazySafety} />}
            />
            <Route
              path={ROUTES.DISCOVER}
              element={<Page component={LazyCollegeDiscovery} />}
            />
            <Route
              path={ROUTES.COLLEGE_DISCOVERY}
              element={
                <Navigate to={ROUTES.DISCOVER} replace />
              }
            />
            <Route
              path={ROUTES.COLLEGE}
              element={<Page component={LazyCollege} />}
            />
            <Route
              path={ROUTES.COLLEGE_BY_ID}
              element={<Page component={LazyCollege} />}
            />
            <Route
              path={ROUTES.SUBJECT_HUB}
              element={<Page component={LazySubjectHub} />}
            />
            <Route
              path={ROUTES.TERMS}
              element={<Page component={LazyTermsOfService} />}
            />
            <Route
              path={ROUTES.PRIVACY}
              element={<Page component={LazyPrivacyPolicy} />}
            />
            <Route
              path={ROUTES.HELP}
              element={<Page component={LazyHelpFAQ} />}
            />
            <Route
              path={ROUTES.PWA_TEST}
              element={<Page component={LazyPWATestPage} />}
            />

            {/* ── Authenticated routes ── */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedPage component={LazyDashboard} />
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedPage component={LazyProfile} />
              }
            />

            {/* ── Owner-only routes ── */}
            <Route
              path={ROUTES.OWNER_DASHBOARD}
              element={
                <ProtectedPage
                  component={LazyOwnerDashboard}
                  roles={['owner', 'admin']}
                />
              }
            />

            {/* ── Admin-only routes ── */}
            <Route
              path={ROUTES.ADMIN}
              element={
                <ProtectedPage
                  component={LazyAdmin}
                  roles={['admin']}
                />
              }
            />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;