import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createVocabWord, type CreateVocabWordInput } from '@/lib/vocab';

export function useCreateVocabWord(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVocabWordInput) => createVocabWord(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab', 'due', userId] });
    },
  });
}
