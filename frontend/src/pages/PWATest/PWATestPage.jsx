/* ============================================================
   CAMPUSNEST — PWA Test Page  (/pwa-test)
   Shows PWA installation status, service worker status,
   offline capability, push notification permission,
   and cache stats. Development / QA tool.
   ============================================================ */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import Navbar        from '../../components/layout/Navbar';
import Footer        from '../../components/layout/Footer';
import Loader        from '../../components/ui/Loader';
import usePageLoader from '../../hooks/usePageLoader';
import './PWATestPage.css';

/* ── Check helpers ── */
function checkServiceWorker() {
  return 'serviceWorker' in navigator;
}

function checkPushNotifications() {
  return 'PushManager' in window && 'Notification' in window;
}

function checkOfflineStorage() {
  return 'caches' in window;
}

function checkInstallable() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

const STATUS_ICONS = {
  pass:        { icon: '✅', label: 'Supported',    cls: 'pwa-status--pass'    },
  warn:        { icon: '⚠️', label: 'Limited',      cls: 'pwa-status--warn'    },
  fail:        { icon: '❌', label: 'Unsupported',   cls: 'pwa-status--fail'    },
  installed:   { icon: '📱', label: 'Installed',     cls: 'pwa-status--pass'    },
  browser:     { icon: '🌐', label: 'Browser mode',  cls: 'pwa-status--warn'    },
  granted:     { icon: '🔔', label: 'Granted',       cls: 'pwa-status--pass'    },
  denied:      { icon: '🔕', label: 'Denied',        cls: 'pwa-status--fail'    },
  default:     { icon: '❓', label: 'Not asked',     cls: 'pwa-status--warn'    },
  unsupported: { icon: '❌', label: 'Unsupported',   cls: 'pwa-status--fail'    },
  loading:     { icon: '⏳', label: 'Checking…',    cls: 'pwa-status--loading' },
};

/* ── Status row ── */
function StatusRow({ label, status, detail }) {
  const s = STATUS_ICONS[status] ?? STATUS_ICONS.warn;

  return (
    <div className="pwa-row" role="listitem">
      <div className="pwa-row__icon" aria-hidden="true">{s.icon}</div>
      <div className="pwa-row__info">
        <p className="pwa-row__label">{label}</p>
        {detail && <p className="pwa-row__detail">{detail}</p>}
      </div>
      <span className={`pwa-row__status ${s.cls}`} aria-label={s.label}>
        {s.label}
      </span>
    </div>
  );
}

