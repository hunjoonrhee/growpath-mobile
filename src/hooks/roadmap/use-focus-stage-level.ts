import { useQuery } from '@tanstack/react-query';

import { fetchFocusStageLevel } from '@/lib/roadmap';

export function useFocusStageLevel(roadmapId: string | null | undefined) {
  return useQuery({
    queryKey: ['roadmap', roadmapId, 'focusStageLevel'],
    queryFn: () => fetchFocusStageLevel(roadmapId as string),
    enabled: Boolean(roadmapId),
  });
}
