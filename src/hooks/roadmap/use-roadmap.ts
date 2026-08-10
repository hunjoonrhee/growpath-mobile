import { useQuery } from '@tanstack/react-query';

import { fetchRoadmap } from '@/lib/roadmap';

export function useRoadmap(roadmapId: string | null | undefined) {
  return useQuery({
    queryKey: ['roadmap', roadmapId],
    queryFn: () => fetchRoadmap(roadmapId as string),
    enabled: Boolean(roadmapId),
  });
}
