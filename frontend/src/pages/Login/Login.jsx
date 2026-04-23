/* ============================================================
   CAMPUSNEST — Login Page
   - Split layout: dark left panel + white form right
   - Email + password form with full validation
   - Password visibility toggle
   - Social login buttons (Google / GitHub)
   - Links to ForgotPassword and Register
   - No credentials are stored in component state longer
     than needed; form resets on unmount
   ============================================================ */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation }           from 'react-router-dom';
import Button                                        from '../../components/ui/Button';
import Loader                                        from '../../components/ui/Loader';
import { ROUTES }                                    from '../../utils/constants';
import { sanitizeEmail, sanitizeText }               from '../../utils/sanitize';
import { validateEmail, validatePassword }           from '../../utils/validators';
import usePageLoader                                 from '../../hooks/usePageLoader';
import './Login.css';

/* ── Left-panel feature list ── */
const FEATURES = [
  {
    icon:  '🏠',
    title: '2000+ Verified PGs',
    sub:   'Near Delhi, Mumbai, Bangalore & more',
  },
  {
    icon:  '🍛',
    title: 'Mess & Meal Plans',
    sub:   'Daily menus, hygiene ratings, delivery',
  },
  {
    icon:  '🛡️',
    title: 'Safety Network',
    sub:   'SOS alerts, emergency contacts, community',
  },
];

/* ── Initial form state ── */
const INITIAL_FORM = { email: '', password: '' };
const INITIAL_ERRORS = { email: '', password: '', general: '' };

