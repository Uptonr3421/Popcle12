/**
 * GET /api/loyalty/active-deals
 * Returns currently active deals (started, not expired, active=true)
 * Used by customer app (countdown display) and staff scanner (deal alerts)
 */

import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const now = new Date().toISOString();

    const { data: deals, error } = await supabase
      .from('offers')
      .select('id, title, description, discount_percentage, free_item, discount_label, starts_at, expires_at, geofence_enabled')
      .eq('active', true)
      .lte('starts_at', now)   // started
      .gt('expires_at', now);  // not expired

    if (error) throw error;

    const enriched = (deals || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      discountLabel: d.discount_label || (
        d.free_item ? 'FREE ITEM'
          : d.discount_percentage ? `${d.discount_percentage}% OFF`
          : 'Special Deal'
      ),
      startsAt: d.starts_at,
      expiresAt: d.expires_at,
      geofenceEnabled: d.geofence_enabled,
      // Seconds until expiry
      secondsLeft: Math.max(0, Math.floor((new Date(d.expires_at).getTime() - Date.now()) / 1000)),
    }));

    return NextResponse.json({ deals: enriched, timestamp: now });
  } catch (err) {
    console.error('Active deals error:', err);
    return NextResponse.json({ deals: [] });
  }
}
