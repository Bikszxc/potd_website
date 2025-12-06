import { createClient } from '@/utils/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    throw new Error('Unauthorized: Please log in.');
  }

  // Check against the environment variable
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
      console.warn("ADMIN_EMAIL environment variable is not set. Denying all admin actions.");
      throw new Error('Server Configuration Error: Admin email not set.');
  }

  if (user.email !== adminEmail) {
      console.warn(`Unauthorized admin access attempt by: ${user.email}`);
      throw new Error('Forbidden: You do not have administrative privileges.');
  }

  return user;
}
