'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deletePost(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    return { message: 'Failed to delete post', error: error.message, success: false };
  }

  revalidatePath('/');
  revalidatePath('/news');
  return { message: 'Post deleted successfully!', success: true };
}
