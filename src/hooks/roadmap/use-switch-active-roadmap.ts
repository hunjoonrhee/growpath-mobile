import { useMutation, useQueryClient } from '@tanstack/react-query';

import { switchActiveRoadmap } from '@/lib/roadmap';

export function useSwitchActiveRoadmap(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roadmapId: string) => switchActiveRoadmap(roadmapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'adoptedRoadmapId', userId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps', userId] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
