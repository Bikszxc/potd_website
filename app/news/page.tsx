import Header from '@/components/header';
import Footer from '@/components/footer';
import NewsSection from '@/components/news-section';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 60;

export default async function NewsPage() {
  const supabase = await createClient();

  // Fetch Posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch Events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(50);

  return (
    <main className="min-h-screen bg-[#191A30] text-white pt-16">
      <Header />
      <NewsSection posts={posts || []} events={events || []} />
      
      <Footer />
    </main>
  );
}