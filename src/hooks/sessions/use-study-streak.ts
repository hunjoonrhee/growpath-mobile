import { useQuery } from '@tanstack/react-query';

import { fetchStudySessionDates } from '@/lib/sessions';
import { computeStreakDays } from '@/lib/streak';

export function useStudyStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', 'streak', userId],
    queryFn: async () => computeStreakDays(await fetchStudySessionDates(userId as string)),
    enabled: userId !== undefined,
  });
}
