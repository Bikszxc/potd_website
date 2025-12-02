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
  
  // Fetch Active Season and Snapshots
  const { data: activeSeason } = await supabase.from('seasons').select('*').eq('is_active', true).single();
  const { data: snapshots } = activeSeason 
      ? await supabase.from('player_season_snapshots').select('*').eq('season_id', activeSeason.id)
      : { data: [] };

  // --- Calculate Season Adjusted Stats (Copy of Leaderboard Logic) ---
  // We need to replicate this to ensure the "Season" stats in the search view match the leaderboard.
  const seasonPlayers = players.map(p => {
      const snapshot = snapshots?.find(s => s.steam_id === p.steam_id64);
      
      const calculateDiff = (current: number, snap: number) => {
          if (current < snap) return current;
          return current - snap;
      };

      const adjustedZombieKills = snapshot ? calculateDiff(p.zombie_kills, snapshot.zombie_kills) : p.zombie_kills;
      const adjustedPlayerKills = snapshot ? calculateDiff(p.player_kills, snapshot.player_kills) : p.player_kills;
      const adjustedHours = snapshot ? calculateDiff(p.hours_survived, snapshot.hours_survived) : p.hours_survived;
      
      const currentEarned = p.economy_earned_this_season || 0;
      const snapEarned = snapshot?.economy_earned || 0;
      const adjustedEarned = snapshot ? calculateDiff(currentEarned, snapEarned) : currentEarned;

      return {
          ...p,
          zombie_kills: adjustedZombieKills,
          player_kills: adjustedPlayerKills,
          hours_survived: adjustedHours,
          economy_earned_this_season: adjustedEarned,
          lifetime_zombie_kills: p.zombie_kills,
          lifetime_player_kills: p.player_kills,
          lifetime_hours_survived: p.hours_survived,
          lifetime_economy_earned: p.economy_earned_this_season
      };
  });

  return (
    <main className="min-h-screen bg-[#191A30] flex flex-col">
      <Header />
      <div className="flex-1">
        <SearchView
            players={seasonPlayers}
            configs={configs || []}
            factionScoring={factionScoring}
        />
      </div>
      <Footer />
    </main>
  );
}
