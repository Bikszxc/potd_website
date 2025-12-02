'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Database, Radio, Map as MapIcon, Crosshair, Target, Fingerprint } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    id: "01",
    title: "No Wipe Legacy",
    subtitle: "Persistent World",
    description: "Build a legacy that lasts. Our server features a persistent world where your safehouse, your faction, and your impact remain until the bitter end. History is written by the survivors, not the server resets.",
    icon: Database,
    image: "/showcase1.jpg",
    stats: [
      { label: "Uptime", value: "99.9%" },
      { label: "Data", value: "Persistent" }
    ]
  },
  {
    id: "02",
    title: "Interactive RP",
    subtitle: "Dynamic Storytelling",
    description: "Driven by a dedicated storytelling team. Engage in server-wide events, navigate complex faction politics, and deal with the consequences of your actions. Every signal could be a trap; every ally, a potential threat.",
    icon: Radio,
    image: "/showcase2.jpg",
    stats: [
      { label: "Factions", value: "Active" },
      { label: "Events", value: "Daily" }
    ]
  },
  {
    id: "03",
    title: "Custom Map",
    subtitle: "Uncharted Territory",
    description: "Explore unique locations designed specifically for Pinya of The Dead. From quarantined military zones to overgrown urban ruins, every corner tells a story. Warning: High danger levels detected in sector 4.",
    icon: MapIcon,
    image: null, // Placeholder for #3
    stats: [
      { label: "Zones", value: "12+" },
      { label: "Danger", value: "Extreme" }
    ]
  }
];

function SchematicCard({ feature }: { feature: typeof features[0] }) {
  return (
    <div className="w-full h-[400px] bg-[#131426] relative border border-white/10 group overflow-hidden rounded-sm">
        {/* Background Image or Blueprint Grid */}
        {feature.image ? (
            <div className="absolute inset-0">
                <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131426] via-[#131426]/50 to-transparent"></div>
            </div>
        ) : (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        )}
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,212,5,0.03),transparent_70%)]"></div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FED405]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FED405]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FED405]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FED405]"></div>

        {/* Central Icon (Only show if no image, or as overlay) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
                <div className="absolute inset-0 bg-[#FED405] blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <feature.icon size={80} className={`${feature.image ? 'text-white/80' : 'text-gray-600'} group-hover:text-[#FED405] transition-colors duration-500 relative z-10 drop-shadow-lg`} strokeWidth={1} />
                
                {/* Rotating circles */}
                <div className="absolute inset-[-20px] border border-white/10 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
                <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            </div>
        </div>

        {/* Data Readouts */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#0f1016] to-transparent">
            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                {feature.stats.map((stat, idx) => (
                    <div key={idx} className="text-left">
                        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">{stat.label}</div>
                        <div className="text-lg font-mono text-[#FED405]">{stat.value}</div>
                    </div>
                ))}
                <div className="text-right">
                    <div className="text-[10px] uppercase text-gray-600 font-mono">SYS.ID</div>
                    <div className="text-white font-bold">{feature.id}</div>
                </div>
            </div>
        </div>

        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#FED405]/5 to-transparent -translate-y-full group-hover:animate-[scan_2s_linear_infinite]"></div>
    </div>
  );
}

export default function NarrativeSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="narrative" ref={containerRef} className="py-32 bg-[#191A30] relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Central Timeline Line (Desktop only) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 -translate-x-1/2 hidden md:block">
            <motion.div 
                style={{ height: lineHeight }}
                className="w-full bg-gradient-to-b from-[#FED405] via-[#FED405]/50 to-transparent"
            ></motion.div>
        </div>

        {features.map((feature, index) => (
          <div 
            key={feature.id}
            className={`relative flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24 mb-32 last:mb-0 group`}
          >
            {/* Center Node (Desktop) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 bg-[#191A30] border border-white/10 rounded-full z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="w-3 h-3 bg-[#FED405] rounded-full group-hover:animate-ping"></div>
            </div>

            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#FED405] font-black text-5xl opacity-20 font-mono relative -bottom-4">{feature.id}</span>
                <div className={`h-[1px] flex-1 bg-gradient-to-r ${index % 2 === 0 ? 'from-[#FED405]/50 to-transparent' : 'from-transparent to-[#FED405]/50'}`}></div>
              </div>
              
              <h4 className="text-[#FED405] font-bold uppercase tracking-widest text-sm mb-2">{feature.subtitle}</h4>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase leading-none">{feature.title}</h2>
              
              <p className="text-gray-400 text-lg leading-relaxed border-l-2 border-white/10 pl-6 group-hover:border-[#FED405] transition-colors duration-500">
                {feature.description}
              </p>
            </motion.div>

            {/* Visual Content */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="flex-1 w-full"
            >
               <SchematicCard feature={feature} />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
