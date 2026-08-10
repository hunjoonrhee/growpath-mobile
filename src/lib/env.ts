function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}. Check your .env file (see .env.example).`);
  }
  return value;
}

export const env = {
  supabaseUrl: requireEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  // Not required yet - joon-dashboard (the web app that hosts this API) isn't
  // deployed. Goal setup falls back to a "not available yet" state when unset.
  roadmapApiUrl: process.env.EXPO_PUBLIC_ROADMAP_API_URL,
} as const;
