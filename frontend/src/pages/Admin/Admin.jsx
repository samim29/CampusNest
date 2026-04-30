/* ============================================================
   CAMPUSNEST — Admin Panel  (/admin)
   Features:
   - Darker sidebar (separate from owner)
   - Platform-wide stats
   - PG submissions table with verify/flag/reject actions
   - User management table
   - Safety reports queue
   ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate }                        from 'react-router-dom';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ROUTES }      from '../../utils/constants';
import './Admin.css';

/* ── Static data ── */
const PLATFORM_STATS = [
  { label:'Total PGs',       value:'2,041', change:'+14 this week', color:'rgba(200,88,58,0.10)',  border:'rgba(200,88,58,0.20)',  textColor:'var(--terracotta)'  },
  { label:'Total Users',     value:'52,340',change:'+340 this week', color:'rgba(122,158,126,0.10)',border:'rgba(122,158,126,0.20)',textColor:'var(--sage)'        },
  { label:'Pending Verify',  value:'34',    change:'Needs action',   color:'rgba(212,168,83,0.10)', border:'rgba(212,168,83,0.20)', textColor:'var(--gold-dark)'   },
  { label:'Open Reports',    value:'8',     change:'Safety reports', color:'rgba(15,27,45,0.06)',   border:'var(--border)',         textColor:'var(--navy)'        },
];

const PG_SUBMISSIONS = [
  { id:'p1', name:'Sunrise Boys PG',      owner:'Ramesh Kumar', city:'Delhi',     submitted:'Apr 20', status:'Verified'  },
  { id:'p2', name:'Green Valley PG',      owner:'Sunita Jain',  city:'Mumbai',    submitted:'Apr 21', status:'Pending'   },
  { id:'p3', name:'City Co-Living Hub',   owner:'Arun Mehta',   city:'Bangalore', submitted:'Apr 22', status:'Pending'   },
  { id:'p4', name:'Metro Hostel Block A', owner:'Deepak Singh', city:'Delhi',     submitted:'Apr 22', status:'Flagged'   },
  { id:'p5', name:'Pearl Girls Residency',owner:'Neha Sharma',  city:'Pune',      submitted:'Apr 23', status:'Verified'  },
  { id:'p6', name:'Tech Park Co-Living',  owner:'Vijay Kumar',  city:'Bangalore', submitted:'Apr 24', status:'Pending'   },
];

const USERS = [
  { id:'u1', name:'Priya Sharma',   email:'priya@du.ac.in',   role:'Student', joined:'Mar 2024', status:'Active'    },
  { id:'u2', name:'Ramesh Kumar',   email:'ramesh@gmail.com', role:'Owner',   joined:'Jan 2023', status:'Active'    },
  { id:'u3', name:'Rahul Verma',    email:'rahul@iitb.ac.in', role:'Student', joined:'Jul 2024', status:'Active'    },
  { id:'u4', name:'Suspicious User',email:'spam@email.com',   role:'Student', joined:'Apr 2026', status:'Suspended' },
];

const SAFETY_REPORTS = [
  { id:'sr1', type:'Unsafe PG',         location:'GTB Nagar, Delhi',   reported:'2h ago',  severity:'High'   },
  { id:'sr2', type:'Scam Listing',      location:'Andheri, Mumbai',    reported:'5h ago',  severity:'High'   },
  { id:'sr3', type:'Street Hazard',     location:'Powai, Mumbai',      reported:'1d ago',  severity:'Medium' },
  { id:'sr4', type:'Lighting Issue',    location:'Sector 62, Noida',   reported:'2d ago',  severity:'Low'    },
];

const ADMIN_SIDEBAR = [
  { id:'overview',  icon:'⊞',  label:'Overview'       },
  { id:'pgs',       icon:'🏠',  label:'PG Listings'    },
  { id:'users',     icon:'👥',  label:'Users'          },
  { id:'colleges',  icon:'🎓',  label:'Colleges'       },
  { id:'mess',      icon:'🍛',  label:'Mess Partners'  },
  { id:'reports',   icon:'🛡️', label:'Safety Reports' },
  { id:'analytics', icon:'📊',  label:'Analytics'      },
  { id:'settings',  icon:'⚙️', label:'Settings'       },
];

const STATUS_STYLES = {
  'Verified':  { bg:'rgba(122,158,126,0.12)', color:'var(--sage)'        },
  'Pending':   { bg:'rgba(212,168,83,0.12)',  color:'var(--gold-dark)'   },
  'Flagged':   { bg:'rgba(200,88,58,0.12)',   color:'var(--terracotta)'  },
  'Active':    { bg:'rgba(122,158,126,0.12)', color:'var(--sage)'        },
  'Suspended': { bg:'rgba(200,88,58,0.12)',   color:'var(--terracotta)'  },
};

const SEVERITY_STYLES = {
  'High':   { bg:'rgba(200,88,58,0.12)', color:'var(--terracotta)'  },
  'Medium': { bg:'rgba(212,168,83,0.12)',color:'var(--gold-dark)'   },
  'Low':    { bg:'rgba(122,158,126,0.12)',color:'var(--sage)'       },
};

/* ── Main component ── */
function Admin() {
  const loading  = usePageLoader();
  const navigate = useNavigate();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen,   setSidebarOpen  ] = useState(false);
  const [pgData,        setPgData       ] = useState(PG_SUBMISSIONS);
  const [userData,      setUserData     ] = useState(USERS);
  const [reports,       setReports      ] = useState(SAFETY_REPORTS);
  const [pgSearch,      setPgSearch     ] = useState('');
  const [userSearch,    setUserSearch   ] = useState('');

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  /* PG actions */
  const handlePGAction = useCallback((id, action) => {
    const statusMap = {
      verify:  'Verified',
      flag:    'Flagged',
      reject:  'Rejected',
    };
    setPgData(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: statusMap[action] ?? p.status } : p
      )
    );
  }, []);

  /* User actions */
  const handleUserAction = useCallback((id, action) => {
    setUserData(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, status: action === 'suspend' ? 'Suspended' : 'Active' }
          : u
      )
    );
  }, []);

  /* Report actions */
  const handleReportAction = useCallback((id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  /* Filtered lists */
  const filteredPGs = pgData.filter(p =>
    pgSearch.length < 2 ||
    p.name.toLowerCase().includes(pgSearch.toLowerCase()) ||
    p.owner.toLowerCase().includes(pgSearch.toLowerCase()) ||
    p.city.toLowerCase().includes(pgSearch.toLowerCase())
  );

  const filteredUsers = userData.filter(u =>
    userSearch.length < 2 ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <>
      <Loader loading={loading} />
      <div className="admin-page" ref={pageRef}>

        {sidebarOpen && (
          <div
            className="admin-sidebar__overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ════ SIDEBAR ════ */}
        <aside
          className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}
          aria-label="Admin navigation"
        >
          <div className="admin-sidebar__logo-wrap">
            <Link to={ROUTES.HOME} className="admin-sidebar__logo">
              <span className="admin-sidebar__logo-icon" aria-hidden="true">🏠</span>
              <span>Admin Panel</span>
            </Link>
          </div>

          <nav aria-label="Admin sections">
            <p className="admin-sidebar__section-label">Manage</p>
            {ADMIN_SIDEBAR.slice(0, 6).map(item => (
              <button
                key={item.id}
                type="button"
                className={`admin-sidebar__item${activeSection === item.id ? ' admin-sidebar__item--active' : ''}`}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="admin-sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
            <p className="admin-sidebar__section-label">System</p>
            {ADMIN_SIDEBAR.slice(6).map(item => (
              <button
                key={item.id}
                type="button"
                className={`admin-sidebar__item${activeSection === item.id ? ' admin-sidebar__item--active' : ''}`}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              >
                <span className="admin-sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="admin-sidebar__signout"
            onClick={() => navigate(ROUTES.LOGIN)}
            type="button"
          >
            <span aria-hidden="true">↩</span> Sign Out
          </button>
        </aside>

        {/* ════ MAIN ════ */}
        <div className="admin-main">

          {/* Top bar */}
          <header className="admin-topbar">
            <button
              className="admin-topbar__hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              type="button"
            >
              <span /><span /><span />
            </button>
            <span className="admin-topbar__title">Admin Panel</span>
            <div className="admin-topbar__right">
              <span className="admin-topbar__badge" aria-label="8 open reports">
                8 alerts
              </span>
            </div>
          </header>

          <div className="admin-content">

            {/* Greeting */}
            <div className="admin-greeting reveal">
              <div>
                <h1 className="admin-greeting__text">
                  Admin <em>Overview</em>
                </h1>
                <p className="admin-greeting__sub">
                  Platform management &amp; moderation
                </p>
              </div>
              <div className="admin-greeting__actions">
                <button
                  type="button"
                  className="admin-export-btn"
                  aria-label="Export platform data"
                >
                  📥 Export
                </button>
              </div>
            </div>

            {/* Platform stats */}
            <ErrorBoundary>
              <div
                className="admin-stats reveal reveal-delay-1"
                role="list"
                aria-label="Platform statistics"
              >
                {PLATFORM_STATS.map(s => (
                  <div
                    key={s.label}
                    className="admin-stat-card"
                    style={{
                      background: s.color,
                      borderColor: s.border,
                    }}
                    role="listitem"
                  >
                    <p className="admin-stat-card__label">{s.label}</p>
                    <p
                      className="admin-stat-card__value"
                      style={{ color: s.textColor }}
                    >
                      {s.value}
                    </p>
                    <p className="admin-stat-card__change">{s.change}</p>
                  </div>
                ))}
              </div>
            </ErrorBoundary>

            {/* PG Submissions table */}
            <ErrorBoundary>
              <ScrollReveal>
                <section
                  className="admin-table-card"
                  aria-labelledby="pg-table-title"
                >
                  <div className="admin-table-card__header">
                    <h2
                      id="pg-table-title"
                      className="admin-table-card__title"
                    >
                      🏠 PG Submissions
                    </h2>
                    <div className="admin-table-card__search-wrap">
                      <label
                        htmlFor="admin-pg-search"
                        className="sr-only"
                      >
                        Search PG submissions
                      </label>
                      <input
                        id="admin-pg-search"
                        type="text"
                        className="admin-search-input"
                        placeholder="Search by name, owner, city…"
                        value={pgSearch}
                        onChange={e => setPgSearch(e.target.value.slice(0, 100))}
                        aria-label="Search PG submissions"
                      />
                    </div>
                  </div>

                  <div className="admin-table-wrap" role="region" aria-label="PG submissions table" tabIndex={0}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th scope="col">PG Name</th>
                          <th scope="col">Owner</th>
                          <th scope="col">City</th>
                          <th scope="col">Submitted</th>
                          <th scope="col">Status</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPGs.map(pg => {
                          const style = STATUS_STYLES[pg.status] ?? STATUS_STYLES['Pending'];
                          return (
                            <tr key={pg.id}>
                              <td className="admin-table__name">{pg.name}</td>
                              <td>{pg.owner}</td>
                              <td>{pg.city}</td>
                              <td>{pg.submitted}</td>
                              <td>
                                <span
                                  className="admin-table__badge"
                                  style={{ background: style.bg, color: style.color }}
                                >
                                  {pg.status}
                                </span>
                              </td>
                              <td>
                                <div className="admin-table__actions">
                                  {pg.status !== 'Verified' && (
                                    <button
                                      type="button"
                                      className="admin-action-btn admin-action-btn--verify"
                                      onClick={() => handlePGAction(pg.id, 'verify')}
                                      aria-label={`Verify ${pg.name}`}
                                    >
                                      ✓ Verify
                                    </button>
                                  )}
                                  {pg.status !== 'Flagged' && (
                                    <button
                                      type="button"
                                      className="admin-action-btn admin-action-btn--flag"
                                      onClick={() => handlePGAction(pg.id, 'flag')}
                                      aria-label={`Flag ${pg.name}`}
                                    >
                                      ⚑ Flag
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredPGs.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="admin-table__empty"
                            >
                              No submissions match your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </ScrollReveal>
            </ErrorBoundary>

            {/* Bottom grid: Users + Safety Reports */}
            <div className="admin-bottom-grid reveal reveal-delay-2">

              {/* Users table */}
              <ErrorBoundary>
                <section
                  className="admin-table-card"
                  aria-labelledby="users-table-title"
                >
                  <div className="admin-table-card__header">
                    <h2
                      id="users-table-title"
                      className="admin-table-card__title"
                    >
                      👥 Users
                    </h2>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search users…"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value.slice(0, 100))}
                      aria-label="Search users"
                    />
                  </div>

                  <div className="admin-table-wrap" role="region" aria-label="Users table" tabIndex={0}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Role</th>
                          <th scope="col">Joined</th>
                          <th scope="col">Status</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => {
                          const style = STATUS_STYLES[u.status] ?? STATUS_STYLES['Active'];
                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="admin-user-cell">
                                  <span className="admin-user-avatar" aria-hidden="true">
                                    {u.name.charAt(0)}
                                  </span>
                                  <div>
                                    <p className="admin-user-name">{u.name}</p>
                                    <p className="admin-user-email">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td>{u.role}</td>
                              <td>{u.joined}</td>
                              <td>
                                <span
                                  className="admin-table__badge"
                                  style={{ background: style.bg, color: style.color }}
                                >
                                  {u.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`admin-action-btn${u.status === 'Suspended' ? ' admin-action-btn--verify' : ' admin-action-btn--flag'}`}
                                  onClick={() =>
                                    handleUserAction(
                                      u.id,
                                      u.status === 'Suspended' ? 'activate' : 'suspend'
                                    )
                                  }
                                  aria-label={`${u.status === 'Suspended' ? 'Activate' : 'Suspend'} ${u.name}`}
                                >
                                  {u.status === 'Suspended' ? '↩ Activate' : '⊘ Suspend'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </ErrorBoundary>

              {/* Safety reports */}
              <ErrorBoundary>
                <section
                  className="admin-table-card"
                  aria-labelledby="reports-table-title"
                >
                  <div className="admin-table-card__header">
                    <h2
                      id="reports-table-title"
                      className="admin-table-card__title"
                    >
                      🛡️ Safety Reports
                    </h2>
                    <span className="admin-table-card__count">
                      {reports.length} open
                    </span>
                  </div>

                  {reports.length === 0 ? (
                    <div className="admin-empty" role="status">
                      <span aria-hidden="true">✅</span>
                      <p>All reports resolved.</p>
                    </div>
                  ) : (
                    <div
                      className="admin-reports-list"
                      role="list"
                      aria-label="Safety reports"
                    >
                      {reports.map(r => {
                        const style = SEVERITY_STYLES[r.severity] ?? SEVERITY_STYLES['Low'];
                        return (
                          <div
                            key={r.id}
                            className="admin-report-row"
                            role="listitem"
                          >
                            <div className="admin-report-row__info">
                              <p className="admin-report-row__type">
                                {r.type}
                              </p>
                              <p className="admin-report-row__loc">
                                📍 {r.location} · {r.reported}
                              </p>
                            </div>
                            <div className="admin-report-row__right">
                              <span
                                className="admin-table__badge"
                                style={{ background: style.bg, color: style.color }}
                              >
                                {r.severity}
                              </span>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--resolve"
                                onClick={() => handleReportAction(r.id)}
                                aria-label={`Resolve report: ${r.type}`}
                              >
                                ✓ Resolve
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </ErrorBoundary>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;