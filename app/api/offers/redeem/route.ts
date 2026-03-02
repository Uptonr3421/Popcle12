import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, offerId, action } = await req.json();

    if (!phone || !offerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Get offer
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('id, title, active, expires_at')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if offer is still active and not expired
    if (!offer.active || new Date(offer.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Offer is no longer available' },
        { status: 400 }
      );
    }

    // Check if already redeemed
    const { data: existing } = await supabase
      .from('offer_redemptions')
      .select('id, redeemed_at')
      .eq('user_id', user.id)
      .eq('offer_id', offerId)
      .single();

    if (action === 'view') {
      // Record that user viewed the offer
      if (!existing) {
        await supabase
          .from('offer_redemptions')
          .insert([
            {
              user_id: user.id,
              offer_id: offerId,
              viewed_at: new Date().toISOString(),
            },
          ]);
      }

      return NextResponse.json({
        success: true,
        action: 'viewed',
        offerTitle: offer.title,
      });
    }

    if (action === 'redeem') {
      if (existing?.redeemed_at) {
        return NextResponse.json(
          { error: 'Offer already redeemed' },
          { status: 400 }
        );
      }

      if (existing) {
        // Update existing record with redemption time
        await supabase
          .from('offer_redemptions')
          .update({ redeemed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Create new record with both view and redemption
        await supabase
          .from('offer_redemptions')
          .insert([
            {
              user_id: user.id,
              offer_id: offerId,
              viewed_at: new Date().toISOString(),
              redeemed_at: new Date().toISOString(),
            },
          ]);
      }

      return NextResponse.json({
        success: true,
        action: 'redeemed',
        offerTitle: offer.title,
        message: `You've successfully redeemed: ${offer.title}`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Redeem offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
