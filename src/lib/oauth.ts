import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

export type OAuthProvider = 'google' | 'github';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: 'growpath', path: 'auth-callback' });

/** Merges the query and hash params of a redirect URL (Supabase's implicit-flow tokens land in the hash). */
function extractCallbackParams(url: string): Record<string, string> {
  const parsed = new URL(url, 'https://phony.example');
  const params: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  if (parsed.hash) {
    new URLSearchParams(parsed.hash.replace(/^#/, '')).forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
}

async function createSessionFromUrl(url: string): Promise<boolean> {
  const params = extractCallbackParams(url);
  if (params.error) throw new Error(params.error_description ?? params.error);

  const { access_token: accessToken, refresh_token: refreshToken } = params;
  if (!accessToken || !refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
  return true;
}

/** Opens the provider's hosted login page and resolves once a Supabase session is established. */
export async function signInWithOAuth(provider: OAuthProvider): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase did not return an OAuth URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  return createSessionFromUrl(result.url);
}
