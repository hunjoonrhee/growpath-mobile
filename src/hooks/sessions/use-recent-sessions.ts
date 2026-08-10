import { useQuery } from '@tanstack/react-query';

import { fetchRecentSessions } from '@/lib/sessions';

/** roadmapId undefined means "still loading which roadmap is active" - waits before querying so the list doesn't flash unfiltered results first. */
export function useRecentSessions(userId: string | undefined, roadmapId: string | null | undefined) {
  return useQuery({
    queryKey: ['sessions', 'recent', userId, roadmapId],
    queryFn: () => fetchRecentSessions(userId as string, roadmapId ?? null),
    enabled: userId !== undefined && roadmapId !== undefined,
  });
}
