import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { title, description, discount, expiresAt } = await req.json();

    if (!title || !description || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse discount — if it looks like a number treat as percentage, otherwise set free_item
    const discountNum = parseInt(discount, 10);
    const isFreeItem = isNaN(discountNum) || discount?.toLowerCase().includes('free');

    const { data: offer, error } = await supabase
      .from('offers')
      .insert([
        {
          title,
          description,
          discount_percentage: isFreeItem ? 0 : discountNum,
          free_item: isFreeItem,
          expires_at: expiresAt,
          active: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discount: offer.free_item ? 'FREE ITEM' : `${offer.discount_percentage}% Off`,
        expiresAt: offer.expires_at,
        active: offer.active,
      },
    });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
