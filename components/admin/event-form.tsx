'use client';

import { useActionState, useEffect } from 'react';
import { createEvent } from '@/actions/create-event';
import { toast } from 'sonner';

export default function EventForm() {
  const [state, formAction, isPending] = useActionState(createEvent, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      // Optional: reset form manually if needed, though native forms often reset on navigation or we can use a ref.
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Operation Name</label>
        <input name="title" type="text" required className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" placeholder="Operation: Zero Hour" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
            <select name="type" className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white">
              <option value="storyline">Storyline (Major)</option>
              <option value="side_event">Side Event</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Image Banner URL (Optional)</label>
            <input name="image_url" type="url" className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" placeholder="https://..." />
          </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Launch Date</label>
        <input name="date" type="datetime-local" required className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-gray-400" />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Briefing (Markdown Supported)</label>
        <textarea name="description" rows={4} className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" placeholder="Mission details..."></textarea>
      </div>

      <button disabled={isPending} type="submit" className="w-full bg-red-500 text-white font-bold py-3 uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50">
        {isPending ? 'Scheduling...' : 'Schedule'}
      </button>
    </form>
  );
}
