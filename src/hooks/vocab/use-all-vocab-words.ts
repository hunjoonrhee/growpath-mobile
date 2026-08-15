import { useQuery } from '@tanstack/react-query';

import { fetchAllVocabWords } from '@/lib/vocab';

export function useAllVocabWords(userId: string | undefined) {
  return useQuery({
    queryKey: ['vocab', 'all', userId],
    queryFn: () => fetchAllVocabWords(userId as string),
    enabled: userId !== undefined,
  });
}
