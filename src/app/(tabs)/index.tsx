import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { CompassDial } from '@/components/compass-dial';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CaptureFab } from '@/components/today/CaptureFab';
import { GreetingHeader } from '@/components/today/GreetingHeader';
import { QuickStatsRow } from '@/components/today/QuickStatsRow';
import { RecommendationCard } from '@/components/today/RecommendationCard';
import { StageProgressBar } from '@/components/today/StageProgressBar';
import { TimerHandoffSheet } from '@/components/today/TimerHandoffSheet';
import { Spacing } from '@/constants/theme';

// TODO(phase-3+): replace with real data from Supabase (active goal, gap %,
// today's recommendation) once auth + roadmap generation/switching land.
// Unlike the UI chrome around it (translated via src/locales/*.json), these
// values stand in for user/AI-generated content that will come from the DB,
// not static copy - so they're plain strings here, not i18n keys.
const MOCK_TODAY = {
  userName: 'Joon',
  streakDays: 12,
  gapPercent: 68,
  goalName: 'Lead Architekt 방향',
  goalSub: '저번달 대비 +3%',
  totalStages: 5,
  currentStage: 2,
  currentStageLabel: '상태관리 심화',
  recommendation: {
    domain: 'dev' as const,
    title: 'NgRx Effects 학습하기',
    description: '2단계 갭 스킬 중 우선순위 1위. 예상 25분, 끝나면 코드리뷰 모드로 바로 이어갈 수 있어요.',
  },
  quickStats: [
    { id: 'vocab-review', icon: '📚', label: '단어장 복습 · 7개' },
    { id: 'weekly-progress', icon: '🎯', label: '이번 주 3/5회' },
  ],
};

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isHandoffSheetVisible, setIsHandoffSheetVisible] = useState(false);

  const handleSelectWeb = () => {
    setIsHandoffSheetVisible(false);
    Alert.alert(t('today.webHandoffComingSoon'));
  };

  const handleSelectTimer = () => {
    setIsHandoffSheetVisible(false);
    router.push({ pathname: '/timer', params: { topic: MOCK_TODAY.recommendation.title } });
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GreetingHeader name={MOCK_TODAY.userName} streakDays={MOCK_TODAY.streakDays} />

        <Pressable
          style={styles.dialWrap}
          onPress={() => router.push('/roadmap')}
          accessibilityRole="button"
          accessibilityLabel={t('today.dialAccessibilityLabel')}>
          <CompassDial percent={MOCK_TODAY.gapPercent} label={t('today.dialLabel')} />
          <ThemedText type="smallBold" style={styles.goalName}>
            {MOCK_TODAY.goalName}
          </ThemedText>
          <ThemedText type="small" themeColor="textDim">
            {t('today.stageOfTotal', {
              stage: MOCK_TODAY.currentStage,
              total: MOCK_TODAY.totalStages,
              sub: MOCK_TODAY.goalSub,
            })}
          </ThemedText>
        </Pressable>

        <StageProgressBar
          totalStages={MOCK_TODAY.totalStages}
          currentStage={MOCK_TODAY.currentStage}
          currentStageLabel={MOCK_TODAY.currentStageLabel}
        />

        <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
          {t('today.recommendationTitle')}
        </ThemedText>
        <RecommendationCard
          domain={MOCK_TODAY.recommendation.domain}
          title={MOCK_TODAY.recommendation.title}
          description={MOCK_TODAY.recommendation.description}
          onPressCta={() => setIsHandoffSheetVisible(true)}
        />

        <QuickStatsRow stats={MOCK_TODAY.quickStats} />
      </ScrollView>

      {/* Icon/label imply voice capture specifically, so route this to the
          same "not ready yet" messaging as Log's voice button rather than
          silently opening the text-only manual entry flow instead. */}
      <CaptureFab onPress={() => Alert.alert(t('log.captureComingSoon'))} />

      <TimerHandoffSheet
        visible={isHandoffSheetVisible}
        onClose={() => setIsHandoffSheetVisible(false)}
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
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
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
