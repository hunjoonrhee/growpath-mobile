import { env } from '@/lib/env';
import type { Domain } from '@/lib/domain';

export class RoadmapGenerationUnavailableError extends Error {}

export type GenerateRoadmapInput = {
  domain: Domain;
  goalText: string;
};

/**
 * Will call joon-dashboard's /api/roadmap/generate once it's deployed and
 * EXPO_PUBLIC_ROADMAP_API_URL is set. Always throws
 * RoadmapGenerationUnavailableError for now - deliberately not making the
 * request even when the URL is configured, since the response shape isn't
 * known yet: firing a real POST and then discarding a successful response
 * would create a roadmap server-side while still reporting failure here,
 * and a retry would create a duplicate.
 */
export async function generateRoadmap(input: GenerateRoadmapInput): Promise<never> {
  throw new RoadmapGenerationUnavailableError(
    env.roadmapApiUrl ? 'Roadmap generation response handling is not implemented yet.' : 'EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.'
  );
}
