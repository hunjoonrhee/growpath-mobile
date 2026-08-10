import { useQuery } from '@tanstack/react-query';

import { fetchDueVocabWordCount } from '@/lib/vocab';

export function useDueVocabWordCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['vocab', 'dueCount', userId],
    queryFn: () => fetchDueVocabWordCount(userId as string),
    enabled: userId !== undefined,
  });
}
