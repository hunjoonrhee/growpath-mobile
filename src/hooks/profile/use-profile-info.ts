import { useQuery } from '@tanstack/react-query';

import { fetchProfileInfo } from '@/lib/profile';

export function useProfileInfo(userId: string | undefined) {
  return useQuery({
    queryKey: ['profileInfo', userId],
    queryFn: () => fetchProfileInfo(userId as string),
    enabled: Boolean(userId),
  });
}
