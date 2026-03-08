import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

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
      .eq('phone', phone)
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
