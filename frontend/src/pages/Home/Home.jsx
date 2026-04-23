/* ============================================================
   CAMPUSNEST — Home Page
   Orchestrates all home sections.
   Handles page loader, scroll reveal, and error boundaries.
   ============================================================ */

import { useRef } from 'react';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import Loader        from '../../components/ui/Loader';
import Navbar        from '../../components/layout/Navbar';
import Footer        from '../../components/layout/Footer';
import HeroSection   from './HeroSection';
import HowItWorks    from './HowItWorks';
import FeaturesSection from './FeaturesSection';
import PGShowcase    from './PGShowcase';
import FoodSection   from './FoodSection';
import Testimonials  from './Testimonials';
import CTASection    from './CTASection';

import usePageLoader    from '../../hooks/usePageLoader';
import useScrollReveal  from '../../hooks/useScrollReveal';

import '../../styles/index.css';
import './Home.css';

function Home() {
  const loading      = usePageLoader();
  const pageRef      = useRef(null);
  useScrollReveal(pageRef);

  return (
    <>
      <Loader loading={loading} />

      <div className="home" ref={pageRef}>
        <Navbar />

        <main id="main-content">
          <ErrorBoundary>
            <HeroSection />
          </ErrorBoundary>

          <ErrorBoundary>
            <HowItWorks />
          </ErrorBoundary>

          <ErrorBoundary>
            <FeaturesSection />
          </ErrorBoundary>

          <ErrorBoundary>
            <PGShowcase />
          </ErrorBoundary>

          <ErrorBoundary>
            <FoodSection />
          </ErrorBoundary>

          <ErrorBoundary>
            <Testimonials />
          </ErrorBoundary>

          <ErrorBoundary>
            <CTASection />
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Home;