import { useAdoptedRoadmapId } from '@/hooks/roadmap/use-adopted-roadmap-id';
import { useRecentSessions } from '@/hooks/sessions/use-recent-sessions';

/**
 * Combines the two queries the Log tab needs (which roadmap is active, that
 * roadmap's sessions) with the loading/error composition disabled/dependent
 * queries require - see useActiveRoadmap for why this lives in one hook
 * instead of being re-derived per screen.
 */
export function useActiveRoadmapSessions(userId: string | undefined) {
  const adoptedRoadmapId = useAdoptedRoadmapId(userId);
  const recentSessions = useRecentSessions(userId, adoptedRoadmapId.data);

  // recentSessions stays disabled (enabled: false) until adoptedRoadmapId
  // resolves, and a disabled query's isLoading is false the whole time (only
  // isPending reflects "no data yet" regardless of enabled) - reading
  // recentSessions.isLoading directly would flash the empty state before
  // adoptedRoadmapId even finishes. If adoptedRoadmapId itself errors,
  // recentSessions never enables and isPending would stay true forever, so
  // that path routes to the error state instead of an infinite spinner.
  const isLoading = adoptedRoadmapId.isLoading || (!adoptedRoadmapId.isError && recentSessions.isPending);
  const isError = adoptedRoadmapId.isError || recentSessions.isError;

  return { sessions: recentSessions.data, isLoading, isError };
}
