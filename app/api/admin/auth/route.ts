import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, user_type')
      .eq('phone', phone)
      .eq('user_type', 'admin')
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
