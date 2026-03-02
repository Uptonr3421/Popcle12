import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, isEmployee } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('phone_number')
      .eq('phone_number', phone)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      throw queryError;
    }

    const exists = !!user;

    return NextResponse.json({ 
      exists,
      phone 
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
