import { supabase } from './supabase';

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.startsWith('+')) return phone;
  return `+${digits}`;
}

export function to10Digit(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits.length === 10 ? digits : digits;
}

export async function sendOTP(phone: string) {
  const e164 = toE164(phone);
  const { data, error } = await supabase.auth.signInWithOtp({ phone: e164 });
  if (error) throw error;
  return data;
}

export async function verifyOTP(phone: string, token: string) {
  const e164 = toE164(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: e164,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getRole(userId: string): Promise<string> {
  const { data } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single();
  return data?.user_type ?? 'customer';
}

export async function getUserRecord(phone: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  return data;
}
