import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get stats
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('stamp_count');

    const { data: records, error: recordsError } = await supabase
      .from('loyalty_records')
      .select('id');

    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('id')
      .eq('active', true);

    if (usersError || recordsError || offersError) {
      throw new Error('Database error');
    }

    const totalStamps = (users || []).reduce((sum, u) => sum + (u.stamp_count || 0), 0);
    const rewardsRedeemed = (records || []).length;
    const totalCustomers = (users || []).length;
    const activeOffers = (offers || []).length;

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalStampsAdded: totalStamps,
        rewardsRedeemed,
        activeOffers,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      stats: {
        totalCustomers: 0,
        totalStampsAdded: 0,
        rewardsRedeemed: 0,
        activeOffers: 0,
      },
    });
  }
}
