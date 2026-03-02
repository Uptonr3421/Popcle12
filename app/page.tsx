'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-orange-50 to-background">
      {/* Animated background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-8 pb-12 md:pt-16 md:pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Brand Badge */}
            <div className="inline-block mb-6 px-4 py-2 bg-accent/20 rounded-full border border-accent/40 backdrop-blur-sm">
              <span className="text-accent font-sans font-semibold text-sm">Handcrafted Gourmet Ice Cream</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-sans font-bold text-5xl md:text-7xl mb-4 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                Pop Culture CLE
              </span>
            </h1>
            
            {/* Tagline */}
            <p className="text-xl md:text-2xl text-foreground/80 mb-3 font-medium">
              No air. Maximum flavor. Pure richness.
            </p>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed mb-10">
              Earn stamps on every visit and unlock <span className="font-bold text-primary">free gourmet ice cream popsicles</span> packed with pure, creamy flavor.
            </p>

            {/* Product Image Grid */}
            <div className="mb-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
              {[
                { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c4d27db8-4d52-48b1-a5d2-ccc0160d0509.jpeg', alt: 'Colorful popsicle with sprinkles' },
                { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a8db6a6b-90e0-4e76-aae4-d559eb291f50.jpeg', alt: 'Ice cream cones display' },
                { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4902868e-33d5-4d7b-9adf-25927ab0ba5e.jpeg', alt: 'Pop Culture CLE storefront sign' },
              ].map((product, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 h-32 md:h-48 cursor-pointer">
                  <img 
                    src={product.src} 
                    alt={product.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-16 px-2">
              <Link href="/auth" className="w-full sm:w-auto">
                <button className="btn-primary-glow w-full sm:w-auto shadow-lg hover:shadow-2xl transform transition-all">
                  🎫 Join Loyalty Program
                </button>
              </Link>
              <Link href="/auth?mode=employee" className="w-full sm:w-auto">
                <button className="btn-vibrant w-full sm:w-auto border-2 border-secondary text-secondary hover:bg-secondary/10 shadow-lg hover:shadow-2xl transform transition-all">
                  👀 Employee Scanner
                </button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
              {[
                { icon: '📍', title: 'Geofence Offers', desc: 'Get special deals when near our Solon location', color: 'from-accent/20 to-orange-100' },
                { icon: '🎫', title: '10 Stamps = Free', desc: 'Each visit earns a stamp towards free ice cream', color: 'from-secondary/20 to-teal-100' },
                { icon: '🔔', title: 'Push Alerts', desc: 'Be first to know about exclusive promotions', color: 'from-primary/20 to-rose-100' },
              ].map((feature, idx) => (
                <div key={idx} className={`card-vibrant bg-gradient-to-br ${feature.color} p-6 text-center hover:scale-105 transition-transform`}>
                  <div className="text-5xl mb-3 animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-sans font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-12 md:py-20 px-4 bg-white/50 backdrop-blur-sm border-y border-border/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans text-3xl md:text-4xl font-bold text-center mb-12">Visit Us Today</h2>
            
            <div className="card-vibrant overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-shadow">
              {/* Location Image */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/81ccd041-ddbb-4a54-95b2-e2609a59427d.jpeg"
                  alt="Pop Culture CLE storefront"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* Location Info */}
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-lg md:text-xl font-sans font-bold text-foreground mb-2">
                    📍 33549 Solon Rd, Solon, OH 44139
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    Stop by our cozy shop and grab your favorite handcrafted ice cream popsicle. Open daily for your sweet cravings!
                  </p>
                </div>

                {/* Contact Actions */}
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  <a 
                    href="tel:+12162457316" 
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-accent to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all hover:scale-105"
                  >
                    📞 Call: (216) 245-7316
                  </a>
                  <a 
                    href="mailto:info@popculturecle.com" 
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-secondary to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-secondary/50 transition-all hover:scale-105"
                  >
                    📧 Email Us
                  </a>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-border/30">
                  <p className="text-sm text-foreground/60 mb-3">Follow us for updates and special announcements:</p>
                  <div className="flex justify-center gap-4 md:gap-6">
                    <a href="https://instagram.com/popculturecle" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-125 transition-transform">📸</a>
                    <a href="https://facebook.com/profile.php?id=248019982622260" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-125 transition-transform">👍</a>
                    <a href="https://x.com/popculturecle" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-125 transition-transform">𝕏</a>
                    <a href="https://m.yelp.com/biz/pop-culture-cle-solon-2" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-125 transition-transform">⭐</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 text-center border-t border-border/50">
          <p className="text-sm text-foreground/60 mb-2">
            Pop Culture CLE © 2026 | Premium Handcrafted Desserts
          </p>
          <p className="text-xs text-foreground/50">
            Loyalty App v1.0 | Mobile-First Design | Web & iPhone Ready
          </p>
        </footer>
      </div>
    </div>
  );
}
