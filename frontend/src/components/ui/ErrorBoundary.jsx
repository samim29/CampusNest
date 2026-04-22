/* ============================================================
   CAMPUSNEST — ErrorBoundary
   Catches React render errors and shows a friendly fallback
   instead of a blank white screen.
   Usage: Wrap any subtree — <ErrorBoundary><Component /></ErrorBoundary>
   ============================================================ */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error, info) {
    // In production, pipe this to your error tracker (e.g. Sentry)
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary] Caught error:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            background: 'var(--cream)',
          }}
        >
          <span style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              color: 'var(--navy)',
              marginBottom: '10px',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              maxWidth: '420px',
              marginBottom: '24px',
              lineHeight: 1.7,
            }}
          >
            {process.env.NODE_ENV !== 'production'
              ? this.state.errorMessage
              : 'We hit a snag. Please try refreshing the page.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '11px 24px',
                background: 'var(--terracotta)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.assign('/')}
              style={{
                padding: '11px 24px',
                background: 'transparent',
                color: 'var(--navy)',
                border: '1.5px solid var(--border-strong)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;