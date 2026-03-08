"use client";

import { motion } from "framer-motion";
import { KeyRound, MessageSquare, ShieldCheck, Route } from "lucide-react";

const steps = [
  {
    icon: KeyRound,
    color: "#FF2D78",
    bg: "#FFF0F5",
    border: "#FF2D78",
    step: "Step 1",
    title: "Type Your Number",
    desc: "No username. No password. Just a phone number.",
  },
  {
    icon: MessageSquare,
    color: "#00C9E8",
    bg: "#F0FBFE",
    border: "#00C9E8",
    step: "Step 2",
    title: "Get a Text",
    desc: "A 6-digit code arrives by text. Type it in. Done.",
  },
  {
    icon: ShieldCheck,
    color: "#7C3AED",
    bg: "#F5F0FF",
    border: "#7C3AED",
    step: "Step 3",
    title: "Stay Logged In",
    desc: "They never log in again. The app just remembers them.",
  },
  {
    icon: Route,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#D97706",
    step: "Step 4",
    title: "See Their Own Screen",
    desc: "Customers see rewards. Staff see scanners. You see everything.",
  },
];

export default function AuthFlow() {
  return (
    <section className="section-pad bg-white border-b-4 border-black">
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-block bg-[#00C9E8] border-4 border-black px-6 py-2 brutal-shadow mb-6 -rotate-1">
            <span className="font-black uppercase tracking-widest text-black text-sm">
              How Login Works
            </span>
          </div>
          <h2 className="display-lg text-[#0D0D0D] mt-2 mb-4">
            No Passwords. <span className="text-gradient-blue">Ever.</span>
          </h2>
          <p className="body-lg text-[#444] max-w-xl mx-auto">
            Your customers just tap their phone number and get a text.
            That&apos;s it. They&apos;re in — and they stay in.
          </p>
        </motion.div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white border-4 border-black brutal-shadow flex flex-col gap-4 p-6 hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center border-2 border-black"
                  style={{ background: s.bg }}
                >
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
                <span
                  className="text-xs font-black uppercase tracking-widest border-b-2 pb-0.5"
                  style={{ color: s.color, borderColor: s.color }}
                >
                  {s.step}
                </span>
              </div>
              <div>
                <h3 className="text-[#0D0D0D] text-lg font-black mb-2 uppercase">{s.title}</h3>
                <p className="body-sm text-[#444]">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-[#0D0D0D] border-4 border-black brutal-shadow p-6 text-center"
        >
          <p className="text-white font-bold text-sm">
            🔒 Powered by Supabase Auth — enterprise-grade security. Zero complexity for your customers.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