function Login() {
  const loading  = usePageLoader();
  const navigate = useNavigate();
  const location = useLocation();

  /* Where to redirect after login — support ?next= param */
  const redirectTo = new URLSearchParams(location.search).get('next') || ROUTES.DASHBOARD;

  const [form,         setForm        ] = useState(INITIAL_FORM);
  const [errors,       setErrors      ] = useState(INITIAL_ERRORS);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,   setSubmitting  ] = useState(false);

  const emailRef = useRef(null);

  /* Focus email input on mount */
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  /* Clear sensitive data on unmount */
  useEffect(() => {
    return () => {
      setForm(INITIAL_FORM);
    };
  }, []);

  /* ── Field change handler with per-field sanitization ── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    let sanitized = value;
    if (name === 'email')    sanitized = sanitizeEmail(value);
    if (name === 'password') sanitized = sanitizeText(value, 128);

    setForm((prev) => ({ ...prev, [name]: sanitized }));

    /* Clear field-level error on edit */
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  }, [errors]);

  /* ── Validate entire form, return true if clean ── */
  const validateForm = useCallback(() => {
    const emailResult    = validateEmail(form.email);
    const passwordResult = validatePassword(form.password);

    const newErrors = {
      email:    emailResult.valid    ? '' : emailResult.message,
      password: passwordResult.valid ? '' : passwordResult.message,
      general:  '',
    };

    setErrors(newErrors);
    return emailResult.valid && passwordResult.valid;
  }, [form]);

  /* ── Submit ── */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;
      if (!validateForm()) return;

      setSubmitting(true);
      setErrors(INITIAL_ERRORS);

      try {
        /*
         * TODO: Replace with your actual auth API call.
         * Example:
         *   const res = await authService.login({ email: form.email, password: form.password });
         *   if (res.token) { ... navigate }
         *
         * Simulating a network delay for now:
         */
        await new Promise((resolve) => setTimeout(resolve, 1200));

        /* On success — navigate to redirect target */
        navigate(redirectTo, { replace: true });
      } catch (err) {
        /* Show server error without leaking internals */
        setErrors((prev) => ({
          ...prev,
          general:
            err?.message === 'INVALID_CREDENTIALS'
              ? 'Incorrect email or password. Please try again.'
              : 'Something went wrong. Please try again later.',
        }));
      } finally {
        setSubmitting(false);
      }
    },
    [form, submitting, validateForm, navigate, redirectTo],
  );

  /* ── Social login placeholder ── */
  const handleSocialLogin = useCallback((provider) => {
    /*
     * TODO: Integrate OAuth provider (Google / GitHub).
     * Example: window.location.href = `/api/auth/${provider}`;
     */
    console.info(`[Login] Social login with ${provider} — not yet implemented`);
  }, []);

  return (
    <>
      <Loader loading={loading} />

      <div className="login-page">
        {/* ── Left panel ── */}
        <aside className="login-page__left" aria-label="CampusNest benefits">
          <div className="login-page__left-inner">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="login-page__logo" aria-label="CampusNest home">
              <span className="login-page__logo-icon" aria-hidden="true">🏠</span>
              <span className="login-page__logo-text">CampusNest</span>
            </Link>

            {/* Headline */}
            <div className="login-page__left-content">
              <h1 className="login-page__left-headline">
                Welcome <em>home</em>,<br /> scholar.
              </h1>
              <p className="login-page__left-sub">
                Join 50,000+ students finding their perfect nest near campus.
              </p>

              {/* Feature list */}
              <ul className="login-page__features" aria-label="Platform features">
                {FEATURES.map((f) => (
                  <li key={f.title} className="login-page__feature">
                    <span className="login-page__feature-icon" aria-hidden="true">
                      {f.icon}
                    </span>
                    <div>
                      <p className="login-page__feature-title">{f.title}</p>
                      <p className="login-page__feature-sub">{f.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ambient orbs */}
            <span className="login-page__orb login-page__orb--a" aria-hidden="true" />
            <span className="login-page__orb login-page__orb--b" aria-hidden="true" />
          </div>
        </aside>

        {/* ── Right panel — form ── */}
        <main className="login-page__right" id="main-content">
          <div className="login-page__form-wrap">
            {/* Mobile logo */}
            <Link
              to={ROUTES.HOME}
              className="login-page__logo login-page__logo--mobile"
              aria-label="CampusNest home"
            >
              <span className="login-page__logo-icon" aria-hidden="true">🏠</span>
              <span className="login-page__logo-text">CampusNest</span>
            </Link>

            <h2 className="login-page__welcome">Welcome back 👋</h2>
            <p className="login-page__welcome-sub">
              Sign in to your CampusNest account
            </p>

            {/* ── Social login ── */}
            <div className="login-page__socials">
              <button
                type="button"
                className="login-page__social-btn"
                onClick={() => handleSocialLogin('google')}
                aria-label="Continue with Google"
              >
                <span aria-hidden="true">🔵</span> Google
              </button>
              <button
                type="button"
                className="login-page__social-btn"
                onClick={() => handleSocialLogin('github')}
                aria-label="Continue with GitHub"
              >
                <span aria-hidden="true">🐙</span> GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="login-page__divider" aria-hidden="true">
              <span>or continue with email</span>
            </div>

            {/* ── General error ── */}
            {errors.general && (
              <div
                className="login-page__error-banner"
                role="alert"
                aria-live="assertive"
              >
                ⚠️ {errors.general}
              </div>
            )}

            {/* ── Form ── */}
            <form
              className="login-page__form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Login form"
            >
              {/* Email */}
              <div className="login-page__field">
                <label
                  htmlFor="login-email"
                  className="login-page__label"
                >
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`login-page__input${errors.email ? ' login-page__input--error' : ''}`}
                  placeholder="student@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                  maxLength={254}
                  disabled={submitting}
                  spellCheck={false}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="login-page__field-error"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="login-page__field">
                <label
                  htmlFor="login-password"
                  className="login-page__label"
                >
                  Password
                </label>
                <div className="login-page__password-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`login-page__input${errors.password ? ' login-page__input--error' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                    maxLength={128}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="login-page__pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="login-page__field-error"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="login-page__meta">
                <label className="login-page__remember">
                  <input
                    type="checkbox"
                    className="login-page__checkbox"
                    disabled={submitting}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="login-page__forgot"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={submitting}
                className="login-page__submit"
              >
                {submitting ? 'Signing in…' : 'Sign In →'}
              </Button>
            </form>

            {/* Register link */}
            <p className="login-page__register">
              New here?{' '}
              <Link to={ROUTES.REGISTER} className="login-page__register-link">
                Create free account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

export default Login;