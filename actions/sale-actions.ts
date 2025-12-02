'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function applySale(prevState: any, formData: FormData) {
  const scope = formData.get('scope') as string; // 'global' | 'specific'
  const rank_id = formData.get('rank_id') as string;
  const type = formData.get('type') as string; // 'percent' | 'fixed'
  const value = parseFloat(formData.get('value') as string);
  
  // Global specific fields
  const start_type = formData.get('start_type') as string; // 'now' | 'scheduled'
  const sale_start_date_input = formData.get('sale_start_date') as string;
  const sale_end_date = formData.get('sale_end_date') as string;
  const sale_header = formData.get('sale_header') as string;
  const sale_color = formData.get('sale_color') as string;

  if (isNaN(value) || value < 0) {
      return { message: 'Invalid discount value', success: false };
  }

  const supabase = await createClient();

  try {
    // 1. Update Ranks Prices (DB holds the "Configured" sale price)
    let query = supabase.from('ranks').select('*');
    if (scope === 'specific' && rank_id) {
        query = query.eq('id', rank_id);
    }

    const { data: ranks, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    if (!ranks || ranks.length === 0) return { message: 'No ranks found', success: false };

    const updates = ranks.map(rank => {
        let newSalePrice = 0;
        if (type === 'percent') {
            newSalePrice = rank.price * (1 - value / 100);
        } else {
            newSalePrice = rank.price - value;
        }
        newSalePrice = Math.max(0, Math.round(newSalePrice * 100) / 100);

        // Determine dates
        let start = null;
        if (start_type === 'now') {
            start = new Date().toISOString();
        } else if (sale_start_date_input) {
            start = new Date(sale_start_date_input).toISOString();
        } else {
            start = new Date().toISOString();
        }
        
        const end = sale_end_date ? new Date(sale_end_date).toISOString() : null;

        return { 
            id: rank.id, 
            sale_price: newSalePrice,
            sale_start_date: start,
            sale_end_date: end
        };
    });

    for (const update of updates) {
        await supabase.from('ranks').update({ 
            sale_price: update.sale_price,
            sale_start_date: update.sale_start_date,
            sale_end_date: update.sale_end_date
        }).eq('id', update.id);
    }

    // 2. Update Sale Config (If Global)
    if (scope === 'global') {
        let startDateToSave = null;
        if (start_type === 'now') {
            startDateToSave = new Date().toISOString();
        } else if (sale_start_date_input) {
            startDateToSave = new Date(sale_start_date_input).toISOString();
        } else {
            // Fallback if 'scheduled' but no date provided, usually default to now or error?
            // We'll default to now for safety.
            startDateToSave = new Date().toISOString();
        }

        await supabase.from('sale_config').update({
            active: true,
            sale_start_date: startDateToSave,
            sale_end_date: sale_end_date ? new Date(sale_end_date).toISOString() : null,
            sale_header: sale_header || 'Global Operations Sale',
            sale_color: sale_color || '#DC2626',
            discount_type: type,
            discount_value: value
        }).eq('id', 1);
    }

    revalidatePath('/donate');
    revalidatePath('/admin/dashboard');
    return { message: 'Discount configuration saved!', success: true };

  } catch (e: any) {
      console.error('Sale Error:', e);
      return { message: e.message || 'Failed to apply sale', success: false };
  }
}

export async function clearSale(prevState: any, formData: FormData) {
    const scope = formData.get('scope') as string; // 'global' | 'specific'
    const rank_id = formData.get('rank_id') as string;

    const supabase = await createClient();

    try {
        // Reset prices and dates
        let query = supabase.from('ranks').update({ 
            sale_price: null,
            sale_start_date: null,
            sale_end_date: null
        });
        
        if (scope === 'specific' && rank_id) {
            query = query.eq('id', rank_id);
        } else {
            query = query.neq('id', 0);
        }

        const { error } = await query;
        if (error) throw error;

        // If global clear, reset config
        if (scope === 'global') {
            await supabase.from('sale_config').update({
                active: false,
                sale_start_date: null,
                sale_end_date: null,
                discount_type: null,
                discount_value: null
            }).eq('id', 1);
        }

        revalidatePath('/donate');
        revalidatePath('/admin/dashboard');
        return { message: 'Sale cleared!', success: true };
    } catch (e: any) {
        return { message: e.message || 'Failed to clear sale', success: false };
    }
}
