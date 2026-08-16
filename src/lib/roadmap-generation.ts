import { API_CALL_TIMEOUT_MS, env } from '@/lib/env';
import type { Roadmap, RoadmapStage } from '@/lib/roadmap';
import { supabase } from '@/lib/supabase';

export class RoadmapGenerationUnavailableError extends Error {}

export type GenerateRoadmapInput = {
  goalText: string;
  careerLevel: string;
  locale: string;
  /** Regenerates this existing roadmap in place (same id, fresh stages/domain/targetLanguage) instead of creating a new one - see the roadmap edit screen. */
  roadmapId?: string;
};

type GenerateRoadmapApiResponse = {
  id: string;
  goal: string;
  career_level: string;
  stages: RoadmapStage[];
  domain: string | null;
  targetLanguage: string | null;
};

/**
 * Calls joon-dashboard's /api/roadmap/generate, authenticated with the
 * current Supabase session's access token - the route verifies it
 * server-side and derives user_id from it (see joon-dashboard's
 * getAuthenticatedUserId), never from a client-supplied field. The caller's
 * domain chip isn't sent - the route classifies domain/targetLanguage itself
 * from the goal text (see joon-dashboard's roadmap/generate route), which
 * also catches hybrid goals (e.g. "German-speaking lead architect") the
 * chip's single dev/language/art/other choice can't express.
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
      body: JSON.stringify({ goal: input.goalText, careerLevel: input.careerLevel, locale: input.locale, roadmapId: input.roadmapId }),
      signal: AbortSignal.timeout(API_CALL_TIMEOUT_MS),
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

  // Known gap: goal-setup.tsx's pendingRoadmapId dedup only latches once
  // this line resolves. If the server creates the roadmap but the response
  // body never makes it back intact (dropped connection, truncated body,
  // AbortSignal.timeout racing an in-flight response), this throws before
  // that latch is set, and a resubmit creates a second, orphaned row.
  // Closing this fully needs a client-generated idempotency key honored
  // server-side (a joon-dashboard change) - not done here, same accepted-risk
  // class as the TIL-save duplicate-on-timeout gap in the roleplay feature.
  const data = (await res.json()) as GenerateRoadmapApiResponse;
  return {
    id: data.id,
    goal: data.goal,
    careerLevel: data.career_level,
    stages: data.stages,
    domain: data.domain,
    targetLanguage: data.targetLanguage,
  };
}
