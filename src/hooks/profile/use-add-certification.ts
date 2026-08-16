import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addCertification, type NewCertificationInput } from '@/lib/profile';

export function useAddCertification(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewCertificationInput) => addCertification(userId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', userId] });
    },
  });
}
