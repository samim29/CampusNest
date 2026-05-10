/* ============================================================
   CAMPUSNEST — AuthContext (Fixed)
   
   KEY FIX: useNavigate and useLocation are ONLY used inside
   RequireAuth (which renders inside <Router> via routes).
   They are NOT used inside AuthProvider at all.
   AuthProvider itself has zero router dependencies.
   ============================================================ */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

/* ── Router hooks imported ONLY for RequireAuth ──
   These are used inside the component body of RequireAuth,
   which always renders inside <Router>, so this is safe.    */
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

/* ── Context ── */
const AuthContext = createContext(null);

/* ── Session storage key — never store passwords ── */
const SESSION_KEY = 'cn_session';

/* ── Safely parse stored session ── */
function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.role) return null;
    return parsed;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/* ── Safely persist session ── */
function saveSession(user) {
  try {
    if (!user) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      /* Strip sensitive fields before storing */
      const { password, token, ...safe } = user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    }
  } catch {
    /* SessionStorage quota exceeded or blocked — fail silently */
  }
}

/* ════════════════════════════════════════
   PROVIDER — zero router hooks here
   ════════════════════════════════════════ */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading ] = useState(true);

  /* Restore session on mount */
  useEffect(() => {
    const stored = loadSession();
    setCurrentUser(stored);
    setAuthLoading(false);
  }, []);

  const login = useCallback((userData) => {
    if (!userData?.id || !userData?.role) {
      if (import.meta.env.DEV) {
        console.warn('[AuthContext] login() called with invalid user data');
      }
      return;
    }
    saveSession(userData);
    setCurrentUser(userData);
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setCurrentUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates };
      saveSession(merged);
      return merged;
    });
  }, []);

  const isAuthenticated = Boolean(currentUser);
  const role            = currentUser?.role ?? null;

  const value = useMemo(() => ({
    currentUser,
    authLoading,
    isAuthenticated,
    role,
    isStudent: role === 'student',
    isOwner:   role === 'owner',
    isAdmin:   role === 'admin',
    login,
    logout,
    updateUser,
  }), [
    currentUser,
    authLoading,
    isAuthenticated,
    role,
    login,
    logout,
    updateUser,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ════════════════════════════════════════
   HOOK
   ════════════════════════════════════════ */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      '[CampusNest] useAuth() must be called inside <AuthProvider>. ' +
      'Make sure your component is rendered inside the provider tree.'
    );
  }
  return ctx;
}

/* ════════════════════════════════════════
   REQUIRE AUTH
   This component always renders INSIDE <Router> (via App.jsx
   route definitions), so useNavigate / useLocation are safe.
   ════════════════════════════════════════ */
export function RequireAuth({ children, roles }) {
  const { isAuthenticated, role, authLoading } = useAuth();

  /* These hooks are safe here — RequireAuth only ever
     renders as a child of a <Route>, which is inside <Router> */
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    /* Wait for session check to finish */
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate(
        `${ROUTES.LOGIN}?next=${encodeURIComponent(location.pathname)}`,
        { replace: true }
      );
      return;
    }

    /* Role-based guard */
    if (roles && roles.length > 0 && !roles.includes(role)) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [
    isAuthenticated,
    role,
    authLoading,
    navigate,
    location.pathname,
    roles,
  ]);

  /* Still checking session — render nothing */
  if (authLoading) return null;

  /* Not logged in — redirect fires via useEffect above */
  if (!isAuthenticated) return null;

  /* Wrong role — redirect fires via useEffect above */
  if (roles && roles.length > 0 && !roles.includes(role)) return null;

  /* All checks passed — render the protected content */
  return children;
}