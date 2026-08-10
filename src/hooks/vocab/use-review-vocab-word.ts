import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ReviewState } from '@/lib/spaced-repetition';
import { reviewVocabWord } from '@/lib/vocab';

export type ReviewVocabWordInput = {
  id: string;
  current: ReviewState;
  knew: boolean;
};

export function useReviewVocabWord(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, current, knew }: ReviewVocabWordInput) => reviewVocabWord(id, current, knew),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab', 'due', userId] });
      queryClient.invalidateQueries({ queryKey: ['vocab', 'dueCount', userId] });
    },
  });
}
