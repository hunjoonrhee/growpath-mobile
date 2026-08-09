import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Mirrors joon-dashboard's src/lib/supabase.ts helpers so the two apps stay
// in the same shape even though the code isn't literally shared (separate repos).
export async function insertWithUser<T extends Record<string, unknown>>(table: string, data: T | T[]) {
  const userId = await getCurrentUserId();
  const withUserId = Array.isArray(data) ? data.map((d) => ({ ...d, user_id: userId })) : { ...data, user_id: userId };
  return supabase.from(table).insert(withUserId);
}

export async function upsertWithUser<T extends Record<string, unknown>>(
  table: string,
  data: T | T[],
  options?: { onConflict?: string }
) {
  const userId = await getCurrentUserId();
  const withUserId = Array.isArray(data) ? data.map((d) => ({ ...d, user_id: userId })) : { ...data, user_id: userId };
  return supabase.from(table).upsert(withUserId, options);
}
