'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const QRCode = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeCanvas), {
  ssr: false,
  loading: () => <div className="w-64 h-64 bg-muted rounded-lg animate-pulse mx-auto" />,
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [stampCount, setStampCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [nearStore, setNearStore] = useState(false);
  const [wasNearStore, setWasNearStore] = useState(false);
  const [distanceToStore, setDistanceToStore] = useState<number | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.phone) {
      setUserName(user.name || 'Valued Customer');
      fetchStampCount();
      checkGeofence();
      
      // Check geofence every 10 seconds
      const interval = setInterval(checkGeofence, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchStampCount = async () => {
    if (!user?.phone) return;
    try {
      const response = await fetch(`/api/loyalty/stamps?phone=${user.phone}`);
      if (response.ok) {
        const data = await response.json();
        setStampCount(data.stampCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch stamp count:', err);
    }
  };

  const checkGeofence = async () => {
    try {
      const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => reject(new Error('Geolocation denied'))
        );
      });

      // Call the geofence API to track and check location
      const action = !wasNearStore ? 'enter' : nearStore ? undefined : 'exit';
      
      const response = await fetch('/api/geofence/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone,
          latitude: position.latitude,
          longitude: position.longitude,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const isNear = data.nearStore;
        
        setDistanceToStore(data.distance);
        
        // Track state changes for enter/exit triggers
        if (isNear && !wasNearStore) {
          setWasNearStore(true);
        } else if (!isNear && wasNearStore) {
          setWasNearStore(false);
        }
        
        setNearStore(isNear);
      }
    } catch (err) {
      setNearStore(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleClaimReward = async () => {
    if (!user?.phone || stampCount < 10) return;
    
    setClaimLoading(true);
    setClaimMessage(null);
    
    try {
      const response = await fetch('/api/loyalty/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setClaimMessage({ type: 'success', text: data.message });
        setStampCount(0);
        // Refresh stamp count after a delay
        setTimeout(() => {
          fetchStampCount();
          setClaimMessage(null);
        }, 5000);
      } else {
        setClaimMessage({ type: 'error', text: data.error || 'Failed to claim reward' });
      }
    } catch (err) {
      setClaimMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-orange-50 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-foreground/70 font-medium">Loading your loyalty account...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const stepsRemaining = 10 - stampCount;
  const progressPercentage = (stampCount / 10) * 100;
  const isReady = stampCount >= 10;

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
            <Link href="/" className="text-2xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hover:opacity-80 transition-opacity">
              Pop Culture CLE
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-1 rounded hover:bg-primary/10"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-sans font-bold mb-2">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{userName}</span>!
            </h1>
            <p className="text-lg text-foreground/70">Your loyalty account is active</p>
            <p className="text-sm text-foreground/60">Phone: {user.phone}</p>
          </section>

          {/* Geofence Alert */}
          {nearStore && (
            <section className="card-vibrant bg-gradient-to-r from-secondary/20 via-teal-100/30 to-transparent p-6 border-2 border-secondary/50 animate-glow">
              <p className="font-semibold text-secondary text-lg text-center flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">📍</span>
                You're near Pop Culture CLE! Check offers and special deals!
              </p>
              {distanceToStore && (
                <p className="text-sm text-secondary/80 text-center mt-2">
                  {distanceToStore < 100 ? "You're at the store!" : `${distanceToStore}m away`}
                </p>
              )}
              <div className="mt-4 flex justify-center">
                <Link href="/offers">
                  <button className="btn-secondary-glow text-sm px-6">
                    View Special Offers
                  </button>
                </Link>
              </div>
            </section>
          )}

          {/* Stamp Counter - Main Visual */}
          <section className="card-vibrant bg-white p-8 md:p-12 text-center shadow-2xl">
            <div className="mb-8">
              <p className="text-sm font-medium text-foreground/70 mb-4 uppercase tracking-widest">Current Progress</p>
              
              {/* Circular Progress Ring */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48 md:w-56 md:h-56">
                  {/* Background Circle */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-border"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgb(76, 175, 158)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgb(139, 58, 98)', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl md:text-6xl font-sans font-bold text-primary">{stampCount}</span>
                    <span className="text-lg font-semibold text-foreground/70 mt-1">/ 10 Stamps</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mb-8">
                {isReady ? (
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-teal-500 text-white rounded-full font-bold text-lg animate-bounce-in shadow-lg">
                    🎉 Ready for Free Item!
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-foreground">
                    {stepsRemaining === 1 ? 'Just 1 more stamp!' : `${stepsRemaining} stamps to go!`}
                  </p>
                )}
              </div>

              {/* Stamps Grid */}
              <div className="flex justify-center gap-2 flex-wrap mb-8">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-sans font-bold text-lg flex items-center justify-center transition-all transform ${
                      idx < stampCount
                        ? 'bg-gradient-to-br from-secondary to-teal-500 text-white scale-110 shadow-lg'
                        : 'bg-border text-foreground/40'
                    }`}
                    style={{
                      animation: idx < stampCount ? `stamp-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.1}s backwards` : 'none',
                    }}
                  >
                    {idx < stampCount ? '✓' : idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Claim Message */}
              {claimMessage && (
                <div className={`p-4 rounded-lg text-center animate-bounce-in ${
                  claimMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-300 text-green-700' 
                    : 'bg-red-50 border border-red-300 text-red-700'
                }`}>
                  <p className="font-bold">{claimMessage.text}</p>
                </div>
              )}

              {isReady && !claimMessage && (
                <button 
                  onClick={handleClaimReward}
                  disabled={claimLoading}
                  className="btn-accent-glow w-full shadow-lg animate-bounce-in disabled:opacity-50"
                >
                  {claimLoading ? 'Claiming...' : '🎁 Claim Free Item'}
                </button>
              )}
              <button 
                onClick={() => setShowQR(!showQR)}
                className="btn-primary-glow w-full shadow-lg"
              >
                {showQR ? '👁 Hide QR Code' : '👁 Show QR Code'}
              </button>
            </div>
          </section>

          {/* QR Code Section */}
          {showQR && (
            <section className="card-vibrant bg-white p-8 md:p-12 text-center shadow-2xl animate-bounce-in">
              <h2 className="text-2xl font-sans font-bold mb-2">Your Loyalty QR Code</h2>
              <p className="text-foreground/70 mb-8">Show this to staff to add stamps to your account</p>

              {/* Ornate QR Frame */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-accent/20 to-secondary/20 p-8 rounded-2xl border-4 border-primary/30 shadow-lg">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <QRCode
                      value={user.phone}
                      size={256}
                    />
                  </div>
                  <p className="text-sm font-semibold text-primary mt-4 uppercase tracking-wider">Scan to Add Stamps</p>
                </div>
              </div>

              <p className="text-xs text-foreground/60 max-w-md mx-auto">
                Each visit to Pop Culture CLE gets you a scan. Ten scans equals one free gourmet ice cream popsicle!
              </p>
            </section>
          )}

          {/* Store Info Section */}
          <section className="card-vibrant bg-white overflow-hidden border border-border/50">
            <div className="relative h-40 overflow-hidden">
              <img 
                src="/images/patio.jpg"
                alt="Pop Culture CLE outdoor seating"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-sans font-bold">Visit Our Store</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-foreground/70 mb-4 text-lg font-semibold">
                📍 33549 Solon Rd, Solon, OH 44139
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:+12162457316"
                  className="px-6 py-3 bg-gradient-to-r from-accent to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all hover:scale-105"
                >
                  📞 Call: (216) 245-7316
                </a>
                <a
                  href="https://maps.google.com/?q=33549+Solon+Rd,+Solon,+OH+44139"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-secondary to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-secondary/50 transition-all hover:scale-105"
                >
                  📍 Get Directions
                </a>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/offers">
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg font-semibold text-foreground hover:shadow-lg transition-all hover:scale-105 border border-border/50">
                🎁 View Special Offers
              </button>
            </Link>
            <Link href="/">
              <button className="w-full sm:w-auto px-6 py-3 bg-white rounded-lg font-semibold text-foreground/70 hover:shadow-lg transition-all hover:scale-105 border border-border/50">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
