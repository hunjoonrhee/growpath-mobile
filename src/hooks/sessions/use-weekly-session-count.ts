import { useQuery } from '@tanstack/react-query';

import { fetchWeeklySessionCount } from '@/lib/sessions';

export function useWeeklySessionCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', 'weeklyCount', userId],
    queryFn: () => fetchWeeklySessionCount(userId as string),
    enabled: userId !== undefined,
  });
}
