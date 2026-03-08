import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('scheduled_pushes')
    .select('*')
    .order('scheduled_for', { ascending: true });

  if (error) return NextResponse.json({ pushes: [] });
  return NextResponse.json({ pushes: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, scheduledFor, recipientType } = await req.json();

    if (!title || !scheduledFor) {
      return NextResponse.json({ error: 'title and scheduledFor required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('scheduled_pushes')
      .insert([{
        title,
        body: body || '',
        scheduled_for: scheduledFor,
        sent: false,
        recipient_type: recipientType || 'all',
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, push: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to schedule push' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('scheduled_pushes')
      .delete()
      .eq('id', id)
      .eq('sent', false); // Can only delete unsent

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
