import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteVocabWord } from '@/lib/vocab';

export function useDeleteVocabWord(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVocabWord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab', 'all', userId] });
      queryClient.invalidateQueries({ queryKey: ['vocab', 'due', userId] });
      queryClient.invalidateQueries({ queryKey: ['vocab', 'dueCount', userId] });
    },
  });
}
