import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useStudyTimerActivity } from '@/hooks/widgets/use-study-timer-activity';
import { useAuth } from '@/lib/auth-context';
import { formatElapsedSeconds } from '@/lib/date';

type TimerStatus = 'running' | 'paused';

export default function TimerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const { topic } = useLocalSearchParams<{ topic?: string }>();

  const [status, setStatus] = useState<TimerStatus>('running');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const accumulatedSecondsRef = useRef(0);
  const segmentStartRef = useRef(0);

  useEffect(() => {
    if (status !== 'running') return;
    segmentStartRef.current = Date.now();
    const interval = setInterval(() => {
      const segmentElapsed = Math.floor((Date.now() - segmentStartRef.current) / 1000);
      setElapsedSeconds(accumulatedSecondsRef.current + segmentElapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useStudyTimerActivity({
    topic: topic ?? '',
    status,
    elapsedSeconds,
    statusLabel: status === 'running' ? t('timer.statusRunning') : t('timer.statusPaused'),
  });

  if (!session) return <Redirect href="/login" />;

  const handleTogglePause = () => {
    if (status === 'running') {
      accumulatedSecondsRef.current = elapsedSeconds;
      setStatus('paused');
    } else {
      setStatus('running');
    }
  };

  const handleFinish = () => {
    router.replace({
      pathname: '/log',
      params: {
        timerTitle: topic ?? '',
        timerMinutes: String(Math.round(elapsedSeconds / 60)),
        // Identifies this specific session for the banner's dismiss state -
        // (title, minutes) alone collides whenever two runs share a title
        // and round to the same minute count.
        timerSessionId: String(Date.now()),
      },
    });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('timer.backAccessibilityLabel')} onPress={() => router.back()} />

        <View style={styles.content}>
          {topic ? (
            <ThemedText type="smallBold" themeColor="pri2" style={styles.topic}>
              {topic}
            </ThemedText>
          ) : null}

          <ThemedText style={styles.clock}>{formatElapsedSeconds(elapsedSeconds)}</ThemedText>

          <ThemedText type="small" themeColor="textDim" style={styles.status}>
            {status === 'running' ? t('timer.statusRunning') : t('timer.statusPaused')}
          </ThemedText>

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={status === 'running' ? t('timer.pauseCta') : t('timer.resumeCta')}
              onPress={handleTogglePause}
              style={styles.secondaryButton}>
              <ThemedText type="smallBold">{status === 'running' ? t('timer.pauseCta') : t('timer.resumeCta')}</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('timer.finishCta')} onPress={handleFinish} style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonLabel}>
                {t('timer.finishCta')}
              </ThemedText>
            </Pressable>
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  topic: {
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  clock: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  status: {
    marginBottom: Spacing.five,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.pri,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#ffffff',
  },
});
