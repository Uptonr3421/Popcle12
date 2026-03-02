import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, phone_number, name, stamp_count, loyalty_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const customers = (users || []).map((user: any) => ({
      id: user.id,
      phone: user.phone_number,
      name: user.name,
      stampCount: user.stamp_count || 0,
      userType: user.loyalty_status || 'customer',
      createdAt: user.created_at,
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ customers: [] });
  }
}
