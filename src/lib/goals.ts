import { supabase } from '@/lib/supabase';
import type { RoadmapStage } from '@/lib/roadmap';

function flattenStageTags(stage: RoadmapStage): string[] {
  return stage.skills.flatMap((skill) => skill.tags);
}

function stageToGoalRow(stage: RoadmapStage, roadmapId: string, userId: string, isFocus: boolean) {
  return {
    roadmap_id: roadmapId,
    user_id: userId,
    name: stage.title,
    description: stage.description,
    status: 'planned',
    priority: 'medium',
    tags: flattenStageTags(stage),
    stage_level: stage.level,
    is_focus: isFocus,
    is_auto_generated: true,
  };
}

/**
 * Idempotent - only creates the per-stage goal rows joon-dashboard's web
 * adopt flow normally creates (RoadmapTab.tsx handleAdopt) if none exist yet
 * for this roadmap. Every mobile-created/adopted roadmap goes through
 * switchActiveRoadmap, not that web flow, so without this,
 * fetchFocusStageLevel has no row to read and stays null forever - not
 * "no progress yet", genuinely nothing to advance from. Leaves existing
 * goals alone so switching back to an already-synced roadmap never
 * disturbs real progress.
 */
export async function ensureGoalsForRoadmap(roadmapId: string, userId: string, stages: RoadmapStage[]): Promise<void> {
  const { data: existing, error: existingError } = await supabase.from('goals').select('id').eq('roadmap_id', roadmapId).limit(1);
  if (existingError) throw existingError;
  if (existing && existing.length > 0) return;

  const rows = stages.map((stage) => stageToGoalRow(stage, roadmapId, userId, stage.level === 1));
  const { error } = await supabase.from('goals').insert(rows);
  if (error) throw error;
}

/**
 * Force resync - used after regenerating a roadmap's stages in place (see
 * useRegenerateRoadmap). The old auto-generated goal rows describe stages
 * that no longer exist, so they're replaced outright rather than merged;
 * focus resets to stage 1 since the new content invalidates whatever stage
 * the user was previously on.
 */
export async function resyncGoalsForRoadmap(roadmapId: string, userId: string, stages: RoadmapStage[]): Promise<void> {
  const { error: deleteError } = await supabase.from('goals').delete().eq('roadmap_id', roadmapId).eq('is_auto_generated', true);
  if (deleteError) throw deleteError;

  const rows = stages.map((stage) => stageToGoalRow(stage, roadmapId, userId, stage.level === 1));
  const { error } = await supabase.from('goals').insert(rows);
  if (error) throw error;
}
