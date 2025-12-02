'use client';

import { useState, useActionState, useEffect } from 'react';
import { LeaderboardConfig, FactionScoreConfig, Season } from '@/types';
import { toggleLeaderboard, updateFactionScoring } from '@/actions/leaderboard-actions';
import { startNewSeason, deleteSeason } from '@/actions/season-actions';
import { Skull, Crosshair, DollarSign, Flag, Trophy, Calculator, Save, Clock, Calendar, Archive, Download, Play, Trash2, Eye, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

const ICONS: Record<string, any> = {
  'zombie_kills': Skull,
  'player_kills': Crosshair,
  'economy': DollarSign,
  'factions': Flag
};

const COLORS: Record<string, string> = {
  'zombie_kills': 'text-yellow-500',
  'player_kills': 'text-red-500',
  'economy': 'text-green-500',
  'factions': 'text-purple-500'
};

function SeasonViewerModal({ season, onClose }: { season: Season, onClose: () => void }) {
    const [sortConfig, setSortConfig] = useState<{ key: number | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    if (!season.final_standings_csv) return null;

    // Simple CSV Parser
    const parseCSV = (csv: string) => {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length === 0) return { headers: [], rows: [] };

        const headers = lines[0].split(',');
        
        let rows = lines.slice(1).map(line => {
            const cols: string[] = [];
            let cur = '';
            let inQuote = false;
            for(let i=0; i<line.length; i++) {
                const c = line[i];
                if(c === '"') { inQuote = !inQuote; continue; }
                if(c === ',' && !inQuote) { cols.push(cur); cur = ''; continue; }
                cur += c;
            }
            cols.push(cur);
            return cols;
        });

        if (sortConfig.key !== null) {
            rows = [...rows].sort((a, b) => {
                if (sortConfig.key === null) return 0;
                
                let valA: any = a[sortConfig.key];
                let valB: any = b[sortConfig.key];

                // Try to parse numbers
                const numA = parseFloat(valA);
                const numB = parseFloat(valB);

                if (!isNaN(numA) && !isNaN(numB)) {
                    valA = numA;
                    valB = numB;
                } else {
                    // Fallback for strings
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return { headers, rows };
    };

    const { headers, rows } = parseCSV(season.final_standings_csv);

    const handleSort = (index: number) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === index && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: index, direction });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl bg-[#131426] border border-white/10 rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0f1016]">
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                            <Archive size={20} className="text-blue-500" />
                            {season.name} <span className="text-gray-500 text-sm font-normal capitalize">Final Standings</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                            {new Date(season.start_date).toLocaleDateString()} — {season.end_date ? new Date(season.end_date).toLocaleDateString() : 'Ended'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="overflow-auto flex-1 custom-scrollbar p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-[#131426] z-10">
                            <tr className="border-b border-white/10">
                                {headers.map((h, i) => (
                                    <th 
                                        key={i} 
                                        onClick={() => handleSort(i)}
                                        className="pb-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-white transition-colors group select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            {h}
                                            <span className="text-gray-600 group-hover:text-gray-400">
                                                {sortConfig.key === i ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                                ) : (
                                                    <ArrowUpDown size={12} />
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rows.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    {row.map((cell, j) => (
                                        <td key={j} className={`py-3 px-2 ${j === 0 ? 'font-mono text-gray-500 text-xs' : 'text-gray-300 group-hover:text-white'}`}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0f1016] flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold uppercase rounded transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LeaderboardManager({ configs, factionScoring, seasons }: { configs: LeaderboardConfig[], factionScoring: FactionScoreConfig, seasons: Season[] }) {
  const activeSeason = seasons.find(s => s.is_active);
  const pastSeasons = seasons.filter(s => !s.is_active);
  const [viewingSeason, setViewingSeason] = useState<Season | null>(null);

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

  const handleDownloadCSV = (csvContent: string | null, filename: string) => {
      if (!csvContent) return;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Default values if not provided (though schema ensures they exist)
  const defaults = {
      zombie: factionScoring?.zombie_kill_multiplier ?? 3.0,
      player: factionScoring?.player_kill_multiplier ?? 10.0,
      economy: factionScoring?.economy_multiplier ?? 0.02,
      survival: factionScoring?.survival_multiplier ?? 0.05
  };

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

        {/* RIGHT COLUMN: SEASON MANAGEMENT */}
        <div className="bg-[#131426] p-5 border border-white/5 rounded-sm h-full">
            <div className="border-b border-white/5 pb-3 mb-4">
                <h3 className="text-xl font-bold text-blue-500 uppercase flex items-center gap-2">
                    <Calendar size={24} /> Season Management
                </h3>
                <p className="text-gray-400 text-sm">Manage season resets and archives.</p>
            </div>

            <div className="space-y-8">
                
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
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
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
                                                onClick={() => handleDownloadCSV(season.final_standings_csv, `${season.name.replace(/\s+/g, '_')}_standings.csv`)}
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
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
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
    </div>
  );
}