import { createClient } from '@/utils/supabase/server';

export async function getSaleStatus(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('sale_config')
      .select('active')
      .eq('id', 1)
      .single();
      
    return data?.active || false;
  } catch (error) {
    console.error('Error fetching sale status:', error);
    return false;
  }
}
