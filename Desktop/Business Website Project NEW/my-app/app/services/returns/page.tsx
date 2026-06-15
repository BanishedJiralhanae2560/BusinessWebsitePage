'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from '@/app/services/ServicePage.module.css';

const STATS = [
  { value: '30',   label: 'Day Return Window' },
  { value: '1yr',  label: 'Standard Warranty'  },
  { value: '100%', label: 'Defect Coverage'     },
  { value: '5d',   label: 'Refund Processing'   },
];

const FEATURES = [
  {
    title: '30-Day Return Window',
    desc: 'Unused, undamaged items in original packaging can be returned within 30 days of delivery — no questions asked.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
  },
  {
    title: '1-Year Manufacturing Warranty',
    desc: 'All products carry a 12-month warranty against manufacturing defects, covering replacement or full refund.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    title: 'Free Return Shipping',
    desc: 'For defective or incorrectly supplied items, we cover all return shipping costs — a prepaid label is provided.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
    ),
  },
  {
    title: 'Fast Refund Processing',
    desc: 'Approved refunds are processed within 5 business days of receiving the returned item.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Replacement Option',
    desc: 'Instead of a refund, you can opt for a direct replacement of the same item dispatched at no additional cost.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
      </svg>
    ),
  },
  {
    title: 'Defect Inspection',
    desc: 'All returned items are inspected by our QC team. Results are shared with you within 2 business days of receipt.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
  },
];

const POLICY_TABLE = [
  { type: 'Standard Products',   returnEligible: 'Yes', window: '30 days', warrantyPeriod: '12 months', coverage: 'Manufacturing defects' },
  { type: 'Custom PCBs',        returnEligible: 'No*', window: 'N/A',     warrantyPeriod: '12 months', coverage: 'Manufacturing defects only' },
  { type: 'Bulk Orders',        returnEligible: 'Partial', window: '14 days', warrantyPeriod: '12 months', coverage: 'Defective units only' },
  { type: 'Development Kits',   returnEligible: 'Yes', window: '30 days', warrantyPeriod: '12 months', coverage: 'Manufacturing defects' },
  { type: 'Software / Digital', returnEligible: 'No',  window: 'N/A',     warrantyPeriod: 'N/A',       coverage: 'N/A' },
];

const STEPS = [
  { num: 'Step 01', title: 'Raise a Request',  desc: 'Contact us via the support form with your order ID and reason for return.' },
  { num: 'Step 02', title: 'RMA Issued',        desc: 'We issue a Return Merchandise Authorisation number and prepaid label if applicable.' },
  { num: 'Step 03', title: 'Ship Item Back',    desc: 'Pack securely and ship using the label or instructions provided.' },
  { num: 'Step 04', title: 'Refund / Replace',  desc: 'Once inspected, your refund is processed or replacement dispatched within 5 days.' },
];

export default function ReturnsWarrantyPage() {
  return (
    <div className={styles.page}>
      <Header navOnly />

      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroIconWrap}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>// SERVICES / RETURNS & WARRANTY</p>
            <h1 className={styles.heroTitle}>Returns & Warranty</h1>
            <p className={styles.heroSub}>
              Hassle-free returns within 30 days and a 12-month manufacturing warranty on all products.
              We stand behind everything we sell.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrap}>

        <div className={styles.statStrip}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statStripItem}>
              <p className={styles.statStripValue}>{s.value}</p>
              <p className={styles.statStripLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        <p className={styles.sectionEyebrow}>// POLICY</p>
        <h2 className={styles.sectionHeading}>What's Covered</h2>
        <p className={styles.sectionSub}>
          Our returns and warranty programme is designed to give you complete confidence in every purchase.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureCardIcon}>{f.icon}</div>
              <p className={styles.featureCardTitle}>{f.title}</p>
              <p className={styles.featureCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <p className={styles.sectionEyebrow}>// PROCESS</p>
        <h2 className={styles.sectionHeading}>How to Return an Item</h2>
        <p className={styles.sectionSub}>Follow these four steps to initiate a return or warranty claim.</p>
        <div className={styles.processRow}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.processStep}>
              <p className={styles.processStepNum}>{s.num}</p>
              <p className={styles.processStepTitle}>{s.title}</p>
              <p className={styles.processStepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>

        <p className={styles.sectionEyebrow}>// ELIGIBILITY</p>
        <h2 className={styles.sectionHeading}>Policy by Product Type</h2>
        <p className={styles.sectionSub}>* Custom PCBs are non-returnable unless a manufacturing defect is confirmed.</p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableTh}>Product Type</th>
                <th className={styles.tableTh}>Return Eligible</th>
                <th className={styles.tableTh}>Return Window</th>
                <th className={styles.tableTh}>Warranty Period</th>
                <th className={styles.tableTh}>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {POLICY_TABLE.map((row, i) => (
                <tr key={i} className={styles.tableTr}>
                  <td className={styles.tableTd}><span className={styles.tableAccent}>{row.type}</span></td>
                  <td className={styles.tableTd}>
                    <span className={`${styles.badge} ${
                      row.returnEligible === 'Yes' ? styles.badgeGreen :
                      row.returnEligible === 'No' || row.returnEligible === 'No*' ? styles.badgeRed :
                      styles.badgeYellow
                    }`}>
                      {row.returnEligible}
                    </span>
                  </td>
                  <td className={styles.tableTd}>{row.window}</td>
                  <td className={styles.tableTd}>{row.warrantyPeriod}</td>
                  <td className={styles.tableTd}>{row.coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Valid Return Reasons</p>
            <ul className={styles.checkList}>
              {[
                'Item arrived damaged or broken',
                'Wrong item received',
                'Item does not match product description',
                'Manufacturing defect confirmed by QC',
                'Item dead on arrival (DOA)',
                'Duplicate order placed in error',
                'Changed mind — within 30 days, unused only',
              ].map((item, i) => (
                <li key={i} className={styles.checkItem}>
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Non-Returnable Conditions</p>
            <ul className={styles.checkList}>
              {[
                'Item has been soldered, modified, or used',
                'Original packaging is missing or damaged',
                'Return request raised after 30 days',
                'Custom or bespoke orders (unless defective)',
                'Damage caused by incorrect handling or installation',
                'Items purchased under clearance or final-sale listing',
                'Software licences and digital downloads',
              ].map((item, i) => (
                <li key={i} className={styles.checkItem}>
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.ctaStrip}>
          <div className={styles.ctaText}>
            <p className={styles.ctaTitle}>Need to return an item?</p>
            <p className={styles.ctaSub}>Contact our support team with your order ID to get started — we make it easy.</p>
          </div>
          <Link href="/contact" className={styles.ctaBtn}>
            Start a Return
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}