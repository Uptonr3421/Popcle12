'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoLandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(1), 400),
      setTimeout(() => setIntroPhase(2), 1400),
      setTimeout(() => setIntroPhase(3), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (showIntro) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, [showIntro]);

  const features = [
    {
      title: 'Digital Loyalty Cards',
      description: 'Replace paper punch cards forever. Customers earn stamps automatically with every purchase - no more lost cards.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      title: 'Instant QR Scanning',
      description: 'Staff scans customer codes in 2 seconds flat. Works on any smartphone - no special hardware needed.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      title: 'Customer Insights',
      description: 'See who your best customers are, track visit patterns, and make smarter business decisions with real data.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Smart Notifications',
      description: 'Send special offers when customers are nearby. Bring them back with perfectly timed reminders.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  // Personal intro screen for Nicole
  if (showIntro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl transition-all duration-[2000ms] ${introPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        </div>

        <div className="relative z-10 max-w-md mx-auto text-center">
          <div className={`transition-all duration-1000 ${introPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-foreground/90 text-xl md:text-2xl leading-relaxed font-light">
              {'"'}This one{"'"}s for you, Nicole.
            </p>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mt-6">
              You{"'"}ve already built something Cleveland loves — now let{"'"}s make it even easier for them to come back.
            </p>
            <p className="text-primary text-2xl md:text-3xl font-bold mt-8">
              Welcome to Pop Culture CLE.
            </p>
          </div>

          <div className={`mt-14 transition-all duration-1000 ${introPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-foreground font-medium text-lg">
              — Upton Rand
            </p>
            <p className="text-primary/80 font-medium mt-1">
              Alignment AI
            </p>
            <a 
              href="mailto:Contact@alignment-ai.io" 
              className="text-muted-foreground text-sm hover:text-primary transition-colors mt-2 inline-block"
            >
              Contact@alignment-ai.io
            </a>
          </div>

          <div className={`mt-12 transition-all duration-1000 ${introPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Button
              size="lg"
              onClick={() => setShowIntro(false)}
              className="px-10 py-6 text-lg font-semibold rounded-full"
            >
              View Your App
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
              alt="Pop Culture CLE"
              className="w-9 h-9 rounded-full object-cover border-2 border-primary/30"
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">Pop Culture CLE</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</a>
            <Link href="/auth">
              <Button size="sm" className="rounded-full px-4">
                Try App
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-6">
                <span className="text-primary text-sm font-medium">Built for Pop Culture CLE</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Turn every visit into lasting loyalty
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                A digital rewards program that keeps customers coming back. No paper cards. No lost stamps. Just simple, powerful loyalty.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-full">
                    Try the Demo
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base rounded-full">
                    See Features
                  </Button>
                </a>
              </div>
            </div>
            
            {/* Store Images Grid */}
            <div className="flex-1 w-full max-w-md">
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
                    alt="Pop Culture CLE"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/81ccd041-ddbb-4a54-95b2-e2609a59427d.jpeg"
                    alt="Store Interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c4d27db8-4d52-48b1-a5d2-ccc0160d0509.jpeg"
                    alt="Collectibles"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a8db6a6b-90e0-4e76-aae4-d559eb291f50.jpeg"
                    alt="Products"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10x', label: 'More repeat visits' },
              { value: '85%', label: 'Customer retention' },
              { value: '2 sec', label: 'Scan time' },
              { value: '$0', label: 'Hardware cost' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything you need
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              A complete loyalty solution built specifically for your store
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div 
                key={feature.title}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  activeFeature === idx 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-card border-border hover:border-primary/20'
                }`}
                onClick={() => setActiveFeature(idx)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  activeFeature === idx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 md:py-24 px-4 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Try it yourself
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Experience the app exactly as your customers and staff will
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Link 
              href="/auth"
              className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">Customer View</h3>
              <p className="text-sm text-muted-foreground mb-3">See loyalty card, stamps & QR code</p>
              <span className="text-primary text-sm font-medium group-hover:underline">Try as customer</span>
            </Link>

            <Link 
              href="/auth?mode=employee"
              className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">Employee Scanner</h3>
              <p className="text-sm text-muted-foreground mb-3">Scan codes & add stamps</p>
              <span className="text-primary text-sm font-medium group-hover:underline">Try as employee</span>
            </Link>

            <Link 
              href="/admin"
              className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">Owner Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-3">Manage customers & offers</p>
              <span className="text-primary text-sm font-medium group-hover:underline">Try as owner</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Simple for everyone
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Customer signs up', desc: 'Quick phone registration. No app download required.' },
              { step: '2', title: 'Show QR at checkout', desc: 'Staff scans the code. Stamp added instantly.' },
              { step: '3', title: 'Earn free rewards', desc: '10 stamps = 1 free item. They keep coming back.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Features List */}
      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What{"'"}s included
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 max-w-3xl mx-auto">
            {[
              'Digital loyalty cards for all customers',
              'QR code scanning from any smartphone',
              'Real-time stamp tracking',
              'Customer visit analytics',
              'Automatic reward redemption',
              'Push notifications (coming soon)',
              'Location-based offers',
              'Admin dashboard',
              'Employee scanner mode',
              'Customer database',
              'Export customer data',
              'iPhone app ready',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 py-2">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to reward your customers?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            This app is built and ready for Pop Culture CLE. Let{"'"}s launch it together.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-full">
                Try the Full Demo
              </Button>
            </Link>
            <a href="mailto:Contact@alignment-ai.io">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base rounded-full">
                Contact Alignment AI
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
                alt="Pop Culture CLE"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-foreground">Pop Culture CLE</span>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-muted-foreground">
                Built by{' '}
                <a href="https://alignment-ai.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Alignment AI
                </a>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                33549 Solon Rd, Solon, OH 44139
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
