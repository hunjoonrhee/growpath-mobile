import { supabase } from '@/lib/supabase';
import { flattenTagsColumn } from '@/lib/tags';

export type RoadmapStageSkill = {
  name: string;
  tags: string[];
};

export type RoadmapStage = {
  level: number;
  title: string;
  description: string;
  skills: RoadmapStageSkill[];
};

export type Roadmap = {
  id: string;
  goal: string;
  careerLevel: string;
  stages: RoadmapStage[];
  /** e.g. 'dev' | 'language' | 'art' | 'other' - classified by joon-dashboard's /api/roadmap/generate. Null for roadmaps generated before this field existed. */
  domain: string | null;
  /** Language this goal requires developing (e.g. "German"), independent of domain - a non-language goal can still need one (e.g. "German-speaking lead architect"). Null when no language component was detected. */
  targetLanguage: string | null;
};

export type RoadmapSummary = {
  id: string;
  goal: string;
  careerLevel: string;
};

const ADOPTED_ROADMAP_ID_KEY = 'adopted_roadmap_id';

type AiRoadmapRow = {
  id: string;
  goal: string;
  career_level: string;
  stages: RoadmapStage[];
  domain: string | null;
  target_language: string | null;
};

function toRoadmap(row: AiRoadmapRow): Roadmap {
  return {
    id: row.id,
    goal: row.goal,
    careerLevel: row.career_level,
    stages: row.stages,
    domain: row.domain,
    targetLanguage: row.target_language,
  };
}

/** Reads the user's active roadmap pointer from the `settings` EAV table (see supabase/README.md). */
export async function fetchAdoptedRoadmapId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('user_id', userId)
    .eq('key', ADOPTED_ROADMAP_ID_KEY)
    .maybeSingle();
  if (error) throw error;
  return (data?.value as string | undefined) ?? null;
}

export async function fetchRoadmap(roadmapId: string): Promise<Roadmap | null> {
  const { data, error } = await supabase
    .from('ai_roadmaps')
    .select('id, goal, career_level, stages, domain, target_language')
    .eq('id', roadmapId)
    .maybeSingle();
  if (error) throw error;
  return data ? toRoadmap(data as AiRoadmapRow) : null;
}

/**
 * Tags from every *user-managed* goal tracked under a roadmap - one of gap
 * analysis's two "studied" evidence sources (the other is session tags).
 *
 * Excludes is_auto_generated goals on purpose: joon-dashboard's roadmap
 * adoption flow (RoadmapTab.tsx handleAdopt) creates one goal per stage and
 * copies that entire stage's skill tags onto it verbatim, which would make
 * every skill read as "studied" the instant a roadmap is adopted - before
 * the user has actually done anything. Only goals the user (or the AI
 * recommendation flow acting on their behalf) explicitly created should
 * count as real evidence.
 */
export async function fetchGoalTags(roadmapId: string): Promise<string[]> {
  // .neq('is_auto_generated', true) would silently drop rows where the
  // column is NULL too (SQL's `<> true` is NULL, not true, for a NULL
  // operand) - .or() here explicitly keeps null/false and excludes only
  // an explicit true.
  const { data, error } = await supabase
    .from('goals')
    .select('tags')
    .eq('roadmap_id', roadmapId)
    .or('is_auto_generated.is.null,is_auto_generated.eq.false');
  if (error) throw error;
  return flattenTagsColumn((data ?? []) as { tags: string[] | null }[]);
}

/** The roadmap stage the AI currently recommends focusing on, if any goal has been marked as such. */
export async function fetchFocusStageLevel(roadmapId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('stage_level')
    .eq('roadmap_id', roadmapId)
    .eq('is_focus', true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.stage_level as number | undefined) ?? null;
}

export async function fetchUserRoadmaps(userId: string): Promise<RoadmapSummary[]> {
  const { data, error } = await supabase
    .from('ai_roadmaps')
    .select('id, goal, career_level')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    goal: row.goal as string,
    careerLevel: row.career_level as string,
  }));
}

/**
 * Points `settings.adopted_roadmap_id` at the new roadmap and mirrors it onto
 * `ai_roadmaps.adopted`, atomically (via the `set_adopted_roadmap` SQL
 * function - see supabase/migrations/20260810000001_set_adopted_roadmap_function.sql).
 * Doing this as separate sequential client-side writes risked a partial
 * failure leaving the two representations disagreeing. The function derives
 * the user from auth.uid() itself, so there's no user id to pass here.
 */
export async function switchActiveRoadmap(roadmapId: string): Promise<void> {
  const { error } = await supabase.rpc('set_adopted_roadmap', { p_roadmap_id: roadmapId });
  if (error) throw error;
}

export type UpdateRoadmapInput = { goal: string; careerLevel: string };

/** Edits the goal text/career level only - doesn't regenerate stages, domain, or targetLanguage. */
export async function updateRoadmap(roadmapId: string, input: UpdateRoadmapInput): Promise<void> {
  const { error } = await supabase
    .from('ai_roadmaps')
    .update({ goal: input.goal, career_level: input.careerLevel })
    .eq('id', roadmapId);
  if (error) throw error;
}

/**
 * Deletes a roadmap and detaches (rather than cascade-deletes) records that
 * reference it - ai_roadmaps has no FK back to it from any migration in
 * this repo (it's a joon-dashboard-owned table), so a plain delete would
 * leave sessions/roleplay_sessions pointing at a nonexistent roadmap_id
 * instead of falling into the already-supported "goal-less" null state.
 * `goals` rows are hard-deleted instead - they're roadmap-scoped (one set
 * per stage, created on adoption) and have no meaning outside it, unlike a
 * session or roleplay transcript, which is a personal record regardless of
 * which roadmap it was originally logged under.
 *
 * If this was the active roadmap, also clears the now-dangling
 * settings.adopted_roadmap_id pointer - useActiveRoadmap treats a pointer
 * to a missing roadmap as an error state, so leaving it set would replace
 * "no active goal" (which NoActiveRoadmapState handles gracefully) with a
 * load error immediately after the user's own delete action.
 */
export async function deleteRoadmap(roadmapId: string, userId: string): Promise<void> {
  await supabase.from('sessions').update({ roadmap_id: null }).eq('roadmap_id', roadmapId).eq('user_id', userId);
  await supabase.from('roleplay_sessions').update({ roadmap_id: null }).eq('roadmap_id', roadmapId).eq('user_id', userId);
  await supabase.from('goals').delete().eq('roadmap_id', roadmapId);

  const { error } = await supabase.from('ai_roadmaps').delete().eq('id', roadmapId).eq('user_id', userId);
  if (error) throw error;

  const adoptedId = await fetchAdoptedRoadmapId(userId);
  if (adoptedId === roadmapId) {
    await supabase.from('settings').delete().eq('user_id', userId).eq('key', ADOPTED_ROADMAP_ID_KEY);
  }
}
