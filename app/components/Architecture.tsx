"use client";

import { motion } from "framer-motion";
import { Smartphone, Users, ScanLine, LayoutDashboard } from "lucide-react";

const roles = [
  {
    icon: Users,
    bgClass: "bg-[#FFF0F5]",
    colorClass: "text-[#FF2D78]",
    title: "Customers",
    desc: "See their points, personal QR code, and live geofenced specials. No password required — ever.",
  },
  {
    icon: ScanLine,
    bgClass: "bg-[#F0FBFE]",
    colorClass: "text-[#00C9E8]",
    title: "Staff",
    desc: "The same app instantly becomes a secure QR scanner the moment a staff phone logs in.",
  },
  {
    icon: LayoutDashboard,
    bgClass: "bg-[#F5F0FF]",
    colorClass: "text-[#7C3AED]",
    title: "Admin (Nicole)",
    desc: "Full analytics, geofence special builder, and a push broadcast panel — all in one place.",
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="section-pad bg-[#FAFAFA] border-b-4 border-black">
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
              App Architecture
            </span>
          </div>
          <h2 className="display-lg text-[#0D0D0D] mt-2 mb-4">
            One App. <span className="text-gradient">Three Roles.</span>
          </h2>
          <p className="body-lg max-w-2xl mx-auto text-[#444]">
            Customers, staff, and you each see a completely different experience from the
            exact same app — automatically, based on who&apos;s logged in.
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white border-4 border-black brutal-shadow p-7 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200"
            >
              <div className={`w-14 h-14 border-4 border-black flex items-center justify-center ${r.bgClass}`}>
                <r.icon size={24} className={r.colorClass} />
              </div>
              <div>
                <h3 className="text-[#0D0D0D] text-xl font-black uppercase mb-2">{r.title}</h3>
                <p className="body-sm text-[#444]">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inclusive vision callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#FFD600] border-4 border-black brutal-shadow p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-16 h-16 border-4 border-black flex items-center justify-center shrink-0 bg-[#FF2D78]">
              <Smartphone size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-[#0D0D0D] text-2xl font-black uppercase mb-2">Radical Inclusivity</h3>
              <p className="text-[#1a1a1a] body-lg max-w-2xl font-semibold">
                As Pop Culture CLE grows — second location, food trucks, pop-ups — the app scales
                with zero extra work. Built on Next.js and React Native for iOS &amp; Android from day one.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
