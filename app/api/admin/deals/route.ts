/**
 * POST /api/admin/deals — Create a scheduled deal with optional push notification
 *
 * DB migrations required — run in Supabase SQL Editor:
 *
 * -- 1. Add starts_at to offers table
 * ALTER TABLE offers ADD COLUMN IF NOT EXISTS starts_at timestamptz DEFAULT now();
 *
 * -- 2. Create scheduled_pushes table
 * CREATE TABLE IF NOT EXISTS scheduled_pushes (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   title text NOT NULL,
 *   body text NOT NULL,
 *   scheduled_for timestamptz NOT NULL,
 *   sent boolean DEFAULT false,
 *   sent_at timestamptz,
 *   recipient_type text NOT NULL DEFAULT 'all' CHECK (recipient_type IN ('all', 'nearby')),
 *   created_at timestamptz DEFAULT now()
 * );
 *
 * -- 3. Add deal_id to loyalty_records for tracking which deal was applied
 * ALTER TABLE loyalty_records ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES offers(id);
 *
 * Body:
 *   title: string
 *   description: string
 *   discountType: 'percentage' | 'free_item' | 'fixed'
 *   discountValue: number  (percent, 0 for free item, or dollar amount)
 *   discountLabel: string  (e.g. "20% OFF", "FREE SCOOP", "$2 OFF")
 *   startsAt: string (ISO datetime)
 *   expiresAt: string (ISO datetime)
 *   geofenceEnabled: boolean
 *   lat?: number
 *   lng?: number
 *   radiusMeters?: number
 *   schedulePush: boolean
 *   pushScheduledFor?: string (ISO datetime, when to send notification)
 *   pushTitle?: string
 *   pushBody?: string
 */

import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      title, description,
      discountType, discountValue, discountLabel,
      startsAt, expiresAt,
      geofenceEnabled, lat, lng, radiusMeters,
      schedulePush, pushScheduledFor, pushTitle, pushBody,
    } = await req.json();

    if (!title || !expiresAt || !discountLabel) {
      return NextResponse.json({ error: 'title, expiresAt, discountLabel required' }, { status: 400 });
    }

    // Create the deal
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('offers')
      .insert([{
        title,
        description: description || '',
        discount_percentage: discountType === 'percentage' ? discountValue : null,
        free_item: discountType === 'free_item',
        discount_label: discountLabel,
        starts_at: startsAt || new Date().toISOString(),
        expires_at: expiresAt,
        active: true,
        geofence_enabled: geofenceEnabled ?? false,
        lat: geofenceEnabled ? lat : null,
        lng: geofenceEnabled ? lng : null,
        radius_meters: geofenceEnabled ? (radiusMeters ?? 200) : null,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (dealError) {
      console.error('Deal insert error:', dealError);
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }

    // Optionally schedule a push notification
    if (schedulePush && pushScheduledFor && pushTitle) {
      const { error: pushError } = await supabaseAdmin
        .from('scheduled_pushes')
        .insert([{
          title: pushTitle,
          body: pushBody || description || title,
          scheduled_for: pushScheduledFor,
          sent: false,
          recipient_type: 'all',
        }]);

      if (pushError) {
        console.warn('Push schedule failed (non-fatal):', pushError);
      }
    }

    return NextResponse.json({ success: true, deal });
  } catch (err) {
    console.error('Create deal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return all deals sorted by starts_at desc, with status computed
    const { data: deals, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const now = new Date().toISOString();
    const enriched = (deals || []).map((d: any) => ({
      ...d,
      status: !d.active ? 'inactive'
        : d.expires_at && d.expires_at < now ? 'expired'
        : d.starts_at && d.starts_at > now ? 'scheduled'
        : 'live',
      discount_label: d.discount_label || (
        d.free_item ? 'FREE ITEM'
          : d.discount_percentage ? `${d.discount_percentage}% OFF`
          : 'Special Deal'
      ),
    }));

    return NextResponse.json({ deals: enriched });
  } catch (err) {
    return NextResponse.json({ deals: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, active } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('offers')
      .update({ active })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}
