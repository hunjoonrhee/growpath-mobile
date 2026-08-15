import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useCloudDictation } from '@/hooks/voice/use-cloud-dictation';
import type { PronunciationResult } from '@/lib/speech-transcription';

export type ChatComposerProps = {
  onSend: (text: string, pronunciation?: PronunciationResult) => void;
  disabled: boolean;
  placeholder: string;
  sendLabel: string;
  /** BCP-47 tag for voice input (see roleplay-language-bcp47.ts) - null hides the mic button when the setup screen's free-text language couldn't be mapped to one. */
  voiceLanguage: string | null;
  voiceIdleLabel: string;
  voiceRecordingLabel: string;
  voiceTranscribingLabel: string;
  voiceAssessingPronunciationLabel: string;
};

export function ChatComposer({
  onSend,
  disabled,
  placeholder,
  sendLabel,
  voiceLanguage,
  voiceIdleLabel,
  voiceRecordingLabel,
  voiceTranscribingLabel,
  voiceAssessingPronunciationLabel,
}: ChatComposerProps) {
  const [text, setText] = useState('');
  // Tracks the exact transcript a pronunciation score was computed for -
  // sent along only if the user hasn't edited the text since (see handleSend).
  // Score covers just that one recording, so a multi-take append (text
  // already had content before this stop()) also naturally falls through to
  // "edited" and drops the stale score instead of misattributing it.
  const [pendingPronunciation, setPendingPronunciation] = useState<{ transcript: string; result: PronunciationResult } | null>(null);
  const dictation = useCloudDictation(voiceLanguage ?? '', { assessPronunciation: true });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, pendingPronunciation?.transcript === trimmed ? pendingPronunciation.result : undefined);
    setText('');
    setPendingPronunciation(null);
  };

  const handleMicPress = async () => {
    if (dictation.status === 'recording') {
      const result = await dictation.stop();
      if (result.transcript) {
        setText((current) => (current ? `${current} ${result.transcript}` : result.transcript));
        setPendingPronunciation(result.pronunciation ? { transcript: result.transcript, result: result.pronunciation } : null);
      }
      // Azure's assessment is a real external API call that fails
      // intermittently in normal use (confirmed - same recording flow
      // succeeds on one attempt and fails on the next) - surfaced directly
      // so a failure is diagnosable without a Metro/Vercel log round trip.
      if (!result.pronunciation && result.pronunciationDebug) {
        Alert.alert('발음 평가 실패', result.pronunciationDebug);
      }
    } else if (dictation.status === 'idle' || dictation.status === 'error') {
      dictation.start();
    }
  };

  const isRecording = dictation.status === 'recording';
  const isTranscribing = dictation.status === 'transcribing';
  const isAssessingPronunciation = dictation.status === 'assessingPronunciation';
  const isBusyTranscribing = isTranscribing || isAssessingPronunciation;
  const isDictating = isRecording || isBusyTranscribing;
  const micLabel = isRecording ? voiceRecordingLabel : isAssessingPronunciation ? voiceAssessingPronunciationLabel : isTranscribing ? voiceTranscribingLabel : voiceIdleLabel;
  const canSend = !disabled && !isDictating && text.trim().length > 0;

  return (
    <View>
      {/* Mirrors voice-capture.tsx/VoiceDictationField's visible status text -
          the mic icon alone doesn't tell the user a longer recording is
          still being uploaded/transcribed, which reads as "did this even
          work?" during that gap. */}
      {isDictating && (
        <ThemedText type="small" themeColor="textDim" style={styles.voiceStatus}>
          {micLabel}
        </ThemedText>
      )}
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <MultilineTextInput value={text} onChangeText={setText} placeholder={placeholder} minHeight={40} maxHeight={100} editable={!disabled} />
        </View>
        {voiceLanguage && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={micLabel}
            onPress={handleMicPress}
            disabled={disabled || isBusyTranscribing}
            style={[styles.micButton, isRecording && styles.micButtonActive, disabled && styles.micButtonDisabled]}>
            {isBusyTranscribing ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <ThemedText style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</ThemedText>
            )}
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sendLabel}
          onPress={handleSend}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}>
          <ThemedText type="smallBold" style={styles.sendLabel}>
            {sendLabel}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  voiceStatus: {
    textAlign: 'center',
    paddingTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrap: {
    flex: 1,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amber,
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  micIcon: {
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.pri,
    borderRadius: 18,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  // Matches PrimaryButton's disabled opacity for consistency - this button
  // is a custom shape (compact + inline, unlike PrimaryButton's full-width
  // block layout) but should still fade the same amount.
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendLabel: {
    color: '#ffffff',
  },
});
