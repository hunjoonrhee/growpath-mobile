function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}. Check your .env file (see .env.example).`);
  }
  return value;
}

// Strips a trailing slash so callers can safely do `${roadmapApiUrl}/api/...`
// without risking a double slash (e.g. from a value copied out of a browser
// address bar) - most hosts 404 on that instead of normalizing it.
function stripTrailingSlash(value: string | undefined): string | undefined {
  return value?.replace(/\/+$/, '');
}

export const env = {
  supabaseUrl: requireEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  // Not required yet - falls back to a "not available yet" state when unset
  // (goal setup) or blocks the feature (roleplay).
  roadmapApiUrl: stripTrailingSlash(process.env.EXPO_PUBLIC_ROADMAP_API_URL),
} as const;

// Shared by every joon-dashboard API call (roadmap generation, tutor chat) -
// a generous ceiling, since a call can involve a retried Gemini request
// server-side: long enough to not false-positive on a legitimately slow
// response, short enough that a dead connection doesn't hang forever.
export const API_CALL_TIMEOUT_MS = 60_000;
