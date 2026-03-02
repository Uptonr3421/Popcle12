import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data for frontend
    const transformedOffers = (offers || []).map((offer: any) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      discount: offer.discount_percentage ? `${offer.discount_percentage}% OFF` : (offer.free_item ? 'FREE ITEM' : 'Special Offer'),
      expiresAt: offer.expires_at,
      active: offer.active,
      geofenceEnabled: offer.geofence_enabled,
    }));

    return NextResponse.json({
      offers: transformedOffers,
    });
  } catch (error) {
    console.error('Fetch offers error:', error);
    return NextResponse.json(
      { offers: [] }
    );
  }
}
