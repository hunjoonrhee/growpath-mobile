import type { RoadmapStage } from '@/lib/roadmap';

export type TodayRecommendation = {
  title: string;
  stageTitle: string;
};

/**
 * Picks the current stage's first skill as "today's pick" - no AI coach
 * endpoint exists yet (same blocker as roadmap generation), so this is a
 * simple, honest rule over real roadmap data rather than a fabricated
 * suggestion.
 */
export function deriveTodayRecommendation(stages: RoadmapStage[], focusLevel: number | null): TodayRecommendation | null {
  if (stages.length === 0) return null;
  const level = focusLevel ?? stages[0].level;
  const stage = stages.find((s) => s.level === level) ?? stages[0];
  const skill = stage.skills[0];
  return {
    title: skill ? skill.name : stage.title,
    stageTitle: stage.title,
  };
}
