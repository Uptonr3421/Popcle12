import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Rate limiter (in-memory, resets on server restart)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

export function sanitizePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return null;
}

export function sanitizeString(str: string, maxLength: number = 200): string {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, maxLength);
}

// Verify admin role from request context
export async function verifyAdmin(req: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get('authorization');
  const adminPhone = req.headers.get('x-admin-phone');

  // Check via admin phone header (used by web dashboard)
  if (adminPhone) {
    const phone = sanitizePhone(adminPhone);
    if (!phone) return { isAdmin: false, error: 'Invalid phone' };

    const { data } = await supabaseAdmin
      .from('users')
      .select('id, user_type')
      .eq('phone', phone)
      .eq('user_type', 'admin')
      .single();

    if (!data) return { isAdmin: false, error: 'Not an admin' };
    return { isAdmin: true, userId: data.id };
  }

  return { isAdmin: false, error: 'No admin credentials' };
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export { supabaseAdmin };
