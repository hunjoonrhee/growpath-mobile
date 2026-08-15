import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { useCallback, useState } from 'react';

import { DICTATION_RECORDING_OPTIONS } from '@/lib/audio-recording';
import { assessPronunciation, transcribeAudio, type PronunciationResult } from '@/lib/speech-transcription';

export type CloudDictationStatus = 'idle' | 'recording' | 'transcribing' | 'assessingPronunciation' | 'error';

export type DictationResult = {
  transcript: string;
  pronunciation: PronunciationResult | null;
  pronunciationDebug: string | null;
};

const EMPTY_RESULT: DictationResult = { transcript: '', pronunciation: null, pronunciationDebug: null };

export type UseCloudDictationOptions = {
  assessPronunciation?: boolean;
};

export type UseCloudDictationResult = {
  status: CloudDictationStatus;
  start: () => Promise<void>;
  /** Stops recording, uploads it, and resolves with the transcript (and pronunciation score, if requested) - empty transcript on failure, status flips to 'error' in that case, callers don't need to also check the return value. */
  stop: () => Promise<DictationResult>;
};

/**
 * Records on-device (mono LINEAR16 WAV - see audio-recording.ts) and
 * transcribes via Google Cloud Speech-to-Text (see speech-transcription.ts).
 * Replaced an on-device-recognition-only approach that transcribed
 * technical loanwords badly (e.g. "Angular" as "앵글로") - see task #22's
 * notes.
 */
export function useCloudDictation(languageCode: string, options?: UseCloudDictationOptions): UseCloudDictationResult {
  const [status, setStatus] = useState<CloudDictationStatus>('idle');
  const recorder = useAudioRecorder(DICTATION_RECORDING_OPTIONS);
  const shouldAssessPronunciation = options?.assessPronunciation ?? false;

  const start = useCallback(async () => {
    const permissions = await requestRecordingPermissionsAsync();
    if (!permissions.granted) {
      setStatus('error');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStatus('recording');
  }, [recorder]);

  const stop = useCallback(async (): Promise<DictationResult> => {
    try {
      await recorder.stop();
    } catch (error) {
      console.warn('Could not stop recording', error);
      setStatus('error');
      return EMPTY_RESULT;
    }

    const uri = recorder.uri;
    if (!uri) {
      setStatus('error');
      return EMPTY_RESULT;
    }

    setStatus('transcribing');
    let transcript: string;
    try {
      transcript = await transcribeAudio(uri, languageCode);
    } catch (error) {
      console.warn('Transcription failed', error);
      setStatus('error');
      return EMPTY_RESULT;
    }

    // Pronunciation assessment needs the transcript as its reference text,
    // so it can only start once transcription is done - not something a
    // caller not asking for it (or an empty transcript, nothing to score)
    // should wait through.
    if (!shouldAssessPronunciation || !transcript) {
      setStatus('idle');
      return { transcript, pronunciation: null, pronunciationDebug: null };
    }

    setStatus('assessingPronunciation');
    try {
      const { pronunciation, pronunciationDebug } = await assessPronunciation(uri, transcript, languageCode);
      setStatus('idle');
      return { transcript, pronunciation, pronunciationDebug };
    } catch (error) {
      // Best-effort, same as a server-side pronunciation failure - the
      // transcript is already good, so this stays 'idle' rather than
      // 'error' (which would suggest the whole recording needs redoing).
      console.warn('Pronunciation assessment upload failed', error);
      setStatus('idle');
      return { transcript, pronunciation: null, pronunciationDebug: error instanceof Error ? error.message : String(error) };
    }
  }, [recorder, languageCode, shouldAssessPronunciation]);

  return { status, start, stop };
}
