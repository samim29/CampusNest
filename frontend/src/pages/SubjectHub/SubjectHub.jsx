/* ============================================================
   CAMPUSNEST — Subject Learning Hub  (/subject-hub)
   Sections:
   - Hero with search
   - Subject cards with progress bars
   - Resource type filter tabs
   - Recent uploads feed
   - Codeforces / coding stats strip
   ============================================================ */

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import ErrorBoundary   from '../../components/ui/ErrorBoundary';
import Loader          from '../../components/ui/Loader';
import ScrollReveal    from '../../components/ui/ScrollReveal';
import usePageLoader   from '../../hooks/usePageLoader';
import useScrollReveal from '../../hooks/useScrollReveal';
import { sanitizeSearch } from '../../utils/sanitize';
import './SubjectHub.css';

/* ── Static data ── */
const SUBJECTS = [
  { id:'s1', name:'Mathematics',     emoji:'📐', resources:142, topics:12, progress:65, color:'var(--terracotta)' },
  { id:'s2', name:'Physics',         emoji:'⚡', resources:98,  topics:9,  progress:40, color:'var(--navy)'      },
  { id:'s3', name:'Chemistry',       emoji:'🧪', resources:75,  topics:8,  progress:25, color:'var(--sage)'      },
  { id:'s4', name:'Computer Science',emoji:'💻', resources:210, topics:15, progress:80, color:'var(--terracotta)'},
  { id:'s5', name:'Engineering',     emoji:'⚙️', resources:130, topics:10, progress:50, color:'var(--gold)'      },
  { id:'s6', name:'Statistics',      emoji:'📊', resources:60,  topics:6,  progress:30, color:'var(--navy)'      },
  { id:'s7', name:'Biology',         emoji:'🧬', resources:88,  topics:11, progress:20, color:'var(--sage)'      },
  { id:'s8', name:'Economics',       emoji:'📈', resources:55,  topics:7,  progress:35, color:'var(--gold)'      },
];

const RESOURCE_TYPES = [
  { id:'all',    label:'All',          icon:'📚' },
  { id:'pdf',    label:'Notes / PDFs', icon:'📄' },
  { id:'video',  label:'Videos',       icon:'🎥' },
  { id:'mcq',    label:'MCQs',         icon:'❓' },
  { id:'code',   label:'Coding',       icon:'💻' },
  { id:'papers', label:'Past Papers',  icon:'📝' },
];

const RECENT_RESOURCES = [
  { id:'r1', title:'Calculus — Integration Techniques (50 problems)', subject:'Mathematics', type:'pdf',   uploader:'Rahul V.',   time:'2h ago',  downloads:34,  emoji:'📄' },
  { id:'r2', title:'Quantum Mechanics — Wave Functions Explained',     subject:'Physics',     type:'video', uploader:'Prof. Sharma',time:'5h ago', downloads:78,  emoji:'🎥' },
  { id:'r3', title:'DSA — Binary Trees Problem Set (Codeforces)',      subject:'CS',          type:'code',  uploader:'Priya S.',   time:'8h ago',  downloads:102, emoji:'💻' },
  { id:'r4', title:'Organic Chemistry — Reaction Mechanisms Notes',   subject:'Chemistry',   type:'pdf',   uploader:'Ananya R.',  time:'1d ago',  downloads:56,  emoji:'📄' },
  { id:'r5', title:'Statistics — Hypothesis Testing MCQs (100 Qs)',   subject:'Statistics',  type:'mcq',   uploader:'Arjun M.',   time:'1d ago',  downloads:29,  emoji:'❓' },
  { id:'r6', title:'GATE 2023 CSE Paper — Full Solved',               subject:'CS',          type:'papers',uploader:'Admin',      time:'2d ago',  downloads:289, emoji:'📝' },
];

const CODING_STATS = [
  { label:'Problems Solved', value:'342', icon:'✅', color:'var(--sage)'      },
  { label:'CF Rating',       value:'1487',icon:'⚡', color:'var(--gold)'     },
  { label:'Study Streak',    value:'14d', icon:'🔥', color:'var(--terracotta)'},
  { label:'Resources Saved', value:'28',  icon:'📚', color:'var(--navy)'     },
];

function useDebounce(value, delay = 300) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

