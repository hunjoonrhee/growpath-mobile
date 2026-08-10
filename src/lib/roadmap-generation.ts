import { env } from '@/lib/env';
import type { Domain } from '@/lib/domain';

export class RoadmapGenerationUnavailableError extends Error {}

export type GenerateRoadmapInput = {
  domain: Domain;
  goalText: string;
};

/**
 * Calls joon-dashboard's /api/roadmap/generate. Throws
 * RoadmapGenerationUnavailableError until EXPO_PUBLIC_ROADMAP_API_URL is
 * configured (joon-dashboard isn't deployed yet, so there's nothing to call).
 */
export async function generateRoadmap(input: GenerateRoadmapInput): Promise<never> {
  if (!env.roadmapApiUrl) {
    throw new RoadmapGenerationUnavailableError('EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.');
  }

  const response = await fetch(`${env.roadmapApiUrl}/api/roadmap/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Roadmap generation failed with status ${response.status}.`);
  }
  // No real endpoint to shape this response against yet - fill in once
  // joon-dashboard is deployed and the actual response shape is known.
  throw new RoadmapGenerationUnavailableError('Roadmap generation response handling is not implemented yet.');
}
