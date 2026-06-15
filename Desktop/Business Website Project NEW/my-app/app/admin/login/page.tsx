'use client';
/**
 * app/admin/login/page.tsx
 * ─────────────────────────────────────────────
 * Admin-only login page, completely separate from /login (regular users).
 * New admins must be invited by an existing admin from the Profile section.
 */
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Check admin_users table client-side as a UX hint
    // (middleware enforces this server-side on every request)
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', data.user?.id)
      .single();

    if (!adminRow) {
      await supabase.auth.signOut();
      setError('You do not have admin access.');
      setLoading(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  };

  return (
    <div className={styles.page}>
      {/* ── Back to main ── */}
      <button
        onClick={() => router.push('/')}
        className={styles.backBtn}
        aria-label="Back to main page"
      >
        ← Back
      </button>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.eyebrow}>// ADMIN</p>
          <h1 className={styles.title}>Admin Sign In</h1>
          <p className={styles.subtitle}>Restricted access — authorised personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Verifying…' : 'Sign In →'}
          </button>
        </form>

        {/* ── Join the Admin Team ── */}
        <button
          onClick={() => router.push('/admin/join')}
          className={styles.joinBtn}
        >
          Join the Admin Team
        </button>

        <p className={styles.contactNote}>
          Need access? Contact your administrator to receive an invitation.
        </p>
      </div>
    </div>
  );
}