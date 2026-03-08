'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { sendOTP, verifyOTP, to10Digit } from '@/lib/auth';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmployee = searchParams.get('mode') === 'employee';

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [useSupabaseAuth, setUseSupabaseAuth] = useState(true);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Focus OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp') {
      otpInputRef.current?.focus();
    }
  }, [step]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      if (useSupabaseAuth) {
        // Send OTP via Supabase (Twilio)
        await sendOTP(digits);
        setResendCooldown(60);
        setStep('otp');
      } else {
        // Fallback: localStorage flow (no OTP)
        await handleLegacyPhoneSubmit(digits);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      // If Supabase phone auth fails (Twilio not configured), fall back gracefully
      if (useSupabaseAuth && (
        message.includes('not enabled') ||
        message.includes('provider') ||
        message.includes('twilio') ||
        message.includes('sms') ||
        message.includes('Phone signups')
      )) {
        console.warn('Supabase Phone Auth not available, falling back to localStorage auth:', message);
        setUseSupabaseAuth(false);
        setError('SMS verification is being set up. Using quick sign-in for now.');
        // Automatically try legacy flow
        try {
          await handleLegacyPhoneSubmit(digits);
        } catch (legacyErr) {
          setError(legacyErr instanceof Error ? legacyErr.message : 'Something went wrong');
        }
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Legacy localStorage-based phone verification (no OTP)
  const handleLegacyPhoneSubmit = async (digits: string) => {
    const response = await fetch('/api/auth/verify-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits, isEmployee }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify phone');
    }

    const { exists, name: userName, userType } = await response.json();

    if (exists) {
      localStorage.setItem('userPhone', digits);
      if (userName) localStorage.setItem('userName', userName);
      localStorage.setItem('userMode', userType || (isEmployee ? 'employee' : 'customer'));
      router.push((userType === 'employee' || isEmployee) ? '/dashboard/scan' : '/dashboard');
    } else {
      setStep('name');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otpCode.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, '');
      await verifyOTP(digits, code);

      // OTP verified — check if user exists in DB
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, isEmployee, supabaseVerified: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify phone');
      }

      const { exists, name: userName, userType } = await response.json();

      if (exists) {
        localStorage.setItem('userPhone', digits);
        if (userName) localStorage.setItem('userName', userName);
        localStorage.setItem('userMode', userType || (isEmployee ? 'employee' : 'customer'));
        router.push((userType === 'employee' || isEmployee) ? '/dashboard/scan' : '/dashboard');
      } else {
        // New user — need name
        setStep('name');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, '');
      await sendOTP(digits);
      setResendCooldown(60);
      setOtpCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, '');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digits,
          name: name.trim(),
          isEmployee,
          supabaseVerified: useSupabaseAuth,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      localStorage.setItem('userPhone', digits);
      localStorage.setItem('userName', name.trim());
      localStorage.setItem('userMode', isEmployee ? 'employee' : 'customer');
      router.push(isEmployee ? '/dashboard/scan' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/50 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary animate-neon-pulse">
              Pop Culture CLE
            </h1>
          </Link>
          <p className="text-foreground/80 font-medium">
            {isEmployee ? 'Employee Scanner' : 'Loyalty Program'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isEmployee ? 'Scan customer QR codes to add stamps' : 'Earn stamps, get free rewards'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-vibrant bg-card backdrop-blur-md p-8 md:p-10 shadow-2xl border border-border">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-3">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:outline-none text-lg bg-input min-h-[44px] transition-colors font-medium"
                  autoFocus
                  autoComplete="tel"
                />
                <p className="text-xs text-foreground/60 mt-2">
                  {isEmployee
                    ? 'Your employee phone number'
                    : useSupabaseAuth
                      ? "We'll send a verification code to this number"
                      : 'We use this to track your loyalty account'}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium animate-bounce-in">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="btn-primary-glow w-full shadow-lg"
              >
                {loading
                  ? useSupabaseAuth ? 'Sending Code...' : 'Verifying...'
                  : useSupabaseAuth ? 'Send Verification Code' : 'Continue'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              <Link href="/" className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-secondary text-secondary hover:bg-secondary/10 font-medium"
                >
                  Back Home
                </Button>
              </Link>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-foreground mb-3">
                  Verification Code
                </label>
                <input
                  ref={otpInputRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:outline-none text-2xl text-center tracking-[0.5em] bg-input min-h-[44px] transition-colors font-bold font-mono"
                  autoComplete="one-time-code"
                />
                <div className="mt-3 p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-xs text-foreground/70 font-medium">
                    Code sent to: <span className="font-semibold text-foreground">{phone}</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium animate-bounce-in">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || otpCode.replace(/\D/g, '').length !== 6}
                className="btn-primary-glow w-full shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className={`text-sm font-medium transition-colors py-2 ${
                    resendCooldown > 0
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'text-primary hover:text-primary/80 cursor-pointer'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpCode('');
                    setError('');
                  }}
                  className="text-sm text-foreground/60 hover:text-primary transition-colors font-medium py-2"
                >
                  Change Number
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-3">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name or nickname"
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-secondary focus:outline-none text-lg bg-input min-h-[44px] transition-colors font-medium"
                  autoFocus
                  autoComplete="name"
                />
                <div className="mt-3 p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-xs text-foreground/70 font-medium">
                    Phone: <span className="font-semibold text-foreground">{phone}</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium animate-bounce-in">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="btn-primary-glow w-full shadow-lg"
              >
                {loading ? 'Creating...' : 'Create Account & Continue'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError('');
                }}
                className="w-full text-sm text-foreground/60 hover:text-primary transition-colors font-medium py-2"
              >
                Use Different Phone
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-8 space-y-2 text-center text-xs text-muted-foreground">
          <p className="font-medium text-accent">Secure & Private</p>
          <p>Your data is encrypted and never shared</p>
          <p className="text-muted-foreground/50">Pop Culture CLE</p>
        </div>
      </div>
    </main>
  );
}

// Loading fallback for Suspense
function AuthLoading() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">...</div>
        <p className="text-muted-foreground font-medium">Loading...</p>
      </div>
    </main>
  );
}

// Main export wrapped in Suspense for useSearchParams
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  );
}
