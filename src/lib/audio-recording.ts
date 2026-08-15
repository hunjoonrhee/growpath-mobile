import { AudioQuality, IOSOutputFormat, type RecordingOptions } from 'expo-audio';

import { DICTATION_SAMPLE_RATE_HERTZ } from '@/lib/speech-transcription';

/**
 * Records mono LINEAR16 PCM in a .wav container - one of the two lossless
 * encodings Google Cloud Speech-to-Text accepts (the other, FLAC, isn't a
 * built-in expo-audio output option). The Android config here is an
 * untested best-effort fallback (this app has no Android target yet, so
 * there's been no way to verify recognition quality against it).
 */
export const DICTATION_RECORDING_OPTIONS: RecordingOptions = {
  extension: '.wav',
  sampleRate: DICTATION_SAMPLE_RATE_HERTZ,
  numberOfChannels: 1,
  bitRate: DICTATION_SAMPLE_RATE_HERTZ * 16,
  android: {
    extension: '.3gp',
    outputFormat: 'default',
    audioEncoder: 'default',
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    sampleRate: DICTATION_SAMPLE_RATE_HERTZ,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: DICTATION_SAMPLE_RATE_HERTZ * 16,
  },
};
