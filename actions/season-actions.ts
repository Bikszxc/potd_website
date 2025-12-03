'use server';

import { createClient } from '@/utils/supabase/server';
import { getLeaderboardData, Player } from '@/utils/leaderboard-data';
import { revalidatePath } from 'next/cache';

export async function startNewSeason(prevState: any, formData: FormData) {
  const name = formData.get('season_name') as string;
  const endDateStr = formData.get('end_date') as string;
  
  if (!name) {
      return { message: 'Season name is required', success: false };
  }

  const supabase = await createClient();

  try {
    // 1. Fetch current active season to archive it
    const { data: activeSeason } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();

    // 1.5 Check for Legacy Archive (First run ever)
    if (!activeSeason) {
        const { count } = await supabase.from('seasons').select('*', { count: 'exact', head: true });
        if (count === 0) {
            console.log("No seasons found. Archiving Legacy/Pre-Season stats...");
            const currentPlayers = await getLeaderboardData();
            let csvContent = "SteamID,Name,Zombie Kills,Player Kills,Hours Survived,Economy Earned\n";
            currentPlayers.forEach(p => {
                csvContent += `${p.steam_id64},"${p.account_name}",${p.zombie_kills},${p.player_kills},${p.hours_survived.toFixed(2)},${p.economy_earned_this_season || 0}\n`;
            });
            
            await supabase.from('seasons').insert({
                name: "Legacy / Pre-Season",
                is_active: false,
                final_standings_csv: csvContent,
                end_date: new Date().toISOString()
            });
        }
    }

    // 2. Calculate final stats for the closing season and generate CSV
    if (activeSeason) {
        console.log(`Archiving active season: ${activeSeason.name} (${activeSeason.id})`);

        // Fetch snapshots for the active season
        const { data: snapshots } = await supabase
            .from('player_season_snapshots')
            .select('*')
            .eq('season_id', activeSeason.id);
        
        // Fetch current current JSON data
        const currentPlayers = await getLeaderboardData();

        // Generate CSV
        let csvContent = "SteamID,Name,Zombie Kills,Player Kills,Hours Survived,Economy Earned\n";
        
        currentPlayers.forEach(p => {
            const snapshot = snapshots?.find(s => s.steam_id === p.steam_id64);
            
            // Helper to calculate diff with reset protection (Same as frontend)
            const calculateDiff = (current: number, snap: number) => {
                if (current < snap) return current;
                return current - snap;
            };

            const zk = calculateDiff(p.zombie_kills, snapshot?.zombie_kills || 0);
            const pk = calculateDiff(p.player_kills, snapshot?.player_kills || 0);
            const hours = calculateDiff(p.hours_survived, snapshot?.hours_survived || 0);
            const eco = calculateDiff((p.economy_earned_this_season || 0), (snapshot?.economy_earned || 0));

            csvContent += `${p.steam_id64},"${p.account_name}",${zk},${pk},${hours.toFixed(2)},${eco}\n`;
        });

        console.log(`Generated CSV length: ${csvContent.length} characters`);

        // Close the active season
        const { error: updateError } = await supabase
            .from('seasons')
            .update({ 
                is_active: false, 
                final_standings_csv: csvContent 
            })
            .eq('id', activeSeason.id);

        if (updateError) {
            console.error("Failed to archive active season:", updateError);
            throw updateError; // Stop execution to prevent creating new season without archiving old one
        }
    } else {
        console.log("No active season found to archive.");
    }

    // 3. Fetch Raw Data for Snapshot BEFORE creating the new season
    // This prevents getLeaderboardData from auto-snapshotting for the new season immediately
    const currentPlayersForSnapshot = await getLeaderboardData({ raw: true });

    // 4. Create NEW Season
    const { data: newSeason, error: createError } = await supabase
        .from('seasons')
        .insert({
            name,
            end_date: endDateStr ? new Date(endDateStr).toISOString() : null,
            is_active: true
        })
        .select()
        .single();

    if (createError) throw createError;

    // 5. Snapshot Current State
    const snapshots = currentPlayersForSnapshot.map(p => ({
        season_id: newSeason.id,
        steam_id: p.steam_id64,
        zombie_kills: p.zombie_kills,
        player_kills: p.player_kills,
        hours_survived: p.hours_survived,
        economy_earned: p.economy_earned_this_season || 0
    }));

    if (snapshots.length > 0) {
        const { error: snapshotError } = await supabase
            .from('player_season_snapshots')
            .insert(snapshots);
        
        if (snapshotError) throw snapshotError;
    }

    revalidatePath('/leaderboards');
    revalidatePath('/admin/dashboard');
    return { message: `Season "${name}" started successfully!`, success: true };

  } catch (e: any) {
      console.error("Season Start Error:", e);
      return { message: e.message || 'Failed to start season', success: false };
  }
}

export async function endSeason(prevState: any, formData: FormData) {
    const supabase = await createClient();

    try {
        // 1. Fetch current active season
        const { data: activeSeason } = await supabase
            .from('seasons')
            .select('*')
            .eq('is_active', true)
            .single();

        if (!activeSeason) {
            return { message: 'No active season to end', success: false };
        }

        console.log(`Ending active season: ${activeSeason.name} (${activeSeason.id})`);

        // Fetch snapshots for the active season
        const { data: snapshots } = await supabase
            .from('player_season_snapshots')
            .select('*')
            .eq('season_id', activeSeason.id);
        
        // Fetch current JSON data
        const currentPlayers = await getLeaderboardData();

        // Generate CSV
        let csvContent = "SteamID,Name,Zombie Kills,Player Kills,Hours Survived,Economy Earned\n";
        
        currentPlayers.forEach(p => {
            const snapshot = snapshots?.find(s => s.steam_id === p.steam_id64);
            
            // Helper to calculate diff with reset protection
            const calculateDiff = (current: number, snap: number) => {
                if (current < snap) return current;
                return current - snap;
            };

            const zk = calculateDiff(p.zombie_kills, snapshot?.zombie_kills || 0);
            const pk = calculateDiff(p.player_kills, snapshot?.player_kills || 0);
            const hours = calculateDiff(p.hours_survived, snapshot?.hours_survived || 0);
            const eco = calculateDiff((p.economy_earned_this_season || 0), (snapshot?.economy_earned || 0));

            csvContent += `${p.steam_id64},"${p.account_name}",${zk},${pk},${hours.toFixed(2)},${eco}\n`;
        });

        // Close the active season
        const { error: updateError } = await supabase
            .from('seasons')
            .update({ 
                is_active: false, 
                end_date: new Date().toISOString(),
                final_standings_csv: csvContent 
            })
            .eq('id', activeSeason.id);

        if (updateError) {
            console.error("Failed to end season:", updateError);
            throw updateError;
        }

        revalidatePath('/leaderboards');
        revalidatePath('/admin/dashboard');
        return { message: `Season "${activeSeason.name}" ended successfully!`, success: true };

    } catch (e: any) {
        console.error("End Season Error:", e);
        return { message: e.message || 'Failed to end season', success: false };
    }
}

export async function deleteSeason(prevState: any, formData: FormData) {
    const id = formData.get('season_id') as string;
    if (!id) return { message: 'Season ID required', success: false };

    const supabase = await createClient();
    
    const { error } = await supabase.from('seasons').delete().eq('id', id);

    if (error) {
        return { message: 'Failed to delete season', success: false };
    }

    revalidatePath('/leaderboards');
    revalidatePath('/admin/dashboard');
    return { message: 'Season deleted', success: true };
}
