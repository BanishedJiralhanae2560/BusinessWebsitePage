'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

/* ============================================================
   Data
   ============================================================ */
const CATEGORIES = [
  {
    name: 'Circuit Boards',
    eyebrow: '// CIRCUIT BOARDS',
    products: [
      { name: 'Circuit Board Alpha',   sku: 'SKU-001', unit: '$—',   moq: '1+',   lead: '1–2 days' },
      { name: 'Power Regulator Board', sku: 'SKU-009', unit: '$—',   moq: '1+',   lead: '1–2 days' },
      { name: 'Custom PCB Module',     sku: 'SKU-006', unit: 'Quote', moq: '10+', lead: '5–10 days' },
    ],
  },
  {
    name: 'Microchips & Processors',
    eyebrow: '// MICROCHIPS & PROCESSORS',
    products: [
      { name: 'Microchip X-Series',  sku: 'SKU-002', unit: '$—', moq: '1+',  lead: '1–2 days' },
      { name: 'GPIO Expander Chip',  sku: 'SKU-007', unit: '$—', moq: '1+',  lead: '1–2 days' },
    ],
  },
  {
    name: 'Sensors & Components',
    eyebrow: '// SENSORS & COMPONENTS',
    products: [
      { name: 'Sensor Array Kit',         sku: 'SKU-003', unit: '$—', moq: '1+', lead: '1–2 days' },
      { name: 'Temperature Sensor TH-1',  sku: 'SKU-008', unit: '$—', moq: '1+', lead: '1–2 days' },
      { name: 'Ultrasonic Sensor Pack',   sku: 'SKU-011', unit: '$—', moq: '1+', lead: '1–2 days' },
    ],
  },
  {
    name: 'Development Kits',
    eyebrow: '// DEVELOPMENT KITS',
    products: [
      { name: 'Dev Kit Pro',    sku: 'SKU-004', unit: '$—', moq: '1+', lead: '1–2 days' },
      { name: 'Nano Dev Board', sku: 'SKU-010', unit: '$—', moq: '1+', lead: '1–2 days' },
    ],
  },
  {
    name: 'Bulk Orders',
    eyebrow: '// BULK ORDERS',
    products: [
      { name: 'Bulk Resistor Pack',  sku: 'SKU-005', unit: '$—', moq: '100+', lead: '3–5 days' },
      { name: 'Bulk Capacitor Set',  sku: 'SKU-012', unit: '$—', moq: '100+', lead: '3–5 days' },
    ],
  },
  {
    name: 'Custom Solutions',
    eyebrow: '// CUSTOM SOLUTIONS',
    products: [
      { name: 'Custom PCB Design',       sku: 'CST-001', unit: 'Quote', moq: '1+',  lead: 'On request' },
      { name: 'Bespoke Component Pack',  sku: 'CST-002', unit: 'Quote', moq: '10+', lead: 'On request' },
    ],
  },
];

const COMPARISON_FEATURES = [
  { feature: 'Unit pricing available',         standard: true,  bulk: true,  enterprise: true  },
  { feature: 'Volume discount',                standard: false, bulk: true,  enterprise: true  },
  { feature: 'Dedicated account manager',      standard: false, bulk: false, enterprise: true  },
  { feature: 'Priority order processing',      standard: false, bulk: true,  enterprise: true  },
  { feature: 'Custom packaging',               standard: false, bulk: false, enterprise: true  },
  { feature: 'Net-30 payment terms',           standard: false, bulk: false, enterprise: true  },
  { feature: 'Free standard shipping',         standard: false, bulk: true,  enterprise: true  },
  { feature: 'Custom component sourcing',      standard: false, bulk: false, enterprise: true  },
  { feature: 'Quarterly pricing review',       standard: false, bulk: false, enterprise: true  },
  { feature: 'SLA guarantee',                  standard: false, bulk: false, enterprise: true  },
];

const BULK_TIERS = [
  { tier: 'Standard',   moq: '1–49 units',    discount: '—',    notes: 'Full unit price, no minimum' },
  { tier: 'Bulk',       moq: '50–249 units',  discount: 'X%',   notes: 'Volume discount applied at checkout' },
  { tier: 'Wholesale',  moq: '250–999 units', discount: 'X%',   notes: 'Contact us for a custom quote' },
  { tier: 'Enterprise', moq: '1,000+ units',  discount: 'X%',   notes: 'Dedicated pricing and SLA' },
];

const FAQS = [
  {
    q: 'Are prices shown inclusive or exclusive of tax?',
    a: 'All listed prices are exclusive of applicable taxes. Tax will be calculated and displayed at checkout based on your delivery location.',
  },
  {
    q: 'How do I get a quote for a custom or bulk order?',
    a: 'Use our Contact page to submit a quote request. Include the product name, SKU, quantity, and any special requirements. We respond within 24 hours.',
  },
  {
    q: 'Do prices change for large volume orders?',
    a: 'Yes — we offer tiered volume pricing starting from 50 units. Contact our sales team or submit a bulk enquiry for a personalised quote.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept major credit and debit cards, bank transfers, and net-30 terms for approved business accounts.',
  },
  {
    q: 'Are custom solution prices fixed or variable?',
    a: 'Custom solution pricing is quoted individually based on design complexity, materials, and quantity. All quotes are valid for 30 days.',
  },
  {
    q: 'Can I lock in a price for a long-term supply agreement?',
    a: 'Yes — enterprise customers can negotiate fixed pricing for 6 or 12-month supply agreements. Contact our sales team to discuss options.',
  },
];

/* ============================================================
   Sub-components
   ============================================================ */
function CheckMark() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"
      style={{ color: 'var(--color-accent, #22c55e)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
    </svg>
  );
}

function CrossMark() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"
      style={{ color: 'var(--color-border, #333)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button className={styles.faqTrigger} onClick={() => setOpen(p => !p)}>
        <span>{q}</span>
        <svg
          className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div className={`${styles.faqBody} ${open ? styles.faqBodyOpen : ''}`}>
        <p className={styles.faqAnswer}>{a}</p>
      </div>
    </div>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const allNames = ['All', ...CATEGORIES.map(c => c.name)];

  const visibleCategories = activeCategory === 'All'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.name === activeCategory);

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroIconWrap}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className={styles.heroEyebrow}>// PRICING</p>
            <h1 className={styles.heroTitle}>Pricing</h1>
            <p className={styles.heroSub}>
              Transparent per-unit pricing across all product categories.
              Volume discounts available — contact us for bulk and custom quotes.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrap}>

        {/* ── Product Pricing Tables ── */}
        <p className={styles.sectionEyebrow}>// PRODUCT PRICING</p>
        <h2 className={styles.sectionHeading}>Pricing by Category</h2>
        <p className={styles.sectionSub}>
          All prices are placeholder values — final pricing will be confirmed before launch.
          Custom and bulk orders are quoted individually.
        </p>

        {/* Category filter tabs */}
        <div className={styles.filterTabs}>
          {allNames.map(name => (
            <button
              key={name}
              className={`${styles.filterTab} ${activeCategory === name ? styles.filterTabActive : ''}`}
              onClick={() => setActiveCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Category tables */}
        <div className={styles.categoryTables}>
          {visibleCategories.map((cat, ci) => (
            <div key={ci} className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <p className={styles.categoryEyebrow}>{cat.eyebrow}</p>
                <h3 className={styles.categoryName}>{cat.name}</h3>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {['Product', 'SKU', 'Unit Price', 'Min. Order Qty', 'Lead Time'].map(h => (
                        <th key={h} className={styles.tableTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cat.products.map((p, pi) => (
                      <tr key={pi} className={styles.tableTr}>
                        <td className={styles.tableTd}>
                          <span className={styles.tableProductName}>{p.name}</span>
                        </td>
                        <td className={styles.tableTd}>
                          <span className={styles.tableSku}>{p.sku}</span>
                        </td>
                        <td className={styles.tableTd}>
                          <span className={p.unit === 'Quote' ? styles.tableQuote : styles.tablePrice}>
                            {p.unit}
                          </span>
                        </td>
                        <td className={styles.tableTd}>{p.moq}</td>
                        <td className={styles.tableTd}>
                          <span className={styles.tableLead}>{p.lead}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bulk / Wholesale Pricing ── */}
        <div className={styles.sectionDivider} />
        <p className={styles.sectionEyebrow}>// BULK & WHOLESALE</p>
        <h2 className={styles.sectionHeading}>Volume Pricing Tiers</h2>
        <p className={styles.sectionSub}>
          The more you order, the more you save. Discounts are applied automatically at checkout
          or via a custom quote for wholesale and enterprise volumes.
        </p>

        <div className={styles.bulkTierGrid}>
          {BULK_TIERS.map((t, i) => (
            <div key={i} className={`${styles.bulkTierCard} ${i === 3 ? styles.bulkTierCardFeatured : ''}`}>
              {i === 3 && <div className={styles.featuredBadge}>Best Value</div>}
              <p className={styles.bulkTierName}>{t.tier}</p>
              <p className={styles.bulkTierMoq}>{t.moq}</p>
              <p className={styles.bulkTierDiscount}>{t.discount} <span>off</span></p>
              <p className={styles.bulkTierNotes}>{t.notes}</p>
            </div>
          ))}
        </div>

        {/* ── Feature Comparison Table ── */}
        <div className={styles.sectionDivider} />
        <p className={styles.sectionEyebrow}>// COMPARISON</p>
        <h2 className={styles.sectionHeading}>What's Included by Tier</h2>
        <p className={styles.sectionSub}>
          See exactly what each purchasing tier includes to find the right fit for your needs.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableTh} style={{ width: '40%' }}>Feature</th>
                <th className={`${styles.tableTh} ${styles.tableThCenter}`}>Standard</th>
                <th className={`${styles.tableTh} ${styles.tableThCenter}`}>Bulk</th>
                <th className={`${styles.tableTh} ${styles.tableThCenter}`}>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((row, i) => (
                <tr key={i} className={styles.tableTr}>
                  <td className={styles.tableTd}>{row.feature}</td>
                  <td className={`${styles.tableTd} ${styles.tableTdCenter}`}>
                    {row.standard ? <CheckMark /> : <CrossMark />}
                  </td>
                  <td className={`${styles.tableTd} ${styles.tableTdCenter}`}>
                    {row.bulk ? <CheckMark /> : <CrossMark />}
                  </td>
                  <td className={`${styles.tableTd} ${styles.tableTdCenter}`}>
                    {row.enterprise ? <CheckMark /> : <CrossMark />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAQ ── */}
        <div className={styles.sectionDivider} />
        <div className={styles.faqSection}>
          <div className={styles.faqHeadingBlock}>
            <p className={styles.faqEyebrow}>// FAQ</p>
            <h2 className={styles.faqHeading}>Pricing FAQs</h2>
            <p className={styles.faqSub}>
              Still have questions?{' '}
              <Link href="/contact" className={styles.faqLink}>Contact our sales team.</Link>
            </p>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>

        {/* ── CTA Strip ── */}
        <div className={styles.ctaStrip}>
          <div>
            <p className={styles.ctaTitle}>Need a custom or bulk quote?</p>
            <p className={styles.ctaSub}>
              Our sales team will prepare a personalised quote within 24 hours.
            </p>
          </div>
          <Link href="/contact" className={styles.ctaBtn}>
            Request a Quote
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}