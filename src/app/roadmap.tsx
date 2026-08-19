import { Redirect, useRouter } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { BackHeader } from '@/components/navigation/BackHeader';
import { NoActiveRoadmapState } from '@/components/roadmap/NoActiveRoadmapState';
import { OtherGoalsList } from '@/components/roadmap/OtherGoalsList';
import { RoadmapActionsRow } from '@/components/roadmap/RoadmapActionsRow';
import { RoadmapEditForm } from '@/components/roadmap/RoadmapEditForm';
import { RoadmapHero } from '@/components/roadmap/RoadmapHero';
import { StageTimeline } from '@/components/roadmap/StageTimeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useDeleteRoadmap } from '@/hooks/roadmap/use-delete-roadmap';
import { useRegenerateRoadmap } from '@/hooks/roadmap/use-regenerate-roadmap';
import { useSwitchActiveRoadmap } from '@/hooks/roadmap/use-switch-active-roadmap';
import { useUserRoadmaps } from '@/hooks/roadmap/use-user-roadmaps';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

export default function RoadmapScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const colors = useTheme();
  const showToast = useToast();

  const { adoptedRoadmapId, roadmap, focusStageLevel, hasAdoptedRoadmap, isLoading, isError } = useActiveRoadmap(userId);
  const userRoadmaps = useUserRoadmaps(userId);
  const switchRoadmap = useSwitchActiveRoadmap(userId);
  const regenerateRoadmap = useRegenerateRoadmap(userId);
  const deleteRoadmap = useDeleteRoadmap(userId);
  const { refreshing, onRefresh } = usePullToRefresh();
  const [isEditing, setIsEditing] = useState(false);

  if (!session) return <Redirect href="/login" />;

  const handleSelectOtherGoal = (roadmapId: string) => {
    switchRoadmap.mutate(roadmapId, {
      onSuccess: () => showToast({ icon: Check, title: t('roadmap.switchedToastTitle') }),
      onError: () => Alert.alert(t('roadmap.errorGeneric')),
    });
  };

  const handleSaveEdit = (roadmapId: string, input: { goal: string; careerLevel: string }) => {
    regenerateRoadmap.mutate(
      { goalText: input.goal, careerLevel: input.careerLevel, locale: i18n.language, roadmapId },
      {
        onSuccess: () => {
          setIsEditing(false);
          showToast({ icon: Check, title: t('roadmap.regeneratedToastTitle') });
        },
        onError: () => Alert.alert(t('roadmap.errorGeneric')),
      }
    );
  };

  const handleDelete = (roadmapId: string) => {
    Alert.alert(t('roadmap.deleteConfirmTitle'), t('roadmap.deleteConfirmMessage'), [
      { text: t('roadmap.deleteCancel'), style: 'cancel' },
      {
        text: t('roadmap.deleteConfirm'),
        style: 'destructive',
        onPress: () =>
          deleteRoadmap.mutate(roadmapId, {
            onSuccess: () => showToast({ icon: Check, title: t('roadmap.deletedToastTitle') }),
            onError: () => Alert.alert(t('roadmap.deleteError')),
          }),
      },
    ]);
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pri2} />}>
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
              {isEditing ? (
                <RoadmapEditForm
                  goal={roadmap.data.goal}
                  careerLevel={roadmap.data.careerLevel}
                  goalLabel={t('roadmap.editGoalLabel')}
                  careerLevelLabel={t('roadmap.editCareerLevelLabel')}
                  saveLabel={t('roadmap.editSaveCta')}
                  cancelLabel={t('roadmap.editCancelCta')}
                  isSaving={regenerateRoadmap.isPending}
                  savingLabel={t('roadmap.editGenerating')}
                  onSave={(input) => handleSaveEdit(roadmap.data!.id, input)}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  <RoadmapHero
                    goal={roadmap.data.goal}
                    careerLevel={roadmap.data.careerLevel}
                    stageProgressLabel={t('roadmap.stageProgress', {
                      current: focusStageLevel.data ?? 1,
                      total: roadmap.data.stages.length,
                    })}
                  />
                  <RoadmapActionsRow
                    editLabel={t('roadmap.editCta')}
                    deleteLabel={t('roadmap.deleteCta')}
                    onPressEdit={() => setIsEditing(true)}
                    onPressDelete={() => handleDelete(roadmap.data!.id)}
                    disabled={deleteRoadmap.isPending}
                  />
                </>
              )}
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
            <NavRow icon={Plus} label={t('roadmap.addGoalCta')} onPress={() => router.push('/goal-setup')} />
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
