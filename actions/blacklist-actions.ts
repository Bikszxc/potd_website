'use server';

import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/supabase/admin-check';
import { revalidatePath } from 'next/cache';

type State = { message: string; success: boolean } | null;

export async function addToBlacklist(prevState: State, formData: FormData): Promise<State> {
  try { await requireAdmin(); } catch (e: any) { return { message: e.message, success: false }; }
  
  const username = formData.get('username') as string;
  const reason = formData.get('reason') as string;

  if (!username) {
    return { message: 'Username is required', success: false };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('player_blacklist')
    .insert({ username, reason });

  if (error) {
    if (error.code === '23505') { // Unique violation
        return { message: 'User is already blacklisted', success: false };
    }
    console.error('Blacklist add error:', error);
    return { message: 'Failed to blacklist user', success: false };
  }

  revalidatePath('/leaderboards');
  revalidatePath('/search');
  revalidatePath('/admin/dashboard');
  return { message: `User "${username}" blacklisted`, success: true };
}

export async function removeFromBlacklist(prevState: State, formData: FormData): Promise<State> {
    try { await requireAdmin(); } catch (e: any) { return { message: e.message, success: false }; }
    
    const id = formData.get('id') as string;
    
    if (!id) return { message: 'ID required', success: false };

    const supabase = await createClient();
    const { error } = await supabase.from('player_blacklist').delete().eq('id', id);

    if (error) {
        console.error('Blacklist remove error:', error);
        return { message: 'Failed to remove from blacklist', success: false };
    }

    revalidatePath('/leaderboards');
    revalidatePath('/search');
    revalidatePath('/admin/dashboard');
    return { message: 'User removed from blacklist', success: true };
}
