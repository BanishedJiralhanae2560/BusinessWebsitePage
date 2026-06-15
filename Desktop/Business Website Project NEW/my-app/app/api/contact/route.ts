/**
 * app/api/contact/route.ts
 * ========================
 * Handles contact form submissions.
 * 1. Validates the payload
 * 2. Saves to Supabase (contact_submissions table)
 * 3. Sends an instant email notification to the admin via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/* ── Supabase admin client (service-role key — server only) ── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!        // never expose this to the browser
);

/* ── Resend ── */
const RESEND_API_KEY   = process.env.RESEND_API_KEY;
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL ?? 'admin@yourstore.com';
const FROM_EMAIL       = process.env.FROM_EMAIL  ?? 'noreply@yourstore.com';

/* ============================================================
   POST /api/contact
   ============================================================ */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    /* ── 1. Basic validation ── */
    if (!name?.trim())    return NextResponse.json({ error: 'Name is required.'    }, { status: 400 });
    if (!subject?.trim()) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json(
        { error: 'Please provide at least an email or phone number.' },
        { status: 400 }
      );
    }

    /* ── 2. Save to Supabase ── */
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{
        name:    name.trim(),
        email:   email?.trim()   || null,
        phone:   phone?.trim()   || null,
        subject: subject.trim(),
        message: message.trim(),
      }])
      .select('id')
      .single();

    if (dbError) {
      console.error('[contact] Supabase error:', dbError);
      const errMsg = dbError?.message || (dbError as any)?.msg || dbError?.details || 'Failed to save submission.';
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    /* ── 3. Send admin notification email via Resend ── */
    const emailBody = `
New contact form submission (#${submission.id})

Name:    ${name.trim()}
Email:   ${email?.trim()  || '—'}
Phone:   ${phone?.trim()  || '—'}
Subject: ${subject.trim()}

Message:
${message.trim()}

---
View and reply in your admin dashboard.
    `.trim();

    if (RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from:    FROM_EMAIL,
            to:      ADMIN_EMAIL,
            subject: `[Contact] ${subject.trim()} — from ${name.trim()}`,
            text:    emailBody,
          }),
        });

        if (!resendRes.ok) {
          console.warn('[contact] Resend notification failed:', await resendRes.text());
        }
      } catch (e) {
        console.warn('[contact] Resend admin error:', e);
      }
    } else {
      console.warn('[contact] RESEND_API_KEY not set; skipping admin notification');
    }

    /* ── 4. Also send a confirmation email to the user (if they gave an email) ── */
    if (email?.trim()) {
      if (RESEND_API_KEY) {
        try {
          const userRes = await fetch('https://api.resend.com/emails', {
            method:  'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from:    FROM_EMAIL,
              to:      email.trim(),
              subject: `We received your message — ${subject.trim()}`,
              text: `Hi ${name.trim()},\n\nThank you for reaching out! We have received your message and will get back to you within 24 hours.\n\nYour subject: ${subject.trim()}\n\nBest regards,\nThe Support Team`,
            }),
          });

          if (!userRes.ok) {
            console.warn('[contact] Resend confirmation failed:', await userRes.text());
          }
        } catch (e) {
          console.warn('[contact] Resend user error:', e);
        }
      } else {
        console.warn('[contact] RESEND_API_KEY not set; skipping user confirmation to', email.trim());
      }
    }

    if (!submission?.id) {
      console.error('[contact] Insert returned no id:', submission);
      return NextResponse.json({ error: 'Failed to save submission.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: submission.id }, { status: 200 });

  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}