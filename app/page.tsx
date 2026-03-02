'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  useEffect(() => {
    // Animate splash screen phases
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300),
      setTimeout(() => setAnimationPhase(2), 600),
      setTimeout(() => setAnimationPhase(3), 900),
      setTimeout(() => setAnimationPhase(4), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnterApp = () => {
    setShowSplash(false);
  };

  const handleDemoSelect = (demo: string) => {
    setSelectedDemo(demo);
    setTimeout(() => {
      router.push(demo);
    }, 300);
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-background overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Comic book halftone dots */}
          <div className="absolute inset-0 halftone-overlay opacity-30" />
          
          {/* Floating geometric shapes */}
          <div 
            className={`absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-xl transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ animationDelay: '0.2s' }}
          />
          <div 
            className={`absolute top-40 right-20 w-48 h-48 bg-secondary/30 rounded-full blur-xl transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ animationDelay: '0.4s' }}
          />
          <div 
            className={`absolute bottom-32 left-20 w-40 h-40 bg-accent/30 rounded-full blur-xl transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ animationDelay: '0.6s' }}
          />
          
          {/* Comic burst stars */}
          {animationPhase >= 2 && (
            <>
              <div className="absolute top-20 right-10 text-6xl animate-float-rotate" style={{ animationDelay: '0s' }}>
                <span className="text-primary">{'★'}</span>
              </div>
              <div className="absolute top-60 left-8 text-4xl animate-float-rotate" style={{ animationDelay: '0.5s' }}>
                <span className="text-secondary">{'★'}</span>
              </div>
              <div className="absolute bottom-40 right-16 text-5xl animate-float-rotate" style={{ animationDelay: '1s' }}>
                <span className="text-accent">{'★'}</span>
              </div>
            </>
          )}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8">
          {/* Hero Image */}
          <div className={`mb-8 transition-all duration-700 ${animationPhase >= 1 ? 'animate-splash-zoom' : 'opacity-0 scale-110'}`}>
            <div className="relative w-64 h-40 md:w-80 md:h-48 mx-auto rounded-2xl overflow-hidden border-4 border-primary/50 shadow-2xl shadow-primary/30">
              <img 
                src="/images/pop-culture-hero.jpg"
                alt="Pop Culture CLE - Comics, Vinyl & Collectibles"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          </div>

          {/* Logo burst */}
          <div className={`mb-6 transition-all duration-700 ${animationPhase >= 2 ? 'animate-comic-burst' : 'opacity-0 scale-0'}`}>
            <div className="relative">
              {/* Comic burst background */}
              <svg className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)]" viewBox="0 0 200 200">
                <polygon 
                  points="100,10 120,80 190,80 135,120 155,190 100,150 45,190 65,120 10,80 80,80" 
                  fill="url(#burstGradient)" 
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="burstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="var(--secondary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Store logo */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/50 mx-auto">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
                  alt="Pop Culture CLE"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Brand name with comic style */}
          <div className={`text-center mb-4 transition-all duration-500 ${animationPhase >= 3 ? 'animate-splash-slide' : 'opacity-0 translate-y-10'}`}>
            <h1 className="comic-text text-5xl md:text-7xl text-primary animate-neon-pulse comic-shadow">
              POP CULTURE
            </h1>
            <h2 className="comic-text text-3xl md:text-5xl text-secondary -mt-1">
              CLE
            </h2>
          </div>

          {/* Tagline */}
          <div className={`text-center mb-8 transition-all duration-500 delay-200 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-lg md:text-xl text-foreground/80 font-medium max-w-xs mx-auto">
              Comics, Vinyl, Collectibles & More
            </p>
            <p className="text-accent text-sm mt-2 font-semibold">
              Solon, Ohio
            </p>
          </div>

          {/* Loyalty badge */}
          <div className={`mb-10 transition-all duration-500 delay-300 ${animationPhase >= 4 ? 'animate-comic-burst' : 'opacity-0 scale-0'}`}>
            <div className="bg-card border-2 border-primary/50 rounded-2xl px-6 py-3 shadow-lg shadow-primary/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎫</span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Loyalty Rewards</p>
                  <p className="text-primary font-bold text-lg">10 Stamps = FREE Item</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enter button */}
          <div className={`transition-all duration-500 delay-500 ${animationPhase >= 4 ? 'animate-splash-slide' : 'opacity-0 translate-y-10'}`}>
            <button
              onClick={handleEnterApp}
              className="group relative px-12 py-4 bg-gradient-to-r from-primary via-secondary to-accent rounded-full font-bold text-lg text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-secondary/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter App Preview
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-accent to-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Business info footer */}
          <div className={`mt-12 text-center transition-all duration-500 delay-700 ${animationPhase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-muted-foreground text-sm">
              33549 Solon Rd, Solon, OH 44139
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              (216) 245-7316
            </p>
          </div>
        </div>
      </div>
    );
  }

  // App Preview Selection Screen
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
                alt="Pop Culture CLE"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-primary text-lg">Pop Culture CLE</h1>
              <p className="text-xs text-muted-foreground">App Preview Mode</p>
            </div>
          </div>
          <button
            onClick={() => setShowSplash(true)}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Back
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Welcome message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome, Store Owner!
          </h2>
          <p className="text-muted-foreground">
            Test your loyalty app features below. Each demo is fully functional.
          </p>
        </div>

        {/* Demo Cards */}
        <div className="space-y-4">
          {/* Customer Experience */}
          <button
            onClick={() => handleDemoSelect('/auth')}
            className={`w-full text-left group transition-all duration-300 ${selectedDemo === '/auth' ? 'scale-95 opacity-50' : ''}`}
          >
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/30 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-2xl shrink-0">
                  📱
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    Customer Experience
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign up, view stamps, scan QR codes, and redeem rewards
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">Sign Up</span>
                    <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">QR Code</span>
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">Stamps</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Employee Scanner */}
          <button
            onClick={() => handleDemoSelect('/auth?mode=employee')}
            className={`w-full text-left group transition-all duration-300 ${selectedDemo === '/auth?mode=employee' ? 'scale-95 opacity-50' : ''}`}
          >
            <div className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl p-6 border border-secondary/30 hover:border-secondary/60 hover:shadow-xl hover:shadow-secondary/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-2xl shrink-0">
                  📷
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-secondary transition-colors">
                    Employee Scanner
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scan customer QR codes and add stamps to their accounts
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">Camera</span>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">Add Stamps</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={() => handleDemoSelect('/admin')}
            className={`w-full text-left group transition-all duration-300 ${selectedDemo === '/admin' ? 'scale-95 opacity-50' : ''}`}
          >
            <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-6 border border-accent/30 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center text-2xl shrink-0">
                  ⚙️
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                    Admin Dashboard
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage customers, create offers, and view analytics
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">Customers</span>
                    <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">Offers</span>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">Analytics</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Geofence Offers */}
          <button
            onClick={() => handleDemoSelect('/offers')}
            className={`w-full text-left group transition-all duration-300 ${selectedDemo === '/offers' ? 'scale-95 opacity-50' : ''}`}
          >
            <div className="bg-gradient-to-br from-purple-500/20 to-secondary/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  📍
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-purple-400 transition-colors">
                    Geofence Offers
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Location-based deals that activate near your store
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">GPS</span>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">Deals</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Product showcase */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center">Your Products</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c4d27db8-4d52-48b1-a5d2-ccc0160d0509.jpeg', alt: 'Colorful popsicle' },
              { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a8db6a6b-90e0-4e76-aae4-d559eb291f50.jpeg', alt: 'Ice cream cones' },
              { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/81ccd041-ddbb-4a54-95b2-e2609a59427d.jpeg', alt: 'Storefront' },
            ].map((img, idx) => (
              <div 
                key={idx} 
                className="aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors hover:scale-105 duration-300"
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Features summary */}
        <div className="mt-10 bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-bold text-foreground mb-4 text-center">App Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🎫', label: 'Digital Stamps' },
              { icon: '📱', label: 'QR Codes' },
              { icon: '📍', label: 'Geofencing' },
              { icon: '🔔', label: 'Push Alerts' },
              { icon: '🎁', label: 'Rewards' },
              { icon: '📊', label: 'Analytics' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-foreground/80">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Pop Culture CLE</p>
          <p>33549 Solon Rd, Solon, OH 44139</p>
          <p>(216) 245-7316</p>
        </div>
      </main>
    </div>
  );
}
