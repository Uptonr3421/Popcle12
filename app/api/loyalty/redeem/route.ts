import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Look up user by phone
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, phone, name, stamp_count')
      .eq('phone', phone)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check stamp count
    if (user.stamp_count < 10) {
      const needed = 10 - user.stamp_count;
      return NextResponse.json(
        { error: `Need ${needed} more stamp${needed === 1 ? '' : 's'} to redeem` },
        { status: 400 }
      );
    }

    // Reset stamp count to 0
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ stamp_count: 0 })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to reset stamp count:', updateError);
      return NextResponse.json({ error: 'Failed to process redemption' }, { status: 500 });
    }

    // Insert loyalty record
    const { error: recordError } = await supabaseAdmin
      .from('loyalty_records')
      .insert({
        user_id: user.id,
        customer_id: user.id,
        action: 'reward_claimed',
        stamp_added_at: new Date().toISOString(),
      });

    if (recordError) {
      console.error('Failed to insert loyalty record:', recordError);
      return NextResponse.json({ error: 'Failed to record redemption' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Free item claimed! Enjoy your reward!',
    });
  } catch (err) {
    console.error('Redeem error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
