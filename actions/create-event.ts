'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEvent(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const content = formData.get('content') as string;
  const type = formData.get('type') as string;
  const date = formData.get('date') as string; // HTML datetime-local input
  const image_url = formData.get('image_url') as string;
  
  const supabase = await createClient();

  const { error } = await supabase.from('events').insert({
    title,
    description: description || null,
    content,
    type,
    event_date: new Date(date).toISOString(),
    image_url: image_url || null,
  });

  if (error) {
    console.error('Error creating event:', error);
    return { message: 'Failed to schedule operation', error: error.message, success: false };
  }

  revalidatePath('/');
  revalidatePath('/news');
  return { message: 'Operation scheduled successfully!', success: true };
}
