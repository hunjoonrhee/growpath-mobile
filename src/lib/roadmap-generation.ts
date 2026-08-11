import { env } from '@/lib/env';
import type { Roadmap, RoadmapStage } from '@/lib/roadmap';
import { supabase } from '@/lib/supabase';

export class RoadmapGenerationUnavailableError extends Error {}

// A generation can involve a retried Gemini call server-side, so this is
// generous - long enough to not false-positive on a legitimately slow
// generation, short enough that a dead connection doesn't hang forever.
const GENERATE_ROADMAP_TIMEOUT_MS = 60_000;

export type GenerateRoadmapInput = {
  goalText: string;
  careerLevel: string;
  locale: string;
};

type GenerateRoadmapApiResponse = {
  id: string;
  goal: string;
  career_level: string;
  stages: RoadmapStage[];
};

/**
 * Calls joon-dashboard's /api/roadmap/generate, authenticated with the
 * current Supabase session's access token - the route verifies it
 * server-side and derives user_id from it (see joon-dashboard's
 * getAuthenticatedUserId), never from a client-supplied field. The caller's
 * domain isn't sent - the route doesn't accept it and ai_roadmaps has no
 * domain column yet (a known, separately-tracked gap).
 */
export async function generateRoadmap(input: GenerateRoadmapInput): Promise<Roadmap> {
  if (!env.roadmapApiUrl) {
    throw new RoadmapGenerationUnavailableError('EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    // Not the "feature unavailable" case - a plain Error so the caller shows
    // a generic retry message instead of "not ready yet".
    throw new Error('Not authenticated.');
  }

  let res: Response;
  try {
    res = await fetch(`${env.roadmapApiUrl}/api/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ goal: input.goalText, careerLevel: input.careerLevel, locale: input.locale }),
      signal: AbortSignal.timeout(GENERATE_ROADMAP_TIMEOUT_MS),
    });
  } catch (error) {
    // Covers both a network failure and AbortSignal.timeout() firing - either
    // way this must stay a plain Error, not RoadmapGenerationUnavailableError,
    // so the caller shows "try again" rather than "not ready yet".
    throw error instanceof Error ? error : new Error('Roadmap generation request failed.');
  }

  if (!res.ok) {
    // A real, likely-transient failure (5xx, expired token, rate limit) -
    // not "feature unavailable", so this must NOT be
    // RoadmapGenerationUnavailableError (that maps to a misleading "coming
    // soon" message in goal-setup.tsx rather than "try again").
    throw new Error(`Roadmap generation failed (${res.status}).`);
  }

  const data = (await res.json()) as GenerateRoadmapApiResponse;
  return { id: data.id, goal: data.goal, careerLevel: data.career_level, stages: data.stages };
}
