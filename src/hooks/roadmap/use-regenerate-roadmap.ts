import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateRoadmap, type GenerateRoadmapInput } from '@/lib/roadmap-generation';

/**
 * Edits a goal by regenerating its roadmap in place - same Gemini call as
 * creating one, so stages/domain/targetLanguage are freshly classified for
 * the edited goal text rather than staying stale, but joon-dashboard UPDATEs
 * the existing ai_roadmaps row instead of creating a new one (see the
 * roadmapId param on GenerateRoadmapInput) - the roadmap id, adopted state,
 * and anything already tied to it (sessions, goals, roleplay_sessions) stay
 * intact.
 */
export function useRegenerateRoadmap(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateRoadmapInput) => generateRoadmap(input),
    onSuccess: (roadmap) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmap.id] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps', userId] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
