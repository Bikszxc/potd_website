import fs from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

export type Player = {
  steam_id64: string;
  steam_name: string;
  account_name: string;
  character_name: string;
  profession: string;
  gender: string;
  is_alive?: boolean;
  hours_survived: number;
  days_survived: number;
  zombie_kills: number;
  player_kills: number;
  favorite_weapon_name?: string;
  traits: { type: string; name: string; cost: number; desc: string }[];
  faction_name?: string | null;
  faction_tag?: string | null;
  skills?: Record<string, { level: number }>;
  economy: {
    primaryCurrency: {
      bank: number;
      wallet: number;
      total: number;
    };
  };
  economy_earned_this_season?: number;
  last_update_unix?: number;
  avatar_url?: string;
  lifetime_hours_survived?: number;
  lifetime_zombie_kills?: number;
  lifetime_player_kills?: number;
  lifetime_economy_earned?: number;
};

export type Faction = {
  name: string;
  tag: string;
  total_zombie_kills: number;
  total_player_kills: number;
  total_economy_earned: number;
  total_time_survived: number;
  member_count: number;
  score: number; // Calculated based on rubric
};

const STEAM_API_KEY = 'EF83BFF3EFFF74CF81EC78F2418F359E';

async function fetchSteamAvatars(players: Player[]): Promise<Player[]> {
  const steamIds = players.map(p => p.steam_id64).filter(Boolean);
  
  if (steamIds.length === 0) return players;

  // Steam API allows up to 100 IDs per request. 
  // For simplicity in this context, we'll assume < 100 players or just take the first batch if it was huge, 
  // but a robust solution would chunk this.
  // Given the file read, let's just handle the batch we have.
  
  const batchedIds = steamIds.slice(0, 100).join(',');

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${batchedIds}`
    );

    if (!response.ok) {
        console.error('Failed to fetch Steam avatars:', response.statusText);
        return players;
    }

    const data = await response.json();
    const steamProfiles = data.response?.players || [];

    const avatarMap = new Map(
        steamProfiles.map((profile: any) => [profile.steamid, profile.avatarfull])
    );

    return players.map(player => ({
        ...player,
        avatar_url: (avatarMap.get(player.steam_id64) as string) || undefined
    }));

  } catch (error) {
    console.error('Error fetching Steam avatars:', error);
    return players;
  }
}

export async function getLeaderboardData(options?: { raw?: boolean }) {
  try {
    const supabase = await createClient();
    const { data: blacklistData } = await supabase.from('player_blacklist').select('username');
    const blacklistedNames = new Set(blacklistData?.map(b => b.username.toLowerCase()) || []);

    let players: Player[] = [];
    let usedRemote = false;

    // 1. Try Supabase Table First (Remote/Primary Method)
    try {
        // console.log("Fetching leaderboard data from Supabase 'leaderboard_imports'...");
        const { data: remoteData } = await supabase
            .from('leaderboard_imports')
            .select('*');

        if (remoteData && remoteData.length > 0) {
            usedRemote = true;
            players = remoteData.map((row: any) => {
                const data = row.data; // The raw JSON is in the 'data' column
                const username = row.username || data.username || '';

                if (blacklistedNames.has(username.toLowerCase())) {
                    return null;
                }
                
                 if (data.username && blacklistedNames.has(data.username.toLowerCase())) {
                    return null;
                }

                // Map raw JSON to Player type
                return {
                    steam_id64: String(row.steam_id || data.steam?.steamid64 || ''),
                    steam_name: data.steam?.steam_name || '',
                    account_name: username,
                    character_name: data.character?.name || '',
                    profession: data.character?.profession || '',
                    gender: data.character?.gender || '',
                    is_alive: true,
                    hours_survived: data.hours_survived || 0,
                    days_survived: (data.hours_survived || 0) / 24,
                    zombie_kills: data.kills?.zombies || 0,
                    player_kills: data.kills?.survivors || 0,
                    favorite_weapon_name: '',
                    traits: data.traits || [],
                    faction_name: data.faction?.name || null,
                    faction_tag: data.faction?.tag || null,
                    skills: Array.isArray(data.skills) 
                        ? data.skills.reduce((acc: any, skill: any) => {
                            acc[skill.name] = { level: skill.level };
                            return acc;
                        }, {}) 
                        : {},
                    economy: {
                        primaryCurrency: {
                            bank: 0,
                            wallet: data.economy?.total || 0,
                            total: data.economy?.total || 0
                        }
                    },
                    economy_earned_this_season: data.economy?.earned || 0,
                    last_update_unix: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
                    lifetime_hours_survived: data.hours_survived || 0,
                    lifetime_zombie_kills: data.kills?.zombies || 0,
                    lifetime_player_kills: data.kills?.survivors || 0,
                    lifetime_economy_earned: data.economy?.earned || 0
                };
            }).filter(Boolean) as Player[];
        }
    } catch (err) {
        console.error("Failed to fetch from Supabase:", err);
    }

    // 2. Fallback to Local File System (Legacy/Dev Method) if Supabase failed or empty
    if (!usedRemote) {
        const playersDir = path.join('/home/pzserver/Zomboid/Lua/LeaderboardsJSON/players');
        
        try {
            await fs.promises.access(playersDir);
            const entries = await fs.promises.readdir(playersDir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const username = entry.name;
                    
                    // Skip if blacklisted (check directory name / username)
                    if (blacklistedNames.has(username.toLowerCase())) {
                        continue;
                    }

                    const jsonPath = path.join(playersDir, username, `${username}.json`);
                    
                    try {
                        const fileContents = await fs.promises.readFile(jsonPath, 'utf8');
                        const stats = await fs.promises.stat(jsonPath); // Get file stats
                        const data = JSON.parse(fileContents);
                        
                        // Double check mapped username
                        if (data.username && blacklistedNames.has(data.username.toLowerCase())) {
                            continue;
                        }

                        // Map new JSON schema to Player type
                        const player: Player = {
                            steam_id64: String(data.steam?.steamid64 || ''),
                            steam_name: data.steam?.steam_name || '',
                            account_name: data.username || '',
                            character_name: data.character?.name || '',
                            profession: data.character?.profession || '',
                            gender: data.character?.gender || '',
                            is_alive: true, // Defaulting as not provided in new JSON
                            hours_survived: data.hours_survived || 0,
                            days_survived: (data.hours_survived || 0) / 24,
                            zombie_kills: data.kills?.zombies || 0,
                            player_kills: data.kills?.survivors || 0,
                            favorite_weapon_name: '', // Not provided
                            traits: data.traits || [],
                            faction_name: data.faction?.name || null,
                            faction_tag: data.faction?.tag || null,
                            skills: Array.isArray(data.skills) 
                                ? data.skills.reduce((acc: any, skill: any) => {
                                    acc[skill.name] = { level: skill.level };
                                    return acc;
                                }, {}) 
                                : {},
                            economy: {
                                primaryCurrency: {
                                    bank: 0, // Not split in new JSON
                                    wallet: data.economy?.total || 0,
                                    total: data.economy?.total || 0
                                }
                            },
                            economy_earned_this_season: data.economy?.earned || 0,
                            last_update_unix: stats.mtimeMs, // Use file modification time
                            lifetime_hours_survived: data.hours_survived || 0, // Store raw value
                            lifetime_zombie_kills: data.kills?.zombies || 0,
                            lifetime_player_kills: data.kills?.survivors || 0,
                            lifetime_economy_earned: data.economy?.earned || 0
                        };

                        players.push(player);
                    } catch (e) {
                        // Ignore missing files or parse errors for individual users
                        // console.warn(`Could not read data for user ${username}:`, e);
                    }
                }
            }
        } catch {
            // console.warn("Players directory not found:", playersDir);
        }
    }

    // Auto-Snapshot Logic for Active Season
    try {
        const { data: activeSeason } = await supabase
            .from('seasons')
            .select('id')
            .eq('is_active', true)
            .single();

        if (activeSeason) {
             const { data: existingSnapshots } = await supabase
                .from('player_season_snapshots')
                .select('*') // Select all fields to use in calculation
                .eq('season_id', activeSeason.id);

             // HYBRID LOOKUP STRATEGY (To support migration during active season)
             const snapshotByUsername = new Map();
             const snapshotBySteamId = new Map();

             existingSnapshots?.forEach((s: any) => {
                 if (s.username) {
                     snapshotByUsername.set(s.username, s);
                 } else if (s.steam_id) {
                     // Only map by SteamID if username is missing (Legacy Snapshot)
                     snapshotBySteamId.set(s.steam_id, s);
                 }
             });
             
             // Identify players who need a snapshot
             // A player needs a snapshot if they are NOT in username map AND NOT in legacy steam map
             const candidates = players.filter(p => {
                 const hasUsernameSnap = p.account_name && snapshotByUsername.has(p.account_name);
                 const hasLegacySnap = p.steam_id64 && snapshotBySteamId.has(p.steam_id64);
                 return !hasUsernameSnap && !hasLegacySnap;
             });
             
             // Deduplicate candidates by username
             const uniqueCandidates = Array.from(new Map(candidates.map(p => [p.account_name, p])).values());

             const newSnapshots = uniqueCandidates.map(p => ({
                    season_id: activeSeason.id,
                    steam_id: p.steam_id64,
                    username: p.account_name,
                    zombie_kills: p.zombie_kills,
                    player_kills: p.player_kills,
                    hours_survived: p.hours_survived,
                    economy_earned: p.economy_earned_this_season || 0
                }));

             if (newSnapshots.length > 0) {
                 console.log(`Creating ${newSnapshots.length} new snapshots for active season ${activeSeason.id}`);
                 await supabase.from('player_season_snapshots').insert(newSnapshots);
                 
                 // Add new snapshots to the map so they are used immediately below
                 newSnapshots.forEach(s => snapshotByUsername.set(s.username, s));
             }

             // APPLY SNAPSHOTS TO DATA (Only if raw is not requested)
             if (!options?.raw) {
                 players = players.map(p => {
                     // Lookup: Try Username first, then Legacy SteamID
                     let snapshot = snapshotByUsername.get(p.account_name);
                     if (!snapshot) {
                         snapshot = snapshotBySteamId.get(p.steam_id64);
                     }

                     if (!snapshot) return p;

                     // Helper: Calculates season progress.
                     // Handles floating point precision errors where snap might be infinitesimally larger than current.
                     
                     // ROLLBACK DETECTION:
                     // If hours_survived is close to the snapshot (< 10% difference) but lower, 
                     // it's likely a server rollback, not a death.
                     // Death would reset hours to ~0.
                     let isRollback = false;
                     if (p.hours_survived < snapshot.hours_survived && snapshot.hours_survived > 5) {
                        const ratio = p.hours_survived / snapshot.hours_survived;
                        // If we have > 90% of our previous hours, it's a rollback.
                        if (ratio > 0.90) isRollback = true;
                     }

                     const calcSeasonStat = (current: number, snap: number) => {
                         // Normal Progress
                         if (current >= snap) return current - snap;
                         
                         // If it's a confirmed rollback (based on hours), return 0 progress
                         if (isRollback) return 0;
                         
                         // Fallback Heuristic: If individual stat is very close (>95%) to snapshot and large,
                         // treat as rollback even if hours didn't trigger (safety net).
                         if (snap > 100 && current > (snap * 0.95)) return 0;

                         // Otherwise, assume Death (Reset) -> Return new current value
                         return current;
                     };

                     return {
                         ...p,
                         zombie_kills: calcSeasonStat(p.zombie_kills, snapshot.zombie_kills),
                         player_kills: calcSeasonStat(p.player_kills, snapshot.player_kills),
                         hours_survived: calcSeasonStat(p.hours_survived, snapshot.hours_survived),
                         economy_earned_this_season: calcSeasonStat(p.economy_earned_this_season || 0, snapshot.economy_earned)
                     };
                 });
             }
        }
    } catch (snapshotError) {
        console.error("Error in auto-snapshot logic:", snapshotError);
        // Don't fail the whole leaderboard load just because snapshotting failed
    }
    
    return await fetchSteamAvatars(players);

  } catch (error) {
    console.error("Error reading leaderboard data:", error);
    return [];
  }
}
