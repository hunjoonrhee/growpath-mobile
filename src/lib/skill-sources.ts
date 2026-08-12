import { supabase } from '@/lib/supabase';
import { flattenTagsColumn } from '@/lib/tags';

// certifications/project_skills are joon-dashboard-owned tables (entered via
// its Settings and Projects screens, which this app doesn't replicate) -
// gap analysis only ever reads them, so a user who's filled these in on the
// web gets the same accurate score on mobile with no new input UI needed.

/** Tags from every certification the user has logged - gap analysis's highest-trust evidence source. */
export async function fetchCertTags(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('certifications').select('tags').eq('user_id', userId);
  if (error) throw error;
  return flattenTagsColumn((data ?? []) as { tags: string[] | null }[]);
}

/** Tags from every project's logged skills - gap analysis's other highest-trust evidence source. */
export async function fetchPracticalTags(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('project_skills').select('tags').eq('user_id', userId);
  if (error) throw error;
  return flattenTagsColumn((data ?? []) as { tags: string[] | null }[]);
}
