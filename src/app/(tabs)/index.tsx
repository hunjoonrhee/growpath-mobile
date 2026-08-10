import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompassDial } from '@/components/compass-dial';
import { NoActiveRoadmapState } from '@/components/roadmap/NoActiveRoadmapState';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CaptureFab } from '@/components/today/CaptureFab';
import { GreetingHeader } from '@/components/today/GreetingHeader';
import { QuickStatsRow } from '@/components/today/QuickStatsRow';
import { RecommendationCard } from '@/components/today/RecommendationCard';
import { StageProgressBar } from '@/components/today/StageProgressBar';
import { TimerHandoffSheet } from '@/components/today/TimerHandoffSheet';
import { Spacing } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useStudyStreak } from '@/hooks/sessions/use-study-streak';
import { useWeeklySessionCount } from '@/hooks/sessions/use-weekly-session-count';
import { useDueVocabWordCount } from '@/hooks/vocab/use-due-vocab-word-count';
import { useAuth } from '@/lib/auth-context';
import { deriveTodayRecommendation } from '@/lib/today-recommendation';

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const { roadmap, focusStageLevel, hasAdoptedRoadmap, isLoading, isError } = useActiveRoadmap(userId);
  const streak = useStudyStreak(userId);
  const weeklySessionCount = useWeeklySessionCount(userId);
  const dueVocabWordCount = useDueVocabWordCount(userId);
  const [isHandoffSheetVisible, setIsHandoffSheetVisible] = useState(false);

  const displayName = session?.user.email?.split('@')[0] ?? '';
  const recommendation = roadmap.data ? deriveTodayRecommendation(roadmap.data.stages, focusStageLevel.data ?? null) : null;
  const totalStages = roadmap.data?.stages.length ?? 0;
  const currentStage = focusStageLevel.data ?? 1;
  // Falls back to the first stage if the focus level doesn't match any
  // stage (e.g. a stale focus pointer after the roadmap's stages changed),
  // rather than silently rendering a blank label.
  const currentStageLabel = roadmap.data ? ((roadmap.data.stages.find((s) => s.level === currentStage) ?? roadmap.data.stages[0])?.title ?? '') : '';
  // Stage-completion percent, not a gap-analysis score - no such formula
  // exists in the schema (see PR history), and CompassDial's `percent` is
  // just a 0-100 gauge with no fixed meaning of its own. today.dialLabel is
  // "진행률"/"Progress"/"Fortschritt" to match, not "갭분석"/"Gap analysis".
  const dialPercent = totalStages > 0 ? Math.round(((currentStage - 1) / totalStages) * 100) : 0;

  const handleSelectWeb = () => {
    setIsHandoffSheetVisible(false);
    Alert.alert(t('today.webHandoffComingSoon'));
  };

  const handleSelectTimer = () => {
    if (!recommendation) return;
    setIsHandoffSheetVisible(false);
    router.push({ pathname: '/timer', params: { topic: recommendation.title } });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <GreetingHeader name={displayName} streakDays={streak.data ?? 0} />

          {isLoading && (
            <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
              {t('today.loading')}
            </ThemedText>
          )}

          {!isLoading && isError && (
            <ThemedText type="small" themeColor="amber" style={styles.centerText}>
              {t('today.loadError')}
            </ThemedText>
          )}

          {!isLoading && !isError && !hasAdoptedRoadmap && <NoActiveRoadmapState onPressSetGoal={() => router.push('/goal-setup')} />}

          {!isLoading && !isError && roadmap.data && (
            <>
              <Pressable
                style={styles.dialWrap}
                onPress={() => router.push('/roadmap')}
                accessibilityRole="button"
                accessibilityLabel={t('today.dialAccessibilityLabel')}>
                <CompassDial percent={dialPercent} label={t('today.dialLabel')} />
                <ThemedText type="smallBold" style={styles.goalName}>
                  {roadmap.data.goal}
                </ThemedText>
                <ThemedText type="small" themeColor="textDim">
                  {t('today.stageOfTotal', { stage: currentStage, total: totalStages })}
                </ThemedText>
              </Pressable>

              <StageProgressBar totalStages={totalStages} currentStage={currentStage} currentStageLabel={currentStageLabel} />

              {recommendation && (
                <>
                  <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
                    {t('today.recommendationTitle')}
                  </ThemedText>
                  <RecommendationCard
                    title={recommendation.title}
                    description={t('today.recommendationDescription', { stage: recommendation.stageTitle })}
                    onPressCta={() => setIsHandoffSheetVisible(true)}
                  />
                </>
              )}
            </>
          )}

          <QuickStatsRow
            stats={[
              { id: 'vocab-review', icon: '📚', label: t('today.quickStats.vocabReview', { count: dueVocabWordCount.data ?? 0 }) },
              { id: 'weekly-progress', icon: '🎯', label: t('today.quickStats.weeklyProgress', { count: weeklySessionCount.data ?? 0 }) },
            ]}
          />
        </ScrollView>
      </SafeAreaView>

      {/* Icon/label imply voice capture specifically, so route this to the
          same "not ready yet" messaging as Log's voice button rather than
          silently opening the text-only manual entry flow instead. */}
      <CaptureFab onPress={() => Alert.alert(t('log.captureComingSoon'))} />

      <TimerHandoffSheet
        visible={isHandoffSheetVisible}
        onClose={() => setIsHandoffSheetVisible(false)}
        closeAccessibilityLabel={t('today.handoffSheet.closeAccessibilityLabel')}
        onSelectWeb={handleSelectWeb}
        onSelectTimer={handleSelectTimer}
        title={t('today.handoffSheet.title')}
        subtitle={t('today.handoffSheet.subtitle')}
        webOptionLabel={t('today.handoffSheet.webLabel')}
        webOptionDescription={t('today.handoffSheet.webDescription')}
        timerOptionLabel={t('today.handoffSheet.timerLabel')}
        timerOptionDescription={t('today.handoffSheet.timerDescription')}
      />
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
    // Extra clearance so the last row of quick stats doesn't sit under the
    // absolutely-positioned CaptureFab (56px tall, 24px from the bottom).
    paddingBottom: Spacing.six + 56 + Spacing.two,
  },
  centerText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  dialWrap: {
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  goalName: {
    marginTop: Spacing.two + 2,
  },
  sectionTitle: {
    marginTop: Spacing.five,
    marginBottom: Spacing.two + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
    fontSize: 12,
  },
});
