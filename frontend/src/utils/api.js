/* ============================================================
   CAMPUSNEST — API Client
   Centralised HTTP client built on fetch.
   - Auto-attaches Authorization header from sessionStorage
   - Normalises error responses into a consistent shape
   - Handles 401 by clearing session and redirecting to login
   - All methods return { data, error } — never throw
   - Request timeout (30s default)
   ============================================================ */

import { ROUTES } from './constants';

const BASE_URL  = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TIMEOUT_MS = 30_000;

/* ── Retrieve stored token safely ── */
function getToken() {
  try {
    const raw = sessionStorage.getItem('cn_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/* ── Build headers ── */
function buildHeaders(extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/* ── Normalise any error into a plain message ── */
function normaliseError(err) {
  if (typeof err === 'string')         return err;
  if (err?.message)                    return err.message;
  return 'An unexpected error occurred. Please try again.';
}

/* ── Handle 401 — clear session and redirect ── */
function handleUnauthorised() {
  try {
    sessionStorage.removeItem('cn_session');
  } catch { /* ignore */ }
  /* Only redirect if we're not already on the login page */
  if (!window.location.pathname.startsWith('/login')) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `${ROUTES.LOGIN}?next=${next}`;
  }
}

/* ── Core request function ── */
async function request(method, endpoint, body = null, extraHeaders = {}) {
  const url        = `${BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timerId    = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const options = {
      method,
      headers: buildHeaders(extraHeaders),
      signal:  controller.signal,
    };

    if (body !== null && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    clearTimeout(timerId);

    /* 401 — session expired or invalid token */
    if (response.status === 401) {
      handleUnauthorised();
      return { data: null, error: 'Session expired. Please log in again.' };
    }

    /* Try to parse JSON; fall back to text */
    let responseData;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    /* Non-2xx response */
    if (!response.ok) {
      const message =
        responseData?.message ??
        responseData?.error   ??
        `Request failed with status ${response.status}`;
      return { data: null, error: message };
    }

    return { data: responseData, error: null };

  } catch (err) {
    clearTimeout(timerId);

    if (err.name === 'AbortError') {
      return { data: null, error: 'Request timed out. Please check your connection.' };
    }

    if (!navigator.onLine) {
      return { data: null, error: 'You are offline. Please check your internet connection.' };
    }

    return { data: null, error: normaliseError(err) };
  }
}

/* ════════════════════════════════════════
   PUBLIC API METHODS
   ════════════════════════════════════════ */
const api = {
  get:    (endpoint, headers)       => request('GET',    endpoint, null, headers),
  post:   (endpoint, body, headers) => request('POST',   endpoint, body, headers),
  put:    (endpoint, body, headers) => request('PUT',    endpoint, body, headers),
  patch:  (endpoint, body, headers) => request('PATCH',  endpoint, body, headers),
  delete: (endpoint, headers)       => request('DELETE', endpoint, null, headers),
};

export default api;

/* ════════════════════════════════════════
   NAMED ENDPOINT HELPERS
   Replace placeholder paths with your real API routes.
   ════════════════════════════════════════ */

/* ── Auth ── */
export const authAPI = {
  login:          (email, password)    => api.post('/auth/login',          { email, password }),
  logout:         ()                   => api.post('/auth/logout',          {}),
  forgotPassword: (email)              => api.post('/auth/forgot-password', { email }),
  verifyOTP:      (email, otp)         => api.post('/auth/verify-otp',      { email, otp }),
  resetPassword:  (email, otp, pw)     => api.post('/auth/reset-password',  { email, otp, newPassword: pw }),
  me:             ()                   => api.get('/auth/me'),
};

/* ── PG Listings ── */
export const pgAPI = {
  list:     (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/pgs${qs ? `?${qs}` : ''}`);
  },
  get:      (id)          => api.get(`/pgs/${id}`),
  create:   (data)        => api.post('/pgs',          data),
  update:   (id, data)    => api.patch(`/pgs/${id}`,   data),
  delete:   (id)          => api.delete(`/pgs/${id}`),
  favorite: (id)          => api.post(`/pgs/${id}/favorite`,   {}),
  unfavorite:(id)         => api.delete(`/pgs/${id}/favorite`),
  reviews:  (id)          => api.get(`/pgs/${id}/reviews`),
};

/* ── Colleges ── */
export const collegeAPI = {
  list:  (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/colleges${qs ? `?${qs}` : ''}`);
  },
  get:   (id)          => api.get(`/colleges/${id}`),
};

/* ── Mess & Food ── */
export const messAPI = {
  list:     (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/mess${qs ? `?${qs}` : ''}`);
  },
  get:      (id)          => api.get(`/mess/${id}`),
  menu:     (id)          => api.get(`/mess/${id}/menu`),
  subscribe:(id, planId)  => api.post(`/mess/${id}/subscribe`, { planId }),
};

/* ── Bookings ── */
export const bookingAPI = {
  list:   ()              => api.get('/bookings'),
  create: (data)          => api.post('/bookings',         data),
  get:    (id)            => api.get(`/bookings/${id}`),
  cancel: (id)            => api.patch(`/bookings/${id}/cancel`, {}),
};

/* ── Safety ── */
export const safetyAPI = {
  getScore:       (lat, lng)     => api.get(`/safety/score?lat=${lat}&lng=${lng}`),
  getIncidents:   (lat, lng)     => api.get(`/safety/incidents?lat=${lat}&lng=${lng}`),
  report:         (data)         => api.post('/safety/report', data),
  getContacts:    ()             => api.get('/safety/contacts'),
  addContact:     (data)         => api.post('/safety/contacts',        data),
  removeContact:  (id)           => api.delete(`/safety/contacts/${id}`),
  triggerSOS:     (lat, lng)     => api.post('/safety/sos', { lat, lng }),
};

/* ── User Profile ── */
export const profileAPI = {
  get:    ()       => api.get('/profile'),
  update: (data)   => api.patch('/profile', data),
  delete: ()       => api.delete('/profile'),
};

/* ── Subject Hub ── */
export const subjectAPI = {
  subjects:   ()           => api.get('/subjects'),
  resources:  (params={})  => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/resources${qs ? `?${qs}` : ''}`);
  },
  upload:     (data)       => api.post('/resources', data),
  download:   (id)         => api.post(`/resources/${id}/download`, {}),
};

/* ── Owner Dashboard ── */
export const ownerAPI = {
  listings:        ()         => api.get('/owner/listings'),
  inquiries:       ()         => api.get('/owner/inquiries'),
  revenue:         ()         => api.get('/owner/revenue'),
  acceptInquiry:   (id)       => api.patch(`/owner/inquiries/${id}/accept`,  {}),
  declineInquiry:  (id)       => api.patch(`/owner/inquiries/${id}/decline`, {}),
};

/* ── Admin ── */
export const adminAPI = {
  stats:          ()          => api.get('/admin/stats'),
  pgSubmissions:  (params={}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/pgs${qs ? `?${qs}` : ''}`);
  },
  verifyPG:       (id)        => api.patch(`/admin/pgs/${id}/verify`,  {}),
  flagPG:         (id)        => api.patch(`/admin/pgs/${id}/flag`,    {}),
  users:          (params={}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  suspendUser:    (id)        => api.patch(`/admin/users/${id}/suspend`,  {}),
  activateUser:   (id)        => api.patch(`/admin/users/${id}/activate`, {}),
  safetyReports:  ()          => api.get('/admin/safety-reports'),
  resolveReport:  (id)        => api.patch(`/admin/safety-reports/${id}/resolve`, {}),
};