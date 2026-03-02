'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [stampCount, setStampCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [nearStore, setNearStore] = useState(false);

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

      // Solon, OH: 33549 Solon Rd (41.4384° N, 81.4096° W)
      const storeLatitude = 41.4384;
      const storeLongitude = -81.4096;
      const radiusKm = 0.5; // 500 meters

      const R = 6371;
      const dLat = ((position.latitude - storeLatitude) * Math.PI) / 180;
      const dLon = ((position.longitude - storeLongitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((storeLatitude * Math.PI) / 180) *
          Math.cos((position.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      setNearStore(distance < radiusKm);
    } catch (err) {
      setNearStore(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
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
    <main className="min-h-screen bg-background pb-8">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/50 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-secondary/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold text-primary hover:opacity-80 transition-opacity">
              Pop Culture CLE
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded hover:bg-primary/10"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{userName}</span>!
            </h1>
            <p className="text-lg text-foreground/70">Your loyalty account is active</p>
            <p className="text-sm text-foreground/60">Phone: {user.phone}</p>
          </section>

          {/* Geofence Alert */}
          {nearStore && (
            <section className="card-vibrant bg-gradient-to-r from-secondary/20 via-accent/20 to-transparent p-6 border-2 border-secondary/50 geofence-active">
              <p className="font-semibold text-secondary text-lg text-center flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">📍</span>
                You're near Pop Culture CLE! Check offers and special deals!
              </p>
            </section>
          )}

          {/* Stamp Counter - Main Visual */}
          <section className="card-vibrant bg-card p-8 md:p-12 text-center shadow-2xl border border-border">
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
                        <stop offset="0%" style={{ stopColor: '#f5d547', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#e84a8a', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#5dd9d9', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl md:text-6xl font-display font-bold text-primary">{stampCount}</span>
                    <span className="text-lg font-semibold text-foreground/70 mt-1">/ 10 Stamps</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mb-8">
                {isReady ? (
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-full font-bold text-lg animate-bounce-in shadow-lg">
                    Ready for Free Item!
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
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-display font-bold text-lg flex items-center justify-center transition-all transform ${
                      idx < stampCount
                        ? 'bg-gradient-to-br from-secondary to-accent text-white scale-110 shadow-lg'
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
              {isReady && (
                <button className="btn-accent-glow w-full shadow-lg animate-bounce-in">
                  🎁 Claim Free Item
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
            <section className="card-vibrant bg-card p-8 md:p-12 text-center shadow-2xl animate-bounce-in border border-border">
              <h2 className="text-2xl font-display font-bold mb-2">Your Loyalty QR Code</h2>
              <p className="text-muted-foreground mb-8">Show this to staff to add stamps to your account</p>

              {/* Ornate QR Frame */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-2xl border-4 border-primary/30 shadow-lg">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <QRCodeCanvas
                      value={user.phone}
                      size={256}
                      level="H"
                      includeMargin={true}
                      fgColor="#0f0a1a"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <p className="text-sm font-semibold text-primary mt-4 uppercase tracking-wider">Scan to Add Stamps</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Each visit to Pop Culture CLE gets you a scan. Ten scans equals one free reward!
              </p>
            </section>
          )}

          {/* Store Info Section */}
          <section className="card-vibrant bg-gradient-to-br from-secondary/10 to-accent/10 p-8 text-center border border-border">
            <h3 className="text-xl font-display font-bold mb-4">Visit Our Store</h3>
            <p className="text-foreground/80 mb-6 text-lg font-semibold">
              33549 Solon Rd, Solon, OH 44139
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+12162457316"
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all hover:scale-105"
              >
                Call: (216) 245-7316
              </a>
              <a
                href="mailto:info@popculturecle.com"
                className="px-6 py-3 bg-gradient-to-r from-secondary to-accent text-secondary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-secondary/50 transition-all hover:scale-105"
              >
                Email Us
              </a>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-sm text-foreground/60">
            <Link href="/" className="text-primary hover:text-secondary transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
