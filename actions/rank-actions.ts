'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createRank(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const billing_cycle = formData.get('billing_cycle') as string;
  const color = formData.get('color') as string;
  const icon_name = formData.get('icon_name') as string;
  const weight = parseInt(formData.get('weight') as string);
  const parent_rank_id = formData.get('parent_rank_id') ? parseInt(formData.get('parent_rank_id') as string) : null;
  
  // Perks are sent as multiple inputs with same name 'perks' or a JSON string? 
  // FormData 'getAll' handles multiple inputs.
  const perks = formData.getAll('perks') as string[];
  // Filter out empty perks
  const cleanPerks = perks.filter(p => p.trim() !== '');

  const sale_price_input = formData.get('sale_price') as string;
  const sale_price = sale_price_input ? parseFloat(sale_price_input) : null;

  const supabase = await createClient();

  const { error } = await supabase.from('ranks').insert({
    name,
    price,
    billing_cycle,
    color,
    icon_name,
    weight,
    parent_rank_id,
    perks: cleanPerks,
    sale_price
  });

  if (error) {
    console.error('Error creating rank:', error);
    return { message: 'Failed to create rank', error: error.message, success: false };
  }

  revalidatePath('/donate');
  revalidatePath('/admin/dashboard');
  return { message: 'Rank created successfully!', success: true };
}

export async function updateRank(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const billing_cycle = formData.get('billing_cycle') as string;
  const color = formData.get('color') as string;
  const icon_name = formData.get('icon_name') as string;
  const weight = parseInt(formData.get('weight') as string);
  const parent_rank_id = formData.get('parent_rank_id') ? parseInt(formData.get('parent_rank_id') as string) : null;
  
  const perks = formData.getAll('perks') as string[];
  const cleanPerks = perks.filter(p => p.trim() !== '');

  const sale_price_input = formData.get('sale_price') as string;
  const sale_price = sale_price_input ? parseFloat(sale_price_input) : null;

  const supabase = await createClient();

  const { error } = await supabase.from('ranks').update({
    name,
    price,
    billing_cycle,
    color,
    icon_name,
    weight,
    parent_rank_id,
    perks: cleanPerks,
    sale_price
  }).eq('id', id);

  if (error) {
    console.error('Error updating rank:', error);
    return { message: 'Failed to update rank', error: error.message, success: false };
  }

  revalidatePath('/donate');
  revalidatePath('/admin/dashboard');
  return { message: 'Rank updated successfully!', success: true };
}

export async function deleteRank(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from('ranks').delete().eq('id', id);
  
  if (error) {
    return { message: 'Failed to delete rank', success: false };
  }
  
  revalidatePath('/donate');
  revalidatePath('/admin/dashboard');
  return { message: 'Rank deleted successfully', success: true };
}
