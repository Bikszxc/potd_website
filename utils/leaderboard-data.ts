import fs from 'fs';
import path from 'path';

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

export async function getLeaderboardData() {
  try {
    const playersDir = path.join(process.cwd(), 'public', 'players');
    
    // Ensure directory exists
    try {
        await fs.promises.access(playersDir);
    } catch {
        console.warn("Players directory not found:", playersDir);
        return [];
    }

    const entries = await fs.promises.readdir(playersDir, { withFileTypes: true });
    const players: Player[] = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const username = entry.name;
            const jsonPath = path.join(playersDir, username, `${username}.json`);
            
            try {
                const fileContents = await fs.promises.readFile(jsonPath, 'utf8');
                const stats = await fs.promises.stat(jsonPath); // Get file stats
                const data = JSON.parse(fileContents);
                
                // Map new JSON schema to Player type
                const player: Player = {
                    steam_id64: data.steam?.steamid64 || '',
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
                    last_update_unix: stats.mtimeMs // Use file modification time
                };

                players.push(player);
            } catch (e) {
                // Ignore missing files or parse errors for individual users
                // console.warn(`Could not read data for user ${username}:`, e);
            }
        }
    }
    
    return await fetchSteamAvatars(players);

  } catch (error) {
    console.error("Error reading leaderboard data:", error);
    return [];
  }
}
