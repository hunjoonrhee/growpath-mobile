import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resyncGoalsForRoadmap } from '@/lib/goals';
import { generateRoadmap, type GenerateRoadmapInput } from '@/lib/roadmap-generation';

/**
 * Edits a goal by regenerating its roadmap in place - same Gemini call as
 * creating one, so stages/domain/targetLanguage are freshly classified for
 * the edited goal text rather than staying stale, but joon-dashboard UPDATEs
 * the existing ai_roadmaps row instead of creating a new one (see the
 * roadmapId param on GenerateRoadmapInput) - the roadmap id, adopted state,
 * and anything already tied to it (sessions, roleplay_sessions) stay intact.
 * The auto-generated per-stage `goals` rows don't - resyncGoalsForRoadmap
 * replaces them to match the new stage content, since the old ones describe
 * stages that no longer exist (see its own doc comment). Awaited before
 * invalidating so the Today/roadmap screens' next fetch already sees the
 * new focus stage, not a stale/missing one.
 */
export function useRegenerateRoadmap(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateRoadmapInput) => generateRoadmap(input),
    onSuccess: async (roadmap) => {
      if (userId) {
        try {
          await resyncGoalsForRoadmap(roadmap.id, userId, roadmap.stages);
        } catch (error) {
          console.warn('resyncGoalsForRoadmap failed', error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmap.id] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps', userId] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
