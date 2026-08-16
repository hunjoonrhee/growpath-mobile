import { useQuery } from '@tanstack/react-query';

import { fetchCertifications } from '@/lib/profile';

export function useCertifications(userId: string | undefined) {
  return useQuery({
    queryKey: ['certifications', userId],
    queryFn: () => fetchCertifications(userId as string),
    enabled: Boolean(userId),
  });
}
