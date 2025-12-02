import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import NarrativeSection from '@/components/narrative-section';
import NewsSection from '@/components/news-section';
import { createClient } from '@/utils/supabase/server';
import { getServerStatus } from '@/utils/server-query';

import JoinSection from '@/components/join-section';

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const supabase = await createClient();
  const serverStatus = await getServerStatus();

  // Fetch Posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch Events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(50);

  // Fetch Latest items for Hero
  const { data: latestAnnouncement } = await supabase
    .from('posts')
    .select('*')
    .eq('category', 'announcement')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: latestPatchNote } = await supabase
    .from('posts')
    .select('*')
    .eq('category', 'patch_notes')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: latestEvent } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true }) // Next upcoming
    .gte('event_date', new Date().toISOString())
    .limit(1)
    .single();

  return (
    <main className="min-h-screen bg-[#191A30] text-white">
      <Header />
      <Hero 
        latestAnnouncement={latestAnnouncement} 
        latestPatchNote={latestPatchNote} 
        latestEvent={latestEvent} 
        serverStatus={serverStatus}
      />
      <NarrativeSection />
      <JoinSection />
      <NewsSection posts={posts || []} events={events || []} />
      
      <Footer />
    </main>
  );
}