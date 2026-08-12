import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateSession, type UpdateSessionInput } from '@/lib/sessions';

export function useUpdateSession(id: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSessionInput) => updateSession(id as string, userId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'byId', id, userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'recent', userId] });
    },
  });
}
