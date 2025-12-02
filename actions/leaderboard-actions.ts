'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleLeaderboard(id: string, enabled: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('leaderboard_config')
    .update({ enabled })
    .eq('id', id);

  if (error) {
    console.error('Error toggling leaderboard:', error);
    return { message: 'Failed to update leaderboard status', success: false };
  }

  revalidatePath('/leaderboards');
  revalidatePath('/admin/dashboard');
  return { message: `Leaderboard ${enabled ? 'enabled' : 'disabled'} successfully!`, success: true };
}

export async function updateFactionScoring(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const zombie_kill_multiplier = parseFloat(formData.get('zombie_kill_multiplier') as string);
  const player_kill_multiplier = parseFloat(formData.get('player_kill_multiplier') as string);
  const economy_multiplier = parseFloat(formData.get('economy_multiplier') as string);
  const survival_multiplier = parseFloat(formData.get('survival_multiplier') as string);

  if (
      isNaN(zombie_kill_multiplier) || 
      isNaN(player_kill_multiplier) || 
      isNaN(economy_multiplier) || 
      isNaN(survival_multiplier)
  ) {
      return { message: 'Invalid scoring values', success: false };
  }

  const { error } = await supabase
    .from('faction_score_config')
    .update({
        zombie_kill_multiplier,
        player_kill_multiplier,
        economy_multiplier,
        survival_multiplier,
        updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    return { message: 'Failed to update scoring config', success: false };
  }

  revalidatePath('/leaderboards');
  revalidatePath('/admin/dashboard');
  return { message: 'Faction scoring updated successfully!', success: true };
}
