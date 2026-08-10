import { useQuery } from '@tanstack/react-query';

import { fetchDueVocabWords } from '@/lib/vocab';

export function useDueVocabWords(userId: string | undefined) {
  return useQuery({
    queryKey: ['vocab', 'due', userId],
    queryFn: () => fetchDueVocabWords(userId as string),
    enabled: userId !== undefined,
  });
}
