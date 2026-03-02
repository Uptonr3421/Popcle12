import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('stamp_count')
      .eq('phone_number', phone)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { stampCount: 0 }
      );
    }

    return NextResponse.json({
      stampCount: user.stamp_count || 0
    });
  } catch (error) {
    console.error('Fetch stamps error:', error);
    return NextResponse.json(
      { stampCount: 0 }
    );
  }
}
