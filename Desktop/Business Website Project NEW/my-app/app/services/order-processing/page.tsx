'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from '@/app/services/ServicePage.module.css';

const STATS = [
  { value: '—',    label: 'Orders Processed' },
  { value: '1–2',  label: 'Business Days' },
  { value: '99%',  label: 'Accuracy Rate' },
  { value: '24/7', label: 'System Uptime' },
];

const FEATURES = [
  {
    title: 'Automated Order Confirmation',
    desc: 'Every order triggers an instant confirmation email with full order details and estimated delivery window.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Real-Time Inventory Sync',
    desc: 'Stock levels update in real time as orders are placed, preventing overselling and backorder issues.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
  },
  {
    title: 'Payment Verification',
    desc: 'All payments are verified before processing begins, ensuring secure and fraud-free transactions.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    title: 'Bulk Order Handling',
    desc: 'Dedicated workflows for large-volume orders with custom pricing, packaging, and priority fulfilment lanes.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
  },
  {
    title: 'Custom Order Notes',
    desc: 'Attach special instructions, configurations, or documentation requirements directly to any order.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
    ),
  },
  {
    title: 'Order Status Tracking',
    desc: 'Customers and admins can track every stage of an order from placement to final delivery in real time.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
];

const STEPS = [
  { num: 'Step 01', title: 'Order Placed',      desc: 'Customer completes checkout and payment is captured securely.' },
  { num: 'Step 02', title: 'Verified',           desc: 'Payment and stock availability are confirmed automatically.' },
  { num: 'Step 03', title: 'Picking & Packing',  desc: 'Items are located, quality-checked, and packaged for dispatch.' },
  { num: 'Step 04', title: 'Dispatched',         desc: 'Order is handed to the courier and tracking details are issued.' },
];

const ORDER_STATUSES = [
  { status: 'Placed',    desc: 'Order received and payment captured',    badge: 'badgeBlue'   },
  { status: 'Verified',  desc: 'Stock confirmed, ready for processing',  badge: 'badgeYellow' },
  { status: 'Packed',    desc: 'Items picked, QC passed, packed',        badge: 'badgeYellow' },
  { status: 'Shipped',   desc: 'With courier, tracking number issued',   badge: 'badgeGreen'  },
  { status: 'Delivered', desc: 'Confirmed delivered to recipient',       badge: 'badgeGreen'  },
  { status: 'Cancelled', desc: 'Order cancelled, refund initiated',      badge: 'badgeRed'    },
];

export default function OrderProcessingPage() {
  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroIconWrap}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>// SERVICES / ORDER PROCESSING</p>
            <h1 className={styles.heroTitle}>Order Processing</h1>
            <p className={styles.heroSub}>
              Fast, accurate, and fully automated order handling — from payment capture to dispatch.
              Every order is tracked, verified, and fulfilled with precision.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrap}>

        {/* Stat strip */}
        <div className={styles.statStrip}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statStripItem}>
              <p className={styles.statStripValue}>{s.value}</p>
              <p className={styles.statStripLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <p className={styles.sectionEyebrow}>// FEATURES</p>
        <h2 className={styles.sectionHeading}>What's Included</h2>
        <p className={styles.sectionSub}>
          Our order processing system handles every stage automatically so you can focus on growing your business.
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

        {/* Process steps */}
        <p className={styles.sectionEyebrow}>// PROCESS</p>
        <h2 className={styles.sectionHeading}>How It Works</h2>
        <p className={styles.sectionSub}>Every order follows a strict 4-stage pipeline to guarantee accuracy and speed.</p>
        <div className={styles.processRow}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.processStep}>
              <p className={styles.processStepNum}>{s.num}</p>
              <p className={styles.processStepTitle}>{s.title}</p>
              <p className={styles.processStepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Order status table + SLA panel */}
        <p className={styles.sectionEyebrow}>// ORDER STATUSES</p>
        <h2 className={styles.sectionHeading}>Status Reference</h2>
        <p className={styles.sectionSub}>Every order moves through these clearly defined states.</p>

        <div className={styles.twoCol}>
          <div className={styles.tableWrap} style={{ marginBottom: 0 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableTh}>Status</th>
                  <th className={styles.tableTh}>Description</th>
                  <th className={styles.tableTh}>State</th>
                </tr>
              </thead>
              <tbody>
                {ORDER_STATUSES.map((o, i) => (
                  <tr key={i} className={styles.tableTr}>
                    <td className={styles.tableTd}><span className={styles.tableAccent}>{o.status}</span></td>
                    <td className={styles.tableTd}>{o.desc}</td>
                    <td className={styles.tableTd}>
                      <span className={`${styles.badge} ${styles[o.badge as keyof typeof styles]}`}>
                        {o.badge === 'badgeGreen' ? 'Complete' : o.badge === 'badgeRed' ? 'Closed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTitle}>Service Level Agreement</p>
            <ul className={styles.checkList}>
              {[
                'Standard orders processed within 1–2 business days',
                'Bulk orders (50+ units) processed within 3–5 business days',
                'Custom orders receive a dedicated processing timeline',
                'Order confirmation sent within 5 minutes of placement',
                'Any processing delays communicated proactively by email',
                'Priority processing available for urgent requirements',
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
        </div>

        {/* CTA */}
        <div className={styles.ctaStrip}>
          <div className={styles.ctaText}>
            <p className={styles.ctaTitle}>Ready to place an order?</p>
            <p className={styles.ctaSub}>Browse our full product catalogue or contact us for bulk and custom orders.</p>
          </div>
          <Link href="/products" className={styles.ctaBtn}>
            Browse Products
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}