import fs from 'fs';
import path from 'path';
import { getLeaderboardData, Faction, Player } from '@/utils/leaderboard-data';
import Header from '@/components/header';
import Footer from '@/components/footer';
import LeaderboardView from '@/components/leaderboard-view';
import { Clock, Construction, Lock, Trophy } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

function getTimeAgo(date: Date) {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

function getSeasonTimeRemaining(endDateStr: string) {
    const now = new Date();
    const end = new Date(endDateStr);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Season Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} Days Remaining`;
    return `${hours} Hours Remaining`;
}

export default async function LeaderboardsPage() {
  const players = await getLeaderboardData();

  // Check if maintenance mode should be active (less than 4 players)
  if (players.length < 4) {
    return (
        <main className="min-h-screen bg-[#191A30] relative overflow-hidden">
            <Header />
            
            {/* Blurred Background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 blur-3xl pointer-events-none">
                <div className="w-[800px] h-[800px] bg-yellow-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
                <div className="w-[600px] h-[600px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl absolute top-1/4 right-1/4 animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_50px_rgba(254,212,5,0.1)]">
                    <Construction size={64} className="text-[#FED405] animate-pulse" />
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
                    New Season <span className="text-[#FED405]">Pending</span>
                </h1>
                
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                    A new season has just started. The leaderboard data is currently being aggregated and verified.
                    <br className="hidden md:block" />
                    Please come back soon to see the new rankings.
                </p>

                <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-sm text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <Lock size={14} />
                    Leaderboard Locked
                </div>
            </div>

            <Footer />
        </main>
    );
  }

  const supabase = await createClient();
  const { data: configs } = await supabase.from('leaderboard_config').select('*').order('display_order');
  const { data: factionScoring } = await supabase.from('faction_score_config').select('*').single();
  
  // Fetch Active Season for Display Info Only
  const { data: activeSeason } = await supabase.from('seasons').select('*').eq('is_active', true).single();

  // Players data is already processed with Season Stats and Lifetime Stats by getLeaderboardData
  const seasonPlayers = players; 

  // --- File Date Logic ---
  let lastUpdatedDate: Date | null = null;
  try {
    const playersDir = path.join(process.cwd(), 'public', 'players');
    // Check if dir exists
    await fs.promises.access(playersDir);
    
    const entries = await fs.promises.readdir(playersDir, { withFileTypes: true });
    let maxTime = 0;
    
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const userFile = path.join(playersDir, entry.name, `${entry.name}.json`);
            try {
                const stats = await fs.promises.stat(userFile);
                if (stats.mtimeMs > maxTime) {
                    maxTime = stats.mtimeMs;
                }
            } catch {}
        }
    }
    
    if (maxTime > 0) {
        lastUpdatedDate = new Date(maxTime);
    }
  } catch (e) {
    // console.error("Error reading players stats:", e);
  }

  // --- Faction Logic ---
  const factionsMap = new Map<string, Faction>();
  
  seasonPlayers.forEach(player => {
      if (!player.faction_name) return;
      
      if (!factionsMap.has(player.faction_name)) {
          factionsMap.set(player.faction_name, {
              name: player.faction_name,
              tag: player.faction_tag || '',
              total_zombie_kills: 0,
              total_player_kills: 0,
              total_economy_earned: 0,
              total_time_survived: 0, // We will store HOURS here now
              member_count: 0,
              score: 0
          });
      }

      const faction = factionsMap.get(player.faction_name)!;
      faction.total_zombie_kills += player.zombie_kills;
      faction.total_player_kills += player.player_kills;
      faction.total_economy_earned += (player.economy_earned_this_season || 0);
      faction.total_time_survived += player.hours_survived; // Changed to hours
      faction.member_count += 1;
  });

  const factions = Array.from(factionsMap.values());

  // Default Multipliers
  const ZK_MULT = factionScoring?.zombie_kill_multiplier ?? 3.0;
  const PK_MULT = factionScoring?.player_kill_multiplier ?? 10.0;
  const ECO_MULT = factionScoring?.economy_multiplier ?? 0.02;
  const TIME_MULT = factionScoring?.survival_multiplier ?? 0.05;

  factions.forEach(f => {
      const score = 
          (f.total_zombie_kills * ZK_MULT) +
          (f.total_player_kills * PK_MULT) +
          (f.total_economy_earned * ECO_MULT) +
          (f.total_time_survived * TIME_MULT);
      f.score = Math.round(score * 100) / 100; // Round to 2 decimals
  });

  const topFactions = factions.sort((a, b) => b.score - a.score);


  // --- Player Sort Logic ---
  const topZombieKills = [...seasonPlayers].sort((a, b) => b.zombie_kills - a.zombie_kills);
  const topPlayerKills = [...seasonPlayers].sort((a, b) => b.player_kills - a.player_kills);
  
  // Economy sort updated to use economy_earned_this_season
  const topRich = [...seasonPlayers].sort((a, b) => (b.economy_earned_this_season || 0) - (a.economy_earned_this_season || 0));

  return (
    <main className="min-h-screen bg-[#191A30]">
      <Header />
      
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
                Survivor <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FED405] to-yellow-600">Rankings</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Recognizing the most lethal, dangerous, and wealthy survivors in the Exclusion Zone.
                Data updated daily.
            </p>
            
            {/* Season Info */}
            {activeSeason && (
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#FED405]/10 border border-[#FED405]/30 rounded-full">
                        <Trophy size={14} className="text-[#FED405]" />
                        <span className="text-sm font-bold text-[#FED405] uppercase tracking-widest">
                            {activeSeason.name}
                        </span>
                    </div>

                    {activeSeason.end_date && (
                        <div className="group relative flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full cursor-help">
                            <Clock size={14} className="text-blue-400" />
                            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest font-mono">
                                {getSeasonTimeRemaining(activeSeason.end_date)}
                            </span>
                            
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-white/10 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Ends: {new Date(activeSeason.end_date).toLocaleDateString('en-US', { dateStyle: 'full' })}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-center mt-6">
                {lastUpdatedDate && (
                  <div className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-help backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-[#FED405]" />
                    <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                        Updated {getTimeAgo(lastUpdatedDate)}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-white/10 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {lastUpdatedDate.toLocaleString('en-US', {
                           dateStyle: 'full',
                           timeStyle: 'medium',
                        })}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90" />
                    </div>
                  </div>
                )}
            </div>
        </div>

        <LeaderboardView 
            topZombieKills={topZombieKills}
            topPlayerKills={topPlayerKills}
            topRich={topRich}
            topFactions={topFactions}
            players={seasonPlayers}
            configs={configs || []}
            factionScoring={factionScoring}
        />
      </div>
      <Footer />
    </main>
  );
}
