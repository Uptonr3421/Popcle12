"use client";

import { motion } from "framer-motion";
import {
  UserCircle2,
  Stamp,
  MapPin,
  Activity,
  Phone,
  ShieldCheck,
  Star,
  ScanLine,
  Clock,
  Tag,
  Radius,
  ToggleRight,
  User,
  Gift,
  CheckCircle,
} from "lucide-react";

const tables = [
  {
    icon: UserCircle2,
    color: "#00C9E8",
    bg: "#F0FBFE",
    name: "Customers",
    plain: "Every person who signs up — their phone, their role, and their point total.",
    fields: [
      { icon: Phone, text: "Phone number" },
      { icon: ShieldCheck, text: "Customer / Staff / Admin role" },
      { icon: Star, text: "Total stamps earned" },
    ],
  },
  {
    icon: Stamp,
    color: "#FF2D78",
    bg: "#FFF0F5",
    name: "Stamps",
    plain: "Every time a customer gets scanned, we record it here.",
    fields: [
      { icon: User, text: "Which customer got scanned" },
      { icon: ScanLine, text: "Which staff member scanned them" },
      { icon: Clock, text: "Date & time of scan" },
    ],
  },
  {
    icon: MapPin,
    color: "#D97706",
    bg: "#FFFBEB",
    name: "Specials",
    plain: "The deals and offers you create. Each one has a location trigger.",
    fields: [
      { icon: Tag, text: "Name of the offer" },
      { icon: Radius, text: "The GPS circle radius" },
      { icon: ToggleRight, text: "On or off switch" },
    ],
  },
  {
    icon: Activity,
    color: "#7C3AED",
    bg: "#F5F0FF",
    name: "Triggered Alerts",
    plain: "Every time a customer walks near your store and gets a notification.",
    fields: [
      { icon: User, text: "Which customer triggered it" },
      { icon: Gift, text: "Which offer fired" },
      { icon: CheckCircle, text: "Whether the push was sent" },
    ],
  },
];

export default function DatabaseSchema() {
  return (
    <section className="section-pad bg-[#FAFAFA] border-b-4 border-black">
      <div className="section-inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-block bg-[#FF2D78] border-4 border-black px-6 py-2 brutal-shadow mb-6 -rotate-1">
            <span className="font-black uppercase tracking-widest text-white text-sm">
              Your Data, Organized
            </span>
          </div>
          <h2 className="display-lg text-[#0D0D0D] mt-2 mb-4">
            The Filing Cabinet <span className="text-gradient">Behind It All.</span>
          </h2>
          <p className="body-lg max-w-2xl mx-auto text-[#444]">
            Think of this like four perfectly organized folders. Everything your app needs to
            run lives here — secure, backed up, and ready to scale to 50,000+ customers.
          </p>
        </motion.div>

        {/* Table cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tables.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white border-4 border-black brutal-shadow p-7"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 border-4 border-black flex items-center justify-center"
                  style={{ background: t.bg }}
                >
                  <t.icon size={24} style={{ color: t.color }} />
                </div>
                <h3 className="text-[#0D0D0D] text-xl font-black uppercase">{t.name}</h3>
              </div>
              <p className="text-[#444] text-sm font-semibold mb-5 leading-relaxed">{t.plain}</p>
              <ul className="flex flex-col gap-3">
                {t.fields.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0"
                      style={{ background: t.bg }}
                    >
                      <f.icon size={14} style={{ color: t.color }} strokeWidth={2.5} />
                    </div>
                    <span className="text-[#0D0D0D] text-sm font-semibold">{f.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Supabase callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-[#FFD600] border-4 border-black brutal-shadow p-6 text-center"
        >
          <p className="text-[#0D0D0D] text-sm font-black">
            Stored on <strong>Supabase</strong> — handles up to{" "}
            <strong>50,000 active users</strong> on the free tier.
            Auto-backups. Zero maintenance.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
