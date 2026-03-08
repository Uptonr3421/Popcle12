import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // SQL migration required for geofence fields:
    // ALTER TABLE offers
    // ADD COLUMN IF NOT EXISTS lat float8,
    // ADD COLUMN IF NOT EXISTS lng float8,
    // ADD COLUMN IF NOT EXISTS radius_meters integer DEFAULT 200;
    const { title, description, discount, expiresAt, geofence_enabled, lat, lng, radius_meters } = await req.json();

    if (!title || !description || !discount || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse discount - extract percentage if it's like "50% Off"
    const discountMatch = discount.match(/(\d+)/);
    const discountPercentage = discountMatch ? parseInt(discountMatch[1]) : null;
    const isFreeItem = discount.toLowerCase().includes('free');

    const { data: offer, error } = await supabase
      .from('offers')
      .insert([
        {
          title,
          description,
          discount_percentage: discountPercentage,
          free_item: isFreeItem,
          expires_at: expiresAt,
          active: true,
          geofence_enabled: geofence_enabled ?? false,
          lat: lat ?? null,
          lng: lng ?? null,
          radius_meters: radius_meters ?? 200,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discount: offer.discount_percentage ? `${offer.discount_percentage}% OFF` : (offer.free_item ? 'FREE ITEM' : 'Special Offer'),
        expiresAt: offer.expires_at,
        active: offer.active,
      },
    });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
