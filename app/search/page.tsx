import { getLeaderboardData, Faction, Player } from '@/utils/leaderboard-data';
import { createClient } from '@/utils/supabase/server';
import SearchView from '@/components/search-view';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default async function SearchPage() {
  const players = await getLeaderboardData();
  const supabase = await createClient();
  
  const { data: configs } = await supabase.from('leaderboard_config').select('*');
  const { data: factionScoring } = await supabase.from('faction_score_config').select('*').single();
  
  // Players data is already processed with Season Stats and Lifetime Stats by getLeaderboardData
  // No need to recalculate here.

  return (
    <main className="min-h-screen bg-[#191A30] flex flex-col">
      <Header />
      <div className="flex-1">
        <SearchView
            players={players}
            configs={configs || []}
            factionScoring={factionScoring}
        />
      </div>
      <Footer />
    </main>
  );
}
