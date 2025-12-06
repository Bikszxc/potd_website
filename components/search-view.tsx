'use client';

import { useState } from 'react';
import { Player, Faction } from '@/utils/leaderboard-data';
import { LeaderboardConfig, FactionScoreConfig } from '@/types';
import { Search, User, Flag, ArrowRight, Skull, Crosshair, DollarSign, Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerInfo from './player-info';
import FactionInfo from './faction-info';

// Extend Player type to include lifetime stats
type ExtendedPlayer = Player & {
    lifetime_zombie_kills?: number;
    lifetime_player_kills?: number;
    lifetime_hours_survived?: number;
    lifetime_economy_earned?: number;
};

export default function SearchView({ 
    players, 
    configs, 
    factionScoring 
}: { 
    players: ExtendedPlayer[], 
    configs: LeaderboardConfig[], 
    factionScoring: FactionScoreConfig 
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'player' | 'faction'>('all');
    const [selectedPlayer, setSelectedPlayer] = useState<ExtendedPlayer | null>(null);
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    // Aggregate Factions from Players
    const factionsMap = new Map<string, Faction>();
    players.forEach(p => {
        if (!p.faction_name) return;
        if (!factionsMap.has(p.faction_name)) {
            factionsMap.set(p.faction_name, {
                name: p.faction_name,
                tag: p.faction_tag || '',
                total_zombie_kills: 0,
                total_player_kills: 0,
                total_economy_earned: 0,
                total_time_survived: 0,
                member_count: 0,
                score: 0
            });
        }
        // Just basic aggregation for listing, detailed stats handled in FactionInfo
        const f = factionsMap.get(p.faction_name)!;
        f.member_count++;
        // We use the season stats passed in `players`
        f.total_zombie_kills += p.zombie_kills;
        f.total_player_kills += p.player_kills;
        f.total_economy_earned += (p.economy_earned_this_season || 0);
        f.total_time_survived += p.hours_survived;
    });
    
    // Calculate Scores for Factions
    const ZK_MULT = factionScoring?.zombie_kill_multiplier ?? 3.0;
    const PK_MULT = factionScoring?.player_kill_multiplier ?? 10.0;
    const ECO_MULT = factionScoring?.economy_multiplier ?? 0.02;
    const TIME_MULT = factionScoring?.survival_multiplier ?? 0.05;

    const factions = Array.from(factionsMap.values()).map(f => {
        const score = (f.total_zombie_kills * ZK_MULT) + (f.total_player_kills * PK_MULT) + (f.total_economy_earned * ECO_MULT) + (f.total_time_survived * TIME_MULT);
        return { ...f, score };
    });

    // Filtering Logic
    const filteredPlayers = players.filter(p => 
        (p.account_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.character_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredFactions = factions.filter(f => 
        (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         f.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Combine for single list render if needed, or keep separate blocks
    // We'll keep the logic but animate the container

    return (
        <div className="min-h-screen w-full pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            
            {/* Header & Search */}
            <div className="text-center mb-16">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 drop-shadow-2xl"
                >
                    Database <span className="text-[#FED405]">Search</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Access the complete survivor and faction database. Retrieve detailed dossiers and performance records.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FED405]/20 to-purple-500/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-[#131426] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                        <div className="pl-6 text-gray-500">
                            <Search size={24} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by Name, Faction Tag, or Alias..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent p-5 text-white text-lg placeholder-gray-600 focus:outline-none font-mono"
                        />
                    </div>
                </motion.div>

                {/* Filter Toggles */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4 mt-8"
                >
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all border ${filter === 'all' ? 'bg-white text-[#191A30] border-white shadow-lg scale-105' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}`}
                    >
                        All Records
                    </button>
                    <button 
                        onClick={() => setFilter('player')}
                        className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${filter === 'player' ? 'bg-yellow-500 text-[#191A30] border-yellow-500 shadow-lg shadow-yellow-500/20 scale-105' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}`}
                    >
                        <User size={16} /> Survivors
                    </button>
                    <button 
                        onClick={() => setFilter('faction')}
                        className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${filter === 'faction' ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20 scale-105' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}`}
                    >
                        <Flag size={16} /> Factions
                    </button>
                </motion.div>
            </div>

            {/* Results Grid */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Factions */}
                {(filter === 'all' || filter === 'faction') && filteredFactions.map(faction => (
                    <div 
                        key={`faction-${faction.name}`}
                        onClick={() => setSelectedFaction(faction)}
                        className="bg-[#131426] border border-white/5 hover:border-purple-500/50 p-6 rounded-sm cursor-pointer group transition-all hover:bg-[#1a1c2e] hover:-translate-y-1 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:border-purple-500/50 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                    <Flag size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold uppercase text-lg group-hover:text-purple-400 transition-colors leading-tight">{faction.name}</h3>
                                    <span className="text-xs text-gray-500 font-mono tracking-wider">[{faction.tag}]</span>
                                </div>
                            </div>
                            <div className="text-right bg-black/20 px-3 py-1 rounded">
                                <div className="text-lg font-bold text-purple-500 leading-none">{faction.member_count}</div>
                                <div className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">Members</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                            <div className="bg-black/20 p-3 rounded flex items-center justify-between border border-white/5 group-hover:border-white/10 transition-colors">
                                <span className="flex items-center gap-2"><Skull size={14} className="text-gray-500" /> Kills</span>
                                <span className="font-mono text-white font-bold">{(faction.total_zombie_kills + faction.total_player_kills).toLocaleString()}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded flex items-center justify-between border border-white/5 group-hover:border-white/10 transition-colors">
                                <span className="flex items-center gap-2"><Trophy size={14} className="text-gray-500" /> Score</span>
                                <span className="font-mono text-white font-bold">{faction.score.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Players */}
                {(filter === 'all' || filter === 'player') && filteredPlayers.map((player, index) => (
                    <div 
                        key={`player-${player.account_name || player.steam_id64}-${index}`}
                        onClick={() => setSelectedPlayer(player)}
                        className="bg-[#131426] border border-white/5 hover:border-[#FED405]/50 p-6 rounded-sm cursor-pointer group transition-all hover:bg-[#1a1c2e] hover:-translate-y-1 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div className="flex items-center gap-5 mb-6">
                            <img 
                                src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.account_name}&background=random&color=fff`} 
                                alt={player.account_name}
                                className="w-14 h-14 rounded bg-white/5 object-cover border border-white/10 group-hover:border-[#FED405]/50 transition-colors shadow-lg"
                            />
                            <div className="min-w-0">
                                <h3 className="text-white font-bold text-lg group-hover:text-[#FED405] transition-colors truncate leading-tight">{player.account_name}</h3>
                                <div className="text-xs text-gray-500 font-mono flex flex-wrap items-center gap-2 mt-1">
                                    <span className="truncate">{player.character_name}</span>
                                    {player.faction_tag && <span className="text-purple-400 bg-purple-500/10 px-1.5 rounded border border-purple-500/20">[{player.faction_tag}]</span>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                            <div className="bg-black/20 p-3 rounded flex items-center justify-between border border-white/5 group-hover:border-white/10 transition-colors">
                                <span className="flex items-center gap-2"><Skull size={14} className="text-gray-500" /> Kills</span>
                                <span className="font-mono text-white font-bold">{player.zombie_kills.toLocaleString()}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded flex items-center justify-between border border-white/5 group-hover:border-white/10 transition-colors">
                                <span className="flex items-center gap-2"><Clock size={14} className="text-gray-500" /> Hours</span>
                                <span className="font-mono text-white font-bold">{player.hours_survived.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            </div>

            {/* Empty State */}
            {((filter === 'all' && filteredPlayers.length === 0 && filteredFactions.length === 0) ||
              (filter === 'player' && filteredPlayers.length === 0) ||
              (filter === 'faction' && filteredFactions.length === 0)) && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 text-gray-500"
                >
                    <div className="mb-6 inline-block p-6 rounded-full bg-white/5 border border-white/5">
                        <Search size={48} className="opacity-30" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No records found</h3>
                    <p className="text-base max-w-md mx-auto">We couldn't find any survivors or factions matching your criteria. Try a different search term.</p>
                </motion.div>
            )}

            <PlayerInfo player={selectedPlayer} onClose={() => setSelectedPlayer(null)} configs={configs} />
            <FactionInfo faction={selectedFaction} allPlayers={players} onClose={() => setSelectedFaction(null)} configs={configs} factionScoring={factionScoring} />
        </div>
    );
}
