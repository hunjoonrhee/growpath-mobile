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

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    date: todayDateString(),
    roadmap_id: roadmapId,
  });
  if (error) throw error;
}
