import { createClient } from '@/utils/supabase/server';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_IMAGES = {
  event: 'https://www.transparenttextures.com/patterns/cubes.png',
};

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('title').eq('id', resolvedParams.id).single();
  
  return {
    title: event?.title ? `${event.title} - POTD Operations` : 'Operation - POTD',
  };
}

export default async function EventPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', resolvedParams.id).single();

  if (!event) {
    notFound();
  }

  const bannerImage = event.image_url || DEFAULT_IMAGES.event;
  
  const eventDate = new Date(event.event_date);
  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
  const now = new Date();
  const isEnded = now > endDate;

  return (
    <div className="min-h-screen bg-[#191A30] text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Banner Section */}
        <div className="w-full h-[400px] relative mb-8 border-y border-white/5 overflow-hidden group">
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${isEnded ? 'grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100' : ''}`}
            style={{ backgroundImage: `url(${bannerImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#191A30] via-[#191A30]/60 to-transparent"></div>
          
          {/* Ended Overlay */}
          {isEnded && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 border-4 border-gray-500/50 px-8 py-4 pointer-events-none group-hover:opacity-0 transition-opacity duration-500">
                <span className="text-4xl md:text-6xl font-black text-gray-400/50 uppercase tracking-widest whitespace-nowrap">Mission Ended</span>
             </div>
          )}
          
          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 max-w-4xl mx-auto relative z-20">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm text-red-400 mb-4 hover:underline">
              <ArrowLeft size={16} /> Back to Intel
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${event.type === 'storyline' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {event.type.replace('_', ' ')}
              </span>
              <span className={`text-sm font-mono font-bold ${isEnded ? 'text-gray-500 line-through' : 'text-gray-400'}`}>
                LAUNCH: {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              {isEnded && <span className="text-sm font-mono font-bold text-red-500">STATUS: COMPLETED</span>}
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg ${isEnded ? 'text-gray-300' : 'text-white'}`}>{event.title}</h1>
          </div>
        </div>

        {/* Content Section */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 prose prose-invert prose-lg prose-headings:text-white prose-a:text-[#FED405] prose-strong:text-white prose-code:text-[#FED405] prose-pre:bg-[#131426] prose-pre:border prose-pre:border-white/10 prose-th:text-white prose-th:border-b prose-th:border-white/20 prose-td:border-b prose-td:border-white/10">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
          >
            {event.content || ''}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
