import { File } from 'expo-file-system';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

export class TranscriptionUnavailableError extends Error {}

/** Must match use-cloud-dictation.ts's recording sampleRate - Google's config needs to know the actual rate the LINEAR16 audio was captured at. */
export const DICTATION_SAMPLE_RATE_HERTZ = 16000;

export type PronunciationWordScore = { word: string; accuracyScore: number; errorType: string };
export type PronunciationResult = {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
  words: PronunciationWordScore[];
};

export type PronunciationAssessmentResult = {
  pronunciation: PronunciationResult | null;
  /** The server's best-effort reason when pronunciation is null (missing config, Azure error, unrecognized response shape) - null when scoring succeeded. Azure's assessment is a real external API call that can fail intermittently in normal use, so this stays around rather than being a one-off debug field. */
  pronunciationDebug: string | null;
};

/**
 * Uploads a recorded LINEAR16 WAV clip to joon-dashboard's Speech-to-Text
 * route and returns the transcribed text. Mirrors roleplay.ts's
 * callTutorChat error classification: missing config is the only
 * "unavailable" (retrying can't fix it) case, everything else (no session,
 * network failure, non-2xx) is a plain Error so the UI still offers retry.
 */
export async function transcribeAudio(fileUri: string, languageCode: string): Promise<string> {
  if (!env.roadmapApiUrl) {
    throw new TranscriptionUnavailableError('EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated.');
  }

  const params = new URLSearchParams({ languageCode, sampleRateHertz: String(DICTATION_SAMPLE_RATE_HERTZ) });
  const url = `${env.roadmapApiUrl}/api/speech/transcribe?${params.toString()}`;

  let result: { status: number; body: string };
  try {
    const file = new File(fileUri);
    result = await file.upload(url, {
      httpMethod: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'audio/wav',
      },
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Audio upload failed.');
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Transcription failed (${result.status}).`);
  }

  const data = JSON.parse(result.body) as { transcript?: string };
  return data.transcript ?? '';
}

/**
 * Uploads the same recording a second time, now that a transcript exists to
 * use as the reference text - Azure needs it as input, so this can only run
 * after transcribeAudio, not in parallel with it. Kept as a separate call
 * (rather than bundled into transcribeAudio behind a flag, as it was
 * before) so callers can show a distinct "발음 분석 중..." phase instead of
 * one opaque combined wait.
 */
export async function assessPronunciation(fileUri: string, referenceText: string, languageCode: string): Promise<PronunciationAssessmentResult> {
  if (!env.roadmapApiUrl) {
    throw new TranscriptionUnavailableError('EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated.');
  }

  const params = new URLSearchParams({ languageCode, referenceText });
  const url = `${env.roadmapApiUrl}/api/speech/pronunciation?${params.toString()}`;

  let result: { status: number; body: string };
  try {
    const file = new File(fileUri);
    result = await file.upload(url, {
      httpMethod: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'audio/wav',
      },
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Audio upload failed.');
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Pronunciation assessment failed (${result.status}).`);
  }

  const data = JSON.parse(result.body) as { pronunciation?: PronunciationResult | null; pronunciationDebug?: string | null };
  return { pronunciation: data.pronunciation ?? null, pronunciationDebug: data.pronunciationDebug ?? null };
}
