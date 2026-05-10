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
import './styles/index.css';

/* ── Lazy imports ── */
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

/* ── Helpers ── */
function PageSuspense({ children }) {
  return (
    <Suspense fallback={<Loader loading />}>
      {children}
    </Suspense>
  );
}

function Page({ component: Component }) {
  return (
    <ErrorBoundary>
      <PageSuspense>
        <Component />
      </PageSuspense>
    </ErrorBoundary>
  );
}

function ProtectedPage({ component: Component, roles }) {
  return (
    <RequireAuth roles={roles}>
      <Page component={Component} />
    </RequireAuth>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '16px',
      background:     'var(--cream)',
      fontFamily:     'var(--font-body)',
      textAlign:      'center',
      padding:        '40px 20px',
    }}>
      <span style={{ fontSize: '56px' }}>🏠</span>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize:   '2rem',
        color:      'var(--navy)',
        fontWeight:  700,
      }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        This page doesn't exist or has been moved.
      </p>
      <a href={ROUTES.HOME} style={{
        marginTop:     '8px',
        padding:       '12px 28px',
        background:    'var(--terracotta)',
        color:         'white',
        borderRadius:  '9999px',
        fontWeight:    600,
        fontSize:      '0.9rem',
        textDecoration:'none',
      }}>
        Back to Home
      </a>
    </div>
  );
}

/* ════════════════════════════════════════
   APP ROOT
   
   ORDER MATTERS:
   1. <Router>        — outermost, enables useNavigate etc.
   2. <ThemeProvider> — inside Router, no router deps
   3. <AuthProvider>  — inside Router, no router deps
   4. <Routes>        — renders pages
   
   RequireAuth uses useNavigate/useLocation safely because
   it only renders inside a <Route> element.
   ════════════════════════════════════════ */
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>

            {/* ── Public ── */}
            <Route path={ROUTES.HOME}            element={<Page component={LazyHome} />} />
            <Route path={ROUTES.LOGIN}           element={<Page component={LazyLogin} />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<Page component={LazyForgotPassword} />} />

            {/* ── Public info ── */}
            <Route path={ROUTES.PG_LISTINGS}     element={<Page component={LazyPGListings} />} />
            <Route path={ROUTES.PG_DETAIL}       element={<Page component={LazyPGDetail} />} />
            <Route path={ROUTES.MESS_FOOD}       element={<Page component={LazyMessFood} />} />
            <Route path={ROUTES.SAFETY}          element={<Page component={LazySafety} />} />
            <Route path={ROUTES.DISCOVER}        element={<Page component={LazyCollegeDiscovery} />} />
            <Route
              path={ROUTES.COLLEGE_DISCOVERY}
              element={<Navigate to={ROUTES.DISCOVER} replace />}
            />
            <Route path={ROUTES.COLLEGE}         element={<Page component={LazyCollege} />} />
            <Route path={ROUTES.COLLEGE_BY_ID}   element={<Page component={LazyCollege} />} />
            <Route path={ROUTES.SUBJECT_HUB}     element={<Page component={LazySubjectHub} />} />
            <Route path={ROUTES.TERMS}           element={<Page component={LazyTermsOfService} />} />
            <Route path={ROUTES.PRIVACY}         element={<Page component={LazyPrivacyPolicy} />} />
            <Route path={ROUTES.HELP}            element={<Page component={LazyHelpFAQ} />} />
            <Route path={ROUTES.PWA_TEST}        element={<Page component={LazyPWATestPage} />} />

            {/* ── Auth required ── */}
            <Route
              path={ROUTES.DASHBOARD}
              element={<ProtectedPage component={LazyDashboard} />}
            />
            <Route
              path={ROUTES.PROFILE}
              element={<ProtectedPage component={LazyProfile} />}
            />

            {/* ── Owner only ── */}
            <Route
              path={ROUTES.OWNER_DASHBOARD}
              element={
                <ProtectedPage
                  component={LazyOwnerDashboard}
                  roles={['owner', 'admin']}
                />
              }
            />

            {/* ── Admin only ── */}
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
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;