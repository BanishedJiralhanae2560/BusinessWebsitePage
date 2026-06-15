'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from '@/app/services/ServicePage.module.css';

const STATS = [
  { value: '150+', label: 'Countries Served' },
  { value: '3–5',  label: 'Domestic Days' },
  { value: '7–14', label: 'International Days' },
  { value: '99%',  label: 'On-Time Rate' },
];

const FEATURES = [
  {
    title: 'Worldwide Delivery',
    desc: 'We ship to over 150 countries. International orders are handled with full customs documentation.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Live Order Tracking',
    desc: 'Tracking numbers issued at dispatch. Customers receive live updates at every courier checkpoint.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    title: 'Secure Packaging',
    desc: 'Electronic components are packaged with anti-static materials, foam inserts, and tamper-evident sealing.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
  },
  {
    title: 'Express Shipping',
    desc: 'Priority and overnight options available for urgent orders — select at checkout or contact us directly.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    title: 'Free Shipping Threshold',
    desc: 'Orders over a set value qualify for free standard shipping — automatically applied at checkout.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Bulk Shipment Coordination',
    desc: 'Freight and pallet shipping available for large-volume orders with dedicated logistics coordination.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
    ),
  },
];

const SHIPPING_OPTIONS = [
  { method: 'Standard Domestic',    time: '3–5 business days',   cost: 'From $X.XX',  free: 'Over $XX' },
  { method: 'Express Domestic',     time: '1–2 business days',   cost: 'From $X.XX',  free: '—'        },
  { method: 'Overnight',            time: 'Next business day',   cost: 'From $X.XX',  free: '—'        },
  { method: 'Standard International', time: '7–14 business days', cost: 'From $X.XX', free: 'Over $XX' },
  { method: 'Express International', time: '3–5 business days',  cost: 'From $X.XX',  free: '—'        },
  { method: 'Freight / Pallet',     time: 'Quoted individually', cost: 'On request',  free: '—'        },
];

const STEPS = [
  { num: 'Step 01', title: 'Order Packed',    desc: 'Items QC-checked and packed with appropriate protective materials.' },
  { num: 'Step 02', title: 'Label Printed',   desc: 'Shipping label generated and tracking number assigned.' },
  { num: 'Step 03', title: 'Courier Pickup',  desc: 'Package collected by courier partner and scanned into network.' },
  { num: 'Step 04', title: 'Delivered',       desc: 'Delivery confirmed and customer notified.' },
];

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <Header navOnly />

      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroIconWrap}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>// SERVICES / SHIPPING & DELIVERY</p>
            <h1 className={styles.heroTitle}>Shipping & Delivery</h1>
            <p className={styles.heroSub}>
              Reliable worldwide delivery with live tracking, secure specialist packaging for
              electronic components, and flexible shipping tiers for every need.
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

        <p className={styles.sectionEyebrow}>// FEATURES</p>
        <h2 className={styles.sectionHeading}>Delivery Options & Features</h2>
        <p className={styles.sectionSub}>
          From single components to full pallet shipments — we have a shipping solution for every scale.
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

        <p className={styles.sectionEyebrow}>// RATES</p>
        <h2 className={styles.sectionHeading}>Shipping Options</h2>
        <p className={styles.sectionSub}>All rates are calculated at checkout based on weight, dimensions, and destination.</p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableTh}>Method</th>
                <th className={styles.tableTh}>Estimated Time</th>
                <th className={styles.tableTh}>Starting Cost</th>
                <th className={styles.tableTh}>Free Shipping</th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_OPTIONS.map((o, i) => (
                <tr key={i} className={styles.tableTr}>
                  <td className={styles.tableTd}><span className={styles.tableAccent}>{o.method}</span></td>
                  <td className={styles.tableTd}>{o.time}</td>
                  <td className={styles.tableTd}>{o.cost}</td>
                  <td className={styles.tableTd}>
                    <span className={`${styles.badge} ${o.free !== '—' ? styles.badgeGreen : styles.badgeYellow}`}>
                      {o.free}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.sectionEyebrow}>// PROCESS</p>
        <h2 className={styles.sectionHeading}>From Pack to Door</h2>
        <p className={styles.sectionSub}>Once your order is confirmed, here is how it gets to you.</p>
        <div className={styles.processRow}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.processStep}>
              <p className={styles.processStepNum}>{s.num}</p>
              <p className={styles.processStepTitle}>{s.title}</p>
              <p className={styles.processStepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Packaging Standards</p>
            <ul className={styles.checkList}>
              {[
                'Anti-static bags and foam inserts for all ICs and PCBs',
                'Double-walled cartons for fragile or precision components',
                'Tamper-evident sealing on all outbound packages',
                'Moisture-resistant inner lining for sensitive components',
                'Custom crating available for oversized or fragile items',
                'All packages include a printed packing slip and invoice',
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
            <p className={styles.panelTitle}>Important Notes</p>
            <ul className={styles.checkList}>
              {[
                'Delivery estimates begin from the dispatch date, not order date',
                'International orders may be subject to local customs duties',
                'We are not liable for customs delays outside our control',
                'Signature may be required for high-value shipments',
                'PO Box delivery available for standard shipping only',
                'Contact us before ordering for remote area delivery queries',
              ].map((item, i) => (
                <li key={i} className={styles.checkItem}>
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.ctaStrip}>
          <div className={styles.ctaText}>
            <p className={styles.ctaTitle}>Questions about your shipment?</p>
            <p className={styles.ctaSub}>Our support team can help with tracking, lost parcels, and delivery queries.</p>
          </div>
          <Link href="/contact" className={styles.ctaBtn}>
            Contact Support
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}