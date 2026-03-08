import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 403 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, phone, name, stamp_count, user_type, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const customers = (users || []).map((user: any) => ({
      id: user.id,
      phone: user.phone,
      name: user.name,
      stampCount: user.stamp_count || 0,
      userType: user.user_type || 'customer',
      createdAt: user.created_at,
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ customers: [] });
  }
}
