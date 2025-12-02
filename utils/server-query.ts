import { GameDig } from 'gamedig';

export type ServerStatus = {
  online: boolean;
  players: number;
  maxPlayers: number;
  name: string;
  ping: number;
};

// Cache the result to avoid spamming the server
let cachedStatus: ServerStatus | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function getServerStatus(): Promise<ServerStatus> {
  const now = Date.now();
  
  // Return cached data if valid
  if (cachedStatus && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedStatus;
  }

  try {
    const state = await GameDig.query({
      type: 'projectzomboid',
      host: '66.118.234.45',
      port: 16261, // Game Port
    });

    cachedStatus = {
      online: true,
      players: state.players.length, // Or state.raw.numplayers
      maxPlayers: state.maxplayers,
      name: state.name,
      ping: state.ping
    };
    lastFetchTime = now;
    
    return cachedStatus;
  } catch (error) {
    console.error('Failed to query server:', error);
    // If we have stale cache, maybe return it? For now, just return offline.
    return {
      online: false,
      players: 0,
      maxPlayers: 64, // Default fallback
      name: 'Server Offline',
      ping: 0
    };
  }
}
