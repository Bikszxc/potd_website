'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const image_url = formData.get('image_url') as string;
  
  const supabase = await createClient();

  const { error } = await supabase.from('posts').insert({
    title,
    description: description || null,
    content,
    category,
    image_url: image_url || null,
  });

  if (error) {
    console.error('Error creating post:', error);
    return { message: 'Failed to create post', error: error.message, success: false };
  }

  revalidatePath('/');
  revalidatePath('/news');
  return { message: 'Post broadcasted successfully!', success: true };
}
