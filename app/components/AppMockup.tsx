"use client";

import { motion } from "framer-motion";
import { QrCode, ScanLine, Radar, Cherry } from "lucide-react";

const phones = [
  {
    label: "The Customer",
    caption: "A frictionless digital stamp card. Show your QR, earn points.",
    gradient: "linear-gradient(135deg, #FF2D78 0%, #7C3AED 100%)",
  },
  {
    label: "The Staff",
    caption: "Any staff phone becomes a scanner. No hardware needed.",
    gradient: "linear-gradient(135deg, #FFD600 0%, #FF8C00 100%)",
  },
  {
    label: "Nicole's Dashboard",
    caption: "Your personal analytics, geofence controls, and broadcast button.",
    gradient: "linear-gradient(135deg, #00C9E8 0%, #7C3AED 100%)",
  },
];

export default function AppMockup() {
  return (
    <section className="section-pad bg-white border-b-4 border-black">
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-[#00C9E8] border-4 border-black px-6 py-2 brutal-shadow mb-6 rotate-1">
            <span className="font-black uppercase tracking-widest text-black text-sm">
              What the App Looks Like
            </span>
          </div>
          <h2 className="display-lg text-[#0D0D0D] mt-2 mb-4">
            Same App. <span className="text-gradient-blue">Three Experiences.</span>
          </h2>
          <p className="body-lg text-[#444] max-w-xl mx-auto">
            Log in as a customer, staff, or admin — and the app instantly shows you exactly what you need.
          </p>
        </motion.div>

        {/* Phone mockups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">

          {/* ── Customer ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="relative w-[270px] h-[540px] rounded-[2.8rem] overflow-hidden border-4 border-black brutal-shadow hover:-translate-y-3 transition-transform duration-300"
              style={{ background: phones[0].gradient }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

              <div className="absolute inset-0 p-5 pt-10 flex flex-col">
                {/* Status bar */}
                <div className="flex justify-between items-center text-white/80 text-xs mb-6 mt-2 px-1">
                  <span className="font-bold">POP CLE</span>
                  <Cherry size={16} />
                </div>

                {/* Points card */}
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/20">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Your Balance</p>
                  <p className="text-white text-5xl font-black">85 <span className="text-xl font-semibold">pts</span></p>
                </div>

                {/* QR area */}
                <div className="flex-1 bg-white rounded-2xl flex flex-col items-center justify-center p-5 shadow-inner">
                  <QrCode size={100} className="text-[#0D0D0D] mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D78]">Scan to Earn</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-[#0D0D0D] font-black text-lg mb-1 uppercase">{phones[0].label}</h3>
              <p className="text-[#444] text-sm max-w-[220px]">{phones[0].caption}</p>
            </div>
          </motion.div>

          {/* ── Staff ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center gap-6 md:-translate-y-6"
          >
            <div
              className="relative w-[270px] h-[540px] rounded-[2.8rem] overflow-hidden border-4 border-black brutal-shadow hover:-translate-y-3 transition-transform duration-300"
              style={{ background: phones[1].gradient }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

              <div className="absolute inset-0 p-5 pt-10 flex flex-col">
                <div className="flex justify-between items-center text-black/80 text-xs mb-6 mt-2 px-1">
                  <span className="font-bold">STAFF MODE</span>
                  <ScanLine size={16} />
                </div>

                {/* Viewfinder */}
                <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 flex items-center justify-center overflow-hidden">
                  <div className="relative w-40 h-40">
                    {[
                      "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
                      "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
                      "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
                      "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
                    ].map((cls) => (
                      <div key={cls} className={`absolute w-7 h-7 border-white ${cls}`} />
                    ))}
                    <motion.div
                      animate={{ y: [0, 130, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute top-0 left-0 right-0 h-0.5 bg-[#FF2D78] shadow-[0_0_10px_#FF2D78]"
                    />
                  </div>
                </div>

                {/* Scan button */}
                <div className="mt-4 bg-[#0D0D0D] rounded-2xl py-4 text-center">
                  <span className="text-[#FFD600] font-bold uppercase tracking-widest text-sm">Scan Customer QR</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-[#0D0D0D] font-black text-lg mb-1 uppercase">{phones[1].label}</h3>
              <p className="text-[#444] text-sm max-w-[220px]">{phones[1].caption}</p>
            </div>
          </motion.div>

          {/* ── Admin ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="relative w-[270px] h-[540px] rounded-[2.8rem] overflow-hidden border-4 border-black brutal-shadow hover:-translate-y-3 transition-transform duration-300"
              style={{ background: phones[2].gradient }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

              <div className="absolute inset-0 p-5 pt-10 flex flex-col gap-3">
                <div className="flex justify-between items-center text-white text-xs mb-2 mt-2 px-1">
                  <span className="font-bold">ADMIN</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00C17A] shadow-[0_0_8px_#00C17A] animate-pulse" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-white text-2xl font-black">4.2k</p>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Customers</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-white text-2xl font-black">12k</p>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Scans</p>
                  </div>
                </div>

                {/* Radar */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Radar size={14} className="text-white" />
                    <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Geofence Radar</span>
                  </div>
                  <div className="flex-1 rounded-lg overflow-hidden relative bg-black/20 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute w-20 h-20 rounded-full border-2 border-white bg-white/20"
                    />
                    <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#fff]" />
                  </div>
                </div>

                {/* Broadcast */}
                <div className="bg-[#FFD600] border-2 border-black rounded-2xl py-3 text-center">
                  <span className="text-[#0D0D0D] font-bold uppercase tracking-widest text-sm">Blast an Offer ✦</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-[#0D0D0D] font-black text-lg mb-1 uppercase">{phones[2].label}</h3>
              <p className="text-[#444] text-sm max-w-[220px]">{phones[2].caption}</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
