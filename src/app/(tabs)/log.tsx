import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { CaptureButtonsRow } from '@/components/log/CaptureButtonsRow';
import { ContextBanner } from '@/components/log/ContextBanner';
import { SessionLogList } from '@/components/log/SessionLogList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useRecentSessions } from '@/hooks/sessions/use-recent-sessions';
import { useAuth } from '@/lib/auth-context';

export default function LogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const recentSessions = useRecentSessions(session?.user.id);
  const { timerTitle, timerMinutes, timerSessionId } = useLocalSearchParams<{
    timerTitle?: string;
    timerMinutes?: string;
    timerSessionId?: string;
  }>();
  // Tabs keeps this screen mounted across tab switches, so router.replace()
  // from the timer only updates params rather than remounting - a plain
  // dismissed boolean would stay true forever after the first dismiss and
  // hide the banner for every later timer session too. Tracking *which*
  // session was dismissed instead lets a new one show again. Keyed on
  // timerSessionId (not title/minutes) since two runs can share a title and
  // round to the same minute count.
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(null);

  if (!session) return null;

  const hasTimerContext = Boolean(timerTitle) && timerSessionId !== undefined && timerSessionId !== dismissedSessionId;

  const handlePressManualEntry = () => {
    router.push(
      hasTimerContext
        ? { pathname: '/capture-entry', params: { title: timerTitle, minutes: timerMinutes } }
        : '/capture-entry'
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t('log.title')}
        </ThemedText>

        {hasTimerContext && (
          <ContextBanner
            message={t('log.contextBanner', { minutes: timerMinutes, title: timerTitle })}
            dismissAccessibilityLabel={t('log.contextBannerDismiss')}
            onDismiss={() => setDismissedSessionId(timerSessionId ?? null)}
          />
        )}

        <CaptureButtonsRow
          voiceLabel={t('log.voiceLabel')}
          photoLabel={t('log.photoLabel')}
          onPressVoice={() => Alert.alert(t('log.captureComingSoon'))}
          onPressPhoto={() => Alert.alert(t('log.captureComingSoon'))}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('log.manualEntryCta')}
          onPress={handlePressManualEntry}
          style={styles.manualEntryButton}>
          <ThemedText type="smallBold" themeColor="pri2">
            {t('log.manualEntryCta')}
          </ThemedText>
        </Pressable>

        <SessionLogList
          title={t('log.recentTitle')}
          sessions={recentSessions.data ?? []}
          isLoading={recentSessions.isLoading}
          isError={recentSessions.isError}
          loadingLabel={t('log.loading')}
          errorLabel={t('log.loadError')}
          emptyLabel={t('log.empty')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.three,
  },
  manualEntryButton: {
    marginTop: Spacing.three - 2,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
