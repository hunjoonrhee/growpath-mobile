import { useQuery } from '@tanstack/react-query';

import { calcGapAnalysis, type GapAnalysisResult } from '@/lib/gap-analysis';
import { fetchGoalTags } from '@/lib/roadmap';
import type { Roadmap } from '@/lib/roadmap';
import { fetchSessionTags } from '@/lib/sessions';
import { fetchCertTags, fetchPracticalTags } from '@/lib/skill-sources';

/**
 * Scores the active roadmap's skill coverage against real evidence
 * (certifications, project skills, and study session/goal tags) - see
 * gap-analysis.ts. Takes the already-loaded roadmap/roadmapId from the
 * caller (Today tab already holds both via useActiveRoadmap) rather than
 * re-fetching, and stays null (not an error state) until the roadmap
 * itself is ready, since there's nothing to score without it.
 */
export function useGapAnalysis(
  userId: string | undefined,
  roadmapId: string | null | undefined,
  roadmap: Roadmap | null | undefined
): { result: GapAnalysisResult | null; isLoading: boolean; isError: boolean } {
  // Without an adopted roadmap there's nothing to score (the `result` below
  // stays null whenever `roadmap` is falsy) - gating every query on this
  // instead of just userId means a user with no active goal doesn't pay for
  // 4 Supabase round trips (including fetchSessionTags, the heaviest one)
  // on every Today tab mount for a result that's never read.
  const hasRoadmap = roadmapId !== undefined && roadmapId !== null;

  const sessionTags = useQuery({
    queryKey: ['sessions', 'tags', userId, roadmapId],
    queryFn: () => fetchSessionTags(userId as string, roadmapId ?? null),
    enabled: userId !== undefined && hasRoadmap,
  });
  const goalTags = useQuery({
    queryKey: ['roadmap', 'goalTags', roadmapId],
    queryFn: () => fetchGoalTags(roadmapId as string),
    enabled: hasRoadmap,
  });
  const certTags = useQuery({
    queryKey: ['skillSources', 'certTags', userId],
    queryFn: () => fetchCertTags(userId as string),
    enabled: userId !== undefined && hasRoadmap,
  });
  const practicalTags = useQuery({
    queryKey: ['skillSources', 'practicalTags', userId],
    queryFn: () => fetchPracticalTags(userId as string),
    enabled: userId !== undefined && hasRoadmap,
  });

  const isLoading = sessionTags.isLoading || goalTags.isLoading || certTags.isLoading || practicalTags.isLoading;
  const isError = sessionTags.isError || goalTags.isError || certTags.isError || practicalTags.isError;

  const result =
    roadmap && !isLoading && !isError
      ? calcGapAnalysis({
          roadmap,
          studiedTags: new Set([...(sessionTags.data ?? []), ...(goalTags.data ?? [])]),
          certTags: new Set(certTags.data ?? []),
          practicalTags: new Set(practicalTags.data ?? []),
        })
      : null;

  return { result, isLoading, isError };
}
