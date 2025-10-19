import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmyiivszfcjklzpqkhvj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteWlpdnN6ZmNqa2x6cHFraHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzAxMjQsImV4cCI6MjA3NTU0NjEyNH0.VPmq266Of1Ch0WsBP1wnfkOx5LEsggLifWifjbHkp64';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions
export const authHelpers = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Get the current user's profile with role
   */
  getCurrentProfile: async () => {
    const user = await authHelpers.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check if current user is admin
   */
  isAdmin: async () => {
    try {
      const profile = await authHelpers.getCurrentProfile();
      return profile?.role === 'admin';
    } catch {
      return false;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

export default supabase;
