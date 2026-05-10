/* ============================================================
   CAMPUSNEST — AuthContext
   Provides authentication state across the entire app.
   - currentUser: object | null
   - role: 'student' | 'owner' | 'admin' | null
   - login / logout / updateUser helpers
   - loading state for initial auth check
   - Protected route helper: <RequireAuth>
   ============================================================ */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

/* ── Shape of context value ── */
const AuthContext = createContext(null);

/* ── Session storage key — never store passwords ── */
const SESSION_KEY = 'cn_session';

/* ── Safely parse stored session ── */
function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    /* Basic sanity check — must have id and role */
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
      /* Strip any sensitive fields before storing */
      const { password, token, ...safe } = user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    }
  } catch {
    /* SessionStorage quota exceeded or blocked — fail silently */
  }
}

/* ════════════════════════════════════════
   PROVIDER
   ════════════════════════════════════════ */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Restore session on mount ── */
  useEffect(() => {
    const stored = loadSession();
    setCurrentUser(stored);
    setAuthLoading(false);
  }, []);

  /* ── Login ──
     Call this after a successful API login response.
     Pass the user object returned from your API.
  ── */
  const login = useCallback((userData) => {
    if (!userData?.id || !userData?.role) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] login() called with invalid user data');
      }
      return;
    }
    saveSession(userData);
    setCurrentUser(userData);
  }, []);

  /* ── Logout ── */
  const logout = useCallback(() => {
    saveSession(null);
    setCurrentUser(null);
  }, []);

  /* ── Update user fields (e.g. after profile edit) ── */
  const updateUser = useCallback((updates) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates };
      saveSession(merged);
      return merged;
    });
  }, []);

  /* Derived helpers */
  const isAuthenticated = Boolean(currentUser);
  const role            = currentUser?.role ?? null;
  const isStudent       = role === 'student';
  const isOwner         = role === 'owner';
  const isAdmin         = role === 'admin';

  const value = useMemo(() => ({
    currentUser,
    authLoading,
    isAuthenticated,
    role,
    isStudent,
    isOwner,
    isAdmin,
    login,
    logout,
    updateUser,
  }), [
    currentUser,
    authLoading,
    isAuthenticated,
    role,
    isStudent,
    isOwner,
    isAdmin,
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
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

/* ════════════════════════════════════════
   PROTECTED ROUTE WRAPPER
   Usage:
     <RequireAuth>
       <Dashboard />
     </RequireAuth>

     <RequireAuth roles={['admin']}>
       <Admin />
     </RequireAuth>
   ════════════════════════════════════════ */
export function RequireAuth({ children, roles }) {
  const { isAuthenticated, role, authLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      /* Redirect to login, preserving the intended destination */
      navigate(
        `${ROUTES.LOGIN}?next=${encodeURIComponent(location.pathname)}`,
        { replace: true }
      );
      return;
    }

    /* Role-based guard */
    if (roles && roles.length > 0 && !roles.includes(role)) {
      /* Authenticated but wrong role — redirect to dashboard */
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate, location.pathname, roles]);

  /* Show nothing while checking auth */
  if (authLoading) return null;

  /* Not authenticated — return null while redirect fires */
  if (!isAuthenticated) return null;

  /* Role mismatch */
  if (roles && roles.length > 0 && !roles.includes(role)) return null;

  return children;
}