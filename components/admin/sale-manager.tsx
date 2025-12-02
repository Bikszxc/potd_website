'use client';

import { useActionState, useEffect, useState } from 'react';
import { applySale, clearSale } from '@/actions/sale-actions';
import { Rank } from '@/types';
import { toast } from 'sonner';
import { Tag, Eraser } from 'lucide-react';

export default function SaleManager({ ranks }: { ranks: Rank[] }) {
  const [scope, setScope] = useState<'global' | 'specific'>('global');
  
  const [applyState, applyAction, isApplyPending] = useActionState(applySale, null);
  const [clearState, clearAction, isClearPending] = useActionState(clearSale, null);

  useEffect(() => {
    if (applyState?.success) toast.success(applyState.message);
    else if (applyState?.success === false) toast.error(applyState.message);
  }, [applyState]);

  useEffect(() => {
    if (clearState?.success) toast.success(clearState.message);
    else if (clearState?.success === false) toast.error(clearState.message);
  }, [clearState]);

  const isPending = isApplyPending || isClearPending;

  return (
    <div className="bg-[#131426] border border-white/5 rounded-sm p-4 mt-6">
      <div className="border-b border-white/5 pb-2 mb-4">
        <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
          <Tag size={16} className="text-[#FED405]" /> Rank Discounts
        </h3>
      </div>

      <form action={applyAction} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Target</label>
          <div className="flex gap-2 mb-2">
            <button 
              type="button" 
              onClick={() => setScope('global')}
              className={`flex-1 py-1 text-xs border ${scope === 'global' ? 'border-[#FED405] text-[#FED405] bg-[#FED405]/10' : 'border-white/10 text-gray-400'}`}
            >
              Global (All)
            </button>
            <button 
              type="button" 
              onClick={() => setScope('specific')}
              className={`flex-1 py-1 text-xs border ${scope === 'specific' ? 'border-[#FED405] text-[#FED405] bg-[#FED405]/10' : 'border-white/10 text-gray-400'}`}
            >
              Specific Rank
            </button>
          </div>
          <input type="hidden" name="scope" value={scope} />
          
          {scope === 'specific' && (
            <select name="rank_id" className="w-full bg-[#191A30] border border-white/10 p-2 text-xs focus:border-[#FED405] focus:outline-none text-white mb-2">
              {ranks.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
           <div className="flex-1">
             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Discount Type</label>
             <select name="type" className="w-full bg-[#191A30] border border-white/10 p-2 text-xs focus:border-[#FED405] focus:outline-none text-white">
               <option value="percent">Percentage (%)</option>
               <option value="fixed">Fixed Amount (₱)</option>
             </select>
           </div>
           <div className="flex-1">
             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Value</label>
             <input name="value" type="number" step="0.01" required className="w-full bg-[#191A30] border border-white/10 p-2 text-xs focus:border-[#FED405] focus:outline-none text-white" placeholder="10" />
           </div>
        </div>

        <div className="flex gap-2 pt-2">
           <button 
             type="submit" 
             disabled={isPending}
             className="flex-1 bg-green-600 text-white text-xs font-bold py-2 uppercase hover:bg-green-500 transition disabled:opacity-50"
           >
             Apply Sale
           </button>
           {/* We need a separate form or button for clearing. Nesting forms is bad. 
               We can use formAction on the button if we were inside one form, 
               but clearSale needs different inputs? Actually similar inputs (scope/id). 
               So we can reuse the form context.
           */}
           <button 
             formAction={clearAction}
             formNoValidate
             disabled={isPending}
             className="flex-1 bg-red-600 text-white text-xs font-bold py-2 uppercase hover:bg-red-500 transition flex items-center justify-center gap-1 disabled:opacity-50"
           >
             <Eraser size={14} /> Force End Sale
           </button>
        </div>
      </form>
    </div>
  );
}
