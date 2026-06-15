'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/signup'); return; }
      setUser(data.user);
      const meta = data.user.user_metadata || {};
      setForm({
        firstName: meta.first_name || '',
        lastName:  meta.last_name  || '',
        email:     data.user.email || '',
        phone:     meta.phone      || '',
        company:   meta.company    || '',
      });
      setLoading(false);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: {
        first_name: form.firstName,
        last_name:  form.lastName,
        phone:      form.phone,
        company:    form.company,
      },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = form.firstName && form.lastName
    ? `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    : form.email.slice(0, 2).toUpperCase();

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <span>Loading account…</span>
      </div>
    </div>
  );

  return (
    <>
      <Header navOnly={true} />
      <div className={styles.page}>

      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Profile</p>
          <h1 className={styles.heroTitle}>My Account</h1>
          <p className={styles.heroSub}>Manage your personal details, preferences, and security settings.</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrap}>
        <div className={styles.layout}>

          {/* Left — Avatar + Stats */}
          <aside className={styles.sidebar}>
            <div className={styles.avatarCard}>
              <div className={styles.avatarCircle}>{initials}</div>
              <div className={styles.avatarName}>{form.firstName || 'Your'} {form.lastName || 'Name'}</div>
              <div className={styles.avatarEmail}>{form.email}</div>
              <div className={styles.avatarDivider} />
              <div className={styles.statGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>12</span>
                  <span className={styles.statLabel}>Orders</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>4</span>
                  <span className={styles.statLabel}>In Cart</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>2</span>
                  <span className={styles.statLabel}>Addresses</span>
                </div>
              </div>
              <div className={styles.avatarDivider} />
              <div className={styles.quickLinks}>
                <Link href="/profile/orders" className={styles.quickLink}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
                  My Orders
                </Link>
                <Link href="/profile/cart" className={styles.quickLink}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  My Cart
                </Link>
              </div>
            </div>
          </aside>

          {/* Right — Forms */}
          <main className={styles.main}>

            {/* Personal Info */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Personal Information</h2>
                  <p className={styles.sectionDesc}>Update your name, contact details, and company.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>First Name</label>
                  <input
                    className={styles.input}
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Jordan"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    className={styles.input}
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Davis"
                  />
                </div>
                <div className={`${styles.formField} ${styles.fullCol}`}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    className={`${styles.input} ${styles.inputReadonly}`}
                    name="email"
                    value={form.email}
                    readOnly
                    placeholder="your@email.com"
                  />
                  <span className={styles.inputHint}>Email cannot be changed here. Contact support.</span>
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Phone</label>
                  <input
                    className={styles.input}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (408) 555-0182"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Company</label>
                  <input
                    className={styles.input}
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="TechWorks Inc."
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
                </button>
              </div>
            </section>

            {/* Security */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Security</h2>
                  <p className={styles.sectionDesc}>Manage your password and login options.</p>
                </div>
              </div>
              <div className={styles.securityRow}>
                <div>
                  <div className={styles.securityLabel}>Password</div>
                  <div className={styles.securityValue}>Last changed 3 months ago</div>
                </div>
                <button className={styles.outlineBtn}>Change Password</button>
              </div>
              <div className={styles.securityRow}>
                <div>
                  <div className={styles.securityLabel}>Two-Factor Authentication</div>
                  <div className={styles.securityValue}>Not enabled — add an extra layer of security</div>
                </div>
                <button className={styles.outlineBtn}>Enable 2FA</button>
              </div>
            </section>

            {/* Danger zone */}
            <section className={`${styles.section} ${styles.dangerSection}`}>
              <h2 className={styles.sectionTitle}>Danger Zone</h2>
              <p className={styles.sectionDesc}>Permanently delete your account and all associated data.</p>
              <button className={styles.dangerBtn}>Delete Account</button>
            </section>

          </main>
        </div>
      </div>
    </div>
    </>
  );
}