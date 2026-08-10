import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSession, type CreateSessionInput } from '@/lib/sessions';

export function useCreateSession(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSessionInput) => createSession(userId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'recent', userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'weeklyCount', userId] });
    },
  });
}
