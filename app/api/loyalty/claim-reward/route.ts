import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, employeePhone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('id, name, stamp_count')
      .eq('phone_number', phone)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has enough stamps
    if ((customer.stamp_count || 0) < 10) {
      return NextResponse.json(
        { error: 'Not enough stamps. Need 10 stamps to claim reward.' },
        { status: 400 }
      );
    }

    // If employee phone provided, verify employee
    if (employeePhone) {
      const { data: employee, error: employeeError } = await supabase
        .from('users')
        .select('id, loyalty_status')
        .eq('phone_number', employeePhone)
        .single();

      if (employeeError || !employee || employee.loyalty_status !== 'employee') {
        return NextResponse.json(
          { error: 'Employee verification failed' },
          { status: 403 }
        );
      }
    }

    // Reset stamps to 0 after claiming reward
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stamp_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);

    if (updateError) {
      throw updateError;
    }

    // Record the redemption in loyalty_records
    await supabase
      .from('loyalty_records')
      .insert([
        {
          user_id: customer.id,
          scanned_by_employee: employeePhone || 'self-service',
          stamp_added_at: new Date().toISOString(),
          notes: 'Reward claimed - Free item redeemed',
        },
      ]);

    return NextResponse.json({
      success: true,
      customerName: customer.name || 'Customer',
      message: `Congratulations ${customer.name || 'Customer'}! You've claimed your free ice cream!`,
      newStampCount: 0,
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
