import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OtherGoalsList } from '@/components/roadmap/OtherGoalsList';
import { RoadmapHero } from '@/components/roadmap/RoadmapHero';
import { StageTimeline } from '@/components/roadmap/StageTimeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAdoptedRoadmapId } from '@/hooks/roadmap/use-adopted-roadmap-id';
import { useFocusStageLevel } from '@/hooks/roadmap/use-focus-stage-level';
import { useRoadmap } from '@/hooks/roadmap/use-roadmap';
import { useSwitchActiveRoadmap } from '@/hooks/roadmap/use-switch-active-roadmap';
import { useUserRoadmaps } from '@/hooks/roadmap/use-user-roadmaps';
import { useAuth } from '@/lib/auth-context';

export default function RoadmapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const adoptedRoadmapId = useAdoptedRoadmapId(userId);
  const roadmap = useRoadmap(adoptedRoadmapId.data);
  const focusStageLevel = useFocusStageLevel(adoptedRoadmapId.data);
  const userRoadmaps = useUserRoadmaps(userId);
  const switchRoadmap = useSwitchActiveRoadmap(userId);

  if (!session) return <Redirect href="/login" />;

  const handleSelectOtherGoal = (roadmapId: string) => {
    switchRoadmap.mutate(roadmapId, {
      onError: () => Alert.alert(t('roadmap.errorGeneric')),
    });
  };

  const hasAdoptedRoadmap = Boolean(adoptedRoadmapId.data);
  const isLoading =
    adoptedRoadmapId.isLoading || (hasAdoptedRoadmap && (roadmap.isLoading || focusStageLevel.isLoading));
  // userRoadmaps only feeds the secondary "other goals" list, so its own
  // failure shouldn't block rendering an already-loaded primary roadmap.
  // The last clause covers settings pointing at a roadmap row that no
  // longer exists (deleted/regenerated) - fetchRoadmap resolves to null
  // rather than erroring, so that alone wouldn't otherwise surface here.
  const isError =
    adoptedRoadmapId.isError ||
    roadmap.isError ||
    focusStageLevel.isError ||
    (hasAdoptedRoadmap && !roadmap.isLoading && !roadmap.data);
  const otherRoadmaps = (userRoadmaps.data ?? []).filter((item) => item.id !== adoptedRoadmapId.data);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.navHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('roadmap.backAccessibilityLabel')}
            onPress={() => router.back()}
            style={styles.backButton}>
            <ThemedText type="smallBold">←</ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
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

          {!isLoading && !isError && !hasAdoptedRoadmap && (
            <View style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.centerText}>
                {t('roadmap.emptyTitle')}
              </ThemedText>
              <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
                {t('roadmap.emptySubtitle')}
              </ThemedText>
            </View>
          )}

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
  navHeader: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two + 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surf2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  emptyState: {
    marginTop: Spacing.six,
    gap: Spacing.two,
  },
});
