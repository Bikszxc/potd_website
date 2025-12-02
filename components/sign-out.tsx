'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/admin/login');
  };

  return (
    <button 
      onClick={handleSignOut}
      className="text-xs uppercase tracking-widest text-red-500 hover:text-red-400 font-bold"
    >
      [ Sign Out ]
    </button>
  );
}
