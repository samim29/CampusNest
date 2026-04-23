/* ============================================================
   CAMPUSNEST — FeaturesSection
   Dark navy background with feature cards grid.
   ============================================================ */

import ScrollReveal   from '../../components/ui/ScrollReveal';
import SectionHeader  from '../../components/common/SectionHeader';
import './FeaturesSection.css';

const FEATURES = [
  {
    icon:     '🏠',
    title:    'Smart PG Discovery',
    desc:     'AI-powered matching finds your perfect accommodation based on preferences, budget, location proximity, and lifestyle — not just price.',
    tags:     ['2000+ Listings', 'Verified Only', 'Virtual Tours'],
    featured: true,
  },
  {
    icon:  '🍛',
    title: 'Culinary Excellence',
    desc:  'Discover mess facilities, restaurants, and PG meal plans with hygiene ratings, weekly menus, and dietary accommodation options.',
    tags:  ['500+ Partners', 'Daily Menus'],
  },
  {
    icon:  '🛡️',
    title: 'Advanced Safety Network',
    desc:  'Real-time safety monitoring, emergency SOS, anonymous incident reporting, and community watch — safety is non-negotiable.',
    tags:  ['24/7 Support', 'SOS Alerts'],
  },
  {
    icon:  '📚',
    title: 'Academic Integration',
    desc:  'Subject learning hubs, Codeforces analytics, study groups, and AI-powered guidance to keep you ahead academically.',
    tags:  ['Notes & Videos', 'Coding Hub'],
  },
  {
    icon:  '🗺️',
    title: 'Interactive Maps',
    desc:  'Live distance calculations from your college, nearby mess & restaurants, transport links — all on one beautiful interactive map.',
    tags:  ['Real-time', 'Distance Tool'],
  },
  {
    icon:  '📱',
    title: 'PWA — Works Offline',
    desc:  'Install as a native app on any device. Access saved listings, menus, and contacts even without internet connection.',
    tags:  ['Offline Mode', 'Push Alerts'],
  },
];

function FeatureCard({ icon, title, desc, tags, featured, delay }) {
  return (
    <ScrollReveal
      delay={delay}
      className={`feat-card${featured ? ' feat-card--featured' : ''}`}
      as="article"
      aria-label={title}
    >
      <div className="feat-card__icon" aria-hidden="true">{icon}</div>
      <h3 className="feat-card__title">{title}</h3>
      <p className="feat-card__desc">{desc}</p>
      {tags?.length > 0 && (
        <ul className="feat-card__tags" aria-label="Feature highlights">
          {tags.map((tag) => (
            <li key={tag} className="feat-card__tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </ScrollReveal>
  );
}

function FeaturesSection() {
  return (
    <section
      className="features"
      id="features"
      aria-labelledby="features-title"
    >
      {/* Top edge line */}
      <div className="features__edge" aria-hidden="true" />

      <div className="features__inner">
        <SectionHeader
          eyebrow="Everything You Need"
          title={
            <>
              Built for <em>student life</em>,<br />
              not just housing
            </>
          }
          subtitle="A complete campus ecosystem — from accommodation to academics to safety."
          light
        />

        <div
          className="features__grid reveal"
          role="list"
          aria-label="Platform features"
        >
          {FEATURES.map((feat, i) => (
            <FeatureCard
              key={feat.title}
              {...feat}
              delay={i % 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;