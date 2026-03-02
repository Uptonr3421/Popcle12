'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedName, setScannedName] = useState<string>('');
  const [loading2, setLoading2] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?mode=employee');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isScannerActive || !user) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    );

    const handleScan = async (decodedText: string) => {
      // Stop scanner while processing
      scanner.pause();
      setScanResult(decodedText);
      
      try {
        const response = await fetch('/api/loyalty/add-stamp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            customerPhone: decodedText,
            employeePhone: user.phone 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setScannedName(data.customerName || 'Customer');
          setMessage({ 
            type: 'success', 
            text: `Stamp added for ${data.customerName}! Total: ${data.newStampCount}/10` 
          });
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to add stamp' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error scanning. Please try again.' });
      }

      // Resume scanner after 3 seconds
      setTimeout(() => {
        scanner.resume();
        setScanResult(null);
      }, 3000);
    };

    const handleError = (error: any) => {
      console.error('QR scan error:', error);
    };

    try {
      scanner.render(handleScan, handleError);
      scannerRef.current = scanner;
    } catch (err) {
      console.error('Scanner init error:', err);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isScannerActive, user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-orange-50 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-foreground/70 font-medium">Loading scanner...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-orange-50 to-background pb-8">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hover:opacity-80 transition-opacity">
              Pop Culture CLE
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground/70">👤 {user.name || 'Employee'}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-1 rounded hover:bg-primary/10"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Title */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Stamp Scanner</span>
            </h1>
            <p className="text-lg text-foreground/70">Scan customer QR codes to add stamps</p>
          </section>

          {/* Message Display */}
          {message && (
            <div className={`card-vibrant p-4 text-center animate-bounce-in border-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-700' 
                : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              <p className="font-bold text-lg">
                {message.type === 'success' ? '✓' : '✕'} {message.text}
              </p>
            </div>
          )}

          {/* Scanner Container */}
          <div className="card-vibrant bg-white p-6 md:p-8 shadow-2xl">
            <div className="mb-4">
              <p className="text-sm text-foreground/70 text-center font-medium mb-4">
                Position QR code in the frame below
              </p>
              <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-primary/30 shadow-md"></div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <Button
                onClick={() => setIsScannerActive(!isScannerActive)}
                className={`w-full ${isScannerActive ? 'btn-accent-glow' : 'btn-primary-glow'}`}
              >
                {isScannerActive ? '⏸ Pause Scanner' : '▶ Resume Scanner'}
              </Button>
              <Link href="/dashboard" className="block">
                <Button type="button" variant="outline" className="w-full border-2 border-secondary text-secondary hover:bg-secondary/10 font-medium">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="card-vibrant bg-gradient-to-br from-secondary/10 to-teal-100/20 p-6 border border-border/50">
            <h3 className="font-display font-bold text-lg mb-3 text-foreground">How to Use:</h3>
            <ol className="space-y-2 text-sm text-foreground/80">
              <li>1. Ask customer to show their loyalty QR code</li>
              <li>2. Point camera at the QR code</li>
              <li>3. System will automatically scan and add a stamp</li>
              <li>4. Confirmation message will appear</li>
              <li>5. Ready to scan the next customer!</li>
            </ol>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-foreground/60">
            <p className="font-medium mb-1">Pop Culture CLE Employee Mode</p>
            <p>Scanner will automatically add stamps to customer accounts</p>
          </div>
        </div>
      </div>
    </main>
  );
}
