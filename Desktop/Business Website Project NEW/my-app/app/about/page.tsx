'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

/* ============================================================
   Data
   ============================================================ */
const STATS = [
  { value: '—',    label: 'Active Customers',    sub: 'Worldwide'          },
  { value: '—',    label: 'Products Available',  sub: 'Across 6 categories'},
  { value: '150+', label: 'Countries Served',    sub: 'Global shipping'    },
  { value: '—',    label: 'Orders Fulfilled',    sub: 'And counting'       },
];

const VALUES = [
  {
    title: 'Quality First',
    desc: 'Every component we stock is tested and certified. We refuse to compromise on standards — your project depends on parts that perform.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    title: 'Transparency',
    desc: 'Clear pricing, honest lead times, and proactive communication. No hidden fees, no surprises — just straightforward business.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    ),
  },
  {
    title: 'Innovation',
    desc: 'We continuously expand our catalogue to stay ahead of the curve — sourcing the latest components so you can build the next generation of products.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    title: 'Customer Focus',
    desc: 'From hobbyists to hardware companies, we treat every customer with the same level of care, expertise, and urgency.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    title: 'Reliability',
    desc: 'Consistent stock levels, dependable shipping partners, and a team you can count on — we are built to be a supplier you never have to worry about.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Sustainability',
    desc: 'We are committed to responsible sourcing, minimal packaging waste, and supporting suppliers who share our environmental values.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
];

const TEAM = [
  { name: 'Team Member Name', role: 'Chief Executive Officer',      initials: 'TM' },
  { name: 'Team Member Name', role: 'Chief Technology Officer',     initials: 'TM' },
  { name: 'Team Member Name', role: 'Head of Operations',           initials: 'TM' },
  { name: 'Team Member Name', role: 'Head of Sales',                initials: 'TM' },
  { name: 'Team Member Name', role: 'Lead Engineer',                initials: 'TM' },
  { name: 'Team Member Name', role: 'Customer Success Manager',     initials: 'TM' },
];

const MILESTONES = [
  { year: '20XX', event: 'Company founded — started with a focused catalogue of circuit boards and microchips.' },
  { year: '20XX', event: 'Expanded to sensors, development kits, and custom PCB solutions.' },
  { year: '20XX', event: 'Launched worldwide shipping to 150+ countries.' },
  { year: '20XX', event: 'Reached — active customers across — markets.' },
  { year: 'Now',  event: 'Continuing to grow our catalogue, team, and global reach.' },
];

/* ============================================================
   Main Component
   ============================================================ */
export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* ── Hero ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>// ABOUT US</p>
          <h1 className={styles.heroTitle}>
            Built for Engineers.<br />
            Trusted by Makers.
          </h1>
          <p className={styles.heroSub}>
            We are a specialist supplier of premium electronic components — serving hobbyists,
            engineers, and hardware companies worldwide. Our mission is to make high-quality
            components accessible, affordable, and reliably delivered to every corner of the globe.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/products" className={styles.heroBtnPrimary}>
              Browse Products
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
            <Link href="/contact" className={styles.heroBtnSecondary}>
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.contentWrap}>

        {/* ── Stats ── */}
        <div className={styles.statStrip}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statStripItem}>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statSub}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Mission ── */}
        <div className={styles.missionBlock}>
          <div className={styles.missionLeft}>
            <p className={styles.sectionEyebrow}>// OUR MISSION</p>
            <h2 className={styles.sectionHeading}>Why We Exist</h2>
            <p className={styles.sectionBody}>
              Electronic components are the foundation of every device, system, and innovation
              in the modern world. Yet sourcing the right part — at the right price, reliably,
              and on time — has always been harder than it should be.
            </p>
            <p className={styles.sectionBody}>
              We built this business to fix that. A single, trusted source for circuit boards,
              microchips, sensors, development kits, and custom solutions — with transparent
              pricing, expert support, and worldwide delivery.
            </p>
          </div>
          <div className={styles.missionRight}>
            <div className={styles.missionCard}>
              <p className={styles.missionCardEyebrow}>Our Promise</p>
              <ul className={styles.missionList}>
                {[
                  'Certified, tested components only',
                  'Transparent pricing with no hidden fees',
                  'Worldwide delivery to 150+ countries',
                  'Expert technical support on every order',
                  'Hassle-free returns and warranty coverage',
                ].map((item, i) => (
                  <li key={i} className={styles.missionListItem}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"
                      style={{ color: 'var(--color-accent, #22c55e)', flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Values ── */}
        <div className={styles.sectionDivider} />
        <p className={styles.sectionEyebrow}>// OUR VALUES</p>
        <h2 className={styles.sectionHeading}>What We Stand For</h2>
        <p className={styles.sectionSub}>
          Six principles that guide every decision we make — from the components we stock
          to the way we treat every customer.
        </p>
        <div className={styles.valuesGrid}>
          {VALUES.map((v, i) => (
            <div key={i} className={styles.valueCard}>
              <div className={styles.valueIconWrap}>{v.icon}</div>
              <p className={styles.valueTitle}>{v.title}</p>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Milestones ── */}
        <div className={styles.sectionDivider} />
        <p className={styles.sectionEyebrow}>// MILESTONES</p>
        <h2 className={styles.sectionHeading}>Our Journey</h2>
        <p className={styles.sectionSub}>Key moments that have shaped who we are today.</p>
        <div className={styles.timeline}>
          {MILESTONES.map((m, i) => (
            <div key={i} className={styles.timelineItem}>
              <div className={styles.timelineYear}>{m.year}</div>
              <div className={styles.timelineDot} />
              <div className={styles.timelineEvent}>{m.event}</div>
            </div>
          ))}
        </div>

        {/* ── Team ── */}
        <div className={styles.sectionDivider} />
        <p className={styles.sectionEyebrow}>// THE TEAM</p>
        <h2 className={styles.sectionHeading}>Meet the People Behind It</h2>
        <p className={styles.sectionSub}>
          A team of engineers, operators, and customer specialists dedicated to making
          your experience as smooth as possible.
        </p>
        <div className={styles.teamGrid}>
          {TEAM.map((member, i) => (
            <div key={i} className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <span className={styles.teamInitials}>{member.initials}</span>
              </div>
              <p className={styles.teamName}>{member.name}</p>
              <p className={styles.teamRole}>{member.role}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className={styles.ctaStrip}>
          <div>
            <p className={styles.ctaTitle}>Ready to work with us?</p>
            <p className={styles.ctaSub}>Browse our catalogue or get in touch with our team today.</p>
          </div>
          <div className={styles.ctaBtns}>
            <Link href="/products" className={styles.ctaBtnPrimary}>
              Shop Now
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
            <Link href="/contact" className={styles.ctaBtnSecondary}>Contact Us</Link>
          </div>
        </div>

      </div>
    </div>
  );
}