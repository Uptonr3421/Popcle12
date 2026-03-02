'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState(0);
  const [activeScreen, setActiveScreen] = useState<'home' | 'loyalty' | 'scan' | 'rewards'>('home');
  const [stamps, setStamps] = useState(6);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(1), 400),
      setTimeout(() => setIntroPhase(2), 1400),
      setTimeout(() => setIntroPhase(3), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Personal intro screen for Nicole
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-3xl transition-all duration-[2000ms] ${introPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        </div>

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <div className={`transition-all duration-1000 ${introPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-white/90 text-xl md:text-2xl leading-relaxed font-light">
              {'"'}This one{"'"}s for you, Nicole.
            </p>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed mt-6">
              You{"'"}ve already built something Cleveland loves — now let{"'"}s make it even easier for them to come back.
            </p>
            <p className="text-yellow-400 text-2xl md:text-3xl font-bold mt-8">
              Welcome to Pop Culture CLE.
            </p>
          </div>

          <div className={`mt-14 transition-all duration-1000 ${introPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-white font-medium text-lg">
              — Upton Rand
            </p>
            <p className="text-yellow-400/80 font-medium mt-1">
              Alignment AI
            </p>
            <a 
              href="mailto:Contact@alignment-ai.io" 
              className="text-white/50 text-sm hover:text-yellow-400 transition-colors mt-2 inline-block"
            >
              Contact@alignment-ai.io
            </a>
          </div>

          <div className={`mt-12 transition-all duration-1000 ${introPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <button
              onClick={() => setShowIntro(false)}
              className="px-10 py-4 bg-yellow-400 text-black text-lg font-bold rounded-full hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95"
            >
              See Your App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
              alt="Pop Culture CLE"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-bold text-white">Pop Culture CLE</span>
          </div>
          <Link href="/auth">
            <button className="px-5 py-2 bg-yellow-400 text-black text-sm font-bold rounded-full hover:bg-yellow-300 transition-colors">
              Launch Full App
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Hero with iPhone */}
          <section className="py-8 md:py-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              
              {/* Left side - Copy */}
              <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                <div className="inline-block px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full mb-4">
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-wide">Your Custom App</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Your loyalty app is ready to try
                </h1>
                <p className="mt-4 text-white/60 text-lg max-w-md mx-auto lg:mx-0">
                  Tap through the demo on the right to see exactly how it works. This is your app, built for Pop Culture CLE.
                </p>
                
                {/* Key Features */}
                <div className="mt-8 space-y-3 max-w-sm mx-auto lg:mx-0">
                  {[
                    { icon: '1', text: 'Customers earn digital stamps' },
                    { icon: '2', text: 'Staff scans QR codes instantly' },
                    { icon: '3', text: '10 stamps = free reward' },
                  ].map((item) => (
                    <div key={item.icon} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-white/80">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/auth">
                    <button className="w-full sm:w-auto px-8 py-4 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-all">
                      Try Full App
                    </button>
                  </Link>
                  <a href="mailto:Contact@alignment-ai.io">
                    <button className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all">
                      Contact Us
                    </button>
                  </a>
                </div>
              </div>

              {/* Right side - iPhone Mockup */}
              <div className="flex-1 flex justify-center order-1 lg:order-2">
                <div className="relative">
                  {/* iPhone Frame */}
                  <div className="relative w-[280px] md:w-[320px] h-[570px] md:h-[650px] bg-[#1a1a1a] rounded-[45px] md:rounded-[55px] p-3 shadow-2xl shadow-black/50 border border-white/10">
                    {/* Dynamic Island */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20" />
                    
                    {/* Screen */}
                    <div className="w-full h-full bg-[#0f0f0f] rounded-[35px] md:rounded-[42px] overflow-hidden relative">
                      {/* Status Bar */}
                      <div className="absolute top-0 left-0 right-0 h-12 flex items-end justify-between px-6 pb-1 text-white text-xs font-medium z-10">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C6.95 3 3 6.95 3 12s3.95 9 9 9c.62 0 1.23-.06 1.82-.18L12 18l-1.82-6H8v-2h2.18L12 3z"/></svg>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                          <div className="w-6 h-3 border border-white rounded-sm relative">
                            <div className="absolute inset-0.5 right-1 bg-white rounded-sm" />
                          </div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="h-full pt-14 pb-20 px-4 overflow-y-auto">
                        {activeScreen === 'home' && (
                          <div className="space-y-5 animate-in fade-in duration-300">
                            {/* Welcome */}
                            <div className="text-center pt-2">
                              <img 
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg"
                                alt="Pop Culture CLE"
                                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-yellow-400/50"
                              />
                              <h2 className="text-lg font-bold text-white">Pop Culture CLE</h2>
                              <p className="text-white/50 text-sm">Welcome back!</p>
                            </div>

                            {/* Stamp Progress */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-white/70 text-sm font-medium">Your Stamps</span>
                                <span className="text-yellow-400 text-sm font-bold">{stamps}/10</span>
                              </div>
                              <div className="flex gap-1.5">
                                {Array.from({ length: 10 }).map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`flex-1 h-2 rounded-full ${i < stamps ? 'bg-yellow-400' : 'bg-white/10'}`} 
                                  />
                                ))}
                              </div>
                              <p className="text-white/40 text-xs mt-2 text-center">{10 - stamps} more for free reward!</p>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setShowQR(true)}
                                className="bg-yellow-400 text-black rounded-xl p-4 text-center"
                              >
                                <div className="w-8 h-8 bg-black/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                </div>
                                <span className="text-sm font-bold">Show QR</span>
                              </button>
                              <button 
                                onClick={() => setActiveScreen('rewards')}
                                className="bg-white/5 border border-white/10 text-white rounded-xl p-4 text-center"
                              >
                                <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                </div>
                                <span className="text-sm font-medium">Rewards</span>
                              </button>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                              <h3 className="text-white/70 text-sm font-medium mb-3">Recent</h3>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm">Stamp earned</p>
                                    <p className="text-white/40 text-xs">Today at 2:34 PM</p>
                                  </div>
                                  <span className="text-yellow-400 text-sm font-bold">+1</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm">Stamp earned</p>
                                    <p className="text-white/40 text-xs">Yesterday</p>
                                  </div>
                                  <span className="text-yellow-400 text-sm font-bold">+1</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'rewards' && (
                          <div className="space-y-5 animate-in fade-in duration-300">
                            <button onClick={() => setActiveScreen('home')} className="flex items-center gap-2 text-white/70">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              <span className="text-sm">Back</span>
                            </button>
                            
                            <h2 className="text-xl font-bold text-white">Rewards</h2>
                            
                            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-400/30">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                                  <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white font-bold">Free Item</h3>
                                  <p className="text-white/60 text-sm">Collect 10 stamps</p>
                                </div>
                                <span className="text-yellow-400 font-bold">{stamps}/10</span>
                              </div>
                              <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(stamps/10)*100}%` }} />
                              </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 opacity-50">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white font-bold">VIP Status</h3>
                                  <p className="text-white/60 text-sm">Coming soon</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* QR Modal */}
                        {showQR && (
                          <div className="fixed inset-0 bg-black/80 z-30 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-[#1a1a1a] rounded-3xl p-6 w-full max-w-[250px] text-center">
                              <h3 className="text-white font-bold text-lg mb-4">Your QR Code</h3>
                              <div className="bg-white rounded-2xl p-4 mb-4">
                                <div className="w-32 h-32 mx-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTAgMGg3djdIMHptMiAyaDN2M0gyem05LTJoN3Y3aC03em0yIDJoM3YzaC0zem0tMTMgOWg3djdIMHptMiAyaDN2M0gyem0xMC0xaDJ2MmgtMnptLTEgMmgydjJoLTJ6bTEgMmgydjJoLTJ6bTIgMGgydjJoLTJ6bTEtNGgydjJoLTJ6bTAgNGgydjJoLTJ6bTMtMmgtMnYtMmgyem0tMiAyaDJ2MmgtMnptLTQtNGgxdjJoLTF6bTAgM2gxdjJoLTF6bS00IDBoMXYyaC0xem0xMy01aC0ydi0yaDJ6bS02IDRoMXYyaC0xem0yIDBoMXYyaC0xem0yLTRoMnYyaC0yeiIvPjwvc3ZnPg==')] bg-contain bg-center bg-no-repeat" />
                              </div>
                              <p className="text-white/60 text-sm mb-4">Show this to staff</p>
                              <button 
                                onClick={() => setShowQR(false)}
                                className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Navigation */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0f0f0f] border-t border-white/10 flex items-center justify-around px-6">
                        <button 
                          onClick={() => setActiveScreen('home')}
                          className={`flex flex-col items-center gap-1 ${activeScreen === 'home' ? 'text-yellow-400' : 'text-white/40'}`}
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          <span className="text-[10px] font-medium">Home</span>
                        </button>
                        <button 
                          onClick={() => { setShowQR(true); setActiveScreen('home'); }}
                          className="flex flex-col items-center gap-1 text-white/40"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                          <span className="text-[10px] font-medium">QR Code</span>
                        </button>
                        <button 
                          onClick={() => setActiveScreen('rewards')}
                          className={`flex flex-col items-center gap-1 ${activeScreen === 'rewards' ? 'text-yellow-400' : 'text-white/40'}`}
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                          <span className="text-[10px] font-medium">Rewards</span>
                        </button>
                      </div>

                      {/* Home Indicator */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
                    </div>
                  </div>

                  {/* Add Stamp Demo Button */}
                  <button 
                    onClick={() => setStamps(prev => Math.min(prev + 1, 10))}
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg hover:bg-green-400 transition-all"
                  >
                    + Add Demo Stamp
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Highlights */}
          <section className="py-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Digital Stamps', desc: 'No more lost punch cards', icon: '01' },
                { title: 'QR Scanning', desc: '2-second checkout', icon: '02' },
                { title: 'Analytics', desc: 'Know your customers', icon: '03' },
                { title: 'iPhone Ready', desc: 'Works on any device', icon: '04' },
              ].map((f) => (
                <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <span className="text-yellow-400 text-xs font-bold">{f.icon}</span>
                  <h3 className="text-white font-bold mt-2">{f.title}</h3>
                  <p className="text-white/50 text-sm mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Demo Modes */}
          <section className="py-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-center mb-2">Try Different Views</h2>
            <p className="text-white/50 text-center mb-8">See how the app works for everyone</p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Link href="/auth" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-yellow-400/50 transition-all group">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-white font-bold">Customer</h3>
                <p className="text-white/50 text-sm mt-1">Earn stamps & rewards</p>
                <span className="text-yellow-400 text-sm mt-3 inline-block group-hover:underline">Try it</span>
              </Link>
              <Link href="/auth?mode=employee" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-yellow-400/50 transition-all group">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <h3 className="text-white font-bold">Employee</h3>
                <p className="text-white/50 text-sm mt-1">Scan QR codes</p>
                <span className="text-yellow-400 text-sm mt-3 inline-block group-hover:underline">Try it</span>
              </Link>
              <Link href="/admin" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-yellow-400/50 transition-all group">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-white font-bold">Owner</h3>
                <p className="text-white/50 text-sm mt-1">Manage everything</p>
                <span className="text-yellow-400 text-sm mt-3 inline-block group-hover:underline">Try it</span>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 border-t border-white/10 text-center">
            <h2 className="text-2xl font-bold">Ready to launch?</h2>
            <p className="text-white/50 mt-2 mb-6">This app is built and ready for Pop Culture CLE</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth">
                <button className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-all">
                  Try Full Demo
                </button>
              </Link>
              <a href="mailto:Contact@alignment-ai.io">
                <button className="px-8 py-4 border border-white/20 text-white rounded-full hover:bg-white/5 transition-all">
                  Contact Alignment AI
                </button>
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>Built by Alignment AI</span>
          <a href="mailto:Contact@alignment-ai.io" className="hover:text-yellow-400 transition-colors">Contact@alignment-ai.io</a>
        </div>
      </footer>
    </div>
  );
}
