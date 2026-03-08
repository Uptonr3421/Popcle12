"use client";

import { motion } from "framer-motion";
import { Code, Shield, Unlock, RefreshCw, CheckCircle, Settings } from "lucide-react";

const youOwn = [
  {
    icon: Code,
    text: "100% of the custom codebase — it's yours forever",
  },
  {
    icon: Shield,
    text: "All customer data: phone numbers, points, analytics",
  },
  {
    icon: Unlock,
    text: "Zero vendor lock-in — move it anywhere, anytime",
  },
];

const weHandle = [
  {
    icon: RefreshCw,
    text: "A full year of app updates included — as Apple & Google change their standards, we handle it",
  },
  {
    icon: CheckCircle,
    text: "App Store compliance, privacy reviews, and audit navigation — fully managed",
  },
  {
    icon: Settings,
    text: "We hold the developer accounts so updates ship fast with no paperwork on your end",
  },
];

export default function Ownership() {
  return (
    <section className="section-pad bg-[#FFF0F5] border-b-4 border-black">
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-block bg-[#7C3AED] border-4 border-black px-6 py-2 brutal-shadow mb-6 rotate-1">
            <span className="font-black uppercase tracking-widest text-white text-sm">
              Who Owns What
            </span>
          </div>
          <h2 className="display-lg text-[#0D0D0D] mt-2 mb-4">
            Clear <span className="text-gradient">Ownership.</span>
          </h2>
          <p className="body-lg text-[#444] max-w-xl mx-auto">
            You own everything that matters. We keep it running, updated, and compliant
            for a full year — at no extra charge.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Pop Culture CLE owns */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white border-4 border-black brutal-shadow p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-14 h-14 border-4 border-black flex items-center justify-center"
                style={{ background: "#FF2D78" }}
              >
                <span className="text-white text-base font-black">YOU</span>
              </div>
              <h3 className="text-[#0D0D0D] text-xl font-black uppercase leading-tight">
                Pop Culture CLE<br />Owns
              </h3>
            </div>
            <ul className="flex flex-col gap-5">
              {youOwn.map((item) => (
                <li key={item.text} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FF2D78] border-2 border-black flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[#0D0D0D] text-sm font-semibold leading-relaxed pt-2">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Alignment-AI handles */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white border-4 border-black brutal-shadow p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-14 h-14 border-4 border-black flex items-center justify-center"
                style={{ background: "#7C3AED" }}
              >
                <span className="text-white text-base font-black">US</span>
              </div>
              <h3 className="text-[#0D0D0D] text-xl font-black uppercase leading-tight">
                Alignment-AI<br />Handles
              </h3>
            </div>
            <ul className="flex flex-col gap-5">
              {weHandle.map((item) => (
                <li key={item.text} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#7C3AED] border-2 border-black flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[#0D0D0D] text-sm font-semibold leading-relaxed pt-2">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Year of updates callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-[#FFD600] border-4 border-black brutal-shadow p-6 text-center"
        >
          <p className="text-[#0D0D0D] font-black text-base">
            ✦ Includes 1 year of updates. As the App Store evolves, we evolve with it — so you never have to think about it.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
