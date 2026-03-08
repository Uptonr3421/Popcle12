"use client";

import { motion } from "framer-motion";

const phases = [
  { label: "Discovery & Design", status: "done", color: "#FF2D78" },
  { label: "Web Platform Build", status: "done", color: "#FF2D78" },
  { label: "Mobile App Development", status: "active", color: "#00C9E8" },
  { label: "QA & Testing", status: "upcoming", color: "#7C3AED" },
  { label: "App Store Submission", status: "upcoming", color: "#7C3AED" },
  { label: "Go-Live & Handoff", status: "upcoming", color: "#FFD600" },
];

export default function Timeline() {
  return (
    <section className="section-pad bg-[#F5F0FF] border-b-4 border-black">
      <div className="section-inner">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-block bg-[#7C3AED] border-4 border-black px-6 py-2 brutal-shadow mb-6 -rotate-1">
            <span className="font-black uppercase tracking-widest text-white text-sm">
              Timeline
            </span>
          </div>
          <h2 className="display-xl text-[#0D0D0D] mb-4">
            30-Day <span className="text-gradient">Accelerated</span> Sprint.
          </h2>
          <p className="body-lg text-[#444] max-w-xl mx-auto">
            The foundation and web platforms are complete. Mobile execution is underway.
            Four agents, running in parallel, shipping daily.
          </p>
        </motion.div>

        {/* Phase track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {phases.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-white border-4 border-black brutal-shadow p-5 flex items-center gap-4"
            >
              <div
                className="w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 text-xs font-black"
                style={{ background: p.color, color: p.status === "upcoming" ? "#fff" : "#0D0D0D" }}
              >
                {p.status === "done" ? "✓" : p.status === "active" ? "▶" : String(i + 1)}
              </div>
              <div>
                <p className="font-black text-[#0D0D0D] text-sm uppercase leading-tight">{p.label}</p>
                <p
                  className="text-xs font-bold uppercase mt-0.5"
                  style={{ color: p.color }}
                >
                  {p.status === "done" ? "Complete" : p.status === "active" ? "In Progress" : "Upcoming"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 bg-[#0D0D0D] border-4 border-black brutal-shadow px-6 py-3 text-sm font-black text-white tracking-widest uppercase">
            <span className="w-3 h-3 rounded-full bg-[#00C9E8] animate-pulse" />
            Systems Nominal — Active Build
          </div>
        </motion.div>

      </div>
    </section>
  );
}
