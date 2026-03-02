import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Store coordinates: 33549 Solon Rd, Solon, OH 44139
const STORE_LATITUDE = 41.4384;
const STORE_LONGITUDE = -81.4096;
const GEOFENCE_RADIUS_KM = 0.5; // 500 meters

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, latitude, longitude, action } = await req.json();

    if (!phone || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, latitude, longitude' },
        { status: 400 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate distance to store
    const distance = calculateDistance(
      latitude,
      longitude,
      STORE_LATITUDE,
      STORE_LONGITUDE
    );

    const isNearStore = distance < GEOFENCE_RADIUS_KM;

    if (action === 'enter' && isNearStore) {
      // Record geofence entry
      const { error: insertError } = await supabase
        .from('geofence_triggers')
        .insert([
          {
            user_id: user.id,
            latitude,
            longitude,
            entered_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error('Geofence insert error:', insertError);
      }

      return NextResponse.json({
        nearStore: true,
        distance: Math.round(distance * 1000), // in meters
        message: 'Welcome to Pop Culture CLE! Check out our special offers.',
        triggered: true,
      });
    } else if (action === 'exit' && !isNearStore) {
      // Update the most recent geofence entry with exit time
      const { data: recentTrigger } = await supabase
        .from('geofence_triggers')
        .select('id')
        .eq('user_id', user.id)
        .is('exited_at', null)
        .order('entered_at', { ascending: false })
        .limit(1)
        .single();

      if (recentTrigger) {
        await supabase
          .from('geofence_triggers')
          .update({ exited_at: new Date().toISOString() })
          .eq('id', recentTrigger.id);
      }

      return NextResponse.json({
        nearStore: false,
        distance: Math.round(distance * 1000),
        message: 'Thanks for visiting! See you next time.',
        triggered: true,
      });
    }

    // Just a location check without triggering
    return NextResponse.json({
      nearStore: isNearStore,
      distance: Math.round(distance * 1000),
      triggered: false,
    });
  } catch (error) {
    console.error('Geofence trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json(
      { error: 'Phone number required' },
      { status: 400 }
    );
  }

  try {
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (userError || !user) {
      return NextResponse.json({ triggers: [] });
    }

    // Get recent geofence triggers
    const { data: triggers, error } = await supabase
      .from('geofence_triggers')
      .select('*')
      .eq('user_id', user.id)
      .order('entered_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      triggers: triggers || [],
    });
  } catch (error) {
    console.error('Geofence fetch error:', error);
    return NextResponse.json({ triggers: [] });
  }
}
