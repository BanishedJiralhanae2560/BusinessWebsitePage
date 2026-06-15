'use client';

/**
 * app/admin/SignOutButton.tsx
 * ─────────────────────────────────────────────
 * Signs the admin out and redirects to /admin/login.
 * Completely separate from regular user sign-out.
 *
 * Usage:
 *   import { SignOutButton } from '@/app/admin/SignOutButton';
 *   <SignOutButton className={styles.sidebarBtn} />
 */
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton({ className }: { className?: string }) {
  const router   = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className={className}
      style={!className ? defaultStyle : undefined}
    >
      Sign Out
    </button>
  );
}

const defaultStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--color-border, #1f1f1f)',
  borderRadius: '6px',
  color: 'var(--color-text-muted, #888)',
  cursor: 'pointer',
  fontSize: '0.78rem',
  padding: '0.4rem 0.85rem',
};