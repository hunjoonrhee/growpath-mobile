import { useQuery } from '@tanstack/react-query';

import { fetchSessionById } from '@/lib/sessions';

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ['sessions', 'byId', id],
    queryFn: () => fetchSessionById(id as string),
    enabled: id !== undefined,
  });
}
