/* ============================================================
   CAMPUSNEST — Testimonials Section
   ============================================================ */

import ScrollReveal  from '../../components/ui/ScrollReveal';
import SectionHeader from '../../components/common/SectionHeader';
import './Testimonials.css';

const TESTIMONIALS = [
  {
    quote:  'Found my PG in 2 days of joining college. The virtual tour saved me from making a terrible decision — the room looked completely different in real life from the old photos!',
    name:   'Priya Sharma',
    detail: '2nd Year, Delhi University',
    avatar: '👩‍🎓',
    bg:     '#fde8d8',
    stars:  5,
  },
  {
    quote:  'The mess & food section is underrated. I use it every single day to check today\'s menu before deciding whether to eat at PG or try somewhere new.',
    name:   'Rahul Verma',
    detail: '3rd Year, IIT Bombay',
    avatar: '👨‍💻',
    bg:     '#d8f0e8',
    stars:  5,
  },
  {
    quote:  'As a girl from a small town, the Safety Network feature genuinely made my parents comfortable with me staying alone in a big city. That peace of mind is priceless.',
    name:   'Ananya Reddy',
    detail: '1st Year, AIIMS Delhi',
    avatar: '👩‍🔬',
    bg:     '#e8d8f0',
    stars:  5,
  },
];

function StarRating({ count }) {
  return (
    <div
      className="testimonial__stars"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden="true">⭐</span>
      ))}
    </div>
  );
}

function TestimonialCard({ quote, name, detail, avatar, bg, stars, delay }) {
  return (
    <ScrollReveal
      delay={delay}
      className="testimonial-card"
      as="article"
      aria-label={`Review by ${name}`}
    >
      <StarRating count={stars} />
      <blockquote className="testimonial__quote">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <footer className="testimonial__author">
        <div
          className="testimonial__avatar"
          style={{ background: bg }}
          aria-hidden="true"
        >
          {avatar}
        </div>
        <div>
          <p className="testimonial__name">{name}</p>
          <p className="testimonial__detail">{detail}</p>
        </div>
      </footer>
    </ScrollReveal>
  );
}

function Testimonials() {
  return (
    <section
      className="testimonials"
      aria-labelledby="testimonials-title"
    >
      <SectionHeader
        eyebrow="Student Stories"
        title={
          <>
            What students
            <br />
            are <em>saying</em>
          </>
        }
        align="center"
        className="testimonials__header"
      />

      <div
        className="testimonials__grid"
        role="list"
        aria-label="Student testimonials"
      >
        {TESTIMONIALS.map((t, i) => (
          <div key={t.name} role="listitem">
            <TestimonialCard {...t} delay={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;