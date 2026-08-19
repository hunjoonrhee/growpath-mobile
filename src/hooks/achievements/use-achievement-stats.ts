import { useQuery } from '@tanstack/react-query';

import type { AchievementStats } from '@/lib/achievements';
import { fetchBestPronunciationScore } from '@/lib/roleplay';
import { fetchSessionStats } from '@/lib/sessions';
import { computeLongestStreakDays } from '@/lib/streak';
import { fetchVocabWordCount } from '@/lib/vocab';

/**
 * All the raw numbers the Achievements screen's badges unlock off of, in
 * one hook - same "combine related queries with shared loading/error
 * rules" pattern as useActiveRoadmap, so the screen itself just renders
 * badges rather than juggling five separate queries.
 */
export function useAchievementStats(
  userId: string | undefined,
  currentStageLevel: number | null | undefined,
  totalStages: number | null | undefined
) {
  const sessionStats = useQuery({
    queryKey: ['achievements', 'sessionStats', userId],
    queryFn: () => fetchSessionStats(userId as string),
    enabled: Boolean(userId),
  });
  const vocabWordCount = useQuery({
    queryKey: ['achievements', 'vocabWordCount', userId],
    queryFn: () => fetchVocabWordCount(userId as string),
    enabled: Boolean(userId),
  });
  const bestPronunciation = useQuery({
    queryKey: ['achievements', 'bestPronunciation', userId],
    queryFn: () => fetchBestPronunciationScore(userId as string),
    enabled: Boolean(userId),
  });

  const isLoading = sessionStats.isLoading || vocabWordCount.isLoading || bestPronunciation.isLoading;
  const isError = sessionStats.isError || vocabWordCount.isError || bestPronunciation.isError;

  let data: AchievementStats | undefined;
  if (sessionStats.data && vocabWordCount.data !== undefined && bestPronunciation.data !== undefined) {
    const sessions = sessionStats.data;
    const longestSession = sessions.reduce<{ minutes: number; date: string } | null>((best, session) => {
      if (session.durationMinutes === null) return best;
      if (best === null || session.durationMinutes > best.minutes) return { minutes: session.durationMinutes, date: session.date };
      return best;
    }, null);

    data = {
      longestStreakEver: computeLongestStreakDays(sessions.map((s) => s.date)),
      totalSessionCount: sessions.length,
      totalStudyMinutes: sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0),
      longestSessionMinutes: longestSession?.minutes ?? null,
      longestSessionDate: longestSession?.date ?? null,
      bestPronunciationScore: bestPronunciation.data?.score ?? null,
      bestPronunciationDate: bestPronunciation.data?.date ?? null,
      savedVocabWordCount: vocabWordCount.data,
      currentStageLevel: currentStageLevel ?? null,
      totalStages: totalStages ?? null,
    };
  }

  return { data, isLoading, isError };
}
