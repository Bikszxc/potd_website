'use client';

import { useEffect, useState, useMemo } from 'react';
import { Player, Faction } from '@/utils/leaderboard-data';
import { LeaderboardConfig, FactionScoreConfig } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Crosshair, DollarSign, Clock, Users, Trophy, Medal, Target, Flag, ExternalLink } from 'lucide-react';

// Extend Player type to include lifetime stats which are injected by the page
type ExtendedPlayer = Player & {
    lifetime_zombie_kills?: number;
    lifetime_player_kills?: number;
    lifetime_hours_survived?: number;
    lifetime_economy_earned?: number;
};

interface FactionInfoProps {
  faction: Faction | null;
  allPlayers: ExtendedPlayer[];
  onClose: () => void;
  configs?: LeaderboardConfig[];
  factionScoring?: FactionScoreConfig;
}

export default function FactionInfo({ faction, allPlayers, onClose, configs, factionScoring }: FactionInfoProps) {
  const [viewMode, setViewMode] = useState<'season' | 'lifetime'>('season');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (faction) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [faction]);

  // Multipliers
  const ZK_MULT = factionScoring?.zombie_kill_multiplier ?? 3.0;
  const PK_MULT = factionScoring?.player_kill_multiplier ?? 10.0;
  const ECO_MULT = factionScoring?.economy_multiplier ?? 0.02;
  const TIME_MULT = factionScoring?.survival_multiplier ?? 0.05;

  const factionStats = useMemo(() => {
      if (!faction) return null;
      const members = allPlayers.filter(p => p.faction_name === faction.name);
      
      if (viewMode === 'season') {
          // Season stats are already calculated in the `faction` object passed down, 
          // BUT we need to recalculate if we want to be consistent with the toggle logic strictly 
          // or we can just use the props. However, for consistency with "Top X", let's derive from players.
          // Actually, using the passed `faction` object is safer for the Total Score as it matches the leaderboard.
          // But for "Top X" players, we MUST look at the players array.
          
          return {
              total_zk: faction.total_zombie_kills,
              total_pk: faction.total_player_kills,
              total_eco: faction.total_economy_earned,
              total_time: faction.total_time_survived,
              score: faction.score,
              zkPoints: faction.total_zombie_kills * ZK_MULT,
              pkPoints: faction.total_player_kills * PK_MULT,
              ecoPoints: faction.total_economy_earned * ECO_MULT,
              timePoints: faction.total_time_survived * TIME_MULT,
              topZombieKiller: [...members].sort((a, b) => b.zombie_kills - a.zombie_kills)[0],
              topPlayerKiller: [...members].sort((a, b) => b.player_kills - a.player_kills)[0],
              topEarner: [...members].sort((a, b) => (b.economy_earned_this_season || 0) - (a.economy_earned_this_season || 0))[0],
              topSurvivor: [...members].sort((a, b) => b.hours_survived - a.hours_survived)[0],
              avgSurvival: faction.member_count > 0 ? faction.total_time_survived / faction.member_count : 0
          };
      } else {
          // Lifetime Calculation
          const total_zk = members.reduce((acc, p) => acc + (p.lifetime_zombie_kills ?? p.zombie_kills), 0);
          const total_pk = members.reduce((acc, p) => acc + (p.lifetime_player_kills ?? p.player_kills), 0);
          const total_eco = members.reduce((acc, p) => acc + (p.lifetime_economy_earned ?? (p.economy_earned_this_season || 0)), 0);
          const total_time = members.reduce((acc, p) => acc + (p.lifetime_hours_survived ?? p.hours_survived), 0);
          
          const zkPoints = total_zk * ZK_MULT;
          const pkPoints = total_pk * PK_MULT;
          const ecoPoints = total_eco * ECO_MULT;
          const timePoints = total_time * TIME_MULT;
          
          const score = zkPoints + pkPoints + ecoPoints + timePoints;

          return {
              total_zk, total_pk, total_eco, total_time, score,
              zkPoints, pkPoints, ecoPoints, timePoints,
              topZombieKiller: [...members].sort((a, b) => (b.lifetime_zombie_kills ?? b.zombie_kills) - (a.lifetime_zombie_kills ?? a.zombie_kills))[0],
              topPlayerKiller: [...members].sort((a, b) => (b.lifetime_player_kills ?? b.player_kills) - (a.lifetime_player_kills ?? a.player_kills))[0],
              topEarner: [...members].sort((a, b) => (b.lifetime_economy_earned ?? (b.economy_earned_this_season || 0)) - (a.lifetime_economy_earned ?? (a.economy_earned_this_season || 0)))[0],
              topSurvivor: [...members].sort((a, b) => (b.lifetime_hours_survived ?? b.hours_survived) - (a.lifetime_hours_survived ?? a.hours_survived))[0],
              avgSurvival: faction.member_count > 0 ? total_time / faction.member_count : 0
          };
      }
  }, [faction, allPlayers, viewMode, ZK_MULT, PK_MULT, ECO_MULT, TIME_MULT]);

  if (!faction || !factionStats) return null;

  const isStatEnabled = (id: string) => {
      if (!configs || configs.length === 0) return true;
      const config = configs.find(c => c.id === id);
      return config ? config.enabled : true;
  };

  // Set accent color for Faction (Purple as default for Faction theme)
  const accentColor = '#8b5cf6'; 

  return (
    <AnimatePresence>
      {faction && (
        <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            key="faction-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[#0f1016] border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[600px]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* --- LEFT PANEL: FACTION ID --- */}
            <div className="relative w-full md:w-96 flex-shrink-0 overflow-hidden flex flex-col md:h-full">
                {/* Dynamic Background */}
                <div 
                    className="absolute inset-0 transition-colors duration-700"
                    style={{ 
                        background: `linear-gradient(to bottom, ${accentColor}, #0f1016 90%)`,
                        opacity: 0.8
                    }}
                ></div>
                
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="relative z-10 flex flex-col items-center p-8 h-full text-center">
                    {/* Icon Ring */}
                    <div className="relative mb-6 group">
                        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative w-40 h-40 rounded-full border-4 border-white/10 shadow-2xl bg-[#1a1c2e] flex items-center justify-center z-10">
                            <Flag size={64} className="text-purple-400" />
                        </div>
                        <div className="absolute bottom-2 right-2 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg bg-purple-600 border-purple-400 text-white">
                            ACTIVE
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-1 text-shadow-lg break-words w-full">
                        {faction.name}
                    </h2>
                    <p className="text-white/60 font-mono text-sm mb-8 tracking-wide">[{faction.tag}]</p>

                    <div className="w-full space-y-4 mb-auto">
                        <IDRow label={viewMode === 'season' ? "Season Score" : "Lifetime Score"} value={factionStats.score.toFixed(1)} />
                        <IDRow label="Members" value={faction.member_count} />
                        <IDRow label="Efficiency" value={`${(factionStats.score / (faction.member_count || 1)).toFixed(1)} pts/player`} />
                    </div>
                </div>
            </div>

            {/* --- RIGHT PANEL: FACTION DOSSIER --- */}
            <div className="flex-1 bg-[#131426] relative overflow-hidden flex flex-col h-full">
                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5" 
                     style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                <div className="relative z-10 p-8 overflow-y-auto custom-scrollbar h-full w-full">
                    
                    {/* Section: Score Breakdown */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                            <SectionHeader title="Score Breakdown" icon={Trophy} color={accentColor} className="mb-0" />
                            
                            {/* Season / Lifetime Toggle */}
                            <div className="flex items-center bg-[#0f1016] border border-white/10 rounded-sm p-1">
                                <button
                                    onClick={() => setViewMode('season')}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
                                        viewMode === 'season' 
                                            ? 'bg-white/10 text-white' 
                                            : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Clock size={10} /> Season</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('lifetime')}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
                                        viewMode === 'lifetime' 
                                            ? 'bg-white/10 text-white' 
                                            : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Trophy size={10} /> All Time</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {isStatEnabled('zombie_kills') && (
                                <StatBox label="Zombie Kills" value={factionStats.total_zk.toLocaleString()} subValue={`+${factionStats.zkPoints.toFixed(0)} pts`} icon={Skull} color="text-yellow-500" />
                            )}
                            {isStatEnabled('player_kills') && (
                                <StatBox label="Player Kills" value={factionStats.total_pk.toLocaleString()} subValue={`+${factionStats.pkPoints.toFixed(0)} pts`} icon={Crosshair} color="text-red-500" />
                            )}
                            {isStatEnabled('economy') && (
                                <StatBox label="Economy" value={`$${factionStats.total_eco.toLocaleString()}`} subValue={`+${factionStats.ecoPoints.toFixed(0)} pts`} icon={DollarSign} color="text-green-500" />
                            )}
                            <StatBox label="Survival" value={`${factionStats.total_time.toFixed(0)}h`} subValue={`+${factionStats.timePoints.toFixed(0)} pts`} icon={Clock} color="text-blue-400" />
                        </div>
                    </div>

                    {/* Section: Top Contributors */}
                    <div className="mb-10">
                        <SectionHeader title="Elite Operatives" icon={Medal} color={accentColor} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isStatEnabled('zombie_kills') && (
                                <TopMemberCard 
                                    member={factionStats.topZombieKiller} 
                                    category="Apex Predator" 
                                    subtext="Most Zombie Kills"
                                    value={`${viewMode === 'season' ? factionStats.topZombieKiller?.zombie_kills : (factionStats.topZombieKiller?.lifetime_zombie_kills ?? factionStats.topZombieKiller?.zombie_kills)} ZKs`} 
                                    icon={Skull} 
                                    color="yellow" 
                                />
                            )}
                            {isStatEnabled('player_kills') && (
                                <TopMemberCard 
                                    member={factionStats.topPlayerKiller} 
                                    category="Public Enemy #1" 
                                    subtext="Most Player Kills"
                                    value={`${viewMode === 'season' ? factionStats.topPlayerKiller?.player_kills : (factionStats.topPlayerKiller?.lifetime_player_kills ?? factionStats.topPlayerKiller?.player_kills)} PKs`} 
                                    icon={Target} 
                                    color="red" 
                                />
                            )}
                            {isStatEnabled('economy') && (
                                <TopMemberCard 
                                    member={factionStats.topEarner} 
                                    category="The Financier" 
                                    subtext="Highest Earner"
                                    value={`$${(viewMode === 'season' ? (factionStats.topEarner?.economy_earned_this_season || 0) : (factionStats.topEarner?.lifetime_economy_earned ?? (factionStats.topEarner?.economy_earned_this_season || 0))).toLocaleString()}`} 
                                    icon={DollarSign} 
                                    color="green" 
                                />
                            )}
                            <TopMemberCard 
                                member={factionStats.topSurvivor} 
                                category="Survivalist" 
                                subtext="Longest Survival"
                                value={`${(viewMode === 'season' ? factionStats.topSurvivor?.hours_survived : (factionStats.topSurvivor?.lifetime_hours_survived ?? factionStats.topSurvivor?.hours_survived))?.toFixed(1)}h`} 
                                icon={Clock} 
                                color="blue" 
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                        <span>Avg Survival: {factionStats.avgSurvival.toFixed(1)} hrs</span>
                        <span>Status: DOMINANT</span>
                    </div>

                </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Sub Components ---

function SectionHeader({ title, icon: Icon, color, className = "mb-6" }: { title: string, icon: any, color: string, className?: string }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Icon size={18} style={{ color: color }} />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h3>
            <div className="h-px flex-1 bg-white/10"></div>
        </div>
    );
}

function IDRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center w-full border-b border-white/10 pb-2 last:border-0">
            <span className="text-xs text-white/50 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-white font-mono text-right">{value}</span>
        </div>
    );
}

function StatBox({ label, value, subValue, icon: Icon, color }: { label: string, value: string, subValue?: string, icon: any, color: string }) {
    return (
        <div className="bg-[#1a1c2e] border border-white/5 p-4 rounded flex flex-col items-center text-center hover:border-white/20 transition-all group">
            <Icon size={24} className={`${color} mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
            <div className="text-xl font-black text-white font-mono leading-none mb-1 truncate w-full">{value}</div>
            {subValue && <div className={`text-xs font-mono mb-1 ${color}`}>{subValue}</div>}
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-auto">{label}</div>
        </div>
    );
}

function TopMemberCard({ member, category, subtext, value, icon: Icon, color }: { member: Player, category: string, subtext: string, value: string, icon: any, color: string }) {
    const colorClasses = {
        yellow: 'text-yellow-500 border-yellow-500/20 hover:border-yellow-500/50',
        red: 'text-red-500 border-red-500/20 hover:border-red-500/50',
        green: 'text-green-500 border-green-500/20 hover:border-green-500/50',
        blue: 'text-blue-400 border-blue-400/20 hover:border-blue-400/50'
    };
    
    const themeClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.yellow;

    if (!member) return (
        <div className="bg-[#1a1c2e] border border-white/5 p-4 rounded flex items-center gap-4 opacity-50">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <Icon size={20} className="text-gray-500" />
            </div>
            <div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{category}</div>
                <div className="text-sm text-gray-600 italic">None</div>
            </div>
        </div>
    );

    return (
        <div className={`bg-[#1a1c2e] border p-4 rounded flex items-center gap-4 transition-all group ${themeClass}`}>
            <div className="relative flex-shrink-0">
                <img 
                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.steam_name}&background=random&color=fff`}
                    alt={member.steam_name}
                    className="w-12 h-12 rounded-full border border-white/10 group-hover:border-white/30 transition-colors"
                />
                <div className={`absolute -bottom-1 -right-1 bg-[#1a1c2e] rounded-full p-1 border ${themeClass.split(' ')[1]}`}>
                    <Icon size={10} className="currentColor" />
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-80`}>{category}</div>
                <div className="text-white font-bold text-sm truncate">{member.steam_name}</div>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">{subtext}</span>
                    <span className="font-mono font-bold text-xs">{value}</span>
                </div>
            </div>
        </div>
    );
}
