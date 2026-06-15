'use client';

import { createClient } from '@/lib/supabase/client';
// Avoid importing next/navigation to prevent type-resolution issues in some setups
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/app/components/Header/LanguageContext';
// Use standard img and anchor elements to avoid Next.js types in this environment
// @ts-ignore: CSS module types may be missing in this TS config
import styles from './Header.module.css';

/* ============================================================
   API Base URL
   ============================================================ */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

/* ============================================================
   Types
   ============================================================ */
type NavItem = { title: string; description: string; icon: string; href: string };

interface HeaderProps {
  navOnly?: boolean;
}

/* ============================================================
   Fallback data (used while API loads or if it fails)
   ============================================================ */
const FALLBACK_PRODUCTS: NavItem[] = [
  { title: 'Circuit Boards',          href: '/products?category=Circuitboards', description: 'Custom circuit board designs',    icon: '🔌' },
  { title: 'Microchips & Processors', href: '/products?category=Microchips',    description: 'Advanced microchip solutions',    icon: '💻' },
  { title: 'Sensors & Components',    href: '/products?category=Sensors',       description: 'High-precision sensors',          icon: '📡' },
  { title: 'Development Kits',        href: '/products?category=Devkits',       description: 'Complete development tools',      icon: '🛠️' },
  { title: 'Custom Solutions',        href: '/products?category=Custom',        description: 'Tailored electronic solutions',   icon: '⚙️' },
  { title: 'Bulk Orders',             href: '/products?category=Bulkorders',    description: 'Large quantity orders',           icon: '📦' },
];

const FALLBACK_SERVICES: NavItem[] = [
  { title: 'Order Processing',    description: 'Fast and reliable order handling', icon: '📋', href: '/services/order-processing' },
  { title: 'Shipping & Delivery', description: 'Worldwide shipping options',       icon: '🚚', href: '/services/shipping'         },
  { title: 'Customer Support',    description: '24/7 technical assistance',        icon: '💬', href: '/services/support'          },
  { title: 'Returns & Warranty',  description: 'Hassle-free return policy',        icon: '🔄', href: '/services/returns'          },
];

/* ============================================================
   Custom hook — fetch nav data from FastAPI
   ============================================================ */
function useNavData() {
  const [products, setProducts] = useState<NavItem[]>(FALLBACK_PRODUCTS);
  const [services, setServices] = useState<NavItem[]>(FALLBACK_SERVICES);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [prodRes, svcRes] = await Promise.all([
          fetch(`${API_BASE}/navigation/products`, { cache: 'no-store' }),
          fetch(`${API_BASE}/navigation/services`, { cache: 'no-store' }),
        ]);

        if (!cancelled) {
          if (prodRes.ok) {
            const data = await prodRes.json();
            setProducts(data);
          }
          if (svcRes.ok) {
            const data = await svcRes.json();
            setServices(data);
          }
        }
      } catch {
        // API unreachable — fallback data stays in place, no crash
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { products, services, ready };
}

/* ============================================================
   Sub-components
   ============================================================ */
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
   Profile Drawer
   ============================================================ */
