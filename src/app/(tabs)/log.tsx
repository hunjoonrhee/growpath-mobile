import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { CaptureButtonsRow } from '@/components/log/CaptureButtonsRow';
import { ContextBanner } from '@/components/log/ContextBanner';
import { SessionLogList } from '@/components/log/SessionLogList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useActiveRoadmapSessions } from '@/hooks/sessions/use-active-roadmap-sessions';
import { useDeleteSession } from '@/hooks/sessions/use-delete-session';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useDueVocabWordCount } from '@/hooks/vocab/use-due-vocab-word-count';
import { useAuth } from '@/lib/auth-context';

export default function LogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  // Scoped to the active goal, so switching goals shows that goal's own log
  // instead of every session ever recorded under any goal.
  const activeRoadmapSessions = useActiveRoadmapSessions(session?.user.id);
  // Vocab review/roleplay only make sense for a goal that actually involves
  // a language (a pure language goal, or a hybrid like "German-speaking
  // lead architect") - see roadmap.targetLanguage, classified at generation
  // time. Showing them unconditionally was the reported issue: every user
  // saw language features regardless of their goal.
  const activeRoadmap = useActiveRoadmap(session?.user.id);
  const hasLanguageGoal = Boolean(activeRoadmap.roadmap.data?.targetLanguage);
  const dueVocabWordCount = useDueVocabWordCount(session?.user.id, hasLanguageGoal);
  const deleteSession = useDeleteSession(session?.user.id);
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
  const { refreshing, onRefresh } = usePullToRefresh();

  if (!session) return null;

  const hasTimerContext = Boolean(timerTitle) && timerSessionId !== undefined && timerSessionId !== dismissedSessionId;

  const handlePressManualEntry = () => {
    router.push(
      hasTimerContext
        ? { pathname: '/capture-entry', params: { title: timerTitle, minutes: timerMinutes, timerSessionId } }
        : '/capture-entry'
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pri2} />}>
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
            onPressVoice={() => router.push('/voice-capture')}
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

          {hasLanguageGoal && (
            <>
              <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
                {t('log.languageSectionTitle')}
              </ThemedText>
              <NavRow
                icon="🗂️"
                label={t('log.vocabReviewCta')}
                subtitle={t('log.vocabDueCount', { count: dueVocabWordCount.data ?? 0 })}
                onPress={() => router.push('/vocab-review')}
              />
              <NavRow icon="➕" label={t('log.vocabAddCta')} onPress={() => router.push('/vocab-add')} />
              <NavRow icon="📖" label={t('log.vocabAllCta')} onPress={() => router.push('/vocab-list')} />
              <NavRow icon="🎭" label={t('log.roleplayCta')} onPress={() => router.push('/roleplay')} />
            </>
          )}

          <SessionLogList
            title={t('log.recentTitle')}
            sessions={activeRoadmapSessions.sessions ?? []}
            isLoading={activeRoadmapSessions.isLoading}
            isError={activeRoadmapSessions.isError}
            loadingLabel={t('log.loading')}
            errorLabel={t('log.loadError')}
            emptyLabel={t('log.empty')}
            onPressSession={(id) => router.push(`/til/${id}`)}
            onDeleteSession={(id) => deleteSession.mutate(id, { onError: () => Alert.alert(t('log.deleteError')) })}
          />
        </ScrollView>
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
  sectionTitle: {
    ...Typography.sectionLabel,
    marginTop: Spacing.five,
    marginBottom: Spacing.two + 2,
  },
});
