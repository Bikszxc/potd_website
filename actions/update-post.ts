'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updatePost(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const image_url = formData.get('image_url') as string;
  
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      description: description || null,
      content,
      category,
      image_url: image_url || null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating post:', error);
    return { message: 'Failed to update post', error: error.message, success: false };
  }

  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath(`/news/${id}`);
  return { message: 'Post updated successfully!', success: true };
}
