// API route: POST /api/admin/broadcast
// Sends a push notification to all customers with a registered Expo push token.
//
// Required env vars (already in .env.local):
//   SUPABASE_URL              — e.g. https://hebmjzgooluebakqaxly.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — server-only, never ship to client
//
// The Supabase Edge Function "send-push" must be deployed first:
//   npx supabase functions deploy send-push

import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'title and body are required' },
        { status: 400 }
      );
    }

    // Fetch all customers with a registered push token
    const { data: customers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, expo_push_token')
      .eq('user_type', 'customer')
      .not('expo_push_token', 'is', null);

    if (fetchError) {
      console.error('Failed to fetch customers:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-push`;

    let sent = 0;
    let failed = 0;

    // Send to each token — use allSettled so one failure doesn't abort the rest
    const results = await Promise.allSettled(
      customers
        .filter((c): c is { id: string; expo_push_token: string } => Boolean(c.expo_push_token))
        .map((c) =>
          fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ token: c.expo_push_token, title, body }),
          })
        )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        sent++;
      } else {
        failed++;
        console.error('Push send failed:', result.reason);
      }
    }

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error('Broadcast error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
