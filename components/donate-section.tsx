'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { SaleConfig, Rank } from '@/types';
import * as Icons from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import RankCard from '@/components/rank-card';
import DonateHighlights from './donate-highlights';

const EXCHANGE_RATE = 58; // 1 USD = 58 PHP (Approx)

export default function DonateSection({ ranks, saleConfig }: { ranks: Rank[], saleConfig?: SaleConfig }) {
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');

  const formatPrice = (price: number) => {
    if (currency === 'PHP') {
      return `₱${price.toLocaleString()}`;
    } else {
      const usd = price / EXCHANGE_RATE;
      const rounded = (Math.round(usd * 20) / 20).toFixed(2);
      return `$${rounded}`;
    }
  };

  // Logic for banner display
  // Prioritize saleConfig.active if available
  const isSaleActive = saleConfig?.active;
  
  // If active, calculate generic discount description
  let bannerText = '';
  if (isSaleActive) {
      if (saleConfig.discount_type === 'percent') {
          bannerText = `${saleConfig.discount_value}% discount on all ranks`;
      } else if (saleConfig.discount_type === 'fixed') {
          bannerText = `₱${saleConfig.discount_value} off all ranks`;
      }
      
      if (saleConfig.sale_end_date) {
          const date = new Date(saleConfig.sale_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          bannerText += ` till ${date}`;
      }
  }

  return (
    <section id="donate" className="py-24 bg-[#191A30] border-t border-white/5 relative min-h-screen">
      <style jsx global>{`
        .clip-path-tag {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0);
        }
        /* Or a more tactical slanted edge */
        .clip-path-tactical {
           clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
      `}</style>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>
      
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              {/* Hero Header */}
              <div className="text-center mb-20 relative">
                <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 uppercase tracking-tighter relative z-10 drop-shadow-2xl">
                  SUPPLY <span className="text-stroke-yellow text-[#FED405]">DROP</span>
                </h2>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-9xl font-black text-white/5 uppercase tracking-widest pointer-events-none whitespace-nowrap hidden md:block">
                  POTD STORE
                </div>
                <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg font-medium border-b border-[#FED405]/30 pb-8 inline-block">
                  Fuel the server. Forge your legacy. Secure exclusive assets.
                </p>
              </div>
      
              {/* Highlights Section */}
              <div className="mb-24">
                 <DonateHighlights />
              </div>
      
              {/* Global Sale Banner */}
              {isSaleActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-12 max-w-3xl mx-auto p-6 text-center relative overflow-hidden group border"
                  style={{ 
                      backgroundColor: `${saleConfig.sale_color}1A`, // 10% opacity hex approximation
                      borderColor: saleConfig.sale_color || '#DC2626'
                  }}
                >
                   <div className="absolute top-0 left-0 w-full h-1 animate-pulse" style={{ backgroundColor: saleConfig.sale_color || '#DC2626' }}></div>
                   <div className="absolute bottom-0 right-0 w-full h-1 animate-pulse" style={{ backgroundColor: saleConfig.sale_color || '#DC2626' }}></div>
                   
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter drop-shadow-lg" style={{ color: saleConfig.sale_color || '#DC2626' }}>
                     {saleConfig.sale_header || 'Global Operations Sale'}
                   </h3>
                   <p className="text-white font-bold uppercase tracking-widest mt-2">
                     {bannerText.toUpperCase()}
                   </p>
                </motion.div>
              )}
      
              {/* Ranks Grid */}
              <div className="mb-12">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Icons.Award className="text-[#FED405]" /> Lifetime Ranks
                      </h3>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
                  </div>
      
                  {ranks.length === 0 ? (
                      <div className="text-center text-gray-500 italic">No donation tiers available at this time.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {ranks.sort((a,b) => a.weight - b.weight).map((rank) => {
                          const parentRank = ranks.find(r => r.id === rank.parent_rank_id);
                          return (
                          <RankCard 
                              key={rank.id} 
                              rank={rank} 
                              parentRankName={parentRank?.name} 
                              onSelect={setSelectedRank} 
                              currency={currency}
                          />
                          );
                      })}
                      </div>
                  )}
              </div>
      
              {/* Currency Toggle (Moved to bottom) */}
              <div className="flex justify-center mb-12">
                 <div className="bg-[#131426] border border-white/10 p-1 rounded-full flex items-center">
                    <button 
                      onClick={() => setCurrency('PHP')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${currency === 'PHP' ? 'bg-[#FED405] text-[#191A30]' : 'text-gray-400 hover:text-white'}`}
                    >
                      PHP (₱)
                    </button>
                    <button 
                      onClick={() => setCurrency('USD')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${currency === 'USD' ? 'bg-[#FED405] text-[#191A30]' : 'text-gray-400 hover:text-white'}`}
                    >
                      USD ($)
                    </button>
                 </div>
              </div>
      
              {/* Detail Modal */}        <Dialog.Root open={!!selectedRank} onOpenChange={(open) => !open && setSelectedRank(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#191A30] border border-white/10 p-8 shadow-2xl z-50 outline-none animate-in zoom-in-95 duration-300">
               {selectedRank && (() => {
                   const IconComp = (Icons as any)[selectedRank.icon_name] || Icons.Shield;
                   const parentRank = ranks.find(r => r.id === selectedRank.parent_rank_id);
                   
                   return (
                     <>
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                              <div className="p-3 rounded bg-[#131426] border border-white/10" style={{ color: selectedRank.color }}>
                                <IconComp size={24} />
                              </div>
                              <div>
                                <Dialog.Title className="text-2xl font-black uppercase tracking-tight text-white">
                                  {selectedRank.name}
                                </Dialog.Title>
                                <div className="flex items-baseline gap-2">
                                    {selectedRank.sale_price ? (
                                        <>
                                          <span className="text-sm text-gray-500 line-through">{formatPrice(selectedRank.price)}</span>
                                          <span className="text-xl font-bold text-[#FED405]">{formatPrice(selectedRank.sale_price)}</span>
                                        </>
                                    ) : (
                                        <span className="text-xl font-bold text-[#FED405]">{formatPrice(selectedRank.price)}</span>
                                    )}
                                    <span className="text-xs text-gray-500 uppercase">
                                        {selectedRank.billing_cycle}
                                    </span>
                                </div>
                              </div>
                           </div>
                           <Dialog.Close className="text-gray-500 hover:text-white transition-colors">
                             <X size={24} />
                           </Dialog.Close>
                        </div>

                        <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto">
                           {parentRank && (
                             <div className="bg-[#131426] p-3 border border-white/5 rounded flex items-center gap-3">
                                <Icons.CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-sm text-gray-300">Includes all benefits of <span className="font-bold text-white">{parentRank.name}</span></span>
                             </div>
                           )}
                           
                           <div>
                             <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Exclusive Perks</h4>
                             <ul className="space-y-2">
                               {selectedRank.perks?.map((perk, i) => (
                                 <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                   <Icons.Check size={16} className="mt-0.5 shrink-0" style={{ color: selectedRank.color }} />
                                   <span>{perk}</span>
                                 </li>
                               ))}
                             </ul>
                           </div>
                        </div>

                        <button 
                          className="w-full py-4 font-bold uppercase tracking-widest text-[#191A30] hover:brightness-110 transition-all"
                          style={{ backgroundColor: selectedRank.color }}
                        >
                           Purchase Rank ({formatPrice(selectedRank.sale_price || selectedRank.price)})
                        </button>
                     </>
                   );
               })()}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      </div>
    </section>
  );
}
