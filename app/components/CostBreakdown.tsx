"use client";

import { motion } from "framer-motion";
import {
  Database, KeyRound, Bell,
  Smartphone, LayoutDashboard, Send,
  Apple, Play, RefreshCw,
} from "lucide-react";

const tiers = [
  {
    jumboText: "$0",
    jumboSub: "/ month",
    accentBg: "bg-[#00C9E8]",
    accentText: "text-[#0D0D0D]",
    borderColor: "border-[#00C9E8]",
    title: "No Recurring Fees",
    subtitle: "The platform is free. Forever.",
    items: [
      { icon: Database,  text: "Supabase — free up to 50,000 customers" },
      { icon: KeyRound,  text: "Clerk Auth — free up to 10,000 users" },
      { icon: Bell,      text: "Push notifications via Expo — free" },
    ],
  },
  {
    jumboText: "$800",
    jumboSub: "one-time",
    accentBg: "bg-[#FF2D78]",
    accentText: "text-white",
    borderColor: "border-[#FF2D78]",
    title: "One-Time Build Fee",
    subtitle: "iOS + Android + Web Admin. All in.",
    items: [
      { icon: Smartphone,      text: "iOS + Android app (React Native)" },
      { icon: LayoutDashboard, text: "Secure web admin dashboard" },
      { icon: Send,            text: "App Store & Google Play submission" },
    ],
  },
  {
    jumboText: "$124",
    jumboSub: "total",
    accentBg: "bg-[#7C3AED]",
    accentText: "text-white",
    borderColor: "border-[#7C3AED]",
    title: "Store Fees — We Handle It",
    subtitle: "Incl. in your 1-year service agreement.",
    items: [
      { icon: Apple,     text: "Apple Developer — $99/yr" },
      { icon: Play,      text: "Google Play — $25 one-time" },
      { icon: RefreshCw, text: "We hold both — updates ship without any work on your end" },
    ],
  },
];

export default function CostBreakdown() {
  return (
    <section id="cost" className="section-pad bg-[#FFFDF8] border-b-4 border-black">
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="kicker bg-[#FF2D78] text-white border-[#FF2D78]">The Numbers</span>
          <h2 className="display-lg text-[#0D0D0D] mb-4">
            Financial <span className="text-gradient">Clarity.</span>
          </h2>
          <p className="body-lg max-w-xl text-[#555]">
            No hidden fees. No monthly surprises. Free-tier enterprise infrastructure that scales to 50k customers.
          </p>
        </motion.div>

        {/* Editorial tier rows */}
        <div className="flex flex-col gap-0">
          {tiers.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-[1fr_2fr] border-2 border-black brutal-shadow bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:brutal-shadow-lg transition-all duration-200 mb-4"
            >
              {/* Left — jumbo number */}
              <div className={`${t.accentBg} p-8 md:p-10 flex flex-col justify-between`}>
                <div>
                  <p className={`jumbo ${t.accentText} leading-none`}>{t.jumboText}</p>
                  <p className={`${t.accentText} text-sm font-black uppercase tracking-[0.15em] mt-2 opacity-70`}>{t.jumboSub}</p>
                </div>
                <div className={`mt-6 w-12 h-1 ${i === 1 ? "bg-white/40" : "bg-black/20"}`} />
              </div>

              {/* Right — detail */}
              <div className="p-8 md:p-10 border-l-2 border-black">
                <h3 className="text-[#0D0D0D] text-xl font-black uppercase tracking-tight mb-1">{t.title}</h3>
                <p className="text-[#888] text-sm font-semibold mb-6">{t.subtitle}</p>
                <ul className="flex flex-col gap-4">
                  {t.items.map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className={`w-8 h-8 ${t.accentBg} border-2 border-black flex items-center justify-center shrink-0`}>
                        <item.icon size={14} className={t.accentText} strokeWidth={2.5} />
                      </div>
                      <span className="text-[#0D0D0D] text-sm font-semibold leading-relaxed pt-1">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-[#FFD600] border-2 border-black brutal-shadow p-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="text-[#0D0D0D] text-xs font-black uppercase tracking-widest mb-1">All-in at launch</p>
            <p className="text-[#0D0D0D] text-3xl font-black">$800 <span className="text-[#555] text-lg font-semibold">+ $124 store fees</span></p>
          </div>
          <p className="text-[#333] text-sm font-semibold max-w-xs text-center md:text-right">
            Then $99/yr for Apple renewal. That&apos;s the whole story.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
