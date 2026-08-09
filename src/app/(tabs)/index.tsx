import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CompassDial } from '@/components/compass-dial';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CaptureFab } from '@/components/today/CaptureFab';
import { GreetingHeader } from '@/components/today/GreetingHeader';
import { QuickStatsRow } from '@/components/today/QuickStatsRow';
import { RecommendationCard } from '@/components/today/RecommendationCard';
import { StageProgressBar } from '@/components/today/StageProgressBar';
import { Spacing } from '@/constants/theme';

// TODO(phase-3+): replace with real data from Supabase (active goal, gap %,
// today's recommendation) once auth + roadmap generation/switching land.
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
    { icon: '📚', label: '단어장 복습 · 7개' },
    { icon: '🎯', label: '이번 주 3/5회' },
  ],
};

export default function TodayScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GreetingHeader name={MOCK_TODAY.userName} streakDays={MOCK_TODAY.streakDays} />

        <Pressable
          style={styles.dialWrap}
          // TODO(phase-3): navigate to /roadmap once that route exists.
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="로드맵 화면으로 이동">
          <CompassDial percent={MOCK_TODAY.gapPercent} label="갭분석 · 탭해서 로드맵 보기" />
          <ThemedText type="smallBold" style={styles.goalName}>
            {MOCK_TODAY.goalName}
          </ThemedText>
          <ThemedText type="small" themeColor="textDim">
            {MOCK_TODAY.currentStage}단계 / {MOCK_TODAY.totalStages}단계 · {MOCK_TODAY.goalSub}
          </ThemedText>
        </Pressable>

        <StageProgressBar
          totalStages={MOCK_TODAY.totalStages}
          currentStage={MOCK_TODAY.currentStage}
          currentStageLabel={MOCK_TODAY.currentStageLabel}
        />

        <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
          오늘 추천
        </ThemedText>
        <RecommendationCard
          domain={MOCK_TODAY.recommendation.domain}
          title={MOCK_TODAY.recommendation.title}
          description={MOCK_TODAY.recommendation.description}
          ctaLabel="시작하기"
          // TODO(phase-4): open the timer/web-handoff bottom sheet.
          onPressCta={() => {}}
        />

        <QuickStatsRow stats={MOCK_TODAY.quickStats} />
      </ScrollView>

      <CaptureFab
        // TODO(phase-4): open the voice capture flow.
        onPress={() => {}}
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
