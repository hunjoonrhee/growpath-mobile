import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { BackHeader } from '@/components/navigation/BackHeader';
import { NoActiveRoadmapState } from '@/components/roadmap/NoActiveRoadmapState';
import { OtherGoalsList } from '@/components/roadmap/OtherGoalsList';
import { RoadmapHero } from '@/components/roadmap/RoadmapHero';
import { StageTimeline } from '@/components/roadmap/StageTimeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useSwitchActiveRoadmap } from '@/hooks/roadmap/use-switch-active-roadmap';
import { useUserRoadmaps } from '@/hooks/roadmap/use-user-roadmaps';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useAuth } from '@/lib/auth-context';

export default function RoadmapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const { adoptedRoadmapId, roadmap, focusStageLevel, hasAdoptedRoadmap, isLoading, isError } = useActiveRoadmap(userId);
  const userRoadmaps = useUserRoadmaps(userId);
  const switchRoadmap = useSwitchActiveRoadmap(userId);
  const { refreshing, onRefresh } = usePullToRefresh();

  if (!session) return <Redirect href="/login" />;

  const handleSelectOtherGoal = (roadmapId: string) => {
    switchRoadmap.mutate(roadmapId, {
      onError: () => Alert.alert(t('roadmap.errorGeneric')),
    });
  };

  // userRoadmaps only feeds the secondary "other goals" list, so its own
  // failure shouldn't block rendering an already-loaded primary roadmap -
  // deliberately not folded into useActiveRoadmap's isError.
  const otherRoadmaps = (userRoadmaps.data ?? []).filter((item) => item.id !== adoptedRoadmapId.data);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('roadmap.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pri2} />}>
          {isLoading && (
            <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
              {t('roadmap.loading')}
            </ThemedText>
          )}

          {!isLoading && isError && (
            <ThemedText type="small" themeColor="amber" style={styles.centerText}>
              {t('roadmap.loadError')}
            </ThemedText>
          )}

          {!isLoading && !isError && !hasAdoptedRoadmap && <NoActiveRoadmapState onPressSetGoal={() => router.push('/goal-setup')} />}

          {!isLoading && !isError && roadmap.data && (
            <>
              <RoadmapHero
                goal={roadmap.data.goal}
                careerLevel={roadmap.data.careerLevel}
                stageProgressLabel={t('roadmap.stageProgress', {
                  current: focusStageLevel.data ?? 1,
                  total: roadmap.data.stages.length,
                })}
              />
              <StageTimeline stages={roadmap.data.stages} focusLevel={focusStageLevel.data ?? null} />
            </>
          )}

          <OtherGoalsList
            title={t('roadmap.otherGoalsTitle')}
            goals={otherRoadmaps}
            onSelect={handleSelectOtherGoal}
            isSwitching={switchRoadmap.isPending}
          />

          {/* NoActiveRoadmapState above already covers "no goal at all" with
              its own CTA - this is specifically for adding an *additional*
              goal once one exists, which had no entry point anywhere in the
              app (goal-setup was only reachable from the empty state). */}
          {!isLoading && !isError && hasAdoptedRoadmap && (
            <NavRow icon="➕" label={t('roadmap.addGoalCta')} onPress={() => router.push('/goal-setup')} />
          )}
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
    paddingBottom: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
});
