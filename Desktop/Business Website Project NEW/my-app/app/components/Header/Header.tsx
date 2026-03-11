'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/components/Header/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';

/* ============================================================
   Data
   ============================================================ */
const products = [
  { title: 'Circuit Boards',          description: 'Custom PCBs for your projects',    icon: '🔌', href: '/products/Circuitboards' },
  { title: 'Microchips & Processors', description: 'High-performance computing chips', icon: '💾', href: '/products/Microchips' },
  { title: 'Sensors & Components',    description: 'Essential electronic components',  icon: '📡', href: '/products/Sensors' },
  { title: 'Development Kits',        description: 'Complete starter kits for makers', icon: '🛠️', href: '/products/Devkits' },
  { title: 'Custom Solutions',        description: 'Tailored hardware for your needs', icon: '⚡', href: '/products/Custom' },
  { title: 'Bulk Orders',             description: 'Wholesale pricing available',      icon: '📦', href: '/products/Bulkorders' },
];

const services = [
  { title: 'Order Processing',    description: 'Fast and reliable order handling', icon: '📋', href: '#order-processing' },
  { title: 'Shipping & Delivery', description: 'Worldwide shipping options',       icon: '🚚', href: '#shipping'         },
  { title: 'Customer Support',    description: '24/7 technical assistance',        icon: '💬', href: '#support'          },
  { title: 'Returns & Warranty',  description: 'Hassle-free return policy',        icon: '🔄', href: '#returns'          },
];

/* ============================================================
   Shared Types
   ============================================================ */
type NavItem = { title: string; description: string; icon: string; href: string };

interface HeaderProps {
  /** Pass true on inner pages (e.g. ProductCatalog) to render
   *  only the nav bar — no background image or hero content. */
  navOnly?: boolean;
}

/* ============================================================
   Sub-components
   ============================================================ */