/* ── Subject card ── */
function SubjectCard({ subject, delay, onClick }) {
  return (
    <ScrollReveal delay={delay % 4}>
      <article
        className="sh-subject-card"
        onClick={() => onClick(subject)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(subject); }}}
        role="button"
        tabIndex={0}
        aria-label={`${subject.name} — ${subject.resources} resources`}
      >
        <div className="sh-subject-card__top">
          <span className="sh-subject-card__emoji" aria-hidden="true">
            {subject.emoji}
          </span>
          <div className="sh-subject-card__meta">
            <span className="sh-subject-card__count">
              {subject.resources} resources
            </span>
            <span className="sh-subject-card__topics">
              {subject.topics} topics
            </span>
          </div>
        </div>

        <h3 className="sh-subject-card__name">{subject.name}</h3>

        <div className="sh-subject-card__progress-wrap">
          <div className="sh-subject-card__progress-meta">
            <span className="sh-subject-card__progress-label">
              Your progress
            </span>
            <span className="sh-subject-card__progress-pct">
              {subject.progress}%
            </span>
          </div>
          <div
            className="sh-subject-card__progress-track"
            role="progressbar"
            aria-valuenow={subject.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${subject.name} progress: ${subject.progress}%`}
          >
            <div
              className="sh-subject-card__progress-fill"
              style={{
                width: `${subject.progress}%`,
                background: subject.color,
              }}
            />
          </div>
        </div>

        <div className="sh-subject-card__footer">
          <span className="sh-subject-card__explore">
            Explore →
          </span>
        </div>
      </article>
    </ScrollReveal>
  );
}

/* ── Resource row ── */
function ResourceRow({ resource, delay }) {
  const typeBg = {
    pdf:    'rgba(200,88,58,0.10)',
    video:  'rgba(15,27,45,0.08)',
    code:   'rgba(122,158,126,0.10)',
    mcq:    'rgba(212,168,83,0.10)',
    papers: 'rgba(15,27,45,0.06)',
  };

  return (
    <ScrollReveal delay={delay % 4}>
      <article
        className="sh-resource-row"
        aria-label={`${resource.title} — ${resource.type}`}
      >
        <div
          className="sh-resource-row__icon"
          style={{ background: typeBg[resource.type] ?? 'var(--cream)' }}
          aria-hidden="true"
        >
          {resource.emoji}
        </div>

        <div className="sh-resource-row__info">
          <h4 className="sh-resource-row__title">{resource.title}</h4>
          <p className="sh-resource-row__meta">
            {resource.subject} · {resource.uploader} · {resource.time}
          </p>
        </div>

        <div className="sh-resource-row__right">
          <span
            className={`sh-resource-row__type sh-resource-row__type--${resource.type}`}
          >
            {resource.type.toUpperCase()}
          </span>
          <span className="sh-resource-row__downloads">
            ⬇ {resource.downloads}
          </span>
          <button
            type="button"
            className="sh-resource-row__download-btn"
            aria-label={`Download ${resource.title}`}
          >
            ⬇ Save
          </button>
        </div>
      </article>
    </ScrollReveal>
  );
}

/* ── Main component ── */
function SubjectHub() {
  const loading  = usePageLoader();
  const pageRef  = useRef(null);
  useScrollReveal(pageRef);

  const [searchRaw,     setSearchRaw    ] = useState('');
  const [activeType,    setActiveType   ] = useState('all');
  const [activeSubject, setActiveSubject] = useState(null);

  const debouncedSearch = useDebounce(searchRaw, 300);

  /* Filter resources */
  const filteredResources = useMemo(() => {
    let list = [...RECENT_RESOURCES];

    if (activeType !== 'all') {
      list = list.filter(r => r.type === activeType);
    }

    if (activeSubject) {
      list = list.filter(r =>
        r.subject.toLowerCase().includes(activeSubject.name.toLowerCase().slice(0, 4))
      );
    }

    const q = debouncedSearch.trim().toLowerCase();
    if (q.length >= 2) {
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeType, activeSubject, debouncedSearch]);

  /* Filter subjects */
  const filteredSubjects = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (q.length < 2) return SUBJECTS;
    return SUBJECTS.filter(s =>
      s.name.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  const handleSubjectClick = useCallback((subject) => {
    setActiveSubject(prev =>
      prev?.id === subject.id ? null : subject
    );
    setActiveType('all');
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <div className="sh-page" ref={pageRef}>
        <Navbar />

        <main id="main-content">

          {/* ── Hero ── */}
          <section className="sh-hero" aria-labelledby="sh-hero-title">
            <div className="sh-hero__orb sh-hero__orb--a" aria-hidden="true" />
            <div className="sh-hero__orb sh-hero__orb--b" aria-hidden="true" />

            <div className="sh-hero__inner">
              <p className="sh-hero__eyebrow">Academic Hub</p>
              <h1 id="sh-hero-title" className="sh-hero__title">
                Study smarter,{' '}
                <em>together</em>
              </h1>
              <p className="sh-hero__sub">
                Notes, videos, MCQs, past papers &amp; coding problems —
                all in one place for Indian students.
              </p>

              {/* Search */}
              <div
                className="sh-hero__search"
                role="search"
                aria-label="Search subjects and resources"
              >
                <label htmlFor="sh-search" className="sr-only">
                  Search subjects or resources
                </label>
                <span aria-hidden="true">🔍</span>
                <input
                  id="sh-search"
                  type="text"
                  className="sh-hero__search-input"
                  placeholder="Search subjects, topics, notes…"
                  value={searchRaw}
                  onChange={e =>
                    setSearchRaw(sanitizeSearch(e.target.value))
                  }
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={200}
                />
                {searchRaw && (
                  <button
                    type="button"
                    className="sh-hero__search-clear"
                    onClick={() => setSearchRaw('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Coding stats strip */}
              <div
                className="sh-stats-strip"
                role="list"
                aria-label="Your learning stats"
              >
                {CODING_STATS.map(s => (
                  <div
                    key={s.label}
                    className="sh-stats-strip__item"
                    role="listitem"
                  >
                    <span
                      className="sh-stats-strip__icon"
                      aria-hidden="true"
                    >
                      {s.icon}
                    </span>
                    <span
                      className="sh-stats-strip__value"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </span>
                    <span className="sh-stats-strip__label">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Subjects ── */}
          <section
            className="sh-subjects-section"
            aria-labelledby="sh-subjects-title"
          >
            <div className="sh-subjects-section__inner">
              <div className="sh-subjects-section__header">
                <div>
                  <p className="sh-section-eyebrow">Browse Subjects</p>
                  <h2
                    id="sh-subjects-title"
                    className="sh-section-title"
                  >
                    {activeSubject
                      ? `Showing resources for ${activeSubject.name}`
                      : 'All Subjects'}
                  </h2>
                </div>
                {activeSubject && (
                  <button
                    type="button"
                    className="sh-clear-filter"
                    onClick={() => setActiveSubject(null)}
                    aria-label="Clear subject filter"
                  >
                    Clear filter ✕
                  </button>
                )}
              </div>

              <ErrorBoundary>
                {filteredSubjects.length > 0 ? (
                  <div
                    className="sh-subjects-grid"
                    role="list"
                    aria-label="Subject cards"
                  >
                    {filteredSubjects.map((s, i) => (
                      <div key={s.id} role="listitem">
                        <SubjectCard
                          subject={s}
                          delay={i}
                          onClick={handleSubjectClick}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sh-empty" role="status">
                    <span aria-hidden="true">📚</span>
                    <p>No subjects found for &ldquo;{debouncedSearch}&rdquo;</p>
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </section>

          {/* ── Resources ── */}
          <section
            className="sh-resources-section"
            aria-labelledby="sh-resources-title"
          >
            <div className="sh-resources-section__inner">
              <div className="sh-resources-section__header">
                <div>
                  <p className="sh-section-eyebrow">
                    {activeSubject
                      ? activeSubject.name
                      : 'Recently Added'}
                  </p>
                  <h2
                    id="sh-resources-title"
                    className="sh-section-title"
                  >
                    Learning Resources
                  </h2>
                </div>

                <button
                  type="button"
                  className="sh-upload-btn"
                  aria-label="Upload a resource"
                >
                  + Upload Resource
                </button>
              </div>

              {/* Type filter tabs */}
              <div
                className="sh-type-tabs"
                role="tablist"
                aria-label="Filter by resource type"
              >
                {RESOURCE_TYPES.map(t => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={activeType === t.id}
                    className={`sh-type-tab${activeType === t.id ? ' sh-type-tab--active' : ''}`}
                    onClick={() => setActiveType(t.id)}
                    type="button"
                  >
                    <span aria-hidden="true">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Resource list */}
              <ErrorBoundary>
                {filteredResources.length > 0 ? (
                  <div
                    className="sh-resources-list"
                    role="list"
                    aria-label="Learning resources"
                  >
                    {filteredResources.map((r, i) => (
                      <div key={r.id} role="listitem">
                        <ResourceRow resource={r} delay={i} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sh-empty" role="status">
                    <span aria-hidden="true">🔍</span>
                    <p>No resources match your filters. Try a different type or search.</p>
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}

export default SubjectHub;