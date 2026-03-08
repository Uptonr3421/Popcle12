import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizePhone, sanitizeString, checkRateLimit } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone, name: rawName, isEmployee, supabaseVerified } = await request.json();

    const phone = sanitizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const name = sanitizeString(rawName, 100);
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Rate limit: 5 registrations per phone per hour
    const rateCheck = checkRateLimit(`register:${phone}`, 5, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Try again later.', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Build user record
    const userRecord: Record<string, unknown> = {
      phone,
      name: name.trim(),
      user_type: isEmployee ? 'employee' : 'customer',
      stamp_count: 0,
      created_at: new Date().toISOString(),
    };

    // If Supabase auth was used, try to link the auth user ID
    if (supabaseVerified) {
      try {
        const e164Phone = `+1${phone}`;
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = authUsers?.users?.find(
          (u) => u.phone === e164Phone
        );

        if (authUser) {
          userRecord.auth_id = authUser.id;
        }
      } catch (err) {
        // Non-fatal: if we can't link the auth user, still create the DB record
        console.warn('Could not link Supabase auth user:', err);
      }
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([userRecord])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name,
        stamps: newUser.stamp_count,
        type: newUser.user_type,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

