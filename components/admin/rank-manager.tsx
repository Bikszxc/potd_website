'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { createRank, updateRank, deleteRank } from '@/actions/rank-actions';
import { Rank } from '@/types';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, X, Save, Eye } from 'lucide-react';
import IconPicker from './icon-picker';
import * as Icons from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import RankCard from '@/components/rank-card';

export default function RankManager({ initialRanks }: { initialRanks: Rank[] }) {
  const [ranks, setRanks] = useState<Rank[]>(initialRanks);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [perksList, setPerksList] = useState<string[]>(['']);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusNewPerk, setFocusNewPerk] = useState(false);
  const perkInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [createState, createAction, isCreatePending] = useActionState(createRank, null);
  const [updateState, updateAction, isUpdatePending] = useActionState(updateRank, null);

  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    billing_cycle: 'monthly',
    color: '#FED405',
    icon_name: 'Shield',
    weight: 0,
    parent_rank_id: '',
    sale_price: ''
  });

  useEffect(() => {
    setRanks(initialRanks);
  }, [initialRanks]);

  useEffect(() => {
    if (createState?.success) {
      toast.success(createState.message);
      setShowConfirm(false);
      resetForm();
    } else if (createState?.success === false) {
      toast.error(createState.message);
      setShowConfirm(false); // Close modal on error to allow fixing
    }
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) {
      toast.success(updateState.message);
      setEditingRank(null);
      setShowConfirm(false);
      resetForm();
    } else if (updateState?.success === false) {
      toast.error(updateState.message);
      setShowConfirm(false);
    }
  }, [updateState]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      billing_cycle: 'monthly',
      color: '#FED405',
      icon_name: 'Shield',
      weight: 0,
      parent_rank_id: '',
      sale_price: ''
    });
    setPerksList(['']);
    setEditingRank(null);
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank);
    setFormData({
      name: rank.name,
      price: rank.price,
      billing_cycle: rank.billing_cycle, // Cast string to union if needed, assuming it matches
      color: rank.color,
      icon_name: rank.icon_name,
      weight: rank.weight,
      parent_rank_id: rank.parent_rank_id ? rank.parent_rank_id.toString() : '',
      sale_price: rank.sale_price ? rank.sale_price.toString() : ''
    });
    setPerksList(rank.perks && rank.perks.length > 0 ? rank.perks : ['']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this rank? This will remove it from the donation page.')) {
      const result = await deleteRank(id);
      if (result.success) {
        toast.success('Rank deleted');
      } else {
        toast.error('Failed to delete');
      }
    }
  };

  const handlePerkChange = (index: number, value: string) => {
    const newPerks = [...perksList];
    newPerks[index] = value;
    setPerksList(newPerks);
  };

  const addPerkField = () => {
    setPerksList([...perksList, '']);
    setFocusNewPerk(true);
  };

  useEffect(() => {
    if (focusNewPerk && perksList.length > 0) {
        const lastIndex = perksList.length - 1;
        perkInputsRef.current[lastIndex]?.focus();
        setFocusNewPerk(false);
    }
  }, [perksList, focusNewPerk]);

  const removePerkField = (index: number) => {
    const newPerks = perksList.filter((_, i) => i !== index);
    setPerksList(newPerks);
  };

  // Construct a preview rank object from form data
  const previewRank: Rank = {
    id: editingRank?.id || 0,
    name: formData.name || 'Preview Rank',
    price: formData.price,
    billing_cycle: formData.billing_cycle as 'lifetime' | 'monthly',
    color: formData.color,
    icon_name: formData.icon_name,
    weight: formData.weight,
    parent_rank_id: formData.parent_rank_id ? parseInt(formData.parent_rank_id) : null,
    perks: perksList.filter(p => p.trim() !== ''),
    sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
    sale_start_date: null,
    sale_end_date: null,
    created_at: new Date().toISOString()
  };
  
  const parentRankPreview = ranks.find(r => r.id === previewRank.parent_rank_id);

  const isPending = isCreatePending || isUpdatePending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#131426] p-6 border border-white/5 rounded-sm">
           <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
             <div>
               <h3 className="text-xl font-bold text-[#FED405] uppercase">
                 {editingRank ? 'Edit Rank' : 'Create New Rank'}
               </h3>
               <p className="text-gray-400 text-sm">Manage donation tiers and perks.</p>
             </div>
             {editingRank && (
               <button onClick={resetForm} className="text-xs flex items-center gap-1 bg-gray-700 px-3 py-1 text-white rounded hover:bg-gray-600 transition">
                 <X size={12} /> Cancel
               </button>
             )}
           </div>

           {/* We use ref to submit this form programmatically from the modal */}
           <form ref={formRef} action={editingRank ? updateAction : createAction} className="space-y-6">
             {editingRank && <input type="hidden" name="id" value={editingRank.id} />}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Rank Title</label>
                 <input 
                   name="name" 
                   type="text" 
                   required 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white" 
                   placeholder="e.g. Warlord" 
                 />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Parent Rank (Inherits Perks)</label>
                  <select 
                    name="parent_rank_id" 
                    value={formData.parent_rank_id}
                    onChange={e => setFormData({...formData, parent_rank_id: e.target.value})}
                    className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white"
                  >
                    <option value="">(None)</option>
                    {ranks.filter(r => r.id !== editingRank?.id).map(r => (
                      <option key={r.id} value={r.id}>{r.name} (₱{r.price})</option>
                    ))}
                  </select>
               </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Price (₱)</label>
                 <input 
                   name="price" 
                   type="number" 
                   step="0.01" 
                   required 
                   value={formData.price} 
                   onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                   className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white" 
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Cycle</label>
                 <select 
                   name="billing_cycle" 
                   value={formData.billing_cycle}
                   onChange={e => setFormData({...formData, billing_cycle: e.target.value})}
                   className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white"
                 >
                   <option value="monthly">Monthly</option>
                   <option value="lifetime">Lifetime</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Sort Weight</label>
                 <input 
                   name="weight" 
                   type="number" 
                   required 
                   value={formData.weight} 
                   onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})}
                   className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white" 
                   placeholder="0 = First" 
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                 <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Theme Color (Hex)</label>
                 <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="h-10 w-10 bg-transparent border-none cursor-pointer"
                    />
                    <input 
                      name="color" 
                      type="text" 
                      required 
                      value={formData.color} 
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="flex-1 bg-[#191A30] border border-white/10 p-2 text-sm focus:border-[#FED405] focus:outline-none text-white font-mono" 
                    />
                 </div>
                 
                 <div className="mt-4">
                   <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Icon</label>
                   <input type="hidden" name="icon_name" value={formData.icon_name} />
                   <IconPicker selected={formData.icon_name} onChange={(icon) => setFormData({...formData, icon_name: icon})} />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Perks</label>
                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                   {perksList.map((perk, idx) => (
                     <div key={idx} className="flex gap-2">
                       <input 
                         ref={(el) => { perkInputsRef.current[idx] = el }}
                         type="text" 
                         name="perks"
                         value={perk}
                         onChange={(e) => handlePerkChange(idx, e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             addPerkField();
                           }
                         }}
                         className="flex-1 bg-[#191A30] border border-white/10 p-2 text-sm focus:border-[#FED405] focus:outline-none text-white"
                         placeholder="Perk description..."
                       />
                       <button 
                         type="button" 
                         onClick={() => removePerkField(idx)}
                         className="p-2 text-red-500 hover:bg-white/10 rounded"
                       >
                         <X size={16} />
                       </button>
                     </div>
                   ))}
                   <button 
                     type="button" 
                     onClick={addPerkField}
                     className="w-full py-2 border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 text-xs uppercase font-bold flex items-center justify-center gap-2"
                   >
                     <Plus size={14} /> Add Perk
                   </button>
                 </div>
               </div>
             </div>

             {/* Trigger Confirmation Modal instead of Submit */}
             <button 
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full bg-[#FED405] text-[#191A30] font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2 mt-6"
             >
                {editingRank ? <><Save size={18} /> Preview Update</> : <><Eye size={18} /> Preview & Create</>}
             </button>
           </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-1">
        <div className="bg-[#131426] border border-white/5 rounded-sm h-full max-h-[800px] flex flex-col">
           <div className="p-4 border-b border-white/5 bg-[#191A30]">
              <h3 className="font-bold text-white uppercase text-sm">Existing Tiers</h3>
           </div>
           <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {ranks.length === 0 && <div className="text-gray-500 text-xs p-4 text-center italic">No ranks defined.</div>}
              
              {ranks.sort((a,b) => a.weight - b.weight).map(rank => {
                const IconComp = (Icons as any)[rank.icon_name] || Icons.HelpCircle;
                return (
                  <div key={rank.id} className={`p-3 border rounded-sm transition-all group ${editingRank?.id === rank.id ? 'bg-[#FED405]/10 border-[#FED405]' : 'bg-[#191A30] border-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-white/10" style={{ color: rank.color }}>
                          <IconComp size={14} />
                        </div>
                        <span className="font-bold text-white text-sm">{rank.name}</span>
                      </div>
                      <div className="text-right">
                         {rank.sale_price ? (
                           <>
                             <span className="block text-[10px] text-gray-500 line-through">₱{rank.price}</span>
                             <span className="block text-xs font-bold text-[#FED405]">₱{rank.sale_price}</span>
                           </>
                         ) : (
                           <span className="block text-xs font-bold text-gray-300">₱{rank.price}</span>
                         )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => handleEdit(rank)}
                        className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white py-1.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button 
                         onClick={() => handleDelete(rank.id)}
                         className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white py-1.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#191A30] border border-white/10 p-8 shadow-2xl z-50 outline-none animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-black uppercase text-white">
                     Confirm {editingRank ? 'Update' : 'Creation'}
                  </Dialog.Title>
                  <Dialog.Close className="text-gray-500 hover:text-white">
                     <X size={24} />
                  </Dialog.Close>
               </div>
               
               <div className="mb-8 flex justify-center">
                  {/* Preview Card */}
                  <div className="w-64">
                     <RankCard 
                       rank={previewRank} 
                       parentRankName={parentRankPreview?.name}
                       onSelect={() => {}}
                       currency="PHP"
                     />
                  </div>
               </div>
               
               <div className="flex gap-4">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 border border-gray-600 text-gray-300 font-bold uppercase hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                       // Programmatically submit the form
                       formRef.current?.requestSubmit();
                    }}
                    disabled={isPending}
                    className="flex-1 py-3 bg-[#FED405] text-[#191A30] font-bold uppercase hover:bg-white transition disabled:opacity-50"
                  >
                    {isPending ? 'Processing...' : 'Confirm & Save'}
                  </button>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
