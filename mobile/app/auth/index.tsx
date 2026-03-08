import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { sendOTP, verifyOTP, toE164, to10Digit } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * Dev auth bypass — uses email+password instead of phone OTP.
 * Creates real Supabase sessions without Twilio.
 * The "phone" becomes an email: `2165551234@popcle.dev`
 * The "OTP code" is always `000000` in dev mode.
 */
const DEV_EMAIL_DOMAIN = 'popcle.dev';
const DEV_OTP = '000000';

function phoneToDevEmail(phone: string): string {
  return `${phone.replace(/\D/g, '')}@${DEV_EMAIL_DOMAIN}`;
}

type Step = 'phone' | 'otp' | 'name';

/** Max SMS send retries before showing support contact */
const MAX_RETRY_COUNT = 3;

export default function AuthScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const otpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OTP expiry timer: 10 minutes after sending
  useEffect(() => {
    if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    if (step === 'otp' && otpSentAt) {
      const elapsed = Date.now() - otpSentAt;
      const remaining = 10 * 60 * 1000 - elapsed;
      if (remaining <= 0) {
        setOtpExpired(true);
      } else {
        setOtpExpired(false);
        otpTimerRef.current = setTimeout(() => {
          setOtpExpired(true);
        }, remaining);
      }
    }
    return () => {
      if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    };
  }, [step, otpSentAt]);

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
      setOtpSentAt(Date.now());
      setOtpExpired(false);
      setStep('otp');
    } catch (err: unknown) {
      if (__DEV__) {
        // Development only: fall back to email+password bypass
        console.warn('OTP failed, switching to dev mode:', err instanceof Error ? err.message : err);
        setDevMode(true);
        const devEmail = phoneToDevEmail(digits);
        const pw = `dev-${digits}-${Date.now()}-popcle`;
        setDevPassword(pw);
        await supabase.auth.signUp({ email: devEmail, password: pw });
        setOtpSentAt(Date.now());
        setOtpExpired(false);
        setStep('otp');
        setError('Dev mode: enter 000000 as verification code');
      } else {
        // Production: never enable dev mode, show user-friendly error
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        if (nextRetry >= MAX_RETRY_COUNT) {
          setError(
            "We couldn't send your verification code after several attempts. " +
            'Please check your phone number or contact us at info@popculturecle.com',
          );
        } else {
          setError(
            "We couldn't send your verification code. Please check your phone number and try again.",
          );
        }
      }
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

      if (devMode) {
        if (code !== DEV_OTP) {
          setError('Dev mode: code must be 000000');
          setLoading(false);
          return;
        }
        const devEmail = phoneToDevEmail(digits);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword,
        });
        if (signInError) throw signInError;

        // Check if user exists in our users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, user_type')
          .eq('phone', digits)
          .single();

        if (existingUser) {
          // Existing user — auth gate in _layout handles routing
        } else {
          setStep('name');
          setLoading(false);
          return;
        }
      } else {
        // Normal OTP flow
        await verifyOTP(digits, code);

        const { data: existingUser } = await supabase
          .from('users')
          .select('id, user_type')
          .eq('phone', digits)
          .single();

        if (!existingUser) {
          setStep('name');
          setLoading(false);
          return;
        }
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
        phone: digits,
        name: name.trim(),
        user_type: 'customer',
        stamp_count: 0,
        auth_id: session?.user?.id || null,
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
              accessibilityLabel="Enter your 10-digit phone number"
              accessibilityHint="We'll send you a verification code"
            />
            {error ? <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePhoneSubmit}
              disabled={loading || phone.replace(/\D/g, '').length !== 10}
              accessibilityLabel={retryCount > 0 ? 'Retry sending verification code' : 'Send verification code'}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {retryCount > 0 ? 'Retry' : 'Send Code'}
                </Text>
              )}
            </TouchableOpacity>
            {retryCount >= MAX_RETRY_COUNT && (
              <Text style={styles.supportHint}>
                Having trouble? Email info@popculturecle.com
              </Text>
            )}
          </View>
        )}

        {step === 'otp' && (
          <View style={styles.form}>
            {devMode && (
              <View style={{
                backgroundColor: '#ffe600',
                borderWidth: 2,
                borderColor: '#e02020',
                padding: 10,
                borderRadius: 8,
                marginBottom: 12,
              }}>
                <Text style={{
                  color: '#e02020',
                  fontSize: 13,
                  fontWeight: '900',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  ⚠ DEV BUILD ONLY — Enter 000000 ⚠
                </Text>
              </View>
            )}
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
              accessibilityLabel="Enter 6-digit verification code"
            />
            {otpExpired && (
              <View style={{ backgroundColor: 'rgba(255,123,50,0.12)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,123,50,0.3)' }}>
                <Text style={{ color: '#ff7b32', fontWeight: '700', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
                  Code expired. Tap to resend.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#ff7b32', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  onPress={() => {
                    setOtp('');
                    setError('');
                    setOtpExpired(false);
                    setStep('phone');
                    // Auto-trigger resend
                    setTimeout(() => handlePhoneSubmit(), 100);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Resend Code</Text>
                </TouchableOpacity>
              </View>
            )}
            {error ? <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, (loading || otpExpired) && styles.buttonDisabled]}
              onPress={handleOtpSubmit}
              disabled={loading || otp.replace(/\D/g, '').length !== 6 || otpExpired}
              accessibilityLabel="Verify code"
              accessibilityRole="button"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(''); setOtpExpired(false); }}>
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
              accessibilityLabel="Enter your name"
            />
            {error ? <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNameSubmit}
              disabled={loading || !name.trim()}
              accessibilityLabel="Create account"
              accessibilityRole="button"
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
  supportHint: {
    color: 'rgba(31,23,21,0.6)', textAlign: 'center', fontSize: 13,
    fontWeight: '500', marginTop: 4, fontStyle: 'italic',
  },
});
