import { useAdoptedRoadmapId } from '@/hooks/roadmap/use-adopted-roadmap-id';
import { useFocusStageLevel } from '@/hooks/roadmap/use-focus-stage-level';
import { useRoadmap } from '@/hooks/roadmap/use-roadmap';

/**
 * Combines the three queries every screen showing the active roadmap needs
 * (which one is adopted, its content, its current focus stage) with the
 * loading/error rules shared by all of them - kept in one place so a future
 * fix to those rules can't be applied to one screen and missed in another.
 */
export function useActiveRoadmap(userId: string | undefined) {
  const adoptedRoadmapId = useAdoptedRoadmapId(userId);
  const roadmap = useRoadmap(adoptedRoadmapId.data);
  const focusStageLevel = useFocusStageLevel(adoptedRoadmapId.data);

  const hasAdoptedRoadmap = Boolean(adoptedRoadmapId.data);
  const isLoading = adoptedRoadmapId.isLoading || (hasAdoptedRoadmap && (roadmap.isLoading || focusStageLevel.isLoading));
  // Covers settings pointing at a roadmap row that no longer exists
  // (deleted/regenerated) - fetchRoadmap resolves to null rather than
  // erroring, so that alone wouldn't otherwise surface as an error here.
  const isError =
    adoptedRoadmapId.isError ||
    roadmap.isError ||
    focusStageLevel.isError ||
    (hasAdoptedRoadmap && !roadmap.isLoading && !roadmap.data);

  return { adoptedRoadmapId, roadmap, focusStageLevel, hasAdoptedRoadmap, isLoading, isError };
}
