import { useQuery } from '@tanstack/react-query';

import { fetchUserRoadmaps } from '@/lib/roadmap';

export function useUserRoadmaps(userId: string | undefined) {
  return useQuery({
    queryKey: ['roadmaps', userId],
    queryFn: () => fetchUserRoadmaps(userId as string),
    enabled: userId !== undefined,
  });
}
