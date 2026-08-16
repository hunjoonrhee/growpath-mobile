import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/navigation/BackHeader';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCloudDictation } from '@/hooks/voice/use-cloud-dictation';
import { useAuth } from '@/lib/auth-context';
import { toBcp47 } from '@/lib/locale-bcp47';

export default function VoiceCaptureScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const colors = useTheme();
  const [transcript, setTranscript] = useState('');
  const { status, start, stop } = useCloudDictation(toBcp47(i18n.language));

  if (!session) return <Redirect href="/login" />;

  const isRecording = status === 'recording';
  const isTranscribing = status === 'transcribing';
  const statusLabel =
    status === 'error'
      ? t('voiceCapture.error')
      : isTranscribing
        ? t('voiceCapture.transcribing')
        : isRecording
          ? t('voiceCapture.listening')
          : t('voiceCapture.idle');

  const handleRecordPress = async () => {
    if (isRecording) {
      const result = await stop();
      setTranscript(result.transcript);
    } else {
      setTranscript('');
      start();
    }
  };

  const handleRetry = () => {
    setTranscript('');
    start();
  };

  const handleContinue = () => {
    router.replace({ pathname: '/capture-entry', params: { til: transcript } });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('voiceCapture.backAccessibilityLabel')} onPress={() => router.back()} />

        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('voiceCapture.title')}
          </ThemedText>

          <View style={[styles.transcriptBox, { backgroundColor: colors.surf, borderColor: colors.border }]}>
            <ThemedText style={transcript ? undefined : styles.placeholder} themeColor={transcript ? undefined : 'textDim'}>
              {transcript || t('voiceCapture.placeholder')}
            </ThemedText>
          </View>

          <ThemedText type="small" themeColor={status === 'error' ? 'amber' : 'textDim'} style={styles.status}>
            {statusLabel}
          </ThemedText>

          {!transcript && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={statusLabel}
              onPress={handleRecordPress}
              disabled={isTranscribing}
              style={[
                styles.recordButton,
                { backgroundColor: isRecording ? colors.amber : colors.pri },
                isTranscribing && styles.recordButtonDisabled,
              ]}>
              <ThemedText style={[styles.recordIcon, { fontFamily: undefined }]}>{isRecording ? '⏹️' : '🎙️'}</ThemedText>
            </Pressable>
          )}

          {transcript.length > 0 && (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('voiceCapture.retryCta')}
                onPress={handleRetry}
                style={[styles.retryButton, { backgroundColor: colors.surf2, borderColor: colors.border }]}>
                <ThemedText type="smallBold">{t('voiceCapture.retryCta')}</ThemedText>
              </Pressable>
              <PrimaryButton label={t('voiceCapture.continueCta')} onPress={handleContinue} style={styles.continueButton} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.four,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  transcriptBox: {
    width: '100%',
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  placeholder: {
    textAlign: 'center',
  },
  status: {
    textAlign: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordIcon: {
    fontSize: 30,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    flex: 1,
  },
});
