import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone, isEmployee, supabaseVerified } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if user exists in DB
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('phone, name, user_type')
      .eq('phone', phone)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      throw queryError;
    }

    const exists = !!user;

    return NextResponse.json({
      exists,
      phone,
      name: user?.name || null,
      userType: user?.user_type || 'customer',
      supabaseVerified: !!supabaseVerified,
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
