"use client";

import { motion } from "framer-motion";
import { Radar, Phone, Gift } from "lucide-react";

const steps = [
  {
    icon: Radar,
    num: "01",
    color: "#00C9E8",
    bg: "#F0FBFE",
    title: "You Draw an Invisible Circle",
    desc: "Set a 500-foot boundary around your store or food truck — right in the app.",
  },
  {
    icon: Phone,
    num: "02",
    color: "#FF2D78",
    bg: "#FFF0F5",
    title: "Their Phone Notices",
    desc: "When a customer walks inside the circle, the app silently wakes up — even if it's closed.",
  },
  {
    icon: Gift,
    num: "03",
    color: "#7C3AED",
    bg: "#F5F0FF",
    title: "They Get a Reward",
    desc: "A push notification fires instantly: \"Come in for a free topping today!\"",
  },
];

export default function Geofencing() {
  return (
    <section className="section-pad" style={{ background: "#FFD600" }}>
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-label text-[#0D0D0D] border-[#0D0D0D]/30 bg-[#0D0D0D]/10">
            Location Magic
          </span>
          <h2 className="display-lg text-[#0D0D0D] mt-3 mb-4">
            Geofencing.
          </h2>
          <p className="body-lg text-[#333] max-w-xl mx-auto">
            A tech word for a simple idea: when your customer gets close, 
            your app reaches out to them automatically.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.13, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-2xl p-7 flex flex-col gap-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="icon-box w-12 h-12 rounded-xl" style={{ background: s.bg }}>
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
                <span className="text-3xl font-black text-[#E5E5E5] leading-none">{s.num}</span>
              </div>
              <div>
                <h3 className="font-bold text-[#0D0D0D] text-lg mb-2">{s.title}</h3>
                <p className="body-sm">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-[#0D0D0D] border-4 border-black brutal-shadow p-8 text-center"
        >
          <p className="text-white text-base font-bold">
            ✦ No battery drain. No constant tracking. <br className="hidden md:block" />
            The phone itself watches — only pinging when they arrive.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
