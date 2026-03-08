/**
 * Deal helpers for the loyalty app.
 *
 * DB Migration needed:
 * ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_label text;
 * ALTER TABLE offers ADD COLUMN IF NOT EXISTS starts_at timestamptz DEFAULT now();
 */

import { supabase } from './supabase';

export interface ActiveDeal {
  id: string;
  title: string;
  description: string;
  discountLabel: string;
  expiresAt: string;
  secondsLeft: number;
}

/**
 * Fetch currently active deals from Supabase.
 */
export async function getActiveDeals(): Promise<ActiveDeal[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('offers')
    .select('id, title, description, discount_percentage, free_item, discount_label, starts_at, expires_at')
    .eq('active', true)
    .lte('starts_at', now)
    .gt('expires_at', now);

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description || '',
    discountLabel: d.discount_label || (
      d.free_item ? 'FREE ITEM'
        : d.discount_percentage ? `${d.discount_percentage}% OFF`
        : 'Special Deal'
    ),
    expiresAt: d.expires_at,
    secondsLeft: Math.max(0, Math.floor((new Date(d.expires_at).getTime() - Date.now()) / 1000)),
  }));
}

/**
 * Format seconds remaining into human-readable countdown.
 * e.g. 7261 → "2h 01m 01s"
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'EXPIRED';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

/**
 * Get a staff-facing instruction string for a deal.
 * e.g. "Apply 20% OFF to this order"
 */
export function getStaffInstruction(deal: ActiveDeal): string {
  return `Apply ${deal.discountLabel} to this order`;
}
