import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRoadmap, type UpdateRoadmapInput } from '@/lib/roadmap';

export function useUpdateRoadmap(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roadmapId, input }: { roadmapId: string; input: UpdateRoadmapInput }) => updateRoadmap(roadmapId, input),
    onSuccess: (_data, { roadmapId }) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps', userId] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
