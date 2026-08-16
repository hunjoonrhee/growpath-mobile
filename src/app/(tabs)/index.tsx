import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
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
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useGapAnalysis } from '@/hooks/roadmap/use-gap-analysis';
import { useStudyStreak } from '@/hooks/sessions/use-study-streak';
import { useWeeklySessionCount } from '@/hooks/sessions/use-weekly-session-count';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useDueVocabWordCount } from '@/hooks/vocab/use-due-vocab-word-count';
import { useTodayWidgetSync } from '@/hooks/widgets/use-today-widget-sync';
import { useAuth } from '@/lib/auth-context';
import { deriveTodayRecommendation } from '@/lib/today-recommendation';

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const { adoptedRoadmapId, roadmap, focusStageLevel, hasAdoptedRoadmap, isLoading, isError } = useActiveRoadmap(userId);
  const gapAnalysis = useGapAnalysis(userId, adoptedRoadmapId.data, roadmap.data);
  const streak = useStudyStreak(userId);
  const weeklySessionCount = useWeeklySessionCount(userId);
  // Vocab review only makes sense for a goal that actually involves a
  // language (a pure language goal, or a hybrid like "German-speaking lead
  // architect") - see roadmap.targetLanguage, classified at generation time.
  const hasLanguageGoal = Boolean(roadmap.data?.targetLanguage);
  const dueVocabWordCount = useDueVocabWordCount(userId, hasLanguageGoal);
  const [isHandoffSheetVisible, setIsHandoffSheetVisible] = useState(false);
  const { refreshing, onRefresh } = usePullToRefresh();

  const displayName = session?.user.email?.split('@')[0] ?? '';
  const recommendation = roadmap.data ? deriveTodayRecommendation(roadmap.data.stages, focusStageLevel.data ?? null) : null;
  const totalStages = roadmap.data?.stages.length ?? 0;
  const currentStage = focusStageLevel.data ?? 1;
  // Falls back to the first stage if the focus level doesn't match any
  // stage (e.g. a stale focus pointer after the roadmap's stages changed),
  // rather than silently rendering a blank label.
  const currentStageLabel = roadmap.data ? ((roadmap.data.stages.find((s) => s.level === currentStage) ?? roadmap.data.stages[0])?.title ?? '') : '';
  // The real gap-analysis score (evidence-weighted skill coverage - see
  // gap-analysis.ts) once its handful of extra queries resolve; a
  // stage-completion estimate in the meantime so the dial doesn't sit at 0%
  // during that gap.
  const stageBasedPercent = totalStages > 0 ? Math.round(((currentStage - 1) / totalStages) * 100) : 0;
  const dialPercent = gapAnalysis.result ? gapAnalysis.result.gapPct : stageBasedPercent;
  // Same skill name can appear in multiple stages (e.g. a recurring "Git"
  // prerequisite) - dedupe so the hint doesn't burn its 3 slots on repeats.
  const missingSkillNames = Array.from(
    new Set(gapAnalysis.result?.skills.filter((skill) => skill.source === 'none').map((skill) => skill.name) ?? [])
  );

  useTodayWidgetSync(
    roadmap.data
      ? {
          goalTitle: roadmap.data.goal,
          progressLabel: t('today.dialLabel'),
          stageLabel: t('today.stageOfTotal', { stage: currentStage, total: totalStages }),
          streakLabel: t('today.streak', { count: streak.data ?? 0 }),
          percent: dialPercent,
        }
      : null
  );

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
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pri2} />}>
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
                {missingSkillNames.length > 0 && (
                  <ThemedText type="small" themeColor="textFaint" style={styles.gapHint}>
                    {t('today.gapHint', { skills: missingSkillNames.slice(0, 3).join(', ') })}
                  </ThemedText>
                )}
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
              ...(hasLanguageGoal
                ? [{ id: 'vocab-review', icon: '📚', label: t('today.quickStats.vocabReview', { count: dueVocabWordCount.data ?? 0 }) }]
                : []),
              { id: 'weekly-progress', icon: '🎯', label: t('today.quickStats.weeklyProgress', { count: weeklySessionCount.data ?? 0 }) },
            ]}
          />
        </ScrollView>
      </SafeAreaView>

      <CaptureFab onPress={() => router.push('/voice-capture')} />

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
  gapHint: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    marginTop: Spacing.five,
    marginBottom: Spacing.two + 2,
  },
});
