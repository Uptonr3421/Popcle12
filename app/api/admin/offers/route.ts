import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, sanitizeString } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 403 });
    }

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

    // Input validation
    const cleanTitle = sanitizeString(title, 200);
    const cleanDescription = sanitizeString(description, 1000);
    if (!cleanTitle) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
    }
    if (typeof lat === 'number' && (lat < -90 || lat > 90)) {
      return NextResponse.json({ error: 'Latitude must be between -90 and 90' }, { status: 400 });
    }
    if (typeof lng === 'number' && (lng < -180 || lng > 180)) {
      return NextResponse.json({ error: 'Longitude must be between -180 and 180' }, { status: 400 });
    }

    // Parse discount - extract percentage if it's like "50% Off"
    const discountMatch = discount.match(/(\d+)/);
    const discountPercentage = discountMatch ? parseInt(discountMatch[1]) : null;
    const isFreeItem = discount.toLowerCase().includes('free');

    if (discountPercentage !== null && (discountPercentage < 0 || discountPercentage > 100)) {
      return NextResponse.json({ error: 'Discount percentage must be between 0 and 100' }, { status: 400 });
    }

    const { data: offer, error } = await supabase
      .from('offers')
      .insert([
        {
          title: cleanTitle,
          description: cleanDescription,
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
