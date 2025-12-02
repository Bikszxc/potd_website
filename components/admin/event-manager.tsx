'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { createEvent } from '@/actions/create-event';
import { updateEvent } from '@/actions/update-event';
import { deleteEvent } from '@/actions/delete-event';
import { Event } from '@/types';
import { toast } from 'sonner';
import { Trash2, Edit, Eye, X, Save, Plus, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import MarkdownGuide from './markdown-guide';
import MarkdownToolbar from './markdown-toolbar';
import ImageUploader from './image-uploader';

export default function EventManager({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'content' | 'banner' | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Form States
  const [createState, createAction, isCreatePending] = useActionState(createEvent, null);
  const [updateState, updateAction, isUpdatePending] = useActionState(updateEvent, null);

  // Local state for form inputs
  const [formData, setFormData] = useState({
    title: '',
    type: 'storyline',
    image_url: '',
    date: '',
    description: '',
    content: ''
  });

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (createState?.success) {
      toast.success(createState.message);
      resetForm();
    } else if (createState?.success === false) {
      toast.error(createState.message);
    }
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) {
      toast.success(updateState.message);
      setEditingEvent(null);
      resetForm();
    } else if (updateState?.success === false) {
      toast.error(updateState.message);
    }
  }, [updateState]);

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'storyline',
      image_url: '',
      date: '',
      description: '',
      content: ''
    });
    setEditingEvent(null);
    setIsPreview(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const d = new Date(event.event_date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const formattedDate = d.toISOString().slice(0, 16);

    setFormData({
      title: event.title,
      type: event.type,
      image_url: event.image_url || '',
      date: formattedDate,
      description: event.description || '',
      content: event.content
    });
    setIsPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to cancel this operation? This action cannot be undone.')) {
      const result = await deleteEvent(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleImageUpload = (url: string) => {
    if (uploadTarget === 'banner') {
      setFormData({ ...formData, image_url: url });
    } else if (uploadTarget === 'content') {
      const textarea = contentRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + `![Image](${url})` + text.substring(end);
        setFormData({ ...formData, content: newText });
        
        setTimeout(() => {
            textarea.focus();
            const newPos = start + `![Image](${url})`.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
      } else {
        setFormData({ ...formData, content: formData.content + `\n![Image](${url})` });
      }
    }
    setUploadTarget(null);
  };

  const isPending = isCreatePending || isUpdatePending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
       {uploadTarget && (
         <ImageUploader 
           onClose={() => setUploadTarget(null)} 
           onUploadComplete={handleImageUpload} 
         />
       )}

       {/* Left Column: Form */}
       <div className="lg:col-span-2 space-y-6">
         <div className="bg-[#131426] p-6 border border-white/5 rounded-sm">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-red-400 uppercase">
                  {editingEvent ? 'Edit Operation' : 'Schedule Operation'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {editingEvent ? `Updating Operation #${editingEvent.id}` : 'Set up server events or storylines.'}
                </p>
              </div>
              <div className="flex gap-2">
                {editingEvent && (
                  <button onClick={resetForm} className="text-xs flex items-center gap-1 bg-gray-700 px-3 py-1 text-white rounded hover:bg-gray-600 transition">
                    <X size={12} /> Cancel
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setShowGuide(!showGuide)} 
                  className="text-xs flex items-center gap-1 border border-[#FED405] text-[#FED405] px-3 py-1 rounded hover:bg-[#FED405]/10 transition"
                >
                   {showGuide ? 'Hide Guide' : 'Markdown Guide'}
                </button>
              </div>
            </div>

            {showGuide && (
               <div className="mb-6">
                 <MarkdownGuide />
               </div>
            )}
            
            <form action={editingEvent ? updateAction : createAction} className="space-y-4">
              {editingEvent && <input type="hidden" name="id" value={editingEvent.id} />}
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Operation Name</label>
                <input 
                  name="title" 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" 
                  placeholder="Operation: Zero Hour" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
                    <select 
                      name="type" 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white"
                    >
                      <option value="storyline">Storyline (Major)</option>
                      <option value="side_event">Side Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Image Banner URL (Optional)</label>
                    <div className="flex gap-2">
                      <input 
                        name="image_url" 
                        type="url" 
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        className="flex-1 bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" 
                        placeholder="https://..." 
                      />
                      <button 
                        type="button"
                        onClick={() => setUploadTarget('banner')}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 rounded border border-white/10 transition-colors"
                        title="Upload Image"
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Launch Date</label>
                <input 
                  name="date" 
                  type="datetime-local" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-gray-400" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Short Description (Catchy Summary)</label>
                <textarea 
                  name="description" 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" 
                  placeholder="Brief operational overview for the card..." 
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-xs font-bold uppercase text-gray-400">Mission Briefing (Content)</label>
                  <button 
                    type="button" 
                    onClick={() => setIsPreview(!isPreview)}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isPreview ? 'bg-[#FED405] text-[#191A30] font-bold' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  >
                    {isPreview ? <><Edit size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
                  </button>
                </div>

                {isPreview ? (
                  <div className="w-full bg-[#191A30] border border-white/10 p-4 min-h-[200px] prose prose-invert prose-sm max-w-none overflow-y-auto prose-headings:text-white prose-a:text-[#FED405] prose-strong:text-white prose-code:text-[#FED405] prose-pre:bg-[#0f101f] prose-pre:border prose-pre:border-white/10 prose-th:text-white prose-th:border-b prose-th:border-white/20 prose-td:border-b prose-td:border-white/10">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
                      {formData.content || '*No details provided*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <MarkdownToolbar 
                      textareaRef={contentRef} 
                      value={formData.content} 
                      onChange={(val) => setFormData({...formData, content: val})} 
                      onImageClick={() => setUploadTarget('content')}
                    />
                    <textarea 
                        ref={contentRef}
                        name="content" 
                        rows={8} 
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="w-full bg-[#191A30] border border-white/10 border-t-0 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600 rounded-b-sm" 
                        placeholder="Mission details..."
                    ></textarea>
                  </div>
                )}
              </div>

              <button disabled={isPending} type="submit" className="w-full bg-red-500 text-white font-bold py-3 uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? 'Processing...' : (editingEvent ? <><Save size={18} /> Update Operation</> : <><Plus size={18} /> Schedule</>)}
              </button>
            </form>
         </div>
       </div>

       {/* Right Column: List of Events */}
       <div className="lg:col-span-1">
         <div className="bg-[#131426] border border-white/5 rounded-sm h-full max-h-[800px] flex flex-col">
            <div className="p-4 border-b border-white/5 bg-[#191A30]">
               <h3 className="font-bold text-white uppercase text-sm">Planned Operations</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
               {events.length === 0 && <div className="text-gray-500 text-xs p-4 text-center italic">No operations found.</div>}
               
               {events.map(event => (
                 <div key={event.id} className={`p-3 border rounded-sm transition-all group ${editingEvent?.id === event.id ? 'bg-red-500/10 border-red-500' : 'bg-[#191A30] border-white/5 hover:border-white/20'}`}>
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase rounded ${event.type === 'storyline' ? 'bg-red-900/50 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                       {event.type === 'storyline' ? 'Story' : 'Side'}
                     </span>
                     <span className="text-[10px] text-gray-500 font-mono">
                       {new Date(event.event_date).toLocaleDateString('en-US', {month:'short', day:'numeric', hour: '2-digit', minute: '2-digit'})}
                     </span>
                   </div>
                   <h4 className="text-sm font-bold text-white mb-3 line-clamp-2">{event.title}</h4>
                   
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleEdit(event)}
                       className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white py-1.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1"
                     >
                       <Edit size={12} /> Edit
                     </button>
                     <button 
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white py-1.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1"
                     >
                       <Trash2 size={12} /> Delete
                     </button>
                   </div>
                 </div>
               ))}
            </div>
         </div>
       </div>
    </div>
  );
}
