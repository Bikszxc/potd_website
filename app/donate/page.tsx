import DonateSection from '@/components/donate-section';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 60;

export default async function DonatePage() {
  const supabase = await createClient();
  let { data: ranks } = await supabase.from('ranks').select('*');
  let { data: saleConfig } = await supabase.from('sale_config').select('*').single();

  // Check for start/expiration
  if (saleConfig?.active) {
    const now = new Date();
    const startDate = saleConfig.sale_start_date ? new Date(saleConfig.sale_start_date) : null;
    const endDate = saleConfig.sale_end_date ? new Date(saleConfig.sale_end_date) : null;
    
    const notStarted = startDate && now < startDate;
    const expired = endDate && now > endDate;

    if (notStarted || expired) {
      // Mask the data for display
      saleConfig = { ...saleConfig, active: false };
      if (ranks) {
        ranks = ranks.map(r => ({ ...r, sale_price: null }));
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#191A30] text-white pt-16">
      <Header />
      {/* Reuse the component but ensure it renders correctly on a standalone page */}
      <DonateSection ranks={ranks || []} saleConfig={saleConfig} />
      
      <Footer />
    </main>
  );
}
