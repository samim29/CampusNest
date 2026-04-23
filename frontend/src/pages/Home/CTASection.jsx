/* ============================================================
   CAMPUSNEST — CTASection
   Full-width terracotta call-to-action banner.
   ============================================================ */

import Button       from '../../components/ui/Button';
import ScrollReveal from '../../components/ui/ScrollReveal';
import { ROUTES }   from '../../utils/constants';
import './CTASection.css';

function CTASection() {
  return (
    <section
      className="cta-section"
      aria-labelledby="cta-title"
    >
      <ScrollReveal className="cta-section__inner">
        {/* Watermark */}
        <span className="cta-section__watermark" aria-hidden="true">🏠</span>

        {/* Text */}
        <div className="cta-section__text">
          <h2
            id="cta-title"
            className="cta-section__title display-md"
          >
            Ready to find your
            <br />
            <em>perfect nest</em>?
          </h2>
          <p className="cta-section__sub">
            Join 50,000+ students who found their home away from home
            with CampusNest — completely free to get started.
          </p>
        </div>

        {/* Buttons */}
        <div className="cta-section__buttons">
          <Button
            as="link"
            to={ROUTES.PG_LISTINGS}
            variant="white"
            size="lg"
          >
            🚀 Get Started Free
          </Button>
          <Button
            as="link"
            to={ROUTES.HELP}
            variant="ghost-white"
            size="md"
          >
            Talk to Support
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}

export default CTASection;