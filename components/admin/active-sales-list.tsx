'use client';

import { Rank, SaleConfig } from '@/types';
import { Tag, Percent, Trash2 } from 'lucide-react';
import { clearSale } from '@/actions/sale-actions';
import { useFormStatus } from 'react-dom';

function TerminateButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending}
            className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition disabled:opacity-50"
            title="End Sale"
        >
            <Trash2 size={16} />
        </button>
    );
}

export default function ActiveSalesList({ ranks, saleConfig }: { ranks: Rank[], saleConfig: SaleConfig }) {
  const activeRankSales = ranks.filter(r => r.sale_price);
  const isGlobal = saleConfig?.active;

  return (
    <div className="bg-[#131426] p-6 border border-white/5 rounded-sm h-fit">
        <div className="border-b border-white/5 pb-4 mb-6">
            <h3 className="text-xl font-bold text-blue-500 uppercase flex items-center gap-2">
            <Percent size={24} /> Active Discounts
            </h3>
            <p className="text-gray-400 text-sm">Currently running promotions.</p>
        </div>
        
        <div className="space-y-3">
            {!isGlobal && activeRankSales.length === 0 && (
                <div className="text-gray-500 text-sm italic text-center py-4">
                    No active discounts running.
                </div>
            )}

            {isGlobal && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Tag size={16} className="text-red-500" />
                        <div>
                            <div className="text-white text-xs font-bold uppercase">{saleConfig.sale_header}</div>
                            <div className="text-[10px] text-gray-400">
                                {saleConfig.discount_type === 'percent' ? `${saleConfig.discount_value}% Off` : `₱${saleConfig.discount_value} Off`} Global
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] text-red-400 font-mono uppercase tracking-widest animate-pulse">Active</div>
                         <form action={async (formData) => { await clearSale(null, formData); }}>
                            <input type="hidden" name="scope" value="global" />
                            <TerminateButton />
                        </form>
                    </div>
                </div>
            )}

            {activeRankSales.map(rank => (
                <div key={rank.id} className="bg-[#191A30] border border-white/10 p-3 rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-white text-xs font-bold">{rank.name}</div>
                        <div className="flex gap-2 items-center">
                            <div className="text-[10px] text-gray-500 line-through">₱{rank.price}</div>
                            <div className="text-xs font-bold text-[#FED405]">₱{rank.sale_price}</div>
                        </div>
                    </div>
                    <form action={async (formData) => { await clearSale(null, formData); }}>
                        <input type="hidden" name="scope" value="specific" />
                        <input type="hidden" name="rank_id" value={rank.id} />
                        <TerminateButton />
                    </form>
                </div>
            ))}
        </div>
    </div>
  );
}