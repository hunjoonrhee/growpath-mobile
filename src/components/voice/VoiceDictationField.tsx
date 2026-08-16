import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCloudDictation } from '@/hooks/voice/use-cloud-dictation';

export type VoiceDictationFieldProps = {
  language: string;
  onTranscript: (text: string) => void;
  idleLabel: string;
  recordingLabel: string;
  transcribingLabel: string;
  errorLabel: string;
};

/** Tap-to-record dictation field - records, uploads, and transcribes via Google Cloud Speech-to-Text. */
export function VoiceDictationField({ language, onTranscript, idleLabel, recordingLabel, transcribingLabel, errorLabel }: VoiceDictationFieldProps) {
  const colors = useTheme();
  const { status, start, stop } = useCloudDictation(language);
  const isRecording = status === 'recording';

  const statusLabel = status === 'error' ? errorLabel : status === 'transcribing' ? transcribingLabel : isRecording ? recordingLabel : idleLabel;

  const handlePress = async () => {
    if (isRecording) {
      const result = await stop();
      if (result.transcript) onTranscript(result.transcript);
    } else if (status !== 'transcribing') {
      start();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surf, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={statusLabel}
        onPress={handlePress}
        disabled={status === 'transcribing'}
        style={[styles.button, { backgroundColor: isRecording ? colors.amber : colors.pri }, status === 'transcribing' && styles.buttonDisabled]}>
        <ThemedText style={[styles.icon, { fontFamily: undefined }]}>{isRecording ? '⏹️' : '🎙️'}</ThemedText>
      </Pressable>
      <ThemedText type="small" themeColor={status === 'error' ? 'amber' : 'textDim'} style={styles.status}>
        {statusLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 24,
  },
  status: {
    textAlign: 'center',
  },
});
