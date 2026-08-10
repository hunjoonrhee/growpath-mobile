import { useQuery } from '@tanstack/react-query';

import { fetchSessionById } from '@/lib/sessions';

export function useSession(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', 'byId', id, userId],
    queryFn: () => fetchSessionById(id as string, userId as string),
    enabled: id !== undefined && userId !== undefined,
  });
}
