'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post, Event } from '@/types';
import { Calendar, Radio, ChevronLeft, ChevronRight, Grid, Filter, X, ArrowRight } from 'lucide-react';
import removeMarkdown from 'remove-markdown';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';

const DEFAULT_IMAGES = {
  announcement: 'https://www.transparenttextures.com/patterns/dark-matter.png',
  patch_notes: 'https://www.transparenttextures.com/patterns/carbon-fibre.png',
  event: 'https://www.transparenttextures.com/patterns/cubes.png',
};

export default function NewsSection({ 
  posts, 
  events 
}: { 
  posts: Post[], 
  events: Event[] 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [viewAllEventsOpen, setViewAllEventsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'announcement' | 'patch_notes'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'storyline' | 'side_event'>('all');
  
  // Responsive Carousel Logic
  const [visibleCount, setVisibleCount] = useState(1); // Default mobile

  useEffect(() => {
    const updateVisibleCount = () => {
        if (window.innerWidth >= 1024) setVisibleCount(3);
        else if (window.innerWidth >= 768) setVisibleCount(2);
        else setVisibleCount(1);
    };
    
    updateVisibleCount(); // Initial
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // If we have more than 4 posts, we show the "View All" card at the end of the carousel logic
  const showViewAllCard = posts.length > 4;
  
  // Total items in the carousel (posts + potential View All card)
  const totalCarouselItems = showViewAllCard ? posts.length + 1 : posts.length;
  const maxIndex = Math.max(0, totalCarouselItems - visibleCount);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const generateSummary = (content: string) => {
    const plainText = removeMarkdown(content);
    const cleanText = plainText.replace(/\s+/g, ' ').trim();
    if (cleanText.length <= 150) return cleanText;
    return cleanText.substring(0, 150).trim() + '...';
  };

  // Filtered posts for the modal
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.category === filter);

  // Filtered events for the modal (All events, Descending)
  const filteredEvents = events
    .filter(e => eventFilter === 'all' || e.type === eventFilter)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  // Visible events for the main page (Max 3, Future/Ongoing only)
  const visibleEvents = events
    .filter(event => {
        const eventDate = new Date(event.event_date);
        const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
        const now = new Date();
        return now <= endDate; // Show if not yet ended
    })
    .slice(0, 3);

  return (
    <section id="news" className="py-24 bg-[#131426] border-t border-white/5 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            News <span className="text-[#FED405]">&</span> Intel
          </h2>
          <div className="w-24 h-1 bg-[#FED405] mx-auto mt-4"></div>
        </div>

        {/* BROADCAST CAROUSEL */}
        <div className="mb-24 relative">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-2xl font-bold text-white uppercase flex items-center gap-2">
               <Radio className="text-[#FED405]" /> Broadcasts
             </h3>
             <div className="flex gap-2">
               <button 
                 onClick={prevSlide}
                 disabled={currentIndex === 0}
                 className="p-2 border border-white/10 bg-[#191A30] text-white hover:border-[#FED405] hover:text-[#FED405] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
               >
                 <ChevronLeft size={20} />
               </button>
               <button 
                 onClick={nextSlide}
                 disabled={currentIndex === maxIndex}
                 className="p-2 border border-white/10 bg-[#191A30] text-white hover:border-[#FED405] hover:text-[#FED405] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
               >
                 <ChevronRight size={20} />
               </button>
             </div>
           </div>

           <div className="overflow-hidden -mx-4 px-4 py-4">
             <motion.div 
               className="flex gap-8"
               initial={false}
               animate={{ x: `-${currentIndex * (100 / visibleCount)}%` }} // This assumes 3 items visible. For mobile, we might need responsive logic or just CSS scroll snap. Let's use grid for layout but transform for slide.
               // Actually, percentage based slide on a flex row works if items are fixed width %.
               // Let's try style approach for the container width.
               style={{ 
                 width: `${(totalCarouselItems / visibleCount) * 100}%`, // Expand width to fit all items
                 display: 'flex' 
               }}
               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
             >
               {posts.map(post => (
                 <div key={post.id} className="w-full px-4" style={{ flex: `0 0 ${100 / totalCarouselItems}%` }}>
                   {/* Note: The width calculation above is tricky with dynamic totalItems. 
                       Easier approach: Make container generic flex, and animate x based on item width.
                       Let's simplify: Use a fixed width calculation based on viewport is hard in SSR.
                       Let's use CSS grid columns for the items? No, carousel needs track.
                       
                       Better Approach for responsiveness:
                       On mobile: Stack or scroll. 
                       On Desktop: 3 visible.
                       
                       Let's assume Desktop (lg) for the "3 visible" requirement. 
                       For styling simplicity in this environment:
                       - Flex container.
                       - Item width = 33.33% (of the viewing window).
                   */}
                 </div>
               ))}
             </motion.div>
             
             {/* REDOING CAROUSEL DOM STRUCTURE FOR SIMPLICITY */}
             <div className="relative overflow-hidden">
                <motion.div 
                  className="flex"
                  animate={{ x: `-${currentIndex * (100 / 1)}%` }} // Mobile: 1 item
                  style={{ 
                    // This style block is overridden by responsive classes in Tailwind if we aren't careful.
                    // Let's do 100% width items for mobile, and change the animate value for desktop.
                    // Since we can't easily switch `animate` value based on media query in JS without hooks,
                    // we will stick to a simpler desktop-first logic or just 3-column logic as requested.
                  }} 
                >
                   {/* 
                      Wait, simple CSS scroll snap is often better than JS animations for this, but user asked for arrows.
                      Let's stick to the 3-column logic but apply it via classes.
                   */}
                </motion.div>
             </div>
           </div>
           
           {/* 
              ACTUAL IMPLEMENTATION:
              We will use a flex row.
              Each item has `min-w-[100%] md:min-w-[50%] lg:min-w-[33.333%]`.
              We animate the `x` of the container.
           */}
           <div className="overflow-hidden">
             {posts.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 bg-[#191A30] text-gray-500">
                    <Radio size={48} className="mb-4 opacity-20" />
                    <span className="text-xl font-bold uppercase tracking-widest opacity-50">No Signal Detected</span>
                    <span className="text-xs">Broadcast frequency silent.</span>
                </div>
             ) : (
             <motion.div 
               className="flex"
               animate={{ 
                 x: `-${currentIndex * (100 / visibleCount)}%`
               }}
               transition={{ ease: "easeInOut", duration: 0.5 }}
             >
               {posts.map(post => (
                 <div 
                    key={post.id} 
                    className="px-4"
                    style={{ minWidth: `${100 / visibleCount}%` }}
                 >
                   <Link href={`/news/${post.id}`} className="group block bg-[#191A30] border border-white/5 hover:border-[#FED405] transition-all overflow-hidden flex flex-col h-full">
                     <div className="h-48 bg-[#0f101f] relative overflow-hidden">
                       <div 
                          className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 duration-500"
                          style={{ backgroundImage: `url(${post.image_url || (post.category === 'patch_notes' ? DEFAULT_IMAGES.patch_notes : DEFAULT_IMAGES.announcement)})` }}
                       ></div>
                       <div className="absolute top-4 left-4">
                         <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${post.category === 'patch_notes' ? 'bg-blue-500 text-white' : 'bg-[#FED405] text-[#191A30]'}`}>
                           {post.category.replace('_', ' ')}
                         </span>
                       </div>
                     </div>

                     <div className="p-6 flex-1 flex flex-col">
                       <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#FED405] transition-colors line-clamp-2">{post.title}</h4>
                       <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                         {post.description ? removeMarkdown(post.description) : generateSummary(post.content)}
                       </p>
                       <div className="flex items-center justify-between text-xs text-gray-500 font-mono mt-auto pt-4 border-t border-white/5">
                         <span>{formatDate(post.created_at)}</span>
                         <span className="group-hover:translate-x-1 transition-transform">READ MORE &rarr;</span>
                       </div>
                     </div>
                   </Link>
                 </div>
               ))}

               {/* View All Card */}
               {showViewAllCard && (
                 <div className="px-4" style={{ minWidth: `${100 / visibleCount}%` }}>
                    <button 
                      onClick={() => setViewAllOpen(true)}
                      className="w-full h-full min-h-[400px] bg-[#191A30] border border-dashed border-white/10 hover:border-[#FED405] group flex flex-col items-center justify-center gap-4 transition-colors"
                    >
                       <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#FED405] transition-colors">
                          <Grid size={32} className="text-gray-400 group-hover:text-[#191A30]" />
                       </div>
                       <span className="text-xl font-bold text-white group-hover:text-[#FED405] uppercase tracking-widest">View All Intel</span>
                       <span className="text-xs text-gray-500">Access Full Archives</span>
                    </button>
                 </div>
               )}
             </motion.div>
             )}
           </div>
        </div>

        {/* UPCOMING OPERATIONS (EVENTS) */}
        <div>
           <h3 className="text-2xl font-bold text-white uppercase mb-8 flex items-center gap-2">
             <Calendar className="text-red-500" /> Scheduled Operations
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {visibleEvents.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center border border-dashed border-white/10 bg-[#191A30] text-gray-500 h-64">
                    <Calendar size={48} className="mb-4 opacity-20" />
                    <span className="text-xl font-bold uppercase tracking-widest opacity-50">No Scheduled Operations</span>
                    <span className="text-xs">Stand by for mission briefings.</span>
                </div>
             ) : (
             visibleEvents.map(event => {
               const eventDate = new Date(event.event_date);
               const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours
               const now = new Date();
               
               let status: 'scheduled' | 'ongoing' | 'ended' = 'scheduled';
               if (now > endDate) status = 'ended';
               else if (now >= eventDate && now <= endDate) status = 'ongoing';

               return (
                 <Link 
                    href={`/news/event/${event.id}`} 
                    key={event.id} 
                    className={`bg-[#191A30] border flex flex-col md:flex-row overflow-hidden group transition-all cursor-pointer relative ${
                      status === 'ongoing' 
                        ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse' 
                        : status === 'ended'
                          ? 'border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                          : 'border-white/5 hover:border-red-500/50'
                    }`}
                 >
                                        {/* Event Image */}
                                        <div className="md:w-1/3 h-48 md:h-auto bg-[#0f101f] relative">
                                          <div 
                                              className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity"
                                              style={{ backgroundImage: `url(${event.image_url || DEFAULT_IMAGES.event})` }}
                                          ></div>
                                          <div className="absolute inset-0 bg-gradient-to-t from-[#191A30] to-transparent md:bg-gradient-to-r"></div>
                                        </div>
                    
                                        <div className="p-6 flex-1 flex flex-col justify-center">
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className={`text-xs font-bold px-2 py-1 uppercase ${
                                                event.type === 'storyline' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                                              }`}>
                                                {event.type.replace('_', ' ')}
                                              </span>
                                              
                                              {/* Live Badge */}
                                              {status === 'ongoing' && (
                                                <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-1 animate-pulse">
                                                  LIVE NOW
                                                </span>
                                              )}
                                            </div>
                    
                                            <span className={`text-xs font-mono font-bold ${
                                               status === 'ongoing' ? 'text-orange-500' : status === 'ended' ? 'text-gray-500' : 'text-red-400'
                                            }`}>
                                              {status === 'ended' 
                                                ? 'EVENT ENDED' 
                                                : new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                              }
                                            </span>
                                          </div>                      <h4 className={`text-xl font-bold mb-2 transition-colors ${
                        status === 'ongoing' ? 'text-orange-500' : 'text-white group-hover:text-red-400'
                      }`}>
                        {event.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-2">
                          {event.description ? removeMarkdown(event.description) : generateSummary(event.content)}
                      </p>
                    </div>
                 </Link>
               );
             })
             )}

             {/* Always show View Previous Events Card */}
             <button 
                onClick={() => setViewAllEventsOpen(true)}
                className="bg-[#191A30] border border-dashed border-white/10 hover:border-red-500 group flex flex-col items-center justify-center gap-4 transition-colors min-h-[200px] p-6"
             >
                 <div className="p-4 rounded-full bg-white/5 group-hover:bg-red-500 transition-colors">
                    <Grid size={32} className="text-gray-400 group-hover:text-white" />
                 </div>
                 <div className="text-center">
                    <span className="block text-xl font-bold text-white group-hover:text-red-500 uppercase tracking-widest transition-colors">View Mission Logs</span>
                    <span className="text-xs text-gray-500">Access Full Operation History</span>
                 </div>
             </button>
           </div>
        </div>

        {/* VIEW ALL POSTS MODAL */}
        <Dialog.Root open={viewAllOpen} onOpenChange={setViewAllOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
            <Dialog.Content className="fixed top-[5%] left-1/2 transform -translate-x-1/2 w-full max-w-5xl bg-[#191A30] border border-white/10 shadow-2xl z-50 outline-none flex flex-col max-h-[90vh] rounded-sm animate-in zoom-in-95 duration-200">
               {/* Header */}
               <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#131426]">
                  <div className="flex items-center gap-4">
                     <Dialog.Title className="text-2xl font-black text-white uppercase tracking-tighter">
                        Comms <span className="text-[#FED405]">Archive</span>
                     </Dialog.Title>
                     <div className="h-6 w-px bg-white/10"></div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setFilter('all')}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${filter === 'all' ? 'bg-[#FED405] text-[#191A30]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                          All
                        </button>
                        <button 
                          onClick={() => setFilter('announcement')}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${filter === 'announcement' ? 'bg-[#FED405] text-[#191A30]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                          Announcements
                        </button>
                        <button 
                          onClick={() => setFilter('patch_notes')}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${filter === 'patch_notes' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                          Patch Notes
                        </button>
                     </div>
                  </div>
                  <Dialog.Close className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </Dialog.Close>
               </div>

               {/* Content */}
               <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredPosts.length === 0 && <div className="col-span-full text-center text-gray-500 italic py-12">No broadcasts found for this frequency.</div>}
                     
                     {filteredPosts.map(post => (
                       <Link href={`/news/${post.id}`} key={post.id} className="group block bg-[#191A30] border border-white/5 hover:border-[#FED405] transition-all overflow-hidden flex flex-col h-full">
                         <div className="h-40 bg-[#0f101f] relative overflow-hidden">
                           <div 
                              className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity"
                              style={{ backgroundImage: `url(${post.image_url || (post.category === 'patch_notes' ? DEFAULT_IMAGES.patch_notes : DEFAULT_IMAGES.announcement)})` }}
                           ></div>
                           <div className="absolute top-3 left-3">
                             <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${post.category === 'patch_notes' ? 'bg-blue-500 text-white' : 'bg-[#FED405] text-[#191A30]'}`}>
                               {post.category.replace('_', ' ')}
                             </span>
                           </div>
                         </div>
                         <div className="p-4 flex-1 flex flex-col">
                           <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#FED405] transition-colors line-clamp-2">{post.title}</h4>
                           <p className="text-gray-400 text-xs line-clamp-3 mb-3 flex-1">
                             {post.description ? removeMarkdown(post.description) : generateSummary(post.content)}
                           </p>
                           <span className="text-[10px] text-gray-500 font-mono mt-auto pt-3 border-t border-white/5">
                             {formatDate(post.created_at)}
                           </span>
                         </div>
                       </Link>
                     ))}
                  </div>
               </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* VIEW ALL EVENTS MODAL */}
        <Dialog.Root open={viewAllEventsOpen} onOpenChange={setViewAllEventsOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
            <Dialog.Content className="fixed top-[5%] left-1/2 transform -translate-x-1/2 w-full max-w-5xl bg-[#191A30] border border-white/10 shadow-2xl z-50 outline-none flex flex-col max-h-[90vh] rounded-sm animate-in zoom-in-95 duration-200">
               {/* Header */}
               <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#131426]">
                  <div className="flex items-center gap-4">
                     <Dialog.Title className="text-2xl font-black text-white uppercase tracking-tighter">
                        Mission <span className="text-red-500">Logs</span>
                     </Dialog.Title>
                     <div className="h-6 w-px bg-white/10"></div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setEventFilter('all')}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${eventFilter === 'all' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                          All
                        </button>
                        <button 
                          onClick={() => setEventFilter('storyline')}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${eventFilter === 'storyline' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                          Storyline
                        </button>
                        <button 
                          onClick={() => setEventFilter('side_event')}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${eventFilter === 'side_event' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                          Side Ops
                        </button>
                     </div>
                  </div>
                  <Dialog.Close className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </Dialog.Close>
               </div>

               {/* Content */}
               <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {filteredEvents.length === 0 && <div className="col-span-full text-center text-gray-500 italic py-12">No mission logs found.</div>}
                     
                     {filteredEvents.map(event => {
                       const eventDate = new Date(event.event_date);
                       const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
                       const now = new Date();
                       let status: 'scheduled' | 'ongoing' | 'ended' = 'scheduled';
                       if (now > endDate) status = 'ended';
                       else if (now >= eventDate && now <= endDate) status = 'ongoing';

                       return (
                       <Link 
                          href={`/news/event/${event.id}`} 
                          key={event.id} 
                          className={`bg-[#191A30] border flex flex-col md:flex-row overflow-hidden group transition-all cursor-pointer ${
                            status === 'ended' 
                              ? 'border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100' 
                              : 'border-white/5 hover:border-red-500/50'
                          }`}
                       >
                          {/* Event Image */}
                          <div className="md:w-1/3 h-40 md:h-auto bg-[#0f101f] relative">
                            <div 
                                className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity"
                                style={{ backgroundImage: `url(${event.image_url || DEFAULT_IMAGES.event})` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#191A30] to-transparent md:bg-gradient-to-r"></div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                                event.type === 'storyline' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                              }`}>
                                {event.type.replace('_', ' ')}
                              </span>
                              <span className={`text-[10px] font-mono font-bold ${
                                status === 'ongoing' ? 'text-orange-500' : status === 'ended' ? 'text-gray-500' : 'text-red-400'
                              }`}>
                                {status === 'ended' 
                                  ? 'EVENT ENDED' 
                                  : new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                }
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{event.title}</h4>
                            <p className="text-gray-400 text-xs line-clamp-2">
                                {event.description ? removeMarkdown(event.description) : generateSummary(event.content)}
                            </p>
                          </div>
                       </Link>
                     );
                     })}
                  </div>
               </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </section>
  );
}