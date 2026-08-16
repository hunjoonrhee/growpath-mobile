import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveProfileInfo, type ProfileInfo } from '@/lib/profile';

export function useSaveProfileInfo(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: ProfileInfo) => saveProfileInfo(userId as string, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileInfo', userId] });
    },
  });
}
