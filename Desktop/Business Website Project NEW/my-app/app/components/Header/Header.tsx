'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';

/* ============================================================
   Data
   ============================================================ */
const products = [
  { title: 'Circuit Boards',          description: 'Custom PCBs for your projects',       icon: '🔌', href: '#circuit-boards' },
  { title: 'Microchips & Processors', description: 'High-performance computing chips',    icon: '💾', href: '#microchips'     },
  { title: 'Sensors & Components',    description: 'Essential electronic components',     icon: '📡', href: '#sensors'        },
  { title: 'Development Kits',        description: 'Complete starter kits for makers',    icon: '🛠️', href: '#dev-kits'       },
  { title: 'Custom Solutions',        description: 'Tailored hardware for your needs',    icon: '⚡', href: '#custom'         },
  { title: 'Bulk Orders',             description: 'Wholesale pricing available',         icon: '📦', href: '#bulk'           },
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

/* ============================================================
   Sub-components
   ============================================================ */

/** Desktop dropdown grid of items */
function DropdownGrid({ items }: { items: NavItem[] }) {
  return (
    <div className={styles.dropdownGrid}>
      {items.map((item, i) => (
        <a key={i} href={item.href} className={styles.dropdownItem}>
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
        </a>
      ))}
    </div>
  );
}

/** "View All" footer strip */
function DropdownFooter({ label, href }: { label: string; href: string }) {
  return (
    <div className={styles.dropdownFooter}>
      <a href={href} className={styles.dropdownFooterLink}>
        <span>{label}</span>
        <svg className={styles.dropdownFooterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    </div>
  );
}

/** Animated chevron */
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

/** Mobile accordion section for Services / Products */
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

/** Three-line hamburger button */
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

/* ============================================================
   Main Component
   ============================================================ */
const Header = () => {
  const [isServiceOpen,  setIsServiceOpen]  = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileOpen,   setIsMobileOpen]   = useState(false);

  return (
    <header className={styles.header}>

      {/* ── Background image + overlay ── */}
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

      {/* ── Navigation bar ── */}
      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <div className={styles.navInner}>
          <div className={styles.navRow}>

            {/* Logo */}
            <div className={styles.logo} aria-label="Your Logo">Your Logo</div>

            {/* ── Desktop links (hidden on mobile) ── */}
            <div className={styles.navLinks}>
              <a href="#home" className={styles.navLink}>Home</a>

              {/* Service dropdown */}
              <div
                className={styles.dropdownWrapper}
                onMouseEnter={() => setIsServiceOpen(true)}
                onMouseLeave={() => setIsServiceOpen(false)}
              >
                <button
                  className={styles.dropdownTrigger}
                  aria-haspopup="true"
                  aria-expanded={isServiceOpen}
                >
                  <span>Service</span>
                  <Chevron open={isServiceOpen} />
                </button>
                <div
                  className={`${styles.dropdown} ${styles.dropdownService} ${isServiceOpen ? styles.dropdownOpen : ''}`}
                  role="menu"
                >
                  <div className={styles.dropdownArrow} aria-hidden="true" />
                  <DropdownGrid items={services} />
                  <DropdownFooter label="View All Services" href="#all-services" />
                </div>
              </div>

              {/* Products dropdown */}
              <div
                className={styles.dropdownWrapper}
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                <button
                  className={styles.dropdownTrigger}
                  aria-haspopup="true"
                  aria-expanded={isProductsOpen}
                >
                  <span>Products</span>
                  <Chevron open={isProductsOpen} />
                </button>
                <div
                  className={`${styles.dropdown} ${styles.dropdownProducts} ${isProductsOpen ? styles.dropdownOpen : ''}`}
                  role="menu"
                >
                  <div className={styles.dropdownArrow} aria-hidden="true" />
                  <DropdownGrid items={products} />
                  <DropdownFooter label="View All Products" href="#all-products" />
                </div>
              </div>

              <a href="#pricing" className={styles.navLink}>Pricing</a>
              <a href="#blog"    className={styles.navLink}>Blog</a>
              <a href="#about"   className={styles.navLink}>About Us</a>
              <a href="#contact" className={styles.navLink}>Contact Us</a>
            </div>

            {/* ── Right side: lang + auth (desktop) + hamburger (mobile) ── */}
            <div className={styles.navRight}>
              {/* Language + sign-in hidden on mobile (shown in mobile menu instead) */}
              <select className={styles.langSelect} aria-label="Language selector">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
              <Link href="/signup" className={styles.signInLink}>
                Sign In / Register
              </Link>

              {/* Hamburger — visible only on mobile */}
              <HamburgerButton
                open={isMobileOpen}
                onClick={() => setIsMobileOpen(prev => !prev)}
              />
            </div>

          </div>
        </div>
      </nav>

      {/* ── Mobile drawer menu ── */}
      <div
        className={`${styles.mobileMenu} ${isMobileOpen ? styles.mobileMenuVisible : ''}`}
        aria-hidden={!isMobileOpen}
      >
        <a href="#home"    className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>Home</a>
        <MobileAccordion label="Service"  items={services} />
        <MobileAccordion label="Products" items={products} />
        <a href="#pricing" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>Pricing</a>
        <a href="#blog"    className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>Blog</a>
        <a href="#about"   className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>About Us</a>
        <a href="#contact" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>Contact Us</a>

        <div className={styles.mobileActions}>
          <select className={styles.mobileLangSelect} aria-label="Language selector">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
          <Link href="/signup" className={styles.mobileSignIn} onClick={() => setIsMobileOpen(false)}>
            Sign In / Register
          </Link>
        </div>
      </div>

      {/* ── Hero content ── */}
      <div className={styles.heroContent}>
        <h2 className={styles.heroSubtitle}>Your Services</h2>
        <h1 className={styles.heroTitle}>
          'Decode your limits with our carefully crafted products.'
        </h1>
        <p className={styles.heroBody}>
          Whenever you want a part for your work or engineering, we make it happen.
        </p>
        <button className={styles.heroButton} type="button">
          <span>Apply Now</span>
          <svg className={styles.heroButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

    </header>
  );
};

export default Header;