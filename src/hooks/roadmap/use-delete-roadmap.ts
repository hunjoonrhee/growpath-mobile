import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRoadmap } from '@/lib/roadmap';

export function useDeleteRoadmap(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roadmapId: string) => deleteRoadmap(roadmapId, userId as string),
    onSuccess: () => {
      // Broad invalidation (roadmap/roadmaps/settings/sessions/today) rather
      // than targeted keys - a delete can change which roadmap is active,
      // detach sessions from it, and remove its goals, all at once.
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps', userId] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'adoptedRoadmapId', userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
