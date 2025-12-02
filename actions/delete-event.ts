'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteEvent(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return { message: 'Failed to delete operation', error: error.message, success: false };
  }

  revalidatePath('/');
  revalidatePath('/news');
  return { message: 'Operation deleted successfully!', success: true };
}
