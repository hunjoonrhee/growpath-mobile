import { env } from '@/lib/env';

export class SpeechSynthesisUnavailableError extends Error {}

/**
 * Builds the URL for joon-dashboard's TTS route. Unlike speech-transcription.ts,
 * this stays a pure URL builder rather than a fetch wrapper - the URL is used
 * directly as an AudioPlayer source's `uri` (see use-roleplay-tts.ts), which
 * attaches the auth header itself and streams the response straight into
 * playback instead of a separate client-side fetch/decode step.
 */
export function buildSynthesizeUrl(text: string, languageCode: string): string {
  if (!env.roadmapApiUrl) {
    throw new SpeechSynthesisUnavailableError('EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.');
  }
  const params = new URLSearchParams({ text, languageCode });
  return `${env.roadmapApiUrl}/api/speech/synthesize?${params.toString()}`;
}
