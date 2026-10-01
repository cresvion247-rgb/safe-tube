import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/lib/env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'safetube-auth',
  },
});

export { isSupabaseConfigured };
