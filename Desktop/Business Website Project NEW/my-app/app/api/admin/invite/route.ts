/**
 * app/api/admin/invite/route.ts
 * ─────────────────────────────────────────────
 * Server-side API route that:
 *  1. Verifies the requester is an authenticated admin
 *  2. Sends a Supabase invite email to the new admin
 *  3. Inserts the new user into admin_users once they accept
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in your .env.local
 * This key is never exposed to the browser.
 */
import { createServerClient } from '@supabase/ssr';
import { createClient }       from '@supabase/supabase-js';
import { cookies }            from 'next/headers';
import { NextResponse }       from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // ── 1. Verify the requester is a signed-in admin ──
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminRow) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  }

  // ── 2. Parse request body ──
  const { email, full_name } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  // ── 3. Use service role client to send invite ──
  // The service role key bypasses RLS and can invite users.
  // NEVER expose this key client-side.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/login`,
      data: { full_name: full_name ?? '' },
    }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // ── 4. Pre-insert into admin_users so middleware grants access on first login ──
  await adminClient
    .from('admin_users')
    .upsert({
      id:        inviteData.user.id,
      full_name: full_name ?? null,
    });

  return NextResponse.json({ success: true });
}