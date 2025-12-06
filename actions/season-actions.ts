'use server';

import { createClient } from '@/utils/supabase/server';
import { getLeaderboardData, Player } from '@/utils/leaderboard-data';
import { requireAdmin } from '@/utils/supabase/admin-check';
import { revalidatePath } from 'next/cache';

export async function startNewSeason(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (e: any) {
     return { message: e.message, success: false };
  }

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
            // Find snapshot: Try username first, then fallback to legacy steam_id (only if snapshot has no username)
            const snapshot = snapshots?.find(s => 
                s.username === p.account_name || 
                (!s.username && s.steam_id === p.steam_id64)
            );
            
            // Helper to calculate diff with reset protection (Same as frontend)
            // ROLLBACK DETECTION:
            let isRollback = false;
            const snapHours = snapshot?.hours_survived || 0;
            if (p.hours_survived < snapHours && snapHours > 5) {
                const ratio = p.hours_survived / snapHours;
                if (ratio > 0.90) isRollback = true;
            }

            const calculateDiff = (current: number, snap: number) => {
                if (current >= snap) return current - snap;
                if (isRollback) return 0;
                // Fallback heuristic
                if (snap > 100 && current > (snap * 0.95)) return 0;
                return current;
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

    // 3. Create NEW Season
    // We do NOT manually snapshot here anymore. We rely on getLeaderboardData() 
    // to automatically snapshot players on the first load of the new season.
    // This prevents race conditions and double-insertions.
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

    revalidatePath('/leaderboards');
    revalidatePath('/admin/dashboard');
    return { message: `Season "${name}" started successfully!`, success: true };

  } catch (e: any) {
      console.error("Season Start Error:", e);
      return { message: e.message || 'Failed to start season', success: false };
  }
}

export async function endSeason(prevState: any, formData: FormData) {
    try {
      await requireAdmin();
    } catch (e: any) {
      return { message: e.message, success: false };
    }

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
            // Find snapshot: Try username first, then fallback to legacy steam_id
            const snapshot = snapshots?.find(s => 
                s.username === p.account_name || 
                (!s.username && s.steam_id === p.steam_id64)
            );
            
            // Helper to calculate diff with reset protection
            // ROLLBACK DETECTION:
            let isRollback = false;
            const snapHours = snapshot?.hours_survived || 0;
            if (p.hours_survived < snapHours && snapHours > 5) {
                const ratio = p.hours_survived / snapHours;
                if (ratio > 0.90) isRollback = true;
            }

            const calculateDiff = (current: number, snap: number) => {
                if (current >= snap) return current - snap;
                if (isRollback) return 0;
                // Fallback heuristic
                if (snap > 100 && current > (snap * 0.95)) return 0;
                return current;
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
    try {
      await requireAdmin();
    } catch (e: any) {
      return { message: e.message, success: false };
    }

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
