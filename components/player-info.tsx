'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Player } from '@/utils/leaderboard-data';
import { LeaderboardConfig } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Skull, Clock, DollarSign, Crosshair, User, Activity, Sword, BookOpen, ShieldAlert, ChevronDown, Calendar, Trophy } from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';
import * as Tooltip from '@radix-ui/react-tooltip';

interface PlayerInfoProps {
  player: (Player & { 
    lifetime_zombie_kills?: number;
    lifetime_player_kills?: number;
    lifetime_hours_survived?: number;
    lifetime_economy_earned?: number;
  }) | null;
  onClose: () => void;
  configs?: LeaderboardConfig[];
}

// Helper for survival time
function formatSurvivalTime(hours: number) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    if (days === 0 && remainingHours === 0) return "Fresh Spawn";
    if (days === 0) return `${remainingHours} Hours`;
    return `${days} Days, ${remainingHours} Hours`;
}

// Helper for time ago
function getTimeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  
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

export default function PlayerInfo({ player, onClose, configs }: PlayerInfoProps) {
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [viewMode, setViewMode] = useState<'season' | 'lifetime'>('season');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isStatEnabled = (id: string) => {
      if (!configs || configs.length === 0) return true;
      const config = configs.find(c => c.id === id);
      return config ? config.enabled : true;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (player) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [player]);

  // Scroll Indicator Logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const isScrollable = container.scrollHeight > container.clientHeight;
      const isAtTop = container.scrollTop < 50;
      setShowScrollIndicator(isScrollable && isAtTop);
    };

    // Check initially and on resize/scroll
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [player]); // Re-run when player changes (content changes)

  useEffect(() => {
    if (player?.avatar_url) {
      const fac = new FastAverageColor();
      fac.getColorAsync(player.avatar_url, { algorithm: 'dominant' })
        .then(color => {
          setDominantColor(color.hex);
        })
        .catch(e => {
          console.warn('Failed to extract color from avatar', e);
          setDominantColor(null);
        });
    } else {
      setDominantColor(null);
    }
  }, [player]);

  // Stats based on view mode
  const stats = useMemo(() => {
      if (!player) return { zk: 0, pk: 0, eco: 0, hours: 0 };
      if (viewMode === 'season') {
          return {
              zk: player.zombie_kills,
              pk: player.player_kills,
              eco: player.economy_earned_this_season || 0,
              hours: player.hours_survived
          };
      } else {
          return {
              zk: player.lifetime_zombie_kills ?? player.zombie_kills,
              pk: player.lifetime_player_kills ?? player.player_kills,
              eco: player.lifetime_economy_earned ?? (player.economy_earned_this_season || 0),
              hours: player.lifetime_hours_survived ?? player.hours_survived
          };
      }
  }, [player, viewMode]);

  if (!player) return null;

  const steamProfileUrl = `https://steamcommunity.com/profiles/${player.steam_id64}`;
  const accentColor = dominantColor || '#4f46e5'; // Default purple-ish if no color
  const displayName = player.faction_tag ? `[${player.faction_tag}] ${player.account_name}` : player.account_name;
  const lastSyncDate = player.last_update_unix ? new Date(player.last_update_unix) : new Date();

  return (
    <Tooltip.Provider delayDuration={0}>
    <AnimatePresence>
      {player && (
        <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" 
            key="player-modal"
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
            className="relative w-full max-w-5xl bg-[#0f1016] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[600px]"
          >
            {/* Close Button (Mobile: Top Right, Desktop: Absolute Top Right over everything) */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* --- LEFT PANEL: ID CARD --- */}
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
                    {/* Avatar Ring */}
                    <div className="relative mb-6 group">
                        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <img 
                            src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.account_name}&background=random&color=fff`}
                            alt={player.account_name}
                            className="relative w-40 h-40 rounded-full border-4 border-white/10 shadow-2xl object-cover z-10"
                            crossOrigin="anonymous"
                        />
                    </div>

                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1 text-shadow-lg truncate w-full px-4">
                        {displayName}
                    </h2>
                    <p className="text-white/60 font-mono text-sm mb-8 tracking-wide">{player.character_name}</p>

                    <div className="w-full space-y-4 mb-auto">
                        <IDRow label="Steam Name" value={player.steam_name} />
                        <IDRow label="Profession" value={player.profession} />
                        <IDRow label="Gender" value={player.gender} />
                    </div>

                    <a 
                        href={steamProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-sm text-white text-xs font-bold uppercase tracking-widest transition-all w-full justify-center group"
                    >
                        <ExternalLink size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        Steam Profile
                    </a>
                </div>
            </div>

            {/* --- RIGHT PANEL: DATA DOSSIER --- */}
            <div className="flex-1 bg-[#131426] relative overflow-hidden flex flex-col h-full">
                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5" 
                     style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* Internal Scroll Indicator */}
                <AnimatePresence>
                  {showScrollIndicator && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    >
                      <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="p-1.5 rounded-full bg-[#191A30]/80 border border-white/10 text-[#FED405] shadow-lg backdrop-blur-sm"
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                    ref={scrollContainerRef}
                    className="relative z-10 p-8 overflow-y-auto overflow-x-hidden custom-scrollbar h-full w-full"
                >
                    
                    {/* Section: Combat & Survival */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                            <SectionHeader title="Performance Metrics" icon={Activity} color={accentColor} className="mb-0" />
                            
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

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                            {isStatEnabled('zombie_kills') && (
                                <StatBox label="Zombie Kills" value={stats.zk.toLocaleString()} icon={Skull} color="text-yellow-500" />
                            )}
                            {isStatEnabled('player_kills') && (
                                <StatBox label="Player Kills" value={stats.pk.toLocaleString()} icon={Crosshair} color="text-red-500" />
                            )}
                            {isStatEnabled('economy') && (
                                <StatBox label={viewMode === 'season' ? "Seasonal Earned" : "Lifetime Earned"} value={`$${stats.eco.toLocaleString()}`} icon={DollarSign} color="text-green-500" />
                            )}
                            <StatBox label="Time Survived" value={formatSurvivalTime(stats.hours)} icon={Clock} color="text-blue-400" />
                        </div>
                    </div>

                    {/* Section: Traits */}
                    <div className="mb-10">
                        <SectionHeader title="Character Traits" icon={User} color={accentColor} />
                        <div className="space-y-6">
                            {(() => {
                                const positiveTraits = player.traits.filter(t => t.cost > 0);
                                const neutralTraits = player.traits.filter(t => t.cost === 0);
                                const negativeTraits = player.traits.filter(t => t.cost < 0);

                                const renderTrait = (trait: any, i: number, borderColor: string) => {
                                    const displayName = trait.name.split('(')[0].trim();
                                    const formattedType = trait.type.toLowerCase().replace(/ /g, '_');
                                    const iconPath = `/icons/traits/trait_${formattedType.toLowerCase()}.png`;
                                    const costColor = trait.cost > 0 ? 'text-green-400' : (trait.cost < 0 ? 'text-red-400' : 'text-gray-400');
                                    const costSign = trait.cost > 0 ? '+' : '';

                                    return (
                                        <Tooltip.Root key={i}>
                                            <Tooltip.Trigger asChild>
                                                <div 
                                                    className={`group relative p-1.5 bg-[#1a1c2e] border ${borderColor} rounded hover:bg-white/5 transition-all cursor-help`}
                                                >
                                                    <img 
                                                        src={iconPath} 
                                                        alt={displayName}
                                                        className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <span className="hidden text-xs font-bold text-gray-300 px-2">{displayName}</span>
                                                </div>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content 
                                                    className="z-[60] w-64 bg-[#0f1016] border border-white/20 rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    sideOffset={5}
                                                >
                                                    <div className="bg-white/5 p-2 border-b border-white/10 flex justify-between items-center">
                                                        <span className="font-bold text-white text-xs uppercase tracking-wider">{displayName}</span>
                                                        <span className={`font-mono text-xs font-bold ${costColor}`}>{costSign}{trait.cost}</span>
                                                    </div>
                                                    <div className="p-3 text-[10px] text-gray-300 leading-relaxed whitespace-pre-line text-left">
                                                        {trait.desc}
                                                    </div>
                                                    <Tooltip.Arrow className="fill-[#0f1016]" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    );
                                };

                                return (
                                    <>
                                        {positiveTraits.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Activity size={12} /> Buffs
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {positiveTraits.map((t, i) => renderTrait(t, i, 'border-green-500/20 hover:border-green-500/50'))}
                                                </div>
                                            </div>
                                        )}

                                        {neutralTraits.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <User size={12} /> Neutral
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {neutralTraits.map((t, i) => renderTrait(t, i, 'border-yellow-500/20 hover:border-yellow-500/50'))}
                                                </div>
                                            </div>
                                        )}

                                        {negativeTraits.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <ShieldAlert size={12} /> Nerfs
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {negativeTraits.map((t, i) => renderTrait(t, i, 'border-red-500/20 hover:border-red-500/50'))}
                                                </div>
                                            </div>
                                        )}

                                        {player.traits.length === 0 && <span className="text-gray-600 text-xs italic">No traits recorded.</span>}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Section: Skills */}
                    {player.skills && Object.keys(player.skills).length > 0 && (
                        <div className="mb-10">
                            <SectionHeader title="Skill Proficiency" icon={BookOpen} color={accentColor} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(player.skills).map(([skillName, data]) => (
                                    <SkillBar key={skillName} skill={skillName} level={data.level} color={accentColor} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Loadout */}
                    {player.favorite_weapon_name && (
                        <div className="mb-10">
                            <SectionHeader title="Tactical Loadout" icon={Sword} color={accentColor} />
                            <div className="bg-[#0f1016] border border-white/5 rounded p-4 flex items-center gap-4 relative overflow-hidden group max-w-sm">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="w-12 h-12 bg-[#1a1c2e] rounded border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <Crosshair size={24} className="text-gray-500 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Primary Weapon</div>
                                    <div className="text-lg font-bold text-white font-mono truncate">{player.favorite_weapon_name}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                        <span>Server ID: {player.steam_id64.slice(-8)}</span>
                        <span className="group relative cursor-help">
                            Last Sync: {player.last_update_unix ? getTimeAgo(player.last_update_unix) : 'N/A'}
                            {player.last_update_unix && (
                                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/90 border border-white/10 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {lastSyncDate.toLocaleString()}
                                </div>
                            )}
                        </span>
                    </div>

                </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </Tooltip.Provider>
  );
}

// --- Sub Components ---

function SectionHeader({ title, icon: Icon, color, className = "mb-6" }: { title: string, icon: any, color: string, className?: string }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Icon size={18} className="text-white" />
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
            <div className="text-2xl font-black text-white font-mono leading-none mb-1 w-full truncate">{value}</div>
            {subValue && <div className="text-xs text-gray-500 font-mono mb-1">{subValue}</div>}
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-auto">{label}</div>
        </div>
    );
}

function SkillBar({ skill, level, color }: { skill: string, level: number, color: string }) {
    // Max level in PZ is 10
    const maxLevel = 10;
    const percentage = Math.min((level / maxLevel) * 100, 100);

    return (
        <div className="bg-[#1a1c2e] border border-white/5 p-3 rounded flex flex-col gap-2 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{skill}</span>
                <span className="text-xs font-mono font-bold text-white">Lvl {level}</span>
            </div>
            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                <div 
                    className="h-full transition-all duration-500 bg-white"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
