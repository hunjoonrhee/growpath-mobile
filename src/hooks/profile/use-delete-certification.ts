import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCertification } from '@/lib/profile';

export function useDeleteCertification(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificationId: string) => deleteCertification(certificationId, userId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', userId] });
    },
  });
}
