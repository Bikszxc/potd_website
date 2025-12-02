'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateEvent(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const content = formData.get('content') as string;
  const type = formData.get('type') as string;
  const date = formData.get('date') as string;
  const image_url = formData.get('image_url') as string;
  
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({
      title,
      description: description || null,
      content,
      type,
      event_date: new Date(date).toISOString(),
      image_url: image_url || null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating event:', error);
    return { message: 'Failed to update operation', error: error.message, success: false };
  }

  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath(`/news/event/${id}`);
  return { message: 'Operation updated successfully!', success: true };
}
