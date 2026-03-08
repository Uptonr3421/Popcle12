"use client";

import Image from "next/image";
import { MoveRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-sunset-warm min-h-screen flex flex-col">
      {/* Rainbow stripe */}
      <div className="rainbow-bar w-full flex-shrink-0" />

      {/* Ambient light blobs */}
      <div
        className="pointer-events-none absolute -top-20 right-[-10%] w-[700px] h-[700px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #FFD600 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 70%)", filter: "blur(100px)" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", filter: "blur(90px)" }}
      />

      {/* Dot texture */}
      <div className="absolute inset-0 bg-dots pointer-events-none" />

      {/* Main content */}
      <div className="section-inner w-full flex-1 flex flex-col justify-center py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left copy ── */}
          <div>
            {/* Kicker */}
            <p className="hero-fade d1 text-[#FF7B2E] text-xs font-black tracking-[0.22em] uppercase mb-8 flex items-center gap-2">
              <span className="inline-block w-6 h-0.5 bg-[#FF7B2E]" />
              Pop Culture CLE × Alignment-AI
            </p>

            {/* Headline — word-by-word CSS entry */}
            <h1 className="mb-8 overflow-hidden">
              <span className="block display-xl text-[#1d1d1f] overflow-hidden">
                <span className="hero-word">A&nbsp;Loyalty</span>
                {" "}
                <span className="hero-word">App</span>
              </span>
              <span className="block display-xl overflow-hidden mt-1">
                <span className="hero-word text-gradient-sun">Built</span>
                {" "}
                <span className="hero-word text-gradient-sun">to&nbsp;Wow</span>
              </span>
              <span className="block display-xl text-[#1d1d1f]/20 overflow-hidden mt-1">
                <span className="hero-word">Your</span>
                {" "}
                <span className="hero-word">Customers.</span>
              </span>
            </h1>

            <p className="hero-fade d2 text-[#6e6e73] text-base max-w-[420px] leading-relaxed font-normal mb-10">
              Instant rewards. Effortless for your team. Fully automated behind the scenes.
              Your brand deserves tech as vibrant as a Cleveland summer afternoon.
            </p>

            {/* CTAs */}
            <div className="hero-fade d3 flex flex-wrap items-center gap-4 mb-12">
              <a
                href="#architecture"
                className="inline-flex items-center gap-3 bg-[#1d1d1f] text-white text-sm font-semibold px-7 py-4 rounded-full
                           transition-all duration-300 hover:bg-[#FF2D78] hover:scale-105 hover:shadow-[0_8px_30px_rgba(255,45,120,0.35)]"
              >
                See How It Works <MoveRight size={16} />
              </a>
              <a
                href="#cost"
                className="text-[#1d1d1f] text-sm font-semibold hover:text-[#FF2D78] transition-colors duration-200"
              >
                View Pricing →
              </a>
            </div>

            {/* Stats row */}
            <div className="hero-fade d4 flex items-center gap-8">
              {[
                { num: "50k", label: "Free users" },
                { num: "30", label: "Day build" },
                { num: "$0", label: "Monthly fees" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-[#1d1d1f] leading-none tracking-tight">{s.num}</p>
                  <p className="text-xs text-[#6e6e73] font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: cinematic image ── */}
          <div className="hero-fade d2 relative flex justify-center lg:justify-end">
            <div className="relative">

              {/* Primary image — Apple-style: rounded, deep shadow */}
              <div
                className="relative w-[300px] h-[390px] md:w-[440px] md:h-[560px] overflow-hidden rounded-3xl"
                style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.18), 0 8px 30px rgba(255,123,46,0.15)" }}
              >
                <Image
                  src="/hero-flatlay.png"
                  alt="Artisan ice cream at Pop Culture CLE"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Gradient polish */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(29,29,31,0.4) 0%, transparent 50%)" }}
                />

                {/* Rainbow accent bar at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 rainbow-bar" />

                {/* City badge — glass style */}
                <div className="absolute top-5 right-5 glass px-4 py-2 rounded-2xl">
                  <p className="text-xs font-black text-[#1d1d1f] uppercase tracking-wider">Cleveland, OH 🍦</p>
                </div>
              </div>

              {/* Floating glass badge — top left */}
              <div
                className="absolute -top-6 -left-6 md:-left-10 glass px-5 py-4 rounded-2xl animate-float"
                style={{ boxShadow: "0 8px 32px rgba(255,45,120,0.2)", border: "1.5px solid rgba(255,45,120,0.3)" }}
              >
                <p className="text-3xl font-black text-[#FF2D78] leading-none">50k</p>
                <p className="text-[#6e6e73] text-xs font-semibold uppercase tracking-wide mt-0.5">Free users</p>
              </div>

              {/* Floating glass badge — bottom right */}
              <div
                className="absolute -bottom-6 -right-6 md:-right-10 glass px-5 py-4 rounded-2xl animate-float-alt"
                style={{ boxShadow: "0 8px 32px rgba(255,214,0,0.25)", border: "1.5px solid rgba(255,214,0,0.4)" }}
              >
                <p className="text-3xl font-black text-[#1d1d1f] leading-none">30</p>
                <p className="text-[#6e6e73] text-xs font-semibold uppercase tracking-wide mt-0.5">Day build</p>
              </div>

              {/* Rainbow pill tags */}
              <div className="absolute -bottom-14 left-0 right-0 flex flex-wrap gap-2 justify-center">
                {[
                  { label: "QR Stamps",    color: "#FF2D78", dark: true },
                  { label: "No Passwords", color: "#FFD600", dark: false },
                  { label: "Push Alerts",  color: "#00C9E8", dark: true },
                  { label: "Free Infra",   color: "#7C3AED", dark: true },
                ].map((b, i) => (
                  <span
                    key={b.label}
                    className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                    style={{
                      background: b.color,
                      color: b.dark ? "#fff" : "#1d1d1f",
                      animationDelay: `${0.7 + i * 0.1}s`,
                    }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
