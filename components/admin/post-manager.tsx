'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { createPost } from '@/actions/create-post';
import { updatePost } from '@/actions/update-post';
import { deletePost } from '@/actions/delete-post';
import { Post } from '@/types';
import { toast } from 'sonner';
import { Trash2, Edit, Eye, FileText, X, Save, Plus, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import MarkdownGuide from './markdown-guide';
import MarkdownToolbar from './markdown-toolbar';
import ImageUploader from './image-uploader';

export default function PostManager({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'content' | 'banner' | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Form States
  const [createState, createAction, isCreatePending] = useActionState(createPost, null);
  const [updateState, updateAction, isUpdatePending] = useActionState(updatePost, null);

  // Local state for form inputs to handle preview
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'announcement',
    image_url: '',
    content: ''
  });

  // Sync posts when prop changes (optional, but good for revalidation)
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Handle Action Responses
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
      setEditingPost(null);
      resetForm();
    } else if (updateState?.success === false) {
      toast.error(updateState.message);
    }
  }, [updateState]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'announcement',
      image_url: '',
      content: ''
    });
    setEditingPost(null);
    setIsPreview(false);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description || '',
      category: post.category,
      image_url: post.image_url || '',
      content: post.content
    });
    setIsPreview(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this broadcast? This action cannot be undone.')) {
      const result = await deletePost(id);
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
        
        // Restore focus next tick
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
                <h3 className="text-xl font-bold text-[#FED405] uppercase">
                  {editingPost ? 'Edit Comms Uplink' : 'New Comms Uplink'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {editingPost ? `Updating Broadcast #${editingPost.id}` : 'Publish announcements or patch notes.'}
                </p>
              </div>
              <div className="flex gap-2">
                {editingPost && (
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

            {/* Markdown Guide Collapsible */}
            {showGuide && (
               <div className="mb-6">
                 <MarkdownGuide />
               </div>
            )}
            
            <form action={editingPost ? updateAction : createAction} className="space-y-4">
              {editingPost && <input type="hidden" name="id" value={editingPost.id} />}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Headline</label>
                  <input 
                    name="title" 
                    type="text" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" 
                    placeholder="Enter title..." 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
                  <select 
                    name="category" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="patch_notes">Patch Note</option>
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

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Short Description (Catchy Summary)</label>
                  <textarea 
                    name="description" 
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#191A30] border border-white/10 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white placeholder-gray-600" 
                    placeholder="A brief, high-impact summary for the news card..." 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-xs font-bold uppercase text-gray-400">Content (Markdown Supported)</label>
                  <button 
                    type="button" 
                    onClick={() => setIsPreview(!isPreview)}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isPreview ? 'bg-[#FED405] text-[#191A30] font-bold' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  >
                    {isPreview ? <><Edit size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
                  </button>
                </div>

                {isPreview ? (
                  <div className="w-full bg-[#191A30] border border-white/10 p-4 min-h-[300px] prose prose-invert prose-sm max-w-none overflow-y-auto prose-headings:text-white prose-a:text-[#FED405] prose-strong:text-white prose-code:text-[#FED405] prose-pre:bg-[#0f101f] prose-pre:border prose-pre:border-white/10 prose-th:text-white prose-th:border-b prose-th:border-white/20 prose-td:border-b prose-td:border-white/10">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
                      {formData.content || '*No content to preview*'}
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
                        rows={12} 
                        required 
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="w-full bg-[#191A30] border border-white/10 border-t-0 p-3 text-sm focus:border-[#FED405] focus:outline-none text-white font-mono placeholder-gray-600 rounded-b-sm"
                        placeholder="## New Features&#10;- Feature 1&#10;- Feature 2"
                    ></textarea>
                  </div>
                )}
              </div>

              <button disabled={isPending} type="submit" className="w-full bg-[#FED405] text-[#191A30] font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? 'Processing...' : (editingPost ? <><Save size={18} /> Update Broadcast</> : <><Plus size={18} /> Broadcast</>)}
              </button>
            </form>
         </div>
       </div>

       {/* Right Column: List of Posts */}
       <div className="lg:col-span-1">
         <div className="bg-[#131426] border border-white/5 rounded-sm h-full max-h-[800px] flex flex-col">
            <div className="p-4 border-b border-white/5 bg-[#191A30]">
               <h3 className="font-bold text-white uppercase text-sm">Recent Broadcasts</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
               {posts.length === 0 && <div className="text-gray-500 text-xs p-4 text-center italic">No archives found.</div>}
               
               {posts.map(post => (
                 <div key={post.id} className={`p-3 border rounded-sm transition-all group ${editingPost?.id === post.id ? 'bg-[#FED405]/10 border-[#FED405]' : 'bg-[#191A30] border-white/5 hover:border-white/20'}`}>
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase rounded ${post.category === 'patch_notes' ? 'bg-blue-900/50 text-blue-200' : 'bg-yellow-900/50 text-yellow-200'}`}>
                       {post.category === 'patch_notes' ? 'Patch' : 'News'}
                     </span>
                     <span className="text-[10px] text-gray-500 font-mono">
                       {new Date(post.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'})}
                     </span>
                   </div>
                   <h4 className="text-sm font-bold text-white mb-3 line-clamp-2">{post.title}</h4>
                   
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleEdit(post)}
                       className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white py-1.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1"
                     >
                       <Edit size={12} /> Edit
                     </button>
                     <button 
                        onClick={() => handleDelete(post.id)}
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
