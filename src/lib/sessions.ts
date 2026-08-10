import { toDateString } from '@/lib/date';
import { fetchAdoptedRoadmapId } from '@/lib/roadmap';
import { insertWithUser, supabase } from '@/lib/supabase';

export type SessionRecord = {
  id: string;
  title: string;
  durationMinutes: number | null;
  date: string;
  til: string | null;
  tags: string[];
  createdAt: string;
};

export type CreateSessionInput = {
  title: string;
  durationMinutes: number | null;
  til: string;
  tags: string[];
};

type SessionRow = {
  id: string;
  title: string;
  duration_minutes: number | null;
  date: string;
  til: string | null;
  tags: string[] | null;
  created_at: string;
};

function toSessionRecord(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    date: row.date,
    til: row.til,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}

/** Monday of the week containing `date` (ISO week, not locale-dependent). */
function startOfIsoWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0=Sun ... 6=Sat
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysSinceMonday);
  return monday;
}

export async function fetchRecentSessions(userId: string, limit = 20): Promise<SessionRecord[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, title, duration_minutes, date, til, tags, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => toSessionRecord(row as SessionRow));
}

/** Ties the new session to the user's active roadmap (if any) for gap-analysis/stats. */
export async function createSession(userId: string, input: CreateSessionInput): Promise<void> {
  const roadmapId = await fetchAdoptedRoadmapId(userId);
  const { error } = await insertWithUser('sessions', {
    title: input.title,
    duration_minutes: input.durationMinutes,
    til: input.til || null,
    tags: input.tags,
    date: toDateString(new Date()),
    roadmap_id: roadmapId,
  });
  if (error) throw error;
}

/** Distinct session dates, most recent first - used to compute the study streak. */
export async function fetchStudySessionDates(userId: string, limit = 200): Promise<string[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((row) => row.date as string)));
}

export async function fetchWeeklySessionCount(userId: string): Promise<number> {
  const weekStart = toDateString(startOfIsoWeek(new Date()));
  const { count, error } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', weekStart);
  if (error) throw error;
  return count ?? 0;
}
