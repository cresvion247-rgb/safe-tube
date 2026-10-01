/** Public build-time config. Server secrets stay in Vercel env, never here. */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
