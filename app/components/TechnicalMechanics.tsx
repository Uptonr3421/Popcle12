"use client";

import { motion } from "framer-motion";
import { Server, Smartphone, Bell, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function TechnicalMechanics() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-6 bg-white border-b-8 border-black relative overflow-hidden">
      {/* Pop Art Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 bg-dots-pink"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-block bg-pop-pink px-8 py-4 border-4 border-black brutal-shadow mb-8 rotate-1">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight text-white">
              Under The Hood
            </h2>
          </div>
          <div className="bg-white p-6 md:p-8 border-4 border-black brutal-shadow max-w-3xl mx-auto -rotate-1">
            <p className="text-lg md:text-xl text-black font-bold leading-relaxed">
              Beautiful design is nothing without raw performance. Here&apos;s a plain-English look at how your app talks to the real world, securely and instantaneously.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Push Notification Pipeline */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <h3 className="text-3xl font-black mb-8 text-black uppercase tracking-wide flex items-center gap-3">
              <div className="w-12 h-12 bg-pop-yellow border-2 border-black flex items-center justify-center brutal-shadow rotate-3 text-black">
                <Bell size={24} />
              </div>
              The "Buzz" Pipeline
            </h3>
            
            <div className="bg-white p-6 md:p-8 border-4 border-black brutal-shadow relative">
              <div className="flex flex-col gap-6 relative z-10">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 border-2 border-black p-4 brutal-shadow flex items-center gap-4">
                    <Server className="text-pop-pink" size={32} />
                    <div className="text-left bg-transparent">
                      <p className="font-bold text-black uppercase mb-1">Your Brain</p>
                      <p className="text-xs text-gray-700 font-medium">Sends the message</p>
                    </div>
                  </div>
                </div>
                
                {/* Connection Arrow */}
                <div className="flex justify-center -my-2 text-black pl-8">
                  <RefreshCw className="animate-spin-slow" size={24} />
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 border-2 border-black p-4 brutal-shadow flex items-center gap-4">
                    <Bell className="text-pop-yellow" size={32} />
                    <div className="text-left">
                      <p className="font-bold text-black uppercase mb-1">Apple & Google</p>
                      <p className="text-xs text-gray-700 font-medium">Delivers it for free</p>
                    </div>
                  </div>
                </div>

                {/* Connection Arrow */}
                <div className="flex justify-center -my-2 text-black pl-8">
                  <div className="w-1 h-8 bg-black"></div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-pop-blue border-2 border-black p-4 brutal-shadow flex items-center gap-4 text-black">
                    <Smartphone size={32} />
                    <div className="text-left">
                      <p className="font-bold uppercase mb-1">Customer Phone</p>
                      <p className="text-xs font-bold bg-white px-2 py-1 uppercase inline-block border border-black shadow-[2px_2px_0_0_#000]">Ding! They see it.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-400 text-black font-medium leading-relaxed">
                <p>When you send a blast to your customers, our system does the heavy lifting to securely route that message straight to Apple and Google&apos;s native notification centers. Instantly. Reliably.</p>
              </div>
            </div>
          </motion.div>

          {/* New Image Feature / Geofencing combo */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <h3 className="text-3xl font-black mb-8 text-black uppercase tracking-wide flex items-center gap-3">
              <div className="w-12 h-12 bg-pop-pink border-2 border-black flex items-center justify-center brutal-shadow -rotate-3 text-white">
                <Smartphone size={24} />
              </div>
              Always-On Radar
            </h3>
            
            <div className="bg-white p-6 md:p-8 border-4 border-black brutal-shadow relative group">
              {/* Vibrant Image Display inside the brutalist card */}
              <div className="relative w-full h-48 md:h-64 border-4 border-black brutal-shadow mb-6 overflow-hidden">
                <Image 
                  src="/desserts.png" 
                  alt="Bright vibrant pop-art style flat lay of gourmet desserts" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Geofence Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute w-32 h-32 rounded-full border-4 border-pop-yellow bg-pop-yellow/30"
                  />
                  <div className="bg-white text-black font-black uppercase px-4 py-2 border-2 border-black brutal-shadow z-10 rotate-3 text-sm">
                    Geofence Triggered!
                  </div>
                </div>
              </div>

              <div className="text-black font-medium leading-relaxed">
                <p className="mb-4">
                  <strong className="text-pop-purple uppercase text-lg inline-block mb-1 border-b-2 border-black">Smart Battery Magic.</strong> 
                  <br />
                  The app draws a 500-foot invisible circle around your store directly on the customer&apos;s phone.
                </p>
                <p>
                  Because the phone itself does the tracking (not our servers), <span className="text-pop-pink font-black uppercase">it works perfectly even if the app is fully closed</span>. It doesn&apos;t drain their battery or stalk their location. It simply waits for them to arrive.
                </p>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
