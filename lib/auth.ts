import { supabaseClient } from './supabase-client';

/**
 * Convert a 10-digit US phone number to E.164 format (+1XXXXXXXXXX).
 * If already in E.164 format, returns as-is.
 */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  // Already has country code or non-US — return with + prefix
  if (phone.startsWith('+')) return phone;
  return `+${digits}`;
}

/**
 * Convert E.164 phone (+1XXXXXXXXXX) to 10-digit format for DB lookups.
 */
export function to10Digit(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  return digits;
}

/**
 * Send an OTP code via SMS to the given phone number.
 * Phone can be 10-digit or E.164 — will be converted automatically.
 */
export async function sendOTP(phone: string) {
  const e164 = toE164(phone);
  const { data, error } = await supabaseClient.auth.signInWithOtp({
    phone: e164,
  });
  if (error) throw error;
  return data;
}

/**
 * Verify an OTP code for the given phone number.
 * Phone can be 10-digit or E.164 — will be converted automatically.
 */
export async function verifyOTP(phone: string, token: string) {
  const e164 = toE164(phone);
  const { data, error } = await supabaseClient.auth.verifyOtp({
    phone: e164,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current auth session.
 */
export async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
}