function PWATestPage() {
  const loading = usePageLoader();

  const [swStatus,           setSwStatus          ] = useState('loading');
  const [swRegistration,     setSwRegistration    ] = useState(null);
  const [swDetail,           setSwDetail          ] = useState('Checking…');
  const [pushStatus,         setPushStatus        ] = useState('loading');
  const [notifPermission,    setNotifPermission   ] = useState('loading');
  const [cacheStatus,        setCacheStatus       ] = useState('loading');
  const [cacheNames,         setCacheNames        ] = useState([]);
  const [installStatus,      setInstallStatus     ] = useState('loading');
  const [deferredPrompt,     setDeferredPrompt    ] = useState(null);
  const [swUpdateAvailable,  setSwUpdateAvailable ] = useState(false);
  const [testLog,            setTestLog           ] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, { msg, type, ts }]);
  }, []);

  /* Run all checks */
  useEffect(() => {
    /* Service Worker */
    if (checkServiceWorker()) {
      navigator.serviceWorker.getRegistration()
        .then(reg => {
          if (reg) {
            setSwStatus('pass');
            setSwDetail(`Scope: ${reg.scope}`);
            setSwRegistration(reg);
            log('Service Worker registered', 'pass');

            reg.addEventListener('updatefound', () => {
              setSwUpdateAvailable(true);
              log('Service Worker update found', 'warn');
            });
          } else {
            setSwStatus('warn');
            setSwDetail('No SW registered. Run npm run build for SW.');
            log('Service Worker not registered (dev mode)', 'warn');
          }
        })
        .catch(() => {
          setSwStatus('fail');
          setSwDetail('Error checking Service Worker.');
          log('Service Worker check failed', 'fail');
        });
    } else {
      setSwStatus('fail');
      setSwDetail('Service Workers not supported in this browser.');
      log('Service Workers not supported', 'fail');
    }

    /* Push notifications */
    if (checkPushNotifications()) {
      setPushStatus('pass');
      log('Push Notifications supported', 'pass');
    } else {
      setPushStatus('fail');
      log('Push Notifications not supported', 'fail');
    }

    /* Notification permission */
    const perm = getNotificationPermission();
    setNotifPermission(perm);
    log(`Notification permission: ${perm}`, perm === 'granted' ? 'pass' : 'warn');

    /* Cache / offline */
    if (checkOfflineStorage()) {
      setCacheStatus('pass');
      caches.keys().then(keys => {
        setCacheNames(keys);
        log(`${keys.length} cache(s) found: ${keys.join(', ') || 'none yet'}`, 'info');
      }).catch(() => {
        log('Could not enumerate caches', 'warn');
      });
    } else {
      setCacheStatus('fail');
      log('Cache API not supported', 'fail');
    }

    /* Install mode */
    setInstallStatus(checkInstallable() ? 'installed' : 'browser');
    log(
      checkInstallable() ? 'Running as installed PWA' : 'Running in browser',
      'info'
    );
  }, [log]);

  /* Capture beforeinstallprompt */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      log('Install prompt available', 'pass');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [log]);

  /* Request notification permission */
  const handleRequestNotif = useCallback(async () => {
    if (!('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      log(`Notification permission: ${perm}`, perm === 'granted' ? 'pass' : 'warn');
    } catch {
      log('Notification permission request failed', 'fail');
    }
  }, [log]);

  /* Trigger install */
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      log(`Install prompt outcome: ${outcome}`, outcome === 'accepted' ? 'pass' : 'warn');
      setDeferredPrompt(null);
    } catch {
      log('Install prompt failed', 'fail');
    }
  }, [deferredPrompt, log]);

  /* Force SW update */
  const handleForceUpdate = useCallback(() => {
    if (!swRegistration) return;
    swRegistration.update()
      .then(() => log('SW update check triggered', 'info'))
      .catch(() => log('SW update check failed', 'fail'));
  }, [swRegistration, log]);

  /* Send test push */
  const handleTestPush = useCallback(() => {
    if (notifPermission !== 'granted') {
      log('Notification permission not granted', 'warn');
      return;
    }
    try {
      new Notification('CampusNest Test', {
        body: '🏠 Your PWA is working correctly!',
        icon: '/icons/icon-192.png',
      });
      log('Test notification sent', 'pass');
    } catch {
      log('Test notification failed', 'fail');
    }
  }, [notifPermission, log]);

  const LOG_STYLES = {
    pass: { icon: '✅', color: 'var(--sage)'       },
    warn: { icon: '⚠️', color: 'var(--gold-dark)' },
    fail: { icon: '❌', color: 'var(--terracotta)' },
    info: { icon: 'ℹ️', color: 'var(--text-muted)' },
  };

  return (
    <>
      <Loader loading={loading} />
      <div className="pwa-page">
        <Navbar />

        <main id="main-content" className="pwa-main">
          <div className="pwa-inner">

            {/* Header */}
            <div className="pwa-header">
              <div>
                <p className="pwa-eyebrow">Developer Tool</p>
                <h1 className="pwa-title">PWA Test Dashboard</h1>
                <p className="pwa-sub">
                  Verify Progressive Web App features, Service Worker
                  status, and offline capabilities.
                </p>
              </div>
              <div className="pwa-header-badge">
                <span aria-hidden="true">📱</span>
                <span>
                  {checkInstallable() ? 'Running as PWA' : 'Browser Mode'}
                </span>
              </div>
            </div>

            {/* Status grid */}
            <div className="pwa-grid">

              {/* Feature support */}
              <section
                className="pwa-card"
                aria-labelledby="pwa-support-title"
              >
                <h2 id="pwa-support-title" className="pwa-card__title">
                  🔍 Feature Support
                </h2>
                <div role="list" className="pwa-rows">
                  <StatusRow
                    label="Service Worker"
                    status={swStatus}
                    detail={swDetail}
                  />
                  <StatusRow
                    label="Push Notifications"
                    status={pushStatus}
                    detail={checkPushNotifications() ? 'PushManager available' : 'Not supported'}
                  />
                  <StatusRow
                    label="Offline Storage (CacheAPI)"
                    status={cacheStatus}
                    detail={
                      cacheNames.length > 0
                        ? `${cacheNames.length} cache(s): ${cacheNames.join(', ')}`
                        : 'No caches found yet'
                    }
                  />
                  <StatusRow
                    label="Install Mode"
                    status={installStatus}
                    detail={
                      installStatus === 'installed'
                        ? 'Running as standalone PWA'
                        : 'Running in browser tab'
                    }
                  />
                  <StatusRow
                    label="Notification Permission"
                    status={notifPermission}
                    detail={`Current permission: ${notifPermission}`}
                  />
                </div>
              </section>

              {/* Actions */}
              <section
                className="pwa-card"
                aria-labelledby="pwa-actions-title"
              >
                <h2 id="pwa-actions-title" className="pwa-card__title">
                  ⚡ Test Actions
                </h2>

                <div className="pwa-actions">
                  <button
                    type="button"
                    className="pwa-action-btn"
                    onClick={handleRequestNotif}
                    disabled={notifPermission === 'granted' || notifPermission === 'denied'}
                    aria-disabled={notifPermission === 'granted' || notifPermission === 'denied'}
                  >
                    <span aria-hidden="true">🔔</span>
                    <div>
                      <p className="pwa-action-btn__label">
                        Request Notification Permission
                      </p>
                      <p className="pwa-action-btn__sub">
                        {notifPermission === 'granted'
                          ? 'Already granted'
                          : notifPermission === 'denied'
                          ? 'Denied — reset in browser settings'
                          : 'Ask user for permission'}
                      </p>
                    </div>
                    <span
                      className="pwa-action-btn__arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    className="pwa-action-btn"
                    onClick={handleTestPush}
                    disabled={notifPermission !== 'granted'}
                    aria-disabled={notifPermission !== 'granted'}
                  >
                    <span aria-hidden="true">📣</span>
                    <div>
                      <p className="pwa-action-btn__label">
                        Send Test Notification
                      </p>
                      <p className="pwa-action-btn__sub">
                        {notifPermission === 'granted'
                          ? 'Fires a local test notification'
                          : 'Requires notification permission first'}
                      </p>
                    </div>
                    <span
                      className="pwa-action-btn__arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>

                  {deferredPrompt && (
                    <button
                      type="button"
                      className="pwa-action-btn pwa-action-btn--featured"
                      onClick={handleInstall}
                    >
                      <span aria-hidden="true">📲</span>
                      <div>
                        <p className="pwa-action-btn__label">
                          Install CampusNest as App
                        </p>
                        <p className="pwa-action-btn__sub">
                          Add to home screen
                        </p>
                      </div>
                      <span
                        className="pwa-action-btn__arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="pwa-action-btn"
                    onClick={handleForceUpdate}
                    disabled={!swRegistration}
                    aria-disabled={!swRegistration}
                  >
                    <span aria-hidden="true">🔄</span>
                    <div>
                      <p className="pwa-action-btn__label">
                        Check for SW Update
                      </p>
                      <p className="pwa-action-btn__sub">
                        {swUpdateAvailable
                          ? 'Update available — reload to apply'
                          : 'Force check for new service worker'}
                      </p>
                    </div>
                    <span
                      className="pwa-action-btn__arrow"
                      aria-hidden="true"
                    >
                      {swUpdateAvailable ? '⚡' : '→'}
                    </span>
                  </button>
                </div>
              </section>
            </div>

            {/* Console log */}
            <section
              className="pwa-log-card"
              aria-labelledby="pwa-log-title"
            >
              <div className="pwa-log-card__header">
                <h2 id="pwa-log-title" className="pwa-card__title">
                  🖥️ Test Log
                </h2>
                <button
                  type="button"
                  className="pwa-log-clear"
                  onClick={() => setTestLog([])}
                  aria-label="Clear test log"
                >
                  Clear
                </button>
              </div>

              <div
                className="pwa-log"
                role="log"
                aria-label="PWA test results"
                aria-live="polite"
              >
                {testLog.length === 0 ? (
                  <p className="pwa-log__empty">
                    Waiting for test results…
                  </p>
                ) : (
                  testLog.map((entry, i) => {
                    const s = LOG_STYLES[entry.type] ?? LOG_STYLES.info;
                    return (
                      <div key={i} className="pwa-log__entry">
                        <span
                          className="pwa-log__icon"
                          aria-hidden="true"
                        >
                          {s.icon}
                        </span>
                        <span
                          className="pwa-log__msg"
                          style={{ color: s.color }}
                        >
                          {entry.msg}
                        </span>
                        <span className="pwa-log__ts">{entry.ts}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Browser info */}
            <section
              className="pwa-card pwa-browser-card"
              aria-labelledby="browser-info-title"
            >
              <h2 id="browser-info-title" className="pwa-card__title">
                🌐 Browser Environment
              </h2>
              <div className="pwa-browser-grid">
                <div className="pwa-browser-item">
                  <p className="pwa-browser-item__label">User Agent</p>
                  <p className="pwa-browser-item__value truncate">
                    {navigator.userAgent}
                  </p>
                </div>
                <div className="pwa-browser-item">
                  <p className="pwa-browser-item__label">Online Status</p>
                  <p
                    className="pwa-browser-item__value"
                    style={{ color: navigator.onLine ? 'var(--sage)' : 'var(--terracotta)' }}
                  >
                    {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
                  </p>
                </div>
                <div className="pwa-browser-item">
                  <p className="pwa-browser-item__label">Language</p>
                  <p className="pwa-browser-item__value">
                    {navigator.language}
                  </p>
                </div>
                <div className="pwa-browser-item">
                  <p className="pwa-browser-item__label">Screen</p>
                  <p className="pwa-browser-item__value">
                    {window.screen.width} × {window.screen.height}
                  </p>
                </div>
              </div>
            </section>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default PWATestPage;