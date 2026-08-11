import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { createSession, type CreateSessionInput } from '@/lib/sessions';

/** Single source of truth for which queries a new session invalidates, so other write paths that bypass this mutation (e.g. roleplay's own retry/idempotency handling) can't drift out of sync with it. */
export function invalidateSessionQueries(queryClient: QueryClient, userId: string | undefined) {
  queryClient.invalidateQueries({ queryKey: ['sessions', 'recent', userId] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'streak', userId] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'weeklyCount', userId] });
}

export function useCreateSession(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSessionInput) => createSession(userId as string, input),
    onSuccess: () => invalidateSessionQueries(queryClient, userId),
  });
}
