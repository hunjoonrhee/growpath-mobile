import { supabase } from '@/lib/supabase';

export type ProfileInfo = {
  name: string;
  bio: string;
};

// 'name' matches joon-dashboard's settings page key (not 'display_name' -
// see supabase/migrations/20260809000001_avatars_storage_bucket.sql's
// comment, which named the wrong key before the web page was checked).
// 'bio' is new - no web equivalent yet, feeds roadmap-generation context later.
const NAME_KEY = 'name';
const BIO_KEY = 'bio';

export type Certification = {
  id: string;
  name: string;
  issuer: string | null;
  tags: string[];
};

type CertificationRow = {
  id: string;
  name: string;
  issuer: string | null;
  tags: string[] | null;
};

function toCertification(row: CertificationRow): Certification {
  return { id: row.id, name: row.name, issuer: row.issuer, tags: row.tags ?? [] };
}

export async function fetchProfileInfo(userId: string): Promise<ProfileInfo> {
  const { data, error } = await supabase.from('settings').select('key, value').eq('user_id', userId).in('key', [NAME_KEY, BIO_KEY]);
  if (error) throw error;
  const map = new Map((data ?? []).map((row) => [row.key as string, row.value as string]));
  return { name: map.get(NAME_KEY) ?? '', bio: map.get(BIO_KEY) ?? '' };
}

export async function saveProfileInfo(userId: string, info: ProfileInfo): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    [
      { key: NAME_KEY, value: info.name, user_id: userId },
      { key: BIO_KEY, value: info.bio, user_id: userId },
    ],
    { onConflict: 'key,user_id' }
  );
  if (error) throw error;
}

export async function fetchCertifications(userId: string): Promise<Certification[]> {
  const { data, error } = await supabase
    .from('certifications')
    .select('id, name, issuer, tags')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toCertification(row as CertificationRow));
}

export type NewCertificationInput = {
  name: string;
  issuer: string | null;
  tags: string[];
};

export async function addCertification(userId: string, input: NewCertificationInput): Promise<Certification> {
  const { data, error } = await supabase
    .from('certifications')
    .insert({ name: input.name, issuer: input.issuer, tags: input.tags, user_id: userId })
    .select('id, name, issuer, tags')
    .single();
  if (error) throw error;
  return toCertification(data as CertificationRow);
}

export async function deleteCertification(certificationId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('certifications').delete().eq('id', certificationId).eq('user_id', userId);
  if (error) throw error;
}
