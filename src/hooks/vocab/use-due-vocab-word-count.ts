import { useQuery } from '@tanstack/react-query';

import { fetchDueVocabWordCount } from '@/lib/vocab';

/**
 * `enabled` defaults to true for backward compatibility, but callers that
 * gate the vocab UI on the active goal needing a language (see #28) should
 * pass `hasLanguageGoal` through here too - otherwise this still spends a
 * Supabase round trip on a count that's never rendered.
 */
export function useDueVocabWordCount(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['vocab', 'dueCount', userId],
    queryFn: () => fetchDueVocabWordCount(userId as string),
    enabled: userId !== undefined && enabled,
  });
}
