import { createClient } from '@/utils/supabase/server';
import SignOutButton from '@/components/sign-out';
import DashboardTabs from '@/components/admin/dashboard-tabs';

export const revalidate = 0; // Ensure admin always sees fresh data

export default async function Dashboard() {
  const supabase = await createClient();
  
  // Fetch posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  // Fetch ranks
  const { data: ranks } = await supabase
    .from('ranks')
    .select('*')
    .order('weight', { ascending: true });

  // Fetch sale config
  const { data: saleConfig } = await supabase
    .from('sale_config')
    .select('*')
    .single();

  // Fetch leaderboard config
  const { data: leaderboardConfigs } = await supabase
    .from('leaderboard_config')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch faction scoring
  const { data: factionScoring } = await supabase
    .from('faction_score_config')
    .select('*')
    .single();

  // Fetch seasons
  const { data: seasons } = await supabase
    .from('seasons')
    .select('id, name, start_date, end_date, is_active, final_standings_csv')
    .order('start_date', { ascending: false });

  // Fetch blacklist
  const { data: blacklist } = await supabase
    .from('player_blacklist')
    .select('*')
    .order('added_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#191A30] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#131426] hidden md:block p-6 sticky top-0 h-screen">
        <div className="mb-12">
           <h1 className="text-2xl font-black tracking-tighter">POTD <span className="text-[#FED405]">CMS</span></h1>
        </div>
        <nav className="space-y-4">
          <div className="block px-4 py-2 bg-[#FED405]/10 text-[#FED405] border-l-2 border-[#FED405] font-bold">
            Overview
          </div>
        </nav>
        
        <div className="absolute bottom-6 left-6">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h1 className="text-2xl font-black">POTD <span className="text-[#FED405]">CMS</span></h1>
          <SignOutButton />
        </div>

        <h2 className="text-3xl font-bold mb-8">Operations Center</h2>
        
        <DashboardTabs 
          posts={posts || []} 
          events={events || []} 
          ranks={ranks || []}
          saleConfig={saleConfig}
          leaderboardConfigs={leaderboardConfigs || []}
          factionScoring={factionScoring}
          seasons={seasons || []}
          blacklist={blacklist || []}
        />
      </main>
    </div>
  );
}