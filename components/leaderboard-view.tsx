'use client';

import { useState } from 'react';
import { Player, Faction } from '@/utils/leaderboard-data';
import { LeaderboardConfig, FactionScoreConfig } from '@/types';
import { Skull, Crosshair, DollarSign, Flag, Trophy, Search, ChevronRight, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerInfo from './player-info';
import FactionInfo from './faction-info';

// Helper for class names
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Helper for survival time
function formatSurvivalTime(hours: number) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    if (days === 0 && remainingHours === 0) return "Fresh Spawn";
    if (days === 0) return `${remainingHours}h`;
    return `${days}d ${remainingHours}h`;
}

interface LeaderboardViewProps {
  topZombieKills: Player[];
  topPlayerKills: Player[];
  topRich: Player[];
  topFactions: Faction[];
  players: Player[];
  configs: LeaderboardConfig[];
  factionScoring?: FactionScoreConfig;
}

type TabType = 'zombie_kills' | 'player_kills' | 'economy' | 'factions';

const COLOR_VARIANTS = {
    yellow: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
        borderSoft: 'border-yellow-500/30',
        hoverBorder: 'hover:border-yellow-500/50',
        bgSoft: 'bg-yellow-500/5',
        bgMedium: 'bg-yellow-500/20',
        glow: 'bg-yellow-500/10',
        shadow: 'shadow-yellow-500/20'
    },
    red: {
        bg: 'bg-red-500',
        text: 'text-red-500',
        border: 'border-red-500',
        borderSoft: 'border-red-500/30',
        hoverBorder: 'hover:border-red-500/50',
        bgSoft: 'bg-red-500/5',
        bgMedium: 'bg-red-500/20',
        glow: 'bg-red-500/10',
        shadow: 'shadow-red-500/20'
    },
    green: {
        bg: 'bg-green-500',
        text: 'text-green-500',
        border: 'border-green-500',
        borderSoft: 'border-green-500/30',
        hoverBorder: 'hover:border-green-500/50',
        bgSoft: 'bg-green-500/5',
        bgMedium: 'bg-green-500/20',
        glow: 'bg-green-500/10',
        shadow: 'shadow-green-500/20'
    },
    purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-500',
        border: 'border-purple-500',
        borderSoft: 'border-purple-500/30',
        hoverBorder: 'hover:border-purple-500/50',
        bgSoft: 'bg-purple-500/5',
        bgMedium: 'bg-purple-500/20',
        glow: 'bg-purple-500/10',
        shadow: 'shadow-purple-500/20'
    }
};

const TABS = [
  { id: 'zombie_kills', label: 'Undead Slayers', icon: Skull, color: 'yellow', desc: 'Most zombies neutralized' },
  { id: 'player_kills', label: 'Most Wanted', icon: Crosshair, color: 'red', desc: 'Most survivors eliminated' },
  { id: 'economy', label: 'Tycoons', icon: DollarSign, color: 'green', desc: 'Wealth amassed this season' },
  { id: 'factions', label: 'Factions', icon: Flag, color: 'purple', desc: 'Dominant survivor groups' },
] as const;

export default function LeaderboardView({ topZombieKills, topPlayerKills, topRich, topFactions, players, configs, factionScoring }: LeaderboardViewProps) {
  // Filter and Sort Tabs based on Configs
  const visibleTabs = TABS.filter(tab => {
      if (!configs || configs.length === 0) return true; // Default to showing all if no config loaded yet
      const config = configs.find(c => c.id === tab.id);
      return config ? config.enabled : true;
  }).sort((a, b) => {
      const configA = configs.find(c => c.id === a.id);
      const configB = configs.find(c => c.id === b.id);
      return (configA?.display_order || 0) - (configB?.display_order || 0);
  });

  const [activeTab, setActiveTab] = useState<TabType>(visibleTabs.length > 0 ? visibleTabs[0].id as TabType : 'zombie_kills');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (visibleTabs.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Trophy size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white">Leaderboards Offline</h3>
              <p className="text-sm">Ranking systems are currently disabled.</p>
          </div>
      );
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'zombie_kills': return { data: topZombieKills, type: 'player' as const, color: 'yellow' };
      case 'player_kills': return { data: topPlayerKills, type: 'player' as const, color: 'red' };
      case 'economy': return { data: topRich, type: 'player' as const, color: 'green' };
      case 'factions': return { data: topFactions, type: 'faction' as const, color: 'purple' };
      default: return { data: [], type: 'player' as const, color: 'gray' };
    }
  };

  const { data, type, color } = getCurrentData();
  const activeColor = color as keyof typeof COLOR_VARIANTS;
  const theme = COLOR_VARIANTS[activeColor];

  // Filter Logic
  const filteredData = data.filter((item: any) => {
    const searchLower = searchQuery.toLowerCase();
    if (type === 'player') {
      const p = item as Player;
      // Ensure fields exist, fallback to empty string if undefined
      const name = p.account_name || '';
      const charName = p.character_name || '';
      return name.toLowerCase().includes(searchLower) ||
             charName.toLowerCase().includes(searchLower);
    } else {
      const f = item as Faction;
      return f.name.toLowerCase().includes(searchLower) ||
             f.tag.toLowerCase().includes(searchLower);
    }
  });

  // Podium is STATIC from the GLOBAL data (Top 1-3)
  const podiumData = data.slice(0, 3);

  // List logic:
  const listData = searchQuery ? filteredData : data.slice(3);

  return (
    <div className="space-y-12">

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
            {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const tabColor = tab.color as keyof typeof COLOR_VARIANTS;
                const tabTheme = COLOR_VARIANTS[tabColor];

                return (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
                        className={classNames(
                            "relative flex items-center gap-3 px-6 py-4 rounded-sm border transition-all duration-300 overflow-hidden group min-w-[200px]",
                            isActive
                                ? `bg-[#191A30] ${tabTheme.border} text-white shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                                : "bg-[#131426]/50 border-white/5 text-gray-400 hover:bg-[#191A30] hover:border-white/20"
                        )}
                    >
                        {isActive && (
                            <div className={`absolute inset-0 ${tabTheme.bgSoft}`}></div>
                        )}
                        {isActive && (
                            <div className={`absolute bottom-0 left-0 w-full h-1 ${tabTheme.bg}`}></div>
                        )}

                        <div className={classNames(
                            "p-2 rounded-full border transition-colors",
                            isActive ? `${tabTheme.bg} text-[#191A30] ${tabTheme.border}` : "bg-transparent border-white/10 group-hover:border-white/30"
                        )}>
                            <Icon size={20} />
                        </div>
                        <div className="text-left">
                            <div className={classNames("font-bold uppercase tracking-wider text-sm", isActive ? "text-white" : "group-hover:text-white")}>
                                {tab.label}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest hidden md:block">
                                {tab.desc}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                 {/* Podium Section - ALWAYS VISIBLE (Static Top 3) */}
                {podiumData.length > 0 && (
                    <div className="relative mb-12 pt-12">
                         {/* Background Glow for Podium */}
                         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 ${theme.glow} blur-[100px] rounded-full pointer-events-none`}></div>

                        <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 px-4">
                            {/* Rank 2 */}
                            {podiumData[1] && (
                                <div className="w-full md:w-1/3 lg:w-1/4 order-2 md:order-1">
                                    <PodiumCard
                                        rank={2}
                                        data={podiumData[1]}
                                        type={type}
                                        activeTab={activeTab}
                                        color={color}
                                        onClick={type === 'player' ? () => setSelectedPlayer(podiumData[1] as Player) : () => setSelectedFaction(podiumData[1] as Faction)}
                                    />
                                </div>
                            )}

                            {/* Rank 1 */}
                            {podiumData[0] && (
                                <div className="w-full md:w-1/3 lg:w-1/4 order-1 md:order-2 -mt-12 z-10">
                                    <PodiumCard
                                        rank={1}
                                        data={podiumData[0]}
                                        type={type}
                                        activeTab={activeTab}
                                        color={color}
                                        isFirst
                                        onClick={type === 'player' ? () => setSelectedPlayer(podiumData[0] as Player) : () => setSelectedFaction(podiumData[0] as Faction)}
                                    />
                                </div>
                            )}

                            {/* Rank 3 */}
                            {podiumData[2] && (
                                <div className="w-full md:w-1/3 lg:w-1/4 order-3">
                                    <PodiumCard
                                        rank={3}
                                        data={podiumData[2]}
                                        type={type}
                                        activeTab={activeTab}
                                        color={color}
                                        onClick={type === 'player' ? () => setSelectedPlayer(podiumData[2] as Player) : () => setSelectedFaction(podiumData[2] as Faction)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Search Bar - MOVED BELOW PODIUM */}
                <div className="relative max-w-md mx-auto mb-12">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'factions' ? 'factions' : 'survivors'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-sm leading-5 bg-[#131426] text-gray-300 placeholder-gray-600 focus:outline-none focus:bg-[#191A30] focus:border-white/30 focus:ring-1 focus:ring-white/30 sm:text-sm transition-colors shadow-lg"
                    />
                </div>

                {/* List Section */}
                <div className="bg-[#131426]/80 border border-white/5 rounded-sm overflow-hidden backdrop-blur-sm">
                    {listData.length > 0 ? (
                        <>
                            <div className="grid grid-cols-12 gap-4 p-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 select-none">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-6 md:col-span-5">Name</div>
                                <div className="col-span-2 hidden md:block text-center">{type === 'player' ? 'Survived For' : 'Members'}</div>
                                <div className="col-span-3 text-right md:pr-8">Score</div>
                                <div className="col-span-2 md:col-span-1 text-center">Info</div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {listData.map((item: any, index: number) => {
                                    // Calculate ACTUAL rank
                                    // Since 'data' is already sorted, the rank is the index in the original 'data' array + 1
                                    const realRank = data.indexOf(item) + 1;

                                    return (
                                        <ListItem
                                            key={type === 'player' ? (item as Player).steam_id64 : (item as Faction).name}
                                            item={item}
                                            rank={realRank}
                                            type={type}
                                            activeTab={activeTab}
                                            color={color}
                                            onClick={type === 'player' ? () => setSelectedPlayer(item as Player) : () => setSelectedFaction(item as Faction)}
                                        />
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        /* Empty State when Search has no results */
                        <div className="text-center py-24 text-gray-500">
                            <div className="mb-4 inline-block p-4 rounded-full bg-white/5">
                                <Search size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white">No results found</h3>
                            <p className="text-sm">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>

            </motion.div>
        </AnimatePresence>

        <PlayerInfo player={selectedPlayer} onClose={() => setSelectedPlayer(null)} configs={configs} />
        <FactionInfo 
            faction={selectedFaction} 
            allPlayers={players} 
            onClose={() => setSelectedFaction(null)} 
            configs={configs} 
            factionScoring={factionScoring} 
        />
    </div>
  );
}

// --- Podium Card Component ---
function PodiumCard({ rank, data, type, activeTab, color, isFirst = false, onClick }: any) {
    const isPlayer = type === 'player';
    const player = isPlayer ? (data as Player) : null;
    const faction = !isPlayer ? (data as Faction) : null;
    const theme = COLOR_VARIANTS[color as keyof typeof COLOR_VARIANTS];

    // Determine Name and Subtext
    // Main Name: [TAG] Username (if tag exists) OR Username
    // Subtext: Character Name
    const factionTag = isPlayer && player!.faction_tag ? `[${player!.faction_tag}] ` : '';
    const name = isPlayer ? `${factionTag}${player!.account_name}` : faction!.name;
    const subtext = isPlayer ? player!.character_name : `[${faction!.tag}]`;

    const avatar = isPlayer
        ? (player!.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`)
        : undefined;

    const getValue = () => {
        if (activeTab === 'zombie_kills') return isPlayer ? player!.zombie_kills : faction!.total_zombie_kills;
        if (activeTab === 'player_kills') return isPlayer ? player!.player_kills : faction!.total_player_kills;
        if (activeTab === 'economy') return isPlayer ? `$${(player!.economy_earned_this_season || 0).toLocaleString()}` : `$${faction!.total_economy_earned.toLocaleString()}`;
        if (activeTab === 'factions') return faction!.score.toFixed(1);
        return 0;
    };

    const getLabel = () => {
         if (activeTab === 'zombie_kills') return 'Kills';
         if (activeTab === 'player_kills') return 'Executions';
         if (activeTab === 'economy') return 'Earned';
         if (activeTab === 'factions') return 'Score';
         return '';
    };

    return (
        <div
            onClick={onClick}
            className={classNames(
                "relative group cursor-pointer flex flex-col items-center",
                isFirst ? "transform scale-105" : "mt-8"
            )}
        >
            {/* Rank Indicator */}
            <div className={classNames(
                "absolute -top-6 z-20 flex items-center justify-center w-12 h-12 transform rotate-45 border-4 border-[#191A30]",
                rank === 1 ? `${theme.bg} text-[#191A30]` : "bg-[#131426] border-white/20 text-gray-400"
            )}>
                 <div className="-rotate-45 font-black text-xl">{rank}</div>
            </div>
            {rank === 1 && <Trophy className={`absolute -top-16 ${theme.text} animate-bounce`} size={32} />}

            {/* Card Body */}
            <div className={classNames(
                "w-full bg-[#131426] border p-6 pt-10 flex flex-col items-center text-center transition-all duration-300 clip-path-corner-lg",
                isFirst
                    ? `${theme.border} shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-gradient-to-b from-[#191A30] to-[#131426]`
                    : `border-white/10 ${theme.hoverBorder} hover:shadow-lg`
            )}>
                 {/* Avatar */}
                 <div className="mb-4 relative">
                    {isPlayer ? (
                        <img src={avatar} alt={name} className={classNames(
                            "rounded-full object-cover border-4 border-[#191A30]",
                            isFirst ? "w-24 h-24" : "w-20 h-20"
                        )} />
                    ) : (
                        <div className={classNames(
                             "rounded-full border-4 border-[#191A30] flex items-center justify-center bg-white/5 text-gray-400",
                             isFirst ? "w-24 h-24" : "w-20 h-20"
                        )}>
                            <Flag size={isFirst ? 40 : 32} />
                        </div>
                    )}

                    {/* Removed Status Indicator as requested */}
                 </div>

                 <h3 className={classNames(
                     "font-bold uppercase tracking-wide text-white mb-1 truncate w-full px-2",
                     isFirst ? "text-xl" : "text-lg"
                 )}>
                    {name}
                 </h3>
                 <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">{subtext}</p>

                 <div className={classNames(
                     "w-full py-3 rounded bg-[#191A30] border border-white/5 mb-2",
                     theme.text
                 )}>
                     <div className="text-3xl font-black font-mono">{getValue()}</div>
                     <div className="text-[10px] uppercase tracking-widest text-gray-500">{getLabel()}</div>
                 </div>
            </div>

             {/* Floor Reflection */}
             <div className={`w-[80%] h-2 ${theme.bgMedium} blur-md rounded-[100%] mt-4`}></div>
        </div>
    )
}


// --- List Item Component ---
function ListItem({ item, rank, type, activeTab, color, onClick }: any) {
    const isPlayer = type === 'player';
    const player = isPlayer ? (item as Player) : null;
    const faction = !isPlayer ? (item as Faction) : null;
    const theme = COLOR_VARIANTS[color as keyof typeof COLOR_VARIANTS];

    const factionTag = isPlayer && player!.faction_tag ? `[${player!.faction_tag}] ` : '';
    const name = isPlayer ? `${factionTag}${player!.account_name}` : faction!.name;
    const subtext = isPlayer ? player!.character_name : faction!.tag;
    const avatar = isPlayer
        ? (player!.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`)
        : undefined;

    const getValue = () => {
        if (activeTab === 'zombie_kills') return isPlayer ? player!.zombie_kills : faction!.total_zombie_kills;
        if (activeTab === 'player_kills') return isPlayer ? player!.player_kills : faction!.total_player_kills;
        if (activeTab === 'economy') return isPlayer ? `$${(player!.economy_earned_this_season || 0).toLocaleString()}` : `$${faction!.total_economy_earned.toLocaleString()}`;
        if (activeTab === 'factions') return faction!.score.toFixed(1);
        return 0;
    };

    return (
        <div
            onClick={onClick}
            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer group"
        >
             <div className="col-span-1 text-center font-mono text-gray-500 group-hover:text-white font-bold">
                {rank}
             </div>

             <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                 {isPlayer ? (
                     <img src={avatar} alt={name} className="w-10 h-10 rounded-full border border-white/10" />
                 ) : (
                     <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-500">
                        <Flag size={16} />
                     </div>
                 )}
                 <div className="min-w-0">
                     <div className="text-white font-bold text-sm truncate group-hover:text-[#FED405] transition-colors">{name}</div>
                     <div className="text-gray-600 text-[10px] uppercase tracking-widest truncate">
                         {isPlayer ? subtext : `Tag: ${subtext}`}
                     </div>
                 </div>
             </div>

             <div className="col-span-2 hidden md:block text-center">
                 {isPlayer ? (
                      <span className="text-[10px] text-gray-400 uppercase font-mono">
                          {formatSurvivalTime(player!.hours_survived)}
                      </span>
                 ) : (
                      <span className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                          <Users size={12} /> {faction!.member_count}
                      </span>
                 )}
             </div>

             <div className={`col-span-3 text-right md:pr-8 font-mono font-bold ${theme.text} text-lg`}>
                 {getValue()}
             </div>

             <div className="col-span-2 md:col-span-1 flex justify-center">
                 <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
             </div>
        </div>
    )
}