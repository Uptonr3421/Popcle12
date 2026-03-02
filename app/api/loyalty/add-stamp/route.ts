import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { customerPhone, employeePhone } = await req.json();

    if (!customerPhone || !employeePhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('id, name, stamp_count, loyalty_status')
      .eq('phone_number', customerPhone)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify employee
    const { data: employee, error: employeeError } = await supabase
      .from('users')
      .select('id, loyalty_status, phone_number')
      .eq('phone_number', employeePhone)
      .single();

    if (employeeError || !employee || employee.loyalty_status !== 'employee') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Increment stamp count (max 10)
    const newStampCount = Math.min((customer.stamp_count || 0) + 1, 10);

    // Update customer
    const { error: updateError } = await supabase
      .from('users')
      .update({ stamp_count: newStampCount })
      .eq('id', customer.id);

    if (updateError) {
      throw updateError;
    }

    // Record the stamp transaction
    await supabase
      .from('loyalty_records')
      .insert([
        {
          user_id: customer.id,
          scanned_by_employee: employee.phone_number,
          stamp_added_at: new Date().toISOString(),
        },
      ]);

    return NextResponse.json({
      success: true,
      customerName: customer.name || 'Customer',
      newStampCount,
      rewardReady: newStampCount >= 10,
    });
  } catch (error) {
    console.error('Add stamp error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