function DropdownGrid({ items }: { items: NavItem[] }) {
  return (
    <div className={styles.dropdownGrid}>
      {items.map((item, i) => (
        <Link key={i} href={item.href} className={styles.dropdownItem}>
          <div className={styles.dropdownItemInner}>
            <span className={styles.dropdownIcon}>{item.icon}</span>
            <div className={styles.dropdownTextGroup}>
              <p className={styles.dropdownItemTitle}>{item.title}</p>
              <p className={styles.dropdownItemDesc}>{item.description}</p>
            </div>
            <svg className={styles.dropdownChevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}

function DropdownFooter({ label, href }: { label: string; href: string }) {
  return (
    <div className={styles.dropdownFooter}>
      <Link href={href} className={styles.dropdownFooterLink}>
        <span>{label}</span>
        <svg className={styles.dropdownFooterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MobileAccordion({ label, items }: { label: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.mobileAccordion}>
      <button
        className={styles.mobileAccordionTrigger}
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span>{label}</span>
        <Chevron open={open} />
      </button>
      <div className={`${styles.mobileAccordionBody} ${open ? styles.mobileAccordionBodyOpen : ''}`}>
        {items.map((item, i) => (
          <a key={i} href={item.href} className={styles.mobileAccordionItem}>
            <span className={styles.mobileAccordionItemIcon}>{item.icon}</span>
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
    >
      <span className={styles.hamburgerLine} />
      <span className={styles.hamburgerLine} />
      <span className={styles.hamburgerLine} />
    </button>
  );
}

/** Shared language <select> used in both desktop nav and mobile drawer */
function LangSelect({
  className,
  lang,
  onChange,
}: {
  className: string;
  lang: string;
  onChange: (code: string) => void;
}) {
  return (
    <select
      className={className}
      aria-label="Language selector"
      value={lang}
      onChange={e => onChange(e.target.value)}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="zh">中文</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
    </select>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
const Header = ({ navOnly = false }: HeaderProps) => {

  // ── UI state ──────────────────────────────────────────────
  const [isServiceOpen,  setIsServiceOpen]  = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileOpen,   setIsMobileOpen]   = useState(false);

  // ── i18n — read from shared LanguageContext ─────────────────
  const { lang, setLang, t } = useLanguage();

  // ── Auth state ────────────────────────────────────────────
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  // ── Shared JSX blocks (used by both navOnly and full-header) ──

  const desktopNav = (
    <div className={styles.navLinks}>
      <a href="/" className={styles.navLink}>
        {t['nav.home'] || 'Home'}
      </a>

      {/* Service dropdown */}
      <div
        className={styles.dropdownWrapper}
        onMouseEnter={() => setIsServiceOpen(true)}
        onMouseLeave={() => setIsServiceOpen(false)}
      >
        <button className={styles.dropdownTrigger} aria-haspopup="true" aria-expanded={isServiceOpen}>
          <span>{t['nav.service'] || 'Service'}</span>
          <Chevron open={isServiceOpen} />
        </button>
        <div
          className={`${styles.dropdown} ${styles.dropdownService} ${isServiceOpen ? styles.dropdownOpen : ''}`}
          role="menu"
        >
          <div className={styles.dropdownArrow} aria-hidden="true" />
          <DropdownGrid items={services} />
          <DropdownFooter
            label={t['nav.view_all_services'] || 'View All Services'}
            href="#all-services"
          />
        </div>
      </div>

      {/* Products dropdown */}
      <div
        className={styles.dropdownWrapper}
        onMouseEnter={() => setIsProductsOpen(true)}
        onMouseLeave={() => setIsProductsOpen(false)}
      >
        <button className={styles.dropdownTrigger} aria-haspopup="true" aria-expanded={isProductsOpen}>
          <span>{t['nav.products'] || 'Products'}</span>
          <Chevron open={isProductsOpen} />
        </button>
        <div
          className={`${styles.dropdown} ${styles.dropdownProducts} ${isProductsOpen ? styles.dropdownOpen : ''}`}
          role="menu"
        >
          <div className={styles.dropdownArrow} aria-hidden="true" />
          <DropdownGrid items={products} />
          <DropdownFooter
            label={t['nav.view_all_products'] || 'View All Products'}
            href="/products"
          />
        </div>
      </div>

      <a href="#pricing" className={styles.navLink}>{t['nav.pricing'] || 'Pricing'}</a>
      <a href="#blog"    className={styles.navLink}>{t['nav.blog']    || 'Blog'}</a>
      <a href="#about"   className={styles.navLink}>{t['nav.about']   || 'About Us'}</a>
      <a href="#contact" className={styles.navLink}>{t['nav.contact'] || 'Contact Us'}</a>
      <Link href="/admin" className={styles.navLink} style={{ color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.06em' }}>
        {t['nav.admin'] || 'Admin'}
      </Link>
    </div>
  );

  // FIX 2: navRight is now a proper const with user-aware sign in/out button
  const navRight = (
    <div className={styles.navRight}>
      <LangSelect className={styles.langSelect} lang={lang} onChange={setLang} />
      {user ? (
        <button onClick={handleSignOut} className={styles.signInLink}>
          {t['nav.sign_out'] || 'Sign Out'}
        </button>
      ) : (
        <Link href="/signup" className={styles.signInLink}>
          {t['nav.sign_in'] || 'Sign In / Register'}
        </Link>
      )}
      <HamburgerButton open={isMobileOpen} onClick={() => setIsMobileOpen(prev => !prev)} />
    </div>
  );

  // FIX 3: Mobile drawer sign-in link is now user-aware
  const mobileDrawer = (
    <div
      className={`${styles.mobileMenu} ${isMobileOpen ? styles.mobileMenuVisible : ''}`}
      aria-hidden={!isMobileOpen}
    >
      <a href="/" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.home'] || 'Home'}
      </a>
      <MobileAccordion label={t['nav.service']  || 'Service'}  items={services} />
      <MobileAccordion label={t['nav.products'] || 'Products'} items={products} />
      <a href="#pricing" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.pricing'] || 'Pricing'}
      </a>
      <a href="#blog" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.blog'] || 'Blog'}
      </a>
      <a href="#about" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.about'] || 'About Us'}
      </a>
      <a href="#contact" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.contact'] || 'Contact Us'}
      </a>
      <Link href="/admin" className={styles.mobileNavLink} style={{ color: 'var(--color-accent)', fontWeight: 600 }} onClick={() => setIsMobileOpen(false)}>
        {t['nav.admin'] || 'Admin'}
      </Link>
      <div className={styles.mobileActions}>
        <LangSelect className={styles.mobileLangSelect} lang={lang} onChange={setLang} />
        {user ? (
          <button onClick={handleSignOut} className={styles.mobileSignIn}>
            {t['nav.sign_out'] || 'Sign Out'}
          </button>
        ) : (
          <Link href="/signup" className={styles.mobileSignIn} onClick={() => setIsMobileOpen(false)}>
            {t['nav.sign_in'] || 'Sign In / Register'}
          </Link>
        )}
      </div>
    </div>
  );

  /* ── navOnly: just the sticky nav bar, no hero ── */
  if (navOnly) {
    return (
      <>
        <nav className={styles.nav} role="navigation" aria-label="Main navigation">
          <div className={styles.navInner}>
            <div className={styles.navRow}>
              <div className={styles.logo} aria-label="Your Logo">Your Logo</div>
              {desktopNav}
              {navRight}
            </div>
          </div>
        </nav>
        {mobileDrawer}
      </>
    );
  }

  /* ── Default: full header with background image + hero ── */
  return (
    <header className={styles.header}>

      {/* Background image + overlay */}
      <div className={styles.backgroundWrapper}>
        <Image
          src="/pexels-pixabay-159220.jpg"
          alt="Circuit board background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className={styles.backgroundOverlay} />
      </div>

      {/* Navigation bar */}
      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <div className={styles.navInner}>
          <div className={styles.navRow}>
            <div className={styles.logo} aria-label="Your Logo">Your Logo</div>
            {desktopNav}
            {navRight}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileDrawer}

      {/* Hero content */}
      <div className={styles.heroContent}>
        <h2 className={styles.heroSubtitle}>
          {t['hero.eyebrow'] || 'Your Services'}
        </h2>
        <h1 className={styles.heroTitle}>
          {t['hero.title'] || "Decode your limits with our carefully crafted products."}
        </h1>
        <p className={styles.heroBody}>
          {t['hero.body'] || 'Whenever you want a part for your work or engineering, we make it happen.'}
        </p>
        <button className={styles.heroButton} type="button">
          <span>{t['hero.cta'] || 'Apply Now'}</span>
          <svg className={styles.heroButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

    </header>
  );
};

export default Header;