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
  announcement: 'https://www.transparenttextures.com/patterns/dark-matter.png',
  patch_notes: 'https://www.transparenttextures.com/patterns/carbon-fibre.png',
};

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('title').eq('id', resolvedParams.id).single();
  
  return {
    title: post?.title ? `${post.title} - POTD News` : 'News - POTD',
  };
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('*').eq('id', resolvedParams.id).single();

  if (!post) {
    notFound();
  }

  const bannerImage = post.image_url || (post.category === 'patch_notes' ? DEFAULT_IMAGES.patch_notes : DEFAULT_IMAGES.announcement);

  return (
    <div className="min-h-screen bg-[#191A30] text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Banner Section */}
        <div className="w-full h-[400px] relative mb-8 border-y border-white/5">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bannerImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#191A30] via-[#191A30]/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 max-w-4xl mx-auto">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm text-[#FED405] mb-4 hover:underline">
              <ArrowLeft size={16} /> Back to Intel
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${post.category === 'patch_notes' ? 'bg-blue-500 text-white' : 'bg-[#FED405] text-[#191A30]'}`}>
                  {post.category.replace('_', ' ')}
              </span>
              <span className="text-gray-400 text-sm font-mono">
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">{post.title}</h1>
          </div>
        </div>

        {/* Content Section */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 prose prose-invert prose-lg prose-headings:text-white prose-a:text-[#FED405] prose-strong:text-white prose-code:text-[#FED405] prose-pre:bg-[#131426] prose-pre:border prose-pre:border-white/10 prose-th:text-white prose-th:border-b prose-th:border-white/20 prose-td:border-b prose-td:border-white/10">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
