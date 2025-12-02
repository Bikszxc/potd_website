import { useActionState, useEffect, useState } from 'react';
import { applySale, clearSale } from '@/actions/sale-actions';
import { Rank, SaleConfig } from '@/types';
import { toast } from 'sonner';
import { Tag, Calendar, Type, Palette, Clock, Eraser } from 'lucide-react';
import ActiveSalesList from './active-sales-list';

export default function DiscountManager({ ranks, saleConfig }: { ranks: Rank[], saleConfig: SaleConfig }) {
  const [scope, setScope] = useState<'global' | 'specific'>('global');
  const [startType, setStartType] = useState<'now' | 'scheduled'>('now');
  const [endMode, setEndMode] = useState<'1d' | '3d' | '7d' | 'custom'>('custom');
  
  const [applyState, applyAction, isApplyPending] = useActionState(applySale, null);
  const [clearState, clearAction, isClearPending] = useActionState(clearSale, null);

  // Local state for config to show current values
  const [configValues, setConfigValues] = useState({
      header: 'Global Operations Sale',
      color: '#DC2626',
      endDate: '',
      startDate: ''
  });

  useEffect(() => {
      if (saleConfig) {
          const endDateStr = saleConfig.sale_end_date ? new Date(saleConfig.sale_end_date).toISOString().slice(0, 16) : '';
          const startDateStr = saleConfig.sale_start_date ? new Date(saleConfig.sale_start_date).toISOString().slice(0, 16) : '';
          setConfigValues({
              header: saleConfig.sale_header || 'Global Operations Sale',
              color: saleConfig.sale_color || '#DC2626',
              endDate: endDateStr,
              startDate: startDateStr
          });
          setEndMode('custom');
      }
  }, [saleConfig]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#131426] p-6 border border-white/5 rounded-sm h-fit">
             <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className="text-xl font-bold text-[#FED405] uppercase flex items-center gap-2">
                <Tag size={24} /> Discount Configuration
                </h3>
                <p className="text-gray-400 text-sm">Set up sales for your donation ranks.</p>
            </div>

            <form action={applyAction} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Scope</label>
                    <div className="flex gap-2">
                        <button 
                        type="button" 
                        onClick={() => setScope('global')}
                        className={`flex-1 py-2 text-sm border font-bold uppercase ${scope === 'global' ? 'border-[#FED405] text-[#FED405] bg-[#FED405]/10' : 'border-white/10 text-gray-400'}`}
                        >
                        Global (All Ranks)
                        </button>
                        <button 
                        type="button" 
                        onClick={() => setScope('specific')}
                        className={`flex-1 py-2 text-sm border font-bold uppercase ${scope === 'specific' ? 'border-[#FED405] text-[#FED405] bg-[#FED405]/10' : 'border-white/10 text-gray-400'}`}
                        >
                        Specific Rank
                        </button>
                    </div>
                    <input type="hidden" name="scope" value={scope} />
                </div>

                {scope === 'specific' && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Target Rank</label>
                        <select name="rank_id" className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white">
                        {ranks.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
                        <select name="type" className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white">
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed (₱)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Value</label>
                        <input name="value" type="number" step="0.01" required className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white" placeholder="10" />
                    </div>
                </div>

                {scope === 'global' && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <h4 className="text-sm font-bold text-white uppercase">Global Settings</h4>
                        
                        {/* Start Date Logic */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                                <Clock size={14} /> Sale Start
                            </label>
                            <div className="flex gap-2 mb-3">
                                <button 
                                type="button" 
                                onClick={() => setStartType('now')}
                                className={`flex-1 py-2 text-xs border font-bold uppercase ${startType === 'now' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-white/10 text-gray-400'}`}
                                >
                                Start Immediately
                                </button>
                                <button 
                                type="button" 
                                onClick={() => setStartType('scheduled')}
                                className={`flex-1 py-2 text-xs border font-bold uppercase ${startType === 'scheduled' ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-white/10 text-gray-400'}`}
                                >
                                Scheduled
                                </button>
                            </div>
                            <input type="hidden" name="start_type" value={startType} />
                            
                            {startType === 'scheduled' && (
                                <input 
                                    name="sale_start_date" 
                                    type="datetime-local" 
                                    value={configValues.startDate}
                                    onChange={(e) => setConfigValues({...configValues, startDate: e.target.value})}
                                    className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white text-gray-400" 
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                                <Calendar size={14} /> Sale End
                            </label>
                            
                            {/* Duration Presets */}
                            <div className="flex gap-2 mb-3">
                                {['1d', '3d', '7d'].map((duration) => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => {
                                            setEndMode(duration as any);
                                            const d = new Date();
                                            const daysToAdd = parseInt(duration);
                                            d.setDate(d.getDate() + daysToAdd);
                                            const isoDate = d.toISOString().split('T')[0];
                                            const targetTime = `${isoDate}T06:00:00+08:00`;
                                            setConfigValues({...configValues, endDate: targetTime});
                                        }}
                                        className={`flex-1 py-2 text-xs border font-bold uppercase ${endMode === duration ? 'border-[#FED405] text-[#FED405] bg-[#FED405]/10' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {duration.toUpperCase()}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEndMode('custom');
                                    }}
                                    className={`flex-1 py-2 text-xs border font-bold uppercase ${endMode === 'custom' ? 'border-[#FED405] text-[#FED405] bg-[#FED405]/10' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Custom
                                </button>
                            </div>

                            <input 
                                type="date" 
                                required={scope === 'global'}
                                value={configValues.endDate ? configValues.endDate.slice(0, 10) : ''}
                                onChange={(e) => {
                                    setEndMode('custom');
                                    const dateVal = e.target.value;
                                    if (dateVal) {
                                        const targetTime = `${dateVal}T06:00:00+08:00`;
                                        setConfigValues({...configValues, endDate: targetTime});
                                    } else {
                                        setConfigValues({...configValues, endDate: ''});
                                    }
                                }}
                                className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white text-gray-400 mb-2" 
                            />
                            
                            <input type="hidden" name="sale_end_date" value={configValues.endDate} />

                            {configValues.endDate && (
                                <p className="text-[10px] text-green-400 font-mono mt-1 flex items-center gap-1">
                                    <Clock size={10} />
                                    Sale will end on {new Date(configValues.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, 6:00 AM (PH Time)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 flex items-center gap-2">
                                <Type size={14} /> Banner Header
                            </label>
                            <input 
                                name="sale_header" 
                                type="text" 
                                value={configValues.header}
                                onChange={(e) => setConfigValues({...configValues, header: e.target.value})}
                                className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 flex items-center gap-2">
                                <Palette size={14} /> Alert Color
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={configValues.color}
                                    onChange={(e) => setConfigValues({...configValues, color: e.target.value})}
                                    className="h-10 w-10 bg-transparent border-none cursor-pointer"
                                />
                                <input 
                                    name="sale_color" 
                                    type="text" 
                                    value={configValues.color}
                                    onChange={(e) => setConfigValues({...configValues, color: e.target.value})}
                                    className="flex-1 bg-[#191A30] border border-white/10 p-2 text-sm focus:border-[#FED405] focus:outline-none text-white font-mono" 
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full bg-green-600 text-white font-bold py-3 uppercase tracking-wider hover:bg-green-500 transition disabled:opacity-50"
                >
                    {isPending ? 'Applying...' : 'Apply Discount'}
                </button>
            </form>
        </div>

        <div className="space-y-8">
            <ActiveSalesList ranks={ranks} saleConfig={saleConfig} />

            <div className="bg-[#131426] p-6 border border-white/5 rounded-sm h-fit">
                 <div className="border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-red-500 uppercase flex items-center gap-2">
                    <Eraser size={24} /> Termination
                    </h3>
                    <p className="text-gray-400 text-sm">End sales and reset prices.</p>
                </div>
                <form action={clearAction} className="space-y-4">
                    <input type="hidden" name="scope" value={scope} />
                    {scope === 'specific' && (
                         <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Target Rank to Reset</label>
                            <select name="rank_id" className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white">
                            {ranks.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                            </select>
                        </div>
                    )}
                    <p className="text-sm text-gray-400 mb-4">
                        {scope === 'global' 
                            ? "This will remove the sale price from ALL ranks and disable the global banner." 
                            : "This will remove the sale price from the selected rank."}
                    </p>
                    <button 
                        type="submit"
                        formNoValidate
                        disabled={isPending}
                        className="w-full bg-red-600 text-white font-bold py-3 uppercase tracking-wider hover:bg-red-500 transition disabled:opacity-50"
                    >
                        {isPending ? 'Processing...' : 'Force End Sale'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}