function ProfileDrawer({
  open,
  onClose,
  user,
  onSignOut,
  t,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  onSignOut: () => void;
  t: Record<string, string>;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'JD';

  const menuItems = [
    {
      label: t['profile.account'] || 'My Account',
      href: '/profile/account',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
    {
      label: t['profile.orders'] || 'My Orders',
      href: '/profile/orders',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
    },
    {
      label: t['profile.cart'] || 'My Cart',
      href: '/profile/cart',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        className={`${styles.profileOverlay} ${open ? styles.profileOverlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className={`${styles.profileDrawer} ${open ? styles.profileDrawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="User profile menu"
      >
        <div className={styles.profileDrawerHeader}>
          <div className={styles.profileDrawerAvatar}>{initials}</div>
          <div className={styles.profileDrawerUserInfo}>
            <span className={styles.profileDrawerName}>
              {user?.user_metadata?.full_name || user?.email || 'Guest'}
            </span>
            <span className={styles.profileDrawerEmail}>{user?.email || ''}</span>
          </div>
          <button className={styles.profileDrawerClose} onClick={onClose} aria-label="Close profile menu">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={styles.profileDrawerNav} aria-label="Profile navigation">
          <p className={styles.profileDrawerSectionLabel}>
            {t['profile.section'] || 'My Profile'}
          </p>
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={styles.profileDrawerItem}
              onClick={onClose}
            >
              <span className={styles.profileDrawerItemIcon}>{item.icon}</span>
              <span className={styles.profileDrawerItemLabel}>{item.label}</span>
              <svg
                className={styles.profileDrawerItemChevron}
                width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </nav>

        <div className={styles.profileDrawerFooter}>
          {user ? (
            <button className={styles.profileDrawerSignOut} onClick={() => { onSignOut(); onClose(); }}>
              {t['nav.sign_out'] || 'Sign Out'}
            </button>
          ) : (
            <a href="/signup" className={styles.profileDrawerSignIn} onClick={onClose}>
              {t['nav.sign_in'] || 'Sign In / Register'}
            </a>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
const Header = ({ navOnly = false }: HeaderProps) => {

  const [isServiceOpen,  setIsServiceOpen]  = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileOpen,   setIsMobileOpen]   = useState(false);
  const [isProfileOpen,  setIsProfileOpen]  = useState(false);

  const { lang, setLang, t } = useLanguage();

  // avoid useRouter to prevent type issues; use window.location where needed
  const [user, setUser] = useState<any>(null);

  // ── Fetch nav items from FastAPI ──────────────────────────
  const { products, services } = useNavData();

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
    window.location.href = '/signup';
  };

  const profileHamburger = (
    <button
      className={`${styles.profileHamburger} ${isProfileOpen ? styles.profileHamburgerOpen : ''}`}
      onClick={() => setIsProfileOpen(prev => !prev)}
      aria-label={isProfileOpen ? 'Close profile menu' : 'Open profile menu'}
      aria-expanded={isProfileOpen}
      aria-haspopup="dialog"
    >
      <span className={styles.profileHamburgerLine} />
      <span className={styles.profileHamburgerLine} />
      <span className={styles.profileHamburgerLine} />
    </button>
  );

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
          <DropdownFooter label={t['nav.view_all_services'] || 'View All Services'} href="/services" />
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
          <DropdownFooter label={t['nav.view_all_products'] || 'View All Products'} href="/products" />
        </div>
      </div>

      <a href="/pricing" className={styles.navLink}>{t['nav.pricing'] || 'Pricing'}</a>
      <a href="/blog" className={styles.navLink}>{t['nav.blog'] || 'Blog'}</a>
      <a href="/about" className={styles.navLink}>{t['nav.about'] || 'About Us'}</a>
      <a href="/contact" className={styles.navLink}>{t['nav.contact'] || 'Contact Us'}</a>
      <a
        href="/admin"
        className={styles.navLink}
        style={{ color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.06em' }}
      >
        {t['nav.admin'] || 'Admin'}
      </a>
    </div>
  );

  const navRight = (
    <div className={styles.navRight}>
      <LangSelect className={styles.langSelect} lang={lang} onChange={setLang} />
      {user ? (
        <button onClick={handleSignOut} className={styles.signInLink}>
          {t['nav.sign_out'] || 'Sign Out'}
        </button>
      ) : (
        <a href="/signup" className={styles.signInLink}>
          {t['nav.sign_in'] || 'Sign In / Register'}
        </a>
      )}
      <HamburgerButton open={isMobileOpen} onClick={() => setIsMobileOpen(prev => !prev)} />
    </div>
  );

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
      <a href="/pricing" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.pricing'] || 'Pricing'}
      </a>
      <a href="/blog" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.blog'] || 'Blog'}
      </a>
      <a href="/about" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.about'] || 'About Us'}
      </a>
      <a href="/contact" className={styles.mobileNavLink} onClick={() => setIsMobileOpen(false)}>
        {t['nav.contact'] || 'Contact Us'}
      </a>
      <a
        href="/admin"
        className={styles.mobileNavLink}
        style={{ color: 'var(--color-accent)', fontWeight: 600 }}
        onClick={() => setIsMobileOpen(false)}
      >
        {t['nav.admin'] || 'Admin'}
      </a>
      <div className={styles.mobileActions}>
        <LangSelect className={styles.mobileLangSelect} lang={lang} onChange={setLang} />
        {user ? (
          <button onClick={handleSignOut} className={styles.mobileSignIn}>
            {t['nav.sign_out'] || 'Sign Out'}
          </button>
        ) : (
          <a href="/signup" className={styles.mobileSignIn} onClick={() => setIsMobileOpen(false)}>
            {t['nav.sign_in'] || 'Sign In / Register'}
          </a>
        )}
      </div>
    </div>
  );

  const profileDrawer = (
    <ProfileDrawer
      open={isProfileOpen}
      onClose={() => setIsProfileOpen(false)}
      user={user}
      onSignOut={handleSignOut}
      t={t}
    />
  );

  /* ── navOnly ── */
  if (navOnly) {
    return (
      <>
        <nav className={styles.nav} role="navigation" aria-label="Main navigation">
          <div className={styles.navInner}>
            <div className={styles.navRow}>
              {profileHamburger}
              <div className={styles.logo} aria-label="Your Logo">Your Logo</div>
              {desktopNav}
              {navRight}
            </div>
          </div>
        </nav>
        {mobileDrawer}
        {profileDrawer}
      </>
    );
  }

  /* ── Full header ── */
  return (
    <header className={styles.header}>
      <div className={styles.backgroundWrapper}>
        <img
          src="/pexels-pixabay-159220.jpg"
          alt="Circuit board background"
          className={styles.backgroundImage}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        <div className={styles.backgroundOverlay} />
      </div>

      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <div className={styles.navInner}>
          <div className={styles.navRow}>
            {profileHamburger}
            <div className={styles.logo} aria-label="Your Logo">Your Logo</div>
            {desktopNav}
            {navRight}
          </div>
        </div>
      </nav>

      {mobileDrawer}
      {profileDrawer}

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