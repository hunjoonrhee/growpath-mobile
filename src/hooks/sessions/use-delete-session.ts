import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSessionQueries } from '@/hooks/sessions/use-create-session';
import { deleteSession } from '@/lib/sessions';

export function useDeleteSession(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSession(id, userId as string),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'byId', id, userId] });
      invalidateSessionQueries(queryClient, userId);
    },
  });
}
