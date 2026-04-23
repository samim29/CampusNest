/* ============================================================
   CAMPUSNEST — ForgotPassword Page
   3-step flow:
     Step 1 — Enter email
     Step 2 — Enter OTP (6-digit)
     Step 3 — Set new password

   Security notes:
   - OTP field accepts only digits, max 6 chars
   - New password validated for strength
   - Confirm password must match
   - All inputs sanitized before any processing
   - Resend OTP has a 30-second cooldown to prevent abuse
   ============================================================ */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate }                         from 'react-router-dom';
import Button                                        from '../../components/ui/Button';
import Loader                                        from '../../components/ui/Loader';
import { ROUTES }                                    from '../../utils/constants';
import { sanitizeEmail, sanitizeText }               from '../../utils/sanitize';
import { validateEmail, validatePassword }           from '../../utils/validators';
import usePageLoader                                 from '../../hooks/usePageLoader';
import './ForgotPassword.css';

const TOTAL_STEPS    = 3;
const OTP_LENGTH     = 6;
const RESEND_COOLDOWN = 30; // seconds

function ForgotPassword() {
  const loading  = usePageLoader();
  const navigate = useNavigate();

  const [step,         setStep        ] = useState(1);
  const [email,        setEmail       ] = useState('');
  const [otp,          setOtp         ] = useState('');
  const [newPassword,  setNewPassword ] = useState('');
  const [confirmPw,    setConfirmPw   ] = useState('');
  const [showPw,       setShowPw      ] = useState(false);
  const [errors,       setErrors      ] = useState({});
  const [submitting,   setSubmitting  ] = useState(false);
  const [resendTimer,  setResendTimer ] = useState(0);
  const [successMsg,   setSuccessMsg  ] = useState('');

  const firstInputRef = useRef(null);

  /* Focus first input on step change */
  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  /* ── Resend OTP countdown ── */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  /* ── Clear state on unmount ── */
  useEffect(() => {
    return () => {
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPw('');
    };
  }, []);

  /* ── STEP 1: Submit email ── */
  const handleEmailSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;

      const clean = sanitizeEmail(email);
      const result = validateEmail(clean);
      if (!result.valid) {
        setErrors({ email: result.message });
        return;
      }

      setErrors({});
      setSubmitting(true);

      try {
        /*
         * TODO: Call your API — POST /api/auth/forgot-password { email: clean }
         * The API should send an OTP to the email.
         */
        await new Promise((r) => setTimeout(r, 1000)); // simulate

        setStep(2);
        setResendTimer(RESEND_COOLDOWN);
        setSuccessMsg(`OTP sent to ${clean}`);
      } catch {
        setErrors({ general: 'Failed to send OTP. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    },
    [email, submitting],
  );

  /* ── STEP 2: Verify OTP ── */
  const handleOtpSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;

      /* Only allow 6 digits */
      if (!/^\d{6}$/.test(otp)) {
        setErrors({ otp: 'Please enter the 6-digit OTP sent to your email.' });
        return;
      }

      setErrors({});
      setSubmitting(true);

      try {
        /*
         * TODO: Call your API — POST /api/auth/verify-otp { email, otp }
         */
        await new Promise((r) => setTimeout(r, 1000));

        setStep(3);
        setSuccessMsg('');
      } catch (err) {
        const isInvalid = err?.message === 'INVALID_OTP';
        setErrors({
          otp: isInvalid
            ? 'Incorrect OTP. Please check your email and try again.'
            : 'Something went wrong. Please try again.',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [email, otp, submitting],
  );

  /* ── STEP 3: Set new password ── */
  const handlePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;

      const clean   = sanitizeText(newPassword, 128);
      const pwResult = validatePassword(clean);

      if (!pwResult.valid) {
        setErrors({ newPassword: pwResult.message });
        return;
      }

      if (clean !== confirmPw) {
        setErrors({ confirmPw: 'Passwords do not match.' });
        return;
      }

      setErrors({});
      setSubmitting(true);

      try {
        /*
         * TODO: Call your API — POST /api/auth/reset-password { email, otp, newPassword: clean }
         */
        await new Promise((r) => setTimeout(r, 1200));

        /* On success — go to login */
        navigate(ROUTES.LOGIN, {
          state: { message: 'Password reset successfully. Please sign in.' },
        });
      } catch {
        setErrors({ general: 'Failed to reset password. Please start over.' });
      } finally {
        setSubmitting(false);
      }
    },
    [email, otp, newPassword, confirmPw, submitting, navigate],
  );

  /* ── Resend OTP ── */
  const handleResend = useCallback(async () => {
    if (resendTimer > 0 || submitting) return;
    setErrors({});
    setOtp('');
    setSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 800));
      setResendTimer(RESEND_COOLDOWN);
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch {
      setErrors({ general: 'Failed to resend OTP. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [resendTimer, submitting]);

  /* ── OTP input — digits only ── */
  const handleOtpChange = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(val);
    if (errors.otp) setErrors((p) => ({ ...p, otp: '' }));
  }, [errors.otp]);

  /* ── Step indicator ── */
  const StepIndicator = () => (
    <div className="fp__steps" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`fp__step-bar${
            i + 1 < step  ? ' fp__step-bar--done'   :
            i + 1 === step ? ' fp__step-bar--active' :
            ''
          }`}
        />
      ))}
    </div>
  );

  return (
    <>
      <Loader loading={loading} />

      <div className="fp-page">
        {/* Ambient background */}
        <span className="fp-page__orb fp-page__orb--a" aria-hidden="true" />
        <span className="fp-page__orb fp-page__orb--b" aria-hidden="true" />

        <main className="fp-page__card" id="main-content">
          {/* Back link */}
          <Link to={ROUTES.LOGIN} className="fp__back" aria-label="Back to login">
            ← Back to login
          </Link>

          <StepIndicator />

          {/* ── Step icons & titles ── */}
          <div
            className="fp__icon"
            aria-hidden="true"
          >
            {step === 1 && '✉️'}
            {step === 2 && '🔢'}
            {step === 3 && '🔑'}
          </div>

          <h1 className="fp__title">
            {step === 1 && 'Forgot password?'}
            {step === 2 && 'Check your email'}
            {step === 3 && 'Set new password'}
          </h1>

          <p className="fp__sub">
            {step === 1 && 'Enter your email address and we\'ll send you a 6-digit OTP to reset your password.'}
            {step === 2 && `We sent a 6-digit code to ${email}. Enter it below — it expires in 15 minutes.`}
            {step === 3 && 'Choose a strong new password for your CampusNest account.'}
          </p>

          {/* Success message */}
          {successMsg && (
            <div
              className="fp__success-banner"
              role="status"
              aria-live="polite"
            >
              ✅ {successMsg}
            </div>
          )}

          {/* General error */}
          {errors.general && (
            <div
              className="fp__error-banner"
              role="alert"
              aria-live="assertive"
            >
              ⚠️ {errors.general}
            </div>
          )}

          {/* ════ STEP 1 — Email ════ */}
          {step === 1 && (
            <form
              onSubmit={handleEmailSubmit}
              noValidate
              aria-label="Enter email to reset password"
            >
              <div className="fp__field">
                <label htmlFor="fp-email" className="fp__label">
                  Email Address
                </label>
                <input
                  ref={firstInputRef}
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  className={`fp__input${errors.email ? ' fp__input--error' : ''}`}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(sanitizeEmail(e.target.value));
                    if (errors.email) setErrors({});
                  }}
                  aria-describedby={errors.email ? 'fp-email-error' : undefined}
                  aria-invalid={!!errors.email}
                  maxLength={254}
                  disabled={submitting}
                  spellCheck={false}
                />
                {errors.email && (
                  <p id="fp-email-error" className="fp__field-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Info box */}
              <div className="fp__info-box">
                <span>🔒</span>
                <p>We'll send a one-time password to this email. Link expires in 15 minutes.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={submitting}
                className="fp__submit"
              >
                {submitting ? 'Sending OTP…' : 'Send Reset OTP →'}
              </Button>
            </form>
          )}

          {/* ════ STEP 2 — OTP ════ */}
          {step === 2 && (
            <form
              onSubmit={handleOtpSubmit}
              noValidate
              aria-label="Enter OTP"
            >
              <div className="fp__field">
                <label htmlFor="fp-otp" className="fp__label">
                  6-Digit OTP
                </label>
                <input
                  ref={firstInputRef}
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={`fp__input fp__input--otp${errors.otp ? ' fp__input--error' : ''}`}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={handleOtpChange}
                  aria-describedby={errors.otp ? 'fp-otp-error' : undefined}
                  aria-invalid={!!errors.otp}
                  maxLength={OTP_LENGTH}
                  disabled={submitting}
                />
                {errors.otp && (
                  <p id="fp-otp-error" className="fp__field-error" role="alert">
                    {errors.otp}
                  </p>
                )}
              </div>

              {/* Resend */}
              <div className="fp__resend">
                <span className="fp__resend-text">Didn't receive it?</span>
                <button
                  type="button"
                  className="fp__resend-btn"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || submitting}
                  aria-live="polite"
                  aria-label={
                    resendTimer > 0
                      ? `Resend available in ${resendTimer} seconds`
                      : 'Resend OTP'
                  }
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={submitting || otp.length < OTP_LENGTH}
                className="fp__submit"
              >
                {submitting ? 'Verifying…' : 'Verify OTP →'}
              </Button>

              <button
                type="button"
                className="fp__back-step"
                onClick={() => { setStep(1); setErrors({}); setOtp(''); }}
              >
                ← Change email address
              </button>
            </form>
          )}

          {/* ════ STEP 3 — New password ════ */}
          {step === 3 && (
            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              aria-label="Set new password"
            >
              {/* New password */}
              <div className="fp__field">
                <label htmlFor="fp-newpw" className="fp__label">
                  New Password
                </label>
                <div className="fp__pw-wrap">
                  <input
                    ref={firstInputRef}
                    id="fp-newpw"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`fp__input${errors.newPassword ? ' fp__input--error' : ''}`}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(sanitizeText(e.target.value, 128));
                      if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
                    }}
                    aria-describedby={errors.newPassword ? 'fp-newpw-error' : 'fp-pw-hint'}
                    aria-invalid={!!errors.newPassword}
                    maxLength={128}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="fp__pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.newPassword ? (
                  <p id="fp-newpw-error" className="fp__field-error" role="alert">
                    {errors.newPassword}
                  </p>
                ) : (
                  <p id="fp-pw-hint" className="fp__hint">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="fp__field">
                <label htmlFor="fp-confirmpw" className="fp__label">
                  Confirm Password
                </label>
                <input
                  id="fp-confirmpw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`fp__input${errors.confirmPw ? ' fp__input--error' : ''}`}
                  placeholder="Repeat your new password"
                  value={confirmPw}
                  onChange={(e) => {
                    setConfirmPw(sanitizeText(e.target.value, 128));
                    if (errors.confirmPw) setErrors((p) => ({ ...p, confirmPw: '' }));
                  }}
                  aria-describedby={errors.confirmPw ? 'fp-confirmpw-error' : undefined}
                  aria-invalid={!!errors.confirmPw}
                  maxLength={128}
                  disabled={submitting}
                />
                {errors.confirmPw && (
                  <p id="fp-confirmpw-error" className="fp__field-error" role="alert">
                    {errors.confirmPw}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={submitting}
                className="fp__submit"
              >
                {submitting ? 'Resetting…' : 'Reset Password →'}
              </Button>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

export default ForgotPassword;