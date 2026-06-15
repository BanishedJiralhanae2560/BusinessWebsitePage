'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from '@/app/services/ServicePage.module.css';

const STATS = [
  { value: '24/7', label: 'Availability'     },
  { value: '<24h', label: 'Response Time'    },
  { value: '98%',  label: 'Resolution Rate'  },
  { value: '4.9★', label: 'Support Rating'   },
];

const FEATURES = [
  {
    title: 'Technical Assistance',
    desc: 'Expert engineers available to help with component specifications, compatibility, and integration queries.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    title: 'Order Support',
    desc: 'Help with order modifications, status queries, address changes, and cancellations before dispatch.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    title: 'Email Support',
    desc: 'Reach us at any time via email. All tickets are acknowledged within 2 hours during business hours.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    title: 'Account Management',
    desc: 'Assistance with account setup, password resets, billing queries, and profile management.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    title: 'Dedicated Account Rep',
    desc: 'Business and bulk customers are assigned a dedicated account manager for personalised service.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    title: 'Documentation & Guides',
    desc: 'Comprehensive datasheets, integration guides, and how-to articles for all product categories.',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    ),
  },
];

const CHANNELS = [
  { channel: 'Email',            availability: 'Mon–Fri, 9am–6pm', response: '< 2 hours',    badge: 'badgeGreen'  },
  { channel: 'Contact Form',     availability: '24/7 submissions', response: '< 24 hours',   badge: 'badgeGreen'  },
  { channel: 'Account Portal',   availability: '24/7 self-serve',  response: 'Instant',      badge: 'badgeGreen'  },
  { channel: 'Dedicated Rep',    availability: 'Business accounts',response: 'Same day',     badge: 'badgeBlue'   },
];

const STEPS = [
  { num: 'Step 01', title: 'Submit Request',  desc: 'Use the contact form, email, or account portal to raise a support ticket.' },
  { num: 'Step 02', title: 'Acknowledgement', desc: 'You receive a ticket reference and estimated response time immediately.' },
  { num: 'Step 03', title: 'Investigation',   desc: 'Our team reviews your case and gathers any additional information needed.' },
  { num: 'Step 04', title: 'Resolution',      desc: 'A solution is provided and the ticket is closed upon your confirmation.' },
];

export default function CustomerSupportPage() {
  return (
    <div className={styles.page}>
      <Header navOnly />

      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroIconWrap}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>// SERVICES / CUSTOMER SUPPORT</p>
            <h1 className={styles.heroTitle}>Customer Support</h1>
            <p className={styles.heroSub}>
              Technical experts and account specialists ready to help — from pre-sale queries
              to post-delivery assistance, we are here every step of the way.
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
        <h2 className={styles.sectionHeading}>How We Support You</h2>
        <p className={styles.sectionSub}>
          From technical datasheets to order amendments — our team covers every type of query.
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

        <p className={styles.sectionEyebrow}>// CHANNELS</p>
        <h2 className={styles.sectionHeading}>Support Channels</h2>
        <p className={styles.sectionSub}>Choose the channel that works best for your situation.</p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableTh}>Channel</th>
                <th className={styles.tableTh}>Availability</th>
                <th className={styles.tableTh}>Response Time</th>
                <th className={styles.tableTh}>Status</th>
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((c, i) => (
                <tr key={i} className={styles.tableTr}>
                  <td className={styles.tableTd}><span className={styles.tableAccent}>{c.channel}</span></td>
                  <td className={styles.tableTd}>{c.availability}</td>
                  <td className={styles.tableTd}>{c.response}</td>
                  <td className={styles.tableTd}>
                    <span className={`${styles.badge} ${styles[c.badge as keyof typeof styles]}`}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.sectionEyebrow}>// PROCESS</p>
        <h2 className={styles.sectionHeading}>Support Ticket Flow</h2>
        <p className={styles.sectionSub}>Every support request follows a structured process to ensure fast, accurate resolution.</p>
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
            <p className={styles.panelTitle}>What We Can Help With</p>
            <ul className={styles.checkList}>
              {[
                'Component specifications and compatibility questions',
                'Order status, modifications, and cancellations',
                'Shipping and delivery queries',
                'Account setup and billing issues',
                'Technical integration and design-in support',
                'Bulk and custom order enquiries',
                'Returns, replacements, and warranty claims',
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
            <p className={styles.panelTitle}>Before You Contact Us</p>
            <ul className={styles.checkList}>
              {[
                'Check your order confirmation email for tracking details',
                'Review our FAQ section on the Contact page',
                'Have your order ID ready when raising a ticket',
                'For technical queries, include part number and application details',
                'For returns, include photos of the item and packaging',
                'Business customers should quote their account reference',
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
            <p className={styles.ctaTitle}>Need help right now?</p>
            <p className={styles.ctaSub}>Use our contact form and we will get back to you within 24 hours.</p>
          </div>
          <Link href="/contact" className={styles.ctaBtn}>
            Get Support
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}