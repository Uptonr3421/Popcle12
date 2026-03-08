"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Code, Terminal, CheckSquare } from "lucide-react";

const agents = [
  {
    icon: BrainCircuit,
    color: "#00C9E8",
    bg: "#F0FBFE",
    name: "Gemini (Antigravity)",
    role: "Systems Architect",
    desc: "Reads the entire codebase at once. Designs the database, scaffolds full screen sets, makes big structural calls.",
  },
  {
    icon: Code,
    color: "#FF2D78",
    bg: "#FFF0F5",
    name: "OpenAI Codex",
    role: "Execution Engine",
    desc: "Generates the repetitive code fast — form handlers, auth wiring, data connections. Runs thousands of lines in parallel.",
  },
  {
    icon: Terminal,
    color: "#FFD600",
    bg: "#FFFBEA",
    name: "Claude (Cursor)",
    role: "Feature Developer",
    desc: "Day-to-day feature work. Push notifications, geofence boundaries, real-time data updates across screens.",
  },
  {
    icon: CheckSquare,
    color: "#7C3AED",
    bg: "#F5F0FF",
    name: "QA Compliance Agent",
    role: "App Store Specialist",
    desc: "Audits everything against Apple and Google guidelines before submission — so it passes first time.",
  },
];

export default function BuildAgents() {
  return (
    <section className="section-pad bg-[#FAFAFA]">
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-label text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/8">
            Why Alignment-AI
          </span>
          <h2 className="display-lg text-[#0D0D0D] mt-3 mb-4">
            Four AI Agents. <span className="text-gradient">Working in Parallel.</span>
          </h2>
          <p className="body-lg max-w-2xl mx-auto">
            Instead of one developer writing code line by line, four specialized AI models
            run simultaneously — hitting your 30-day deadline without cutting corners.
          </p>
          <div className="section-divider mx-auto mt-6" style={{ background: "#7C3AED" }} />
        </motion.div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card flex gap-5 items-start"
            >
              <div className="icon-box w-12 h-12 rounded-xl shrink-0" style={{ background: a.bg }}>
                <a.icon size={22} style={{ color: a.color }} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: a.color }}>
                  {a.role}
                </span>
                <h3 className="font-bold text-[#0D0D0D] text-lg mt-0.5 mb-2">{a.name}</h3>
                <p className="body-sm">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
