import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { sendOTP, verifyOTP, toE164, to10Digit } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Step = 'phone' | 'otp' | 'name';

export default function AuthScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneSubmit = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOTP(digits);
      setStep('otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    const code = otp.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const digits = phone.replace(/\D/g, '');
      await verifyOTP(digits, code);

      // Check if user exists in DB
      const { data: user } = await supabase
        .from('users')
        .select('id, user_type')
        .eq('phone', digits)
        .single();

      if (user) {
        // Existing user — role routing handled by _layout
      } else {
        // New user — collect name
        setStep('name');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const digits = phone.replace(/\D/g, '');
      const { data: { session } } = await supabase.auth.getSession();

      await supabase.from('users').insert([{
        id: session?.user.id,
        phone: digits,
        name: name.trim(),
        user_type: 'customer',
        stamp_count: 0,
        created_at: new Date().toISOString(),
      }]);
      // Role routing handled by _layout after user created
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Pop Culture CLE</Text>
          <Text style={styles.logoSub}>Loyalty Program</Text>
        </View>

        {step === 'phone' && (
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(v) => setPhone(formatPhone(v))}
              placeholder="(555) 123-4567"
              placeholderTextColor="rgba(31,23,21,0.35)"
              keyboardType="phone-pad"
              autoFocus
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePhoneSubmit}
              disabled={loading || phone.replace(/\D/g, '').length !== 10}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 'otp' && (
          <View style={styles.form}>
            <Text style={styles.label}>Verification Code</Text>
            <Text style={styles.hint}>Sent to {phone}</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor="rgba(31,23,21,0.35)"
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleOtpSubmit}
              disabled={loading || otp.replace(/\D/g, '').length !== 6}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(''); }}>
              <Text style={styles.link}>Change Number</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'name' && (
          <View style={styles.form}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="First name or nickname"
              placeholderTextColor="rgba(31,23,21,0.35)"
              autoFocus
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNameSubmit}
              disabled={loading || !name.trim()}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff9f5' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },

  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logo: {
    fontSize: 38, fontWeight: '800',
    color: '#ff3b8d', letterSpacing: -1,
    textAlign: 'center',
  },
  logoSub: {
    fontSize: 14, fontWeight: '600',
    color: 'rgba(31,23,21,0.55)', marginTop: 4, letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  form: { gap: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1f1715', letterSpacing: 0.5, textTransform: 'uppercase' },
  hint: { fontSize: 12, color: 'rgba(31,23,21,0.55)', marginTop: -8 },

  input: {
    borderWidth: 2.5, borderColor: '#1f1715', borderRadius: 14,
    padding: 16, fontSize: 17, color: '#1f1715', backgroundColor: '#fff',
    fontWeight: '500',
  },
  otpInput: {
    textAlign: 'center', letterSpacing: 14, fontSize: 28,
    fontWeight: '800', color: '#ff3b8d',
  },

  error: {
    color: '#e02020', fontSize: 14, fontWeight: '600',
    backgroundColor: 'rgba(224,32,32,0.08)', padding: 10,
    borderRadius: 8, overflow: 'hidden',
  },

  button: {
    backgroundColor: '#ff3b8d', borderRadius: 14,
    padding: 17, alignItems: 'center', marginTop: 8,
    shadowColor: '#ff3b8d', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38, shadowRadius: 12, elevation: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  link: { color: '#ff3b8d', textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: 8 },
});
