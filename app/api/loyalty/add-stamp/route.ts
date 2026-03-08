import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizePhone, checkRateLimit } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const { customerPhone: rawCustomerPhone, employeePhone: rawEmployeePhone } = await req.json();

    if (!rawCustomerPhone || !rawEmployeePhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const customerPhone = sanitizePhone(rawCustomerPhone);
    const employeePhone = sanitizePhone(rawEmployeePhone);
    if (!customerPhone || !employeePhone) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Rate limit: 10 stamps per employee per minute
    const rateCheck = checkRateLimit(`stamp:${employeePhone}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again shortly.', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      );
    }

    // Look up customer
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('id, name')
      .eq('phone', customerPhone)
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
      .select('id, user_type')
      .eq('phone', employeePhone)
      .single();

    if (employeeError || !employee || employee.user_type !== 'employee') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Atomic stamp increment via Supabase RPC — prevents race conditions
    const { data: rpcResult, error: rpcError } = await supabase.rpc('add_stamp', {
      p_customer_id: customer.id,
      p_employee_id: employee.id,
    });

    if (rpcError) {
      throw rpcError;
    }

    if (!rpcResult.success) {
      return NextResponse.json(
        { error: rpcResult.error, cooldown: rpcResult.cooldown || false },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      customerName: customer.name || 'Customer',
      newStampCount: rpcResult.new_count,
      rewardReady: rpcResult.celebration || false,
    });
  } catch (error) {
    console.error('Add stamp error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
