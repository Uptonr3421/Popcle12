'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmployee = searchParams.get('mode') === 'employee';
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'name'>('phone');

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
        // Phone exists, go to dashboard
        localStorage.setItem('userPhone', digits);
        if (userName) localStorage.setItem('userName', userName);
        localStorage.setItem('userMode', userType || (isEmployee ? 'employee' : 'customer'));
        router.push((userType === 'employee' || isEmployee) ? '/dashboard/scan' : '/dashboard');
      } else {
        // New user, need name
        setStep('name');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
          isEmployee 
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
                  {isEmployee ? 'Your employee phone number' : 'We use this to track your loyalty account'}
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
                {loading ? '✓ Verifying...' : 'Continue →'}
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
                  ← Back Home
                </Button>
              </Link>
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
                {loading ? '✓ Creating...' : 'Create Account & Continue →'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                className="w-full text-sm text-foreground/60 hover:text-primary transition-colors font-medium py-2"
              >
                ← Use Different Phone
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
