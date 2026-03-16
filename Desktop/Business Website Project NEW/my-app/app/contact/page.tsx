'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header/Header';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/* ============================================================
   FAQ Data
   ============================================================ */
const FAQS = [
  {
    question: 'What are your typical lead times for orders?',
    answer: 'Standard orders are processed within 1–2 business days. Custom solutions and bulk orders may require 5–10 business days depending on specifications.',
  },
  {
    question: 'Do you offer bulk pricing discounts?',
    answer: 'Yes — we offer tiered pricing for bulk orders. Contact us with your required quantities and we will prepare a custom quote for you.',
  },
  {
    question: 'Can you produce custom PCB designs?',
    answer: 'Absolutely. Our Custom Solutions team handles bespoke circuit board and component designs. Please provide your specifications in the contact form and we will get back to you within 24 hours.',
  },
  {
    question: 'What countries do you ship to?',
    answer: 'We ship worldwide. Delivery times vary by region — typically 3–5 business days domestically and 7–14 business days internationally.',
  },
  {
    question: 'What is your returns policy?',
    answer: 'We accept returns within 30 days of delivery for unused, undamaged items in original packaging. Custom orders are non-refundable unless there is a manufacturing defect.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order ships, you will receive a confirmation email with a tracking number. You can also view order status from your account dashboard.',
  },
];

const SUBJECTS = [
  'General Inquiry',
  'Order Support',
  'Custom Solutions',
  'Bulk / Wholesale',
  'Technical Support',
  'Returns & Warranty',
  'Partnership',
  'Other',
];

/* ============================================================
   FAQ Item
   ============================================================ */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button className={styles.faqTrigger} onClick={() => setOpen(p => !p)}>
        <span>{question}</span>
        <svg
          className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`${styles.faqBody} ${open ? styles.faqBodyOpen : ''}`}>
        <p className={styles.faqAnswer}>{answer}</p>
      </div>
    </div>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
const ContactPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim())    { setError('Please enter your name.');    return; }
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Please provide at least an email or phone number.');
      return;
    }
    if (!form.subject)        { setError('Please select a subject.');   return; }
    if (!form.message.trim()) { setError('Please enter your message.'); return; }

    setLoading(true);
    const supabase = createClient();

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{
        name:    form.name.trim(),
        email:   form.email.trim() || null,
        phone:   form.phone.trim() || null,
        subject: form.subject,
        message: form.message.trim(),
      }]);

    setLoading(false);

    if (dbError) {
      setError('Something went wrong. Please try again.');
      console.error(dbError);
    } else {
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* ── Hero banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>// CONTACT</p>
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p className={styles.heroSub}>
            Have a question, a custom request, or need technical support?<br />
            We respond within 24 hours on business days.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={styles.contentWrap}>

        {/* ── Top row: info cards + form ── */}
        <div className={styles.topRow}>

          {/* Left: contact info */}
          <div className={styles.infoCol}>
            <h2 className={styles.infoHeading}>Contact Information</h2>
            <p className={styles.infoSub}>Reach us through any of the channels below.</p>

            <div className={styles.infoCards}>
              {/* Email */}
              <div className={styles.infoCard}>
                <div className={styles.infoIconWrap}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.infoCardLabel}>Email</p>
                  <a href="mailto:support@yourstore.com" className={styles.infoCardValue}>
                    support@yourstore.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className={styles.infoCard}>
                <div className={styles.infoIconWrap}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.infoCardLabel}>Phone</p>
                  <a href="tel:+10000000000" className={styles.infoCardValue}>
                    +1 (000) 000-0000
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className={styles.infoCard}>
                <div className={styles.infoIconWrap}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.infoCardLabel}>Address</p>
                  <p className={styles.infoCardValue}>123 Street, City, Country</p>
                </div>
              </div>

              {/* Hours */}
              <div className={styles.infoCard}>
                <div className={styles.infoIconWrap}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.infoCardLabel}>Business Hours</p>
                  <p className={styles.infoCardValue}>Mon – Fri, 9am – 6pm</p>
                </div>
              </div>
            </div>

            {/* Response time badge */}
            <div className={styles.responseBadge}>
              <span className={styles.responseDot} />
              Average response time: <strong>&lt; 24 hours</strong>
            </div>
          </div>

          {/* Right: form */}
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <h2 className={styles.formHeading}>Send a Message</h2>
              <p className={styles.formSub}>Fill in the form and we will get back to you shortly.</p>

              {success ? (
                <div className={styles.successBox}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p className={styles.successTitle}>Message sent!</p>
                    <p className={styles.successSub}>Thank you — we'll be in touch within 24 hours.</p>
                  </div>
                  <button className={styles.successReset} onClick={() => setSuccess(false)}>
                    Send another
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                    <input
                      name="name" type="text" placeholder="John Doe"
                      value={form.name} onChange={handleChange}
                      className={styles.input}
                    />
                  </div>

                  {/* Email + Phone row */}
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Email Address</label>
                      <input
                        name="email" type="email" placeholder="you@example.com"
                        value={form.email} onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Phone Number</label>
                      <input
                        name="phone" type="tel" placeholder="+1 (000) 000-0000"
                        value={form.phone} onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <p className={styles.fieldHint}>* At least one of email or phone is required.</p>

                  {/* Subject */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Subject <span className={styles.required}>*</span></label>
                    <select
                      name="subject" value={form.subject} onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select a subject…</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Message <span className={styles.required}>*</span></label>
                    <textarea
                      name="message" placeholder="Tell us how we can help…"
                      value={form.message} onChange={handleChange}
                      className={styles.textarea} rows={5}
                    />
                  </div>

                  {error && <p className={styles.errorMsg}>{error}</p>}

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Sending…' : (
                      <>
                        Send Message
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className={styles.faqSection}>
          <div className={styles.faqHeadingBlock}>
            <p className={styles.faqEyebrow}>// FAQ</p>
            <h2 className={styles.faqHeading}>Frequently Asked Questions</h2>
            <p className={styles.faqSub}>
              Can't find what you're looking for?{' '}
              <a href="mailto:support@yourstore.com" className={styles.faqLink}>Email us directly.</a>
            </p>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((f, i) => <FaqItem key={i} question={f.question} answer={f.answer} />)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;