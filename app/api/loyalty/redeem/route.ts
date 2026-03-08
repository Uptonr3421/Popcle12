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
      .select('id')
      .eq('phone', phone)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Atomic redemption via Supabase RPC — prevents double redeem race conditions
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('redeem_reward', {
      p_user_id: user.id,
    });

    if (rpcError) {
      console.error('Redeem RPC error:', rpcError);
      return NextResponse.json({ error: 'Failed to process redemption' }, { status: 500 });
    }

    if (!rpcResult.success) {
      return NextResponse.json({ error: rpcResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: rpcResult.message || 'Free item claimed! Enjoy your reward!',
    });
  } catch (err) {
    console.error('Redeem error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
