'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

/* ============================================================
   Feature data for branding panel
   ============================================================ */
const features = [
  {
    title: 'Quality Guaranteed',
    desc:  'All components tested and certified',
  },
  {
    title: 'Fast Shipping',
    desc:  'Worldwide delivery in 3–5 business days',
  },
  {
    title: '24/7 Support',
    desc:  'Expert technical assistance always available',
  },
];

const stats = [
  { number: '10K+', label: 'Active Users'  },
  { number: '50K+', label: 'Components'    },
  { number: '99%',  label: 'Satisfaction'  },
];

/* ============================================================
   Reusable checkmark SVG
   ============================================================ */
function CheckIcon() {
  return (
    <svg className={styles.featureCheckIcon} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
const SignUpPage = () => {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className={styles.page}>

      {/* ── Left Panel: Form ── */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>

          {/* Logo */}
          <Link href="/" className={styles.logo}>Your Logo</Link>

          {/* Heading */}
          <div className={styles.headingBlock}>
            <h1 className={styles.heading}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className={styles.subheading}>
              {isLogin
                ? 'Sign in to access your account'
                : 'Join us to explore premium electronic components'}
            </p>
          </div>

          {/* Social buttons */}
          <div className={styles.socialGroup}>
            <button className={styles.socialBtn} type="button">
              {/* Google */}
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button className={styles.socialBtn} type="button">
              {/* Facebook */}
              <svg className={styles.socialIcon} fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Form */}
          <form className={styles.form}>
            {!isLogin && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={styles.input}
                  autoComplete="name"
                />
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={styles.input}
                autoComplete="email"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={styles.input}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLogin && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
            )}

            {isLogin && (
              <div className={styles.rememberRow}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  Remember me
                </label>
                <a href="#" className={styles.forgotLink}>Forgot password?</a>
              </div>
            )}

            {!isLogin && (
              <div className={styles.termsRow}>
                <input type="checkbox" className={styles.checkbox} style={{ marginTop: '2px' }} />
                <span className={styles.termsText}>
                  I agree to the{' '}
                  <a href="#" className={styles.termsLink}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className={styles.termsLink}>Privacy Policy</a>
                </span>
              </div>
            )}

            <Link href="/">
              <button type="button" className={styles.submitBtn}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </Link>
          </form>

          {/* Toggle */}
          <div className={styles.toggleRow}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button className={styles.toggleBtn} onClick={() => setIsLogin(prev => !prev)}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Back to home */}
          <Link href="/" className={styles.backLink}>
            <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>

        </div>
      </div>

      {/* ── Right Panel: Branding ── */}
      <div className={styles.brandPanel}>
        {/* Faint circuit background */}
        <div className={styles.brandBg}>
          <Image
            src="/pexels-pixabay-159220.jpg"
            alt="Circuit board pattern"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div className={styles.brandBgOverlay} />
        </div>

        {/* Brand content */}
        <div className={styles.brandContent}>
          {/* Icon badge */}
          <div className={styles.brandIconBadge}>
            <svg className={styles.brandIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className={styles.brandHeading}>
            Premium Electronic Components
          </h2>
          <p className={styles.brandSubheading}>
            Join thousands of engineers and makers who trust us for their circuit board and component needs.
          </p>

          {/* Feature list */}
          <div className={styles.featureList}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <div className={styles.featureCheckBadge}>
                  <CheckIcon />
                </div>
                <div>
                  <p className={styles.featureTitle}>{f.title}</p>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {stats.map((s, i) => (
              <div key={i}>
                <p className={styles.statNumber}>{s.number}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SignUpPage;