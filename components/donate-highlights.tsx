'use client';

import { motion } from 'framer-motion';
import { Car, Type, Box, Crown, PaintBucket, Package } from 'lucide-react';

const highlights = [
  {
    id: 1,
    title: "Custom Rank Titles",
    subtitle: "Stand Out",
    description: "Equip unique, color-coded titles in chat and overhead to assert your dominance.",
    icon: Crown,
    color: "text-[#FED405]",
    bg: "bg-[#FED405]/10",
    border: "border-[#FED405]/20",
    image: "https://www.transparenttextures.com/patterns/diagmonds-light.png"
  },
  {
    id: 2,
    title: "Exclusive Liveries",
    subtitle: "Ride in Style",
    description: "Access a library of custom vehicle skins or commission your own faction branding.",
    icon: Car,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    image: "https://www.transparenttextures.com/patterns/carbon-fibre.png"
  },
  {
    id: 3,
    title: "Monthly Lootboxes",
    subtitle: "Survival Aid",
    description: "Receive periodic supply drops containing ammo, crafting mats, and rare collectibles.",
    icon: Package,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    image: "https://www.transparenttextures.com/patterns/cubes.png"
  }
];

export default function DonateHighlights() {
  return (
    <div className="mb-24 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative">
      {/* Connecting Line (Desktop) */}
      <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>

      {highlights.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 }}
          className={`relative h-64 group overflow-hidden border ${item.border} bg-[#131426]`}
        >
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${item.image})` }}
          ></div>
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br from-[#191A30] via-[#191A30]/80 to-${item.bg.split('/')[0]}/20`}></div>

          {/* Content Container */}
          <div className="relative h-full p-6 flex flex-col justify-between z-10">
            
            {/* Top Section */}
            <div className="flex justify-between items-start">
               <div className={`p-3 rounded-sm border ${item.border} ${item.bg} backdrop-blur-sm`}>
                 <item.icon size={24} className={item.color} />
               </div>
               <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                 Asset 0{item.id}
               </span>
            </div>

            {/* Bottom Section */}
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-widest mb-1 ${item.color}`}>
                {item.subtitle}
              </h4>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 group-hover:translate-x-1 transition-transform duration-300">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-white/10 pl-3">
                {item.description}
              </p>
            </div>

            {/* Decorative Corner */}
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 ${item.border} opacity-50`}></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
