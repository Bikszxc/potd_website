'use client';

import { useState, useActionState, useEffect } from 'react';
import { LeaderboardConfig, FactionScoreConfig, Season, BlacklistEntry } from '@/types';
import { toggleLeaderboard, updateFactionScoring } from '@/actions/leaderboard-actions';
import { startNewSeason, deleteSeason } from '@/actions/season-actions';
import { addToBlacklist, removeFromBlacklist } from '@/actions/blacklist-actions';
import { Skull, Crosshair, DollarSign, Flag, Trophy, Calculator, Save, Clock, Calendar, Archive, Download, Play, Trash2, Eye, X, Ban, UserX, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

const ICONS: Record<string, LucideIcon> = {
    zombie_kills: Skull,
    player_kills: Crosshair,
    economy: DollarSign,
    factions: Flag
};

const COLORS: Record<string, string> = {
    zombie_kills: 'text-yellow-500',
    player_kills: 'text-red-500',
    economy: 'text-green-500',
    factions: 'text-purple-500'
};

function SeasonViewerModal({ season, onClose }: { season: Season; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#131426] border border-white/10 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#191A30]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-[#FED405]" size={24} />
                        {season.name} Standings
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0f1016] p-4 rounded border border-white/5">
                            <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Duration</div>
                            <div className="text-white font-mono text-sm">
                                {new Date(season.start_date).toLocaleDateString()} — {season.end_date ? new Date(season.end_date).toLocaleDateString() : 'Active'}
                            </div>
                        </div>
                        <div className="bg-[#0f1016] p-4 rounded border border-white/5">
                            <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Status</div>
                            <div className={season.is_active ? "text-green-500 font-bold uppercase" : "text-gray-400 font-bold uppercase"}>
                                {season.is_active ? 'Active Season' : 'Archived'}
                            </div>
                        </div>
                    </div>

                    {season.final_standings_csv ? (
                        <div className="bg-[#191A30] p-4 rounded border border-white/10">
                            <p className="text-sm text-gray-300 mb-4">
                                Detailed standings for this season are available for download. This CSV file contains the final snapshot of all player stats.
                            </p>
                            <a 
                                href={season.final_standings_csv}
                                download={`${season.name.replace(/\s+/g, '_')}_standings.csv`}
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-colors"
                            >
                                <Download size={16} />
                                Download CSV Report
                            </a>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 italic">
                            No detailed standings data available for this season.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LeaderboardManager({ 
    configs, 
    factionScoring, 
    seasons,
    blacklist
}: { 
    configs: LeaderboardConfig[], 
    factionScoring: FactionScoreConfig, 
    seasons: Season[],
    blacklist: BlacklistEntry[]
}) {
  const activeSeason = seasons.find(s => s.is_active);
  const pastSeasons = seasons.filter(s => !s.is_active);
  const [viewingSeason, setViewingSeason] = useState<Season | null>(null);

  const defaults = {
      zombie: factionScoring?.zombie_kill_multiplier ?? 0,
      player: factionScoring?.player_kill_multiplier ?? 0,
      economy: factionScoring?.economy_multiplier ?? 0,
      survival: factionScoring?.survival_multiplier ?? 0
  };

  const handleDownloadCSV = (url: string, filename: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    const result = await toggleLeaderboard(id, !currentState);
    if (result.success) {
        toast.success(result.message);
    } else {
        toast.error(result.message);
    }
  };

  const [updateState, updateAction, isUpdatePending] = useActionState(updateFactionScoring, null);
  const [startSeasonState, startSeasonAction, isStartSeasonPending] = useActionState(startNewSeason, null);
  const [deleteSeasonState, deleteSeasonAction, isDeletePending] = useActionState(deleteSeason, null);
  const [addBlacklistState, addBlacklistAction, isAddBlacklistPending] = useActionState(addToBlacklist, null);
  const [removeBlacklistState, removeBlacklistAction, isRemoveBlacklistPending] = useActionState(removeFromBlacklist, null);

  useEffect(() => {
      if (updateState?.success) {
          toast.success(updateState.message);
      } else if (updateState?.success === false) {
          toast.error(updateState.message);
      }
  }, [updateState]);

  useEffect(() => {
      if (startSeasonState?.success) {
          toast.success(startSeasonState.message);
      } else if (startSeasonState?.success === false) {
          toast.error(startSeasonState.message);
      }
  }, [startSeasonState]);

  useEffect(() => {
      if (deleteSeasonState?.success) {
          toast.success(deleteSeasonState.message);
      } else if (deleteSeasonState?.success === false) {
          toast.error(deleteSeasonState.message);
      }
  }, [deleteSeasonState]);

  useEffect(() => {
    if (addBlacklistState?.success) {
      toast.success(addBlacklistState.message);
    } else if (addBlacklistState?.success === false) {
      toast.error(addBlacklistState.message);
    }
  }, [addBlacklistState]);

  useEffect(() => {
    if (removeBlacklistState?.success) {
      toast.success(removeBlacklistState.message);
    } else if (removeBlacklistState?.success === false) {
      toast.error(removeBlacklistState.message);
    }
  }, [removeBlacklistState]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {viewingSeason && <SeasonViewerModal season={viewingSeason} onClose={() => setViewingSeason(null)} />}
        
        {/* LEFT COLUMN: CONFIGURATION */}
        <div className="space-y-6">
            
            {/* Visibility Toggles */}
            <div className="bg-[#131426] p-5 border border-white/5 rounded-sm">
                <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-[#FED405] uppercase flex items-center gap-2">
                    <Trophy size={24} /> Leaderboard Visibility
                    </h3>
                    <p className="text-gray-400 text-sm">Enable or disable specific ranking categories.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {configs.sort((a, b) => a.display_order - b.display_order).map(config => {
                        const Icon = ICONS[config.id] || Trophy;
                        const colorClass = COLORS[config.id] || 'text-white';

                        return (
                            <div 
                                key={config.id} 
                                className={`p-4 border rounded-sm flex items-center justify-between transition-all ${
                                    config.enabled 
                                        ? 'bg-[#191A30] border-white/10' 
                                        : 'bg-[#0f1016] border-white/5 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded bg-white/5 ${colorClass}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white uppercase text-sm">{config.label}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                            {config.enabled ? 'Visible' : 'Hidden'}
                                        </div>
                                    </div>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.enabled}
                                        onChange={() => handleToggle(config.id, config.enabled)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FED405]"></div>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scoring Rules */}
            <div className="bg-[#131426] p-5 border border-white/5 rounded-sm">
                <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-purple-500 uppercase flex items-center gap-2">
                        <Calculator size={24} /> Faction Scoring Rules
                    </h3>
                    <p className="text-gray-400 text-sm">Adjust how faction points are calculated.</p>
                </div>

                <form action={updateAction} className="space-y-6">
                    <input type="hidden" name="id" value={factionScoring?.id} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Zombie Kills */}
                        <div className="bg-[#191A30] p-4 border border-white/10 rounded-sm">
                            <div className="flex items-center gap-2 mb-2 text-yellow-500">
                                <Skull size={16} />
                                <label className="text-xs font-bold uppercase">Zombie Kill Multiplier</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    name="zombie_kill_multiplier"
                                    defaultValue={defaults.zombie}
                                    step="0.1"
                                    className="flex-1 bg-[#0f1016] border border-white/10 p-2 text-sm text-white font-mono focus:border-yellow-500 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500 font-mono">pts per kill</span>
                            </div>
                        </div>

                        {/* Player Kills */}
                        <div className="bg-[#191A30] p-4 border border-white/10 rounded-sm">
                            <div className="flex items-center gap-2 mb-2 text-red-500">
                                <Crosshair size={16} />
                                <label className="text-xs font-bold uppercase">Player Kill Multiplier</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    name="player_kill_multiplier"
                                    defaultValue={defaults.player}
                                    step="0.1"
                                    className="flex-1 bg-[#0f1016] border border-white/10 p-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500 font-mono">pts per kill</span>
                            </div>
                        </div>

                        {/* Economy */}
                        <div className="bg-[#191A30] p-4 border border-white/10 rounded-sm">
                            <div className="flex items-center gap-2 mb-2 text-green-500">
                                <DollarSign size={16} />
                                <label className="text-xs font-bold uppercase">Economy Multiplier</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    name="economy_multiplier"
                                    defaultValue={defaults.economy}
                                    step="0.001"
                                    className="flex-1 bg-[#0f1016] border border-white/10 p-2 text-sm text-white font-mono focus:border-green-500 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500 font-mono">pts per $1</span>
                            </div>
                        </div>

                        {/* Survival Time */}
                        <div className="bg-[#191A30] p-4 border border-white/10 rounded-sm">
                            <div className="flex items-center gap-2 mb-2 text-blue-400">
                                <Clock size={16} />
                                <label className="text-xs font-bold uppercase">Survival Multiplier</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    name="survival_multiplier"
                                    defaultValue={defaults.survival}
                                    step="0.01"
                                    className="flex-1 bg-[#0f1016] border border-white/10 p-2 text-sm text-white font-mono focus:border-blue-400 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500 font-mono">pts per hour</span>
                            </div>
                        </div>

                    </div>

                    <button 
                        type="submit" 
                        disabled={isUpdatePending}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-purple-600 text-white font-bold uppercase tracking-wider hover:bg-purple-500 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isUpdatePending ? 'Saving...' : 'Save Scoring Rules'}
                    </button>
                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: SEASON & BLACKLIST MANAGEMENT */}
        <div className="space-y-6 h-full">
            
            {/* Season Management */}
            <div className="bg-[#131426] p-5 border border-white/5 rounded-sm">
                <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-blue-500 uppercase flex items-center gap-2">
                        <Calendar size={24} /> Season Management
                    </h3>
                    <p className="text-gray-400 text-sm">Manage season resets and archives.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Start New Season */}
                    <div className="space-y-6">
                        <div className="bg-[#191A30] p-4 border border-white/10 rounded-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-white uppercase">Current Status</h4>
                                {activeSeason ? (
                                    <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded font-bold uppercase tracking-wider">Active: {activeSeason.name}</span>
                                ) : (
                                    <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-1 rounded font-bold uppercase tracking-wider">No Active Season</span>
                                )}
                            </div>
                            
                            <form action={startSeasonAction} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">New Season Name</label>
                                    <input 
                                        name="season_name" 
                                        type="text" 
                                        required
                                        placeholder="e.g. Operation Winter"
                                        className="w-full bg-[#0f1016] border border-white/10 p-3 text-sm focus:border-blue-500 focus:outline-none text-white placeholder-gray-700" 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Target End Date</label>
                                    <input 
                                        name="end_date" 
                                        type="date" 
                                        className="w-full bg-[#0f1016] border border-white/10 p-3 text-sm focus:border-blue-500 focus:outline-none text-white text-gray-400" 
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isStartSeasonPending}
                                    className="w-full bg-blue-600 text-white font-bold py-3 uppercase tracking-wider hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Play size={18} />
                                    {isStartSeasonPending ? 'Starting...' : 'Start New Season'}
                                </button>
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    <span className="text-red-400 font-bold">WARNING:</span> Starting a new season will snapshot all current player stats. The leaderboard will reset to 0 relative to these snapshots. The current season will be archived.
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Archived Seasons */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                            <Archive size={16} /> Season Archives
                        </h4>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {pastSeasons.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm italic border border-dashed border-white/10 rounded">
                                    No archived seasons found.
                                </div>
                            )}

                            {pastSeasons.map(season => (
                                <div key={season.id} className="bg-[#191A30] p-3 rounded border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors">
                                    <div>
                                        <div className="font-bold text-white text-sm">{season.name}</div>
                                        <div className="text-[10px] text-gray-500">
                                            {new Date(season.start_date).toLocaleDateString()} - {season.end_date ? new Date(season.end_date).toLocaleDateString() : 'Ended'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {season.final_standings_csv ? (
                                            <>
                                                <button 
                                                    onClick={() => setViewingSeason(season)}
                                                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded transition-colors"
                                                    title="View Standings"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDownloadCSV(season.final_standings_csv!, `${season.name.replace(/\s+/g, '_')}_standings.csv`)}
                                                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
                                                    title="Download CSV"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-[10px] text-gray-600 italic">No Data</span>
                                        )}
                                        
                                        <form action={deleteSeasonAction}>
                                            <input type="hidden" name="season_id" value={season.id} />
                                            <button 
                                                type="submit"
                                                disabled={isDeletePending}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors disabled:opacity-50"
                                                title="Delete Archive"
                                                onClick={(e) => {
                                                    if (!confirm("Are you sure you want to delete this archive permanently?")) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Blacklist Management */}
            <div className="bg-[#131426] p-5 border border-white/5 rounded-sm">
                <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-red-500 uppercase flex items-center gap-2">
                        <Ban size={24} /> Blacklist Management
                    </h3>
                    <p className="text-gray-400 text-sm">Restrict players from leaderboards and rankings.</p>
                </div>

                <div className="space-y-6">
                    <form action={addBlacklistAction} className="flex flex-col gap-4">
                        <input 
                            name="username" 
                            type="text" 
                            required
                            placeholder="Username to blacklist..." 
                            className="w-full bg-[#0f1016] border border-white/10 p-3 text-sm focus:border-red-500 focus:outline-none text-white placeholder-gray-700" 
                        />
                         <input 
                            name="reason" 
                            type="text" 
                            placeholder="Reason (optional)..." 
                            className="w-full bg-[#0f1016] border border-white/10 p-3 text-sm focus:border-red-500 focus:outline-none text-white placeholder-gray-700" 
                        />
                        <button 
                            type="submit" 
                            disabled={isAddBlacklistPending}
                            className="w-full bg-red-600 text-white font-bold py-3 uppercase tracking-wider hover:bg-red-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <UserX size={16} />
                            {isAddBlacklistPending ? 'Processing...' : 'Ban User'}
                        </button>
                    </form>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {blacklist.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-xs italic border border-dashed border-white/10 rounded">
                                No active blacklists.
                            </div>
                        )}

                        {blacklist.map(entry => (
                            <div key={entry.id} className="bg-[#191A30] p-4 rounded border border-white/5 flex items-center justify-between group hover:border-red-500/30 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <UserX size={14} className="text-red-500" />
                                        <div className="font-bold text-white text-sm">{entry.username}</div>
                                    </div>
                                    {entry.reason && (
                                         <div className="text-xs text-red-400 italic pl-6">&quot;{entry.reason}&quot;</div>
                                    )}
                                    <div className="text-[10px] text-gray-600 pl-6">
                                        Added: {new Date(entry.added_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <form action={removeBlacklistAction}>
                                    <input type="hidden" name="id" value={entry.id} />
                                    <button 
                                        type="submit"
                                        disabled={isRemoveBlacklistPending}
                                        className="text-xs text-gray-500 hover:text-white underline uppercase tracking-wider p-2 hover:bg-white/5 rounded transition-colors"
                                    >
                                        Revoke
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}