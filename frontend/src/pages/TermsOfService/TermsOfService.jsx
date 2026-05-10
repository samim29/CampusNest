/* ============================================================
   CAMPUSNEST — Terms of Service  (/terms-of-service)
   Layout: sticky table-of-contents + scrollable content
   ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import Loader          from '../../components/ui/Loader';
import usePageLoader   from '../../hooks/usePageLoader';
import './TermsOfService.css';

const SECTIONS = [
  {
    id: 'acceptance',
    num: '01',
    title: 'Acceptance of Terms',
    content: `By accessing or using CampusNest ("Platform", "we", "us"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use our Platform. These terms apply to all visitors, students, PG owners, and other users of the service.

We reserve the right to update these terms at any time. Continued use of the Platform after changes constitutes your acceptance of the revised terms. We will notify registered users of material changes via email.`,
  },
  {
    id: 'eligibility',
    num: '02',
    title: 'Eligibility & Registration',
    content: `You must be at least 18 years of age to create an account on CampusNest. By creating an account, you represent that all information you provide is accurate, current, and complete.

You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at support@campusnest.in if you suspect any unauthorised access to your account. CampusNest will not be liable for any loss arising from unauthorised use of your account.

We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
  },
  {
    id: 'platform-use',
    num: '03',
    title: 'Use of the Platform',
    content: `CampusNest provides a marketplace connecting students with PG accommodation providers, mess facilities, and related services. We do not own, operate, or manage any PG listed on the Platform.

You agree not to: post false or misleading information, conduct fraudulent transactions, scrape or harvest data from the Platform, use automated systems to access the Platform without our written permission, transmit malware or harmful code, or engage in any activity that disrupts or interferes with the Platform.

CampusNest reserves the right to remove any content that violates these terms without prior notice.`,
  },
  {
    id: 'pg-listings',
    num: '04',
    title: 'PG Listings Policy',
    content: `PG owners who list their properties agree to provide accurate, up-to-date information about their accommodation. Listings must comply with all applicable local laws, including housing and safety regulations.

CampusNest physically verifies listed properties before awarding the "Verified" badge; however, we do not guarantee the condition, safety, or legality of any listed property. Students are encouraged to conduct their own due diligence before booking.

Fraudulent listings, misrepresentation of property details, or harassment of students will result in immediate account termination and may be reported to law enforcement.`,
  },
  {
    id: 'payments',
    num: '05',
    title: 'Payments & Refunds',
    content: `CampusNest is free to use for students. PG owners may be subject to a commission on confirmed bookings facilitated through the Platform.

Security deposits are held directly by the PG owner and are not managed by CampusNest. All transactions are processed through our PCI-DSS compliant payment gateway. We do not store card details on our servers.

Refund policies for security deposits are subject to the individual PG owner's terms. CampusNest provides documented digital receipts for all platform-facilitated transactions.`,
  },
  {
    id: 'privacy',
    num: '06',
    title: 'Privacy & Data',
    content: `Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using CampusNest, you consent to the collection and use of your information as described in the Privacy Policy.

We implement industry-standard security measures to protect your personal data. We do not sell your personal data to third parties. We may share anonymised, aggregated data for research and analytical purposes.`,
  },
  {
    id: 'safety',
    num: '07',
    title: 'Safety Features',
    content: `CampusNest's Safety Network features (SOS alerts, community reporting, safety scores) are provided as supplementary tools and do not replace professional emergency services. In any genuine emergency, always contact local police (100), ambulance (108), or fire services (101) first.

CampusNest is not liable for any harm, injury, or loss arising from reliance on safety scores, community reports, or SOS features. These features are crowd-sourced and may not always be accurate or up-to-date.`,
  },
  {
    id: 'liability',
    num: '08',
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, CampusNest and its affiliates, officers, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or property.

CampusNest's total liability to you for any claim arising from these Terms shall not exceed the amount you paid to CampusNest in the twelve months preceding the claim.`,
  },
  {
    id: 'governing-law',
    num: '09',
    title: 'Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Delhi, India.

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.`,
  },
  {
    id: 'contact',
    num: '10',
    title: 'Contact Us',
    content: `If you have questions about these Terms, please contact us at:

CampusNest Technologies Pvt. Ltd.
Email: legal@campusnest.in
Support: support@campusnest.in
Address: [Registered Office Address], New Delhi, India – 110001

For general support queries, please visit our Help & FAQ page.`,
  },
];

function TermsOfService() {
  const loading       = usePageLoader();
  const [active, setActive] = useState('acceptance');
  const contentRef    = useRef(null);

  /* Scroll-spy: update active section as user scrolls */
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    SECTIONS.forEach(s => {
      const el = document.getElementById(`tos-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(`tos-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActive(id);
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <div className="legal-page">
        <Navbar />

        <main id="main-content">
          {/* ── Hero header ── */}
          <div className="legal-hero">
            <div className="legal-hero__orb" aria-hidden="true" />
            <div className="legal-hero__inner">
              <p className="legal-hero__eyebrow">Legal</p>
              <h1 className="legal-hero__title">Terms of Service</h1>
              <p className="legal-hero__meta">
                Last updated: May 1, 2026 · Effective immediately
              </p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="legal-body">

            {/* Table of contents */}
            <nav
              className="legal-toc"
              aria-label="Table of contents"
            >
              <p className="legal-toc__title">Contents</p>
              <ul className="legal-toc__list">
                {SECTIONS.map(s => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`legal-toc__item${active === s.id ? ' legal-toc__item--active' : ''}`}
                      onClick={() => scrollToSection(s.id)}
                      aria-current={active === s.id ? 'true' : undefined}
                    >
                      <span
                        className="legal-toc__num"
                        aria-hidden="true"
                      >
                        {s.num}
                      </span>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <article
              ref={contentRef}
              className="legal-content"
              aria-label="Terms of Service content"
            >
              {SECTIONS.map((s, i) => (
                <section
                  key={s.id}
                  id={`tos-${s.id}`}
                  className="legal-section"
                  aria-labelledby={`tos-heading-${s.id}`}
                >
                  <div className="legal-section__num" aria-hidden="true">
                    {s.num}
                  </div>
                  <h2
                    id={`tos-heading-${s.id}`}
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
                <span aria-hidden="true">⚖️</span>
                <p>
                  These Terms of Service constitute the entire agreement
                  between you and CampusNest with respect to the use of
                  the Platform.
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

export default TermsOfService;