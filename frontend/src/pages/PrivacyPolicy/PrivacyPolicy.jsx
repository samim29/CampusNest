/* ============================================================
   CAMPUSNEST — Privacy Policy  (/privacy-policy)
   Same layout as Terms — sticky ToC + scrollable content.
   ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import Navbar        from '../../components/layout/Navbar';
import Footer        from '../../components/layout/Footer';
import Loader        from '../../components/ui/Loader';
import usePageLoader from '../../hooks/usePageLoader';
import './PrivacyPolicy.css';

const PP_SECTIONS = [
  {
    id: 'overview',
    num: '01',
    title: 'Overview',
    content: `CampusNest Technologies Pvt. Ltd. ("CampusNest", "we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.

Please read this policy carefully. By using CampusNest, you consent to the practices described here. This policy applies to all users — students, PG owners, and visitors.`,
  },
  {
    id: 'data-collected',
    num: '02',
    title: 'Information We Collect',
    content: `We collect information you provide directly: name, email address, phone number, college name, and profile details when you register. PG owners additionally provide property details, photos, and banking information for payments.

We automatically collect usage data: pages visited, search queries, device information, browser type, IP address, and approximate location (with your permission). We use cookies and similar tracking technologies to improve your experience.

We do not collect sensitive personal data such as caste, religion, or political views.`,
  },
  {
    id: 'data-use',
    num: '03',
    title: 'How We Use Your Information',
    content: `We use your information to: provide and improve the Platform, match you with relevant PG listings, send transactional emails and notifications, process payments, verify PG listings, operate the Safety Network (SOS alerts, trusted contacts), respond to support requests, detect and prevent fraud, and conduct research and analytics.

We will always ask for your consent before using your data for marketing purposes. You can opt out of marketing communications at any time from your profile settings.`,
  },
  {
    id: 'data-sharing',
    num: '04',
    title: 'Data Sharing & Disclosure',
    content: `We do not sell your personal data to third parties. We share data only in the following circumstances: with PG owners (limited to your name and contact details) when you initiate a booking enquiry; with payment processors to facilitate transactions; with cloud service providers who help us operate the Platform; and with law enforcement when required by law.

All third-party service providers are contractually obligated to protect your data and use it only for the purposes we specify.`,
  },
  {
    id: 'data-security',
    num: '05',
    title: 'Data Security',
    content: `We implement industry-standard security measures including: TLS encryption for all data in transit, AES-256 encryption for sensitive data at rest, regular security audits and penetration testing, two-factor authentication for owner and admin accounts, and PCI-DSS compliant payment processing.

Despite these measures, no system is completely secure. We cannot guarantee absolute security of your data. If a data breach occurs, we will notify affected users within 72 hours as required by applicable law.`,
  },
  {
    id: 'cookies',
    num: '06',
    title: 'Cookies & Tracking',
    content: `We use essential cookies (required for the Platform to function), preference cookies (to remember your settings), analytics cookies (to understand how the Platform is used), and marketing cookies (only with your explicit consent).

You can control cookies through your browser settings. Disabling essential cookies may affect Platform functionality. We use Google Analytics and similar tools in anonymised mode; IP addresses are masked before processing.`,
  },
  {
    id: 'rights',
    num: '07',
    title: 'Your Rights',
    content: `Under applicable Indian data protection law, you have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your data (subject to legal obligations), withdraw consent for processing, and lodge a complaint with the relevant data protection authority.

To exercise any of these rights, contact us at privacy@campusnest.in. We will respond within 30 days. We may need to verify your identity before processing requests.`,
  },
  {
    id: 'retention',
    num: '08',
    title: 'Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide services. After account deletion, we retain certain data for up to 3 years to comply with legal obligations, resolve disputes, and prevent fraud.

Anonymous and aggregated data (which cannot identify you) may be retained indefinitely for research and analytical purposes.`,
  },
  {
    id: 'children',
    num: '09',
    title: "Children's Privacy",
    content: `CampusNest is not intended for use by anyone under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that we have collected data from someone under 18, we will delete it immediately.

If you believe we have collected data from a minor, please contact us at privacy@campusnest.in.`,
  },
  {
    id: 'changes',
    num: '10',
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email and by displaying a prominent notice on the Platform. The "Last Updated" date at the top of this page indicates when the policy was last revised.

Your continued use of CampusNest after policy changes constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    num: '11',
    title: 'Contact & DPO',
    content: `For privacy-related queries, please contact our Data Protection Officer:

Email: privacy@campusnest.in
Address: [Registered Office], New Delhi, India – 110001

For general support, visit our Help & FAQ page or email support@campusnest.in.`,
  },
];

function PrivacyPolicy() {
  const loading         = usePageLoader();
  const [active, setActive] = useState('overview');
  const contentRef      = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace('pp-', ''));
          }
        });
      },
      { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    PP_SECTIONS.forEach(s => {
      const el = document.getElementById(`pp-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(`pp-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <div className="legal-page privacy-page">
        <Navbar />

        <main id="main-content">
          <div className="legal-hero">
            <div className="legal-hero__orb" aria-hidden="true" />
            <div className="legal-hero__inner">
              <p className="legal-hero__eyebrow">Legal</p>
              <h1 className="legal-hero__title">Privacy Policy</h1>
              <p className="legal-hero__meta">
                Last updated: May 1, 2026 · PDPB & IT Act compliant
              </p>
            </div>
          </div>

          <div className="legal-body">
            <nav className="legal-toc" aria-label="Privacy policy table of contents">
              <p className="legal-toc__title">Contents</p>
              <ul className="legal-toc__list">
                {PP_SECTIONS.map(s => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`legal-toc__item${active === s.id ? ' legal-toc__item--active' : ''}`}
                      onClick={() => scrollToSection(s.id)}
                      aria-current={active === s.id ? 'true' : undefined}
                    >
                      <span className="legal-toc__num" aria-hidden="true">
                        {s.num}
                      </span>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <article
              ref={contentRef}
              className="legal-content"
              aria-label="Privacy Policy content"
            >
              {PP_SECTIONS.map(s => (
                <section
                  key={s.id}
                  id={`pp-${s.id}`}
                  className="legal-section"
                  aria-labelledby={`pp-heading-${s.id}`}
                >
                  <div className="legal-section__num" aria-hidden="true">
                    {s.num}
                  </div>
                  <h2
                    id={`pp-heading-${s.id}`}
                    className="legal-section__title"
                  >
                    {s.title}
                  </h2>
                  {s.content.split('\n\n').map((para, pi) => (
                    <p key={pi} className="legal-section__para">
                      {para}
                    </p>
                  ))}
                </section>
              ))}

              <div className="legal-footer-note">
                <span aria-hidden="true">🔒</span>
                <p>
                  Your privacy matters deeply to us. CampusNest will
                  never sell your personal data. For questions or
                  concerns, write to{' '}
                  <a href="mailto:privacy@campusnest.in" className="legal-email-link">
                    privacy@campusnest.in
                  </a>
                </p>
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default PrivacyPolicy;