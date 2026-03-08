import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizePhone, checkRateLimit } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone, isEmployee, supabaseVerified } = await req.json();

    const phone = sanitizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Rate limit: 10 verify attempts per phone per hour
    const rateCheck = checkRateLimit(`verify:${phone}`, 10, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.', retryAfter: rateCheck.retryAfter },
        { status: 429 }
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
