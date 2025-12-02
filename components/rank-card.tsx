'use client';

import { motion } from 'framer-motion';
import { Rank } from '@/types';
import * as Icons from 'lucide-react';

const EXCHANGE_RATE = 58; // 1 USD = 58 PHP (Approx)

export default function RankCard({ 
  rank, 
  parentRankName, 
  onSelect,
  currency = 'PHP'
}: { 
  rank: Rank, 
  parentRankName?: string,
  onSelect: (rank: Rank) => void,
  currency?: 'PHP' | 'USD'
}) {
  const IconComp = (Icons as any)[rank.icon_name] || Icons.Shield;
  
  const displayPerks = rank.perks ? rank.perks.slice(0, 3) : [];
  const remainingPerksCount = (rank.perks ? rank.perks.length : 0) - 3;

  // Currency Conversion Logic
  const formatPrice = (price: number) => {
    if (currency === 'PHP') {
      return `₱${price.toLocaleString()}`;
    } else {
      // Convert to USD and round to nearest 0.05
      const usd = price / EXCHANGE_RATE;
      const rounded = (Math.round(usd * 20) / 20).toFixed(2);
      return `$${rounded}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#131426] border border-white/10 p-6 flex flex-col items-center text-center group hover:bg-[#1a1c33] transition-colors relative overflow-hidden rounded-sm h-full"
      style={{ borderColor: rank.color }}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundColor: rank.color }}></div>

      {/* Sale Badge */}
      {rank.sale_price && (
        <div className="absolute top-0 left-0 z-10">
           <div className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 tracking-widest shadow-lg clip-path-tag">
             SALE
           </div>
        </div>
      )}

      <div className="p-4 rounded-full bg-[#191A30] border border-white/10 mb-4" style={{ color: rank.color }}>
        <IconComp size={32} />
      </div>
      
      <h3 className="text-xl font-bold uppercase tracking-widest mb-2" style={{ color: rank.color }}>
        {rank.name}
      </h3>
      
      <div className="mb-6">
          {rank.sale_price ? (
            <>
              <span className="block text-sm text-gray-500 line-through">{formatPrice(rank.price)}</span>
              <span className="text-3xl font-black text-[#FED405]">{formatPrice(rank.sale_price)}</span>
            </>
          ) : (
              <span className="text-3xl font-black text-white">{formatPrice(rank.price)}</span>
          )}
          <span className="text-sm text-gray-500 font-normal ml-1">
            /{rank.billing_cycle === 'lifetime' ? 'one-time' : 'mo'}
          </span>
      </div>

      <ul className="space-y-3 text-sm text-gray-400 mb-8 flex-1 w-full">
        {parentRankName && (
            <li className="flex items-center justify-center gap-2 italic text-white/60">
              <Icons.ArrowUpCircle size={12} /> All perks of {parentRankName}
            </li>
        )}
        {displayPerks.map((perk, i) => (
          <li key={i} className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            {perk}
          </li>
        ))}
        {remainingPerksCount > 0 && (
          <li className="text-xs text-gray-600 italic">+{remainingPerksCount} more perks...</li>
        )}
      </ul>

      <button 
        onClick={() => onSelect(rank)}
        className="w-full py-3 font-bold uppercase tracking-wider border-2 transition-colors hover:text-[#191A30]"
        style={{ borderColor: rank.color, color: rank.color }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = rank.color;
            e.currentTarget.style.color = '#191A30';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = rank.color;
        }}
      >
        Select
      </button>
    </motion.div>
  );
}