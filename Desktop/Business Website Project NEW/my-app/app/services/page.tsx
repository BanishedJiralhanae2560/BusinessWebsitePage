'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from '@/app/services/ServicePage.module.css';
import mainStyles from '@/app/services/ServicesMain.module.css';

const STATS = [
  { value: '4',    label: 'Core Services'     },
  { value: '24/7', label: 'System Uptime'     },
  { value: '99%',  label: 'Satisfaction Rate' },
  { value: '150+', label: 'Countries Served'  },
];

const SERVICES = [
  {
    href: '/services/order-processing',
    eyebrow: 'ORDER PROCESSING',
    title: 'Order Processing',
    desc: 'Fast, accurate, and fully automated order handling — from payment capture to dispatch. Every order is tracked, verified, and fulfilled with precision.',
    stats: [
      { value: '1–2', label: 'Business Days' },
      { value: '99%', label: 'Accuracy Rate' },
    ],
    features: [
      'Automated order confirmation',
      'Real-time inventory sync',
      'Payment verification',
      'Bulk order handling',
    ],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
  {
    href: '/services/support',
    eyebrow: 'CUSTOMER SUPPORT',
    title: 'Customer Support',
    desc: 'Technical experts and account specialists ready to help — from pre-sale queries to post-delivery assistance, every step of the way.',
    stats: [
      { value: '<24h', label: 'Response Time'   },
      { value: '98%',  label: 'Resolution Rate' },
    ],
    features: [
      'Technical assistance',
      'Order support & modifications',
      'Dedicated account rep',
      'Documentation & guides',
    ],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
  },
  {
    href: '/services/shipping',
    eyebrow: 'SHIPPING & DELIVERY',
    title: 'Shipping & Delivery',
    desc: 'Reliable worldwide delivery with live tracking, secure specialist packaging for electronic components, and flexible shipping tiers for every need.',
    stats: [
      { value: '150+', label: 'Countries'    },
      { value: '99%',  label: 'On-Time Rate' },
    ],
    features: [
      'Worldwide delivery',
      'Live order tracking',
      'Secure specialist packaging',
      'Express & freight options',
    ],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
    ),
  },
  {
    href: '/services/returns',
    eyebrow: 'RETURNS & WARRANTY',
    title: 'Returns & Warranty',
    desc: 'Hassle-free returns within 30 days and a 12-month manufacturing warranty on all products. We stand behind everything we sell.',
    stats: [
      { value: '30d',  label: 'Return Window'   },
      { value: '100%', label: 'Defect Coverage' },
    ],
    features: [
      '30-day return window',
      '1-year manufacturing warranty',
      'Free return shipping on defects',
      'Fast refund processing',
    ],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
  },
];

const PROCESS = [
  { num: 'Step 01', title: 'Browse Services',  desc: 'Explore our four core service areas and find what you need.' },
  { num: 'Step 02', title: 'Place Your Order', desc: 'Add products to cart — our order processing kicks in immediately.' },
  { num: 'Step 03', title: 'We Fulfil & Ship', desc: 'Your order is packed, verified, and dispatched with live tracking.' },
  { num: 'Step 04', title: 'We Support You',   desc: 'Our team is available for any query from purchase to delivery and beyond.' },
];

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroIconWrap}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>// SERVICES</p>
            <h1 className={styles.heroTitle}>All Services</h1>
            <p className={styles.heroSub}>
              Everything from order fulfilment to worldwide delivery — our four core services
              are built to support your business at every stage.
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

        {/* Service cards */}
        <p className={styles.sectionEyebrow}>// OUR SERVICES</p>
        <h2 className={styles.sectionHeading}>What We Offer</h2>
        <p className={styles.sectionSub}>
          Select a service to learn more — each one is built to integrate seamlessly with the others.
        </p>

        <div className={mainStyles.serviceGrid}>
          {SERVICES.map((svc) => (
            <Link key={svc.href} href={svc.href} className={mainStyles.serviceCard}>

              <div className={mainStyles.cardHeader}>
                <div className={mainStyles.cardIconWrap}>{svc.icon}</div>
                <p className={mainStyles.cardEyebrow}>{svc.eyebrow}</p>
              </div>

              <h3 className={mainStyles.cardTitle}>{svc.title}</h3>
              <p className={mainStyles.cardDesc}>{svc.desc}</p>

              <div className={mainStyles.cardStats}>
                {svc.stats.map((stat, i) => (
                  <div key={i} className={mainStyles.cardStat}>
                    <span className={mainStyles.cardStatValue}>{stat.value}</span>
                    <span className={mainStyles.cardStatLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>

              <ul className={mainStyles.cardFeatures}>
                {svc.features.map((f, i) => (
                  <li key={i} className={mainStyles.cardFeatureItem}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      width="12" height="12" className={mainStyles.cardFeatureIcon}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className={mainStyles.cardCta}>
                <span className={mainStyles.cardCtaText}>View service</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>

            </Link>
          ))}
        </div>

        {/* Process */}
        <p className={styles.sectionEyebrow}>// HOW IT WORKS</p>
        <h2 className={styles.sectionHeading}>The Full Journey</h2>
        <p className={styles.sectionSub}>
          From the moment you browse to long after delivery — here is how our services work together.
        </p>
        <div className={styles.processRow}>
          {PROCESS.map((s, i) => (
            <div key={i} className={styles.processStep}>
              <p className={styles.processStepNum}>{s.num}</p>
              <p className={styles.processStepTitle}>{s.title}</p>
              <p className={styles.processStepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Panels */}
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Included With Every Order</p>
            <ul className={styles.checkList}>
              {[
                'Automated order confirmation within minutes',
                'Real-time inventory verification',
                'Secure, specialist packaging for all components',
                'Live tracking number issued at dispatch',
                'Dedicated support for any post-sale query',
                '30-day return window on all standard products',
                '12-month manufacturing warranty as standard',
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
            <p className={styles.panelTitle}>Quick Links</p>
            <ul className={styles.checkList}>
              {SERVICES.map((svc) => (
                <li key={svc.href} className={styles.checkItem}>
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  <Link href={svc.href} className={mainStyles.quickLink}>
                    {svc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaStrip}>
          <div className={styles.ctaText}>
            <p className={styles.ctaTitle}>Ready to get started?</p>
            <p className={styles.ctaSub}>Browse our full product catalogue or contact us for bulk and custom enquiries.</p>
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