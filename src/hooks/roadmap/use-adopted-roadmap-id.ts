import { useQuery } from '@tanstack/react-query';

import { fetchAdoptedRoadmapId } from '@/lib/roadmap';

export function useAdoptedRoadmapId(userId: string | undefined) {
  return useQuery({
    queryKey: ['settings', 'adoptedRoadmapId', userId],
    queryFn: () => fetchAdoptedRoadmapId(userId as string),
    enabled: userId !== undefined,
  });
}
