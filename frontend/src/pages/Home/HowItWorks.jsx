/* ============================================================
   CAMPUSNEST — HowItWorks Section
   ============================================================ */

import ScrollReveal   from '../../components/ui/ScrollReveal';
import SectionHeader  from '../../components/common/SectionHeader';
import './HowItWorks.css';

const STEPS = [
  {
    num:   '01',
    icon:  '🔍',
    step:  'Step 01',
    title: 'Tell us your college',
    desc:  'Enter your college name and preferences. We instantly surface nearby, verified options that match your needs and budget.',
  },
  {
    num:   '02',
    icon:  '🏠',
    step:  'Step 02',
    title: 'Explore & compare',
    desc:  'Browse detailed listings with photos, 360° virtual tours, amenities, policies, and real student reviews.',
  },
  {
    num:   '03',
    icon:  '📅',
    step:  'Step 03',
    title: 'Schedule a visit',
    desc:  'Book a physical or virtual tour directly with the PG owner — no third-party agents involved, ever.',
  },
  {
    num:   '04',
    icon:  '✅',
    step:  'Step 04',
    title: 'Move in safely',
    desc:  'Complete your booking online, pay securely, and move in with full confidence and 24/7 support.',
  },
];

function HowItWorks() {
  return (
    <section
      className="how"
      id="how"
      aria-labelledby="how-title"
    >
      <div className="how__header">
        <SectionHeader
          eyebrow="Simple Process"
          title={
            <>
              From search to{' '}
              <em>settled in</em>
              {' '}— in days
            </>
          }
          subtitle="No middlemen, no hidden fees. Just find, verify, and move in."
        />
      </div>

      <ScrollReveal className="how__grid" as="ol" aria-label="How CampusNest works">
        {STEPS.map((step, i) => (
          <li key={step.num} className="how__item" data-num={step.num}>
            <div
              className="how__icon"
              aria-hidden="true"
            >
              {step.icon}
            </div>
            <p className="how__step-label" aria-hidden="true">
              {step.step}
            </p>
            <h3 className="how__title">{step.title}</h3>
            <p className="how__desc">{step.desc}</p>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}

export default HowItWorks;