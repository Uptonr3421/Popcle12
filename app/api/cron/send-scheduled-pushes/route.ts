/**
 * GET /api/cron/send-scheduled-pushes
 *
 * Called by Vercel Cron every minute (configured in vercel.json).
 * Finds pending scheduled pushes whose time has arrived, sends them,
 * marks them as sent.
 *
 * Protected by CRON_SECRET env var.
 */

import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Find all unsent pushes whose scheduled time has passed
    const { data: pending, error: fetchError } = await supabaseAdmin
      .from('scheduled_pushes')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now);

    if (fetchError) throw fetchError;
    if (!pending || pending.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No pending pushes' });
    }

    // Get all customer push tokens
    const { data: customers } = await supabaseAdmin
      .from('users')
      .select('expo_push_token')
      .eq('user_type', 'customer')
      .not('expo_push_token', 'is', null);

    const tokens = (customers || [])
      .map((c: any) => c.expo_push_token)
      .filter(Boolean);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let totalSent = 0;

    for (const push of pending) {
      // Send to all tokens
      const results = await Promise.allSettled(
        tokens.map((token: string) =>
          fetch(`${supabaseUrl}/functions/v1/send-push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ token, title: push.title, body: push.body }),
          })
        )
      );

      const sent = results.filter(r => r.status === 'fulfilled').length;
      totalSent += sent;

      // Mark as sent
      await supabaseAdmin
        .from('scheduled_pushes')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', push.id);
    }

    return NextResponse.json({
      sent: totalSent,
      pushCount: pending.length,
      tokenCount: tokens.length,
    });
  } catch (err) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
