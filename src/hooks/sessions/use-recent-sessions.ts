import { useQuery } from '@tanstack/react-query';

import { fetchRecentSessions } from '@/lib/sessions';

export function useRecentSessions(userId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', 'recent', userId],
    queryFn: () => fetchRecentSessions(userId as string),
    enabled: userId !== undefined,
  });
}
