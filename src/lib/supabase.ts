import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type PostgrestSingleResponse } from '@supabase/supabase-js';

import { env } from '@/lib/env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// getSession() reads the locally persisted session (no network round trip).
// Good enough here: RLS re-validates the JWT server-side on every request
// regardless of what user_id the client attaches, so a fast local read is
// safe and matters more on mobile than it did in joon-dashboard's web
// version, which used the network-revalidating getUser().
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated - no Supabase session found.');
  }
  return userId;
}

function attachUserId<T extends Record<string, unknown>>(data: T | T[], userId: string): T[] | T {
  return Array.isArray(data) ? data.map((d) => ({ ...d, user_id: userId })) : { ...data, user_id: userId };
}

// Mirrors joon-dashboard's src/lib/supabase.ts helpers so the two apps stay
// in the same shape even though the code isn't literally shared (separate repos).
export async function insertWithUser<T extends Record<string, unknown>>(
  table: string,
  data: T | T[]
): Promise<PostgrestSingleResponse<null>> {
  const userId = await requireCurrentUserId();
  // `table` is an untyped string (no Database schema passed to createClient),
  // so supabase-js can't check the payload shape against real columns here
  // regardless - the cast just avoids fighting its single-vs-array overloads.
  return supabase.from(table).insert(attachUserId(data, userId) as never);
}

export async function upsertWithUser<T extends Record<string, unknown>>(
  table: string,
  data: T | T[],
  options?: { onConflict?: string }
): Promise<PostgrestSingleResponse<null>> {
  const userId = await requireCurrentUserId();
  return supabase.from(table).upsert(attachUserId(data, userId) as never, options);
}
