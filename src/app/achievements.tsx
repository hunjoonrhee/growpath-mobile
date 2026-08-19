import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AchievementSection } from '@/components/achievements/AchievementSection';
import { getBadgeCelebrationContent } from '@/components/achievements/badge-celebration-content';
import { BADGES, type BadgeMeta } from '@/components/achievements/badge-registry';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAchievementStats } from '@/hooks/achievements/use-achievement-stats';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useCelebration } from '@/hooks/use-celebration';
import { useAuth } from '@/lib/auth-context';
import { computeUnlockedBadges, type BadgeId } from '@/lib/achievements';
import { formatShortDate } from '@/lib/date';

export default function AchievementsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const { roadmap, focusStageLevel } = useActiveRoadmap(userId);
  const totalStages = roadmap.data?.stages.length ?? null;
  const stats = useAchievementStats(userId, focusStageLevel.data, totalStages);
  const showCelebration = useCelebration();

  if (!session) return <Redirect href="/login" />;

  const unlocked = stats.data ? computeUnlockedBadges(stats.data) : null;
  const unlockedCount = unlocked ? Object.values(unlocked).filter(Boolean).length : 0;

  const labelFor = (badge: BadgeMeta) => t(`achievements.badges.${badge.labelKey}`);

  const detailFor = (badge: BadgeMeta): string | undefined => {
    if (!stats.data) return undefined;
    switch (badge.id) {
      case 'pr-longest-session':
        return stats.data.longestSessionMinutes !== null && stats.data.longestSessionDate !== null
          ? t('achievements.detail.longestSession', {
              minutes: stats.data.longestSessionMinutes,
              date: formatShortDate(stats.data.longestSessionDate, i18n.language),
            })
          : undefined;
      case 'pr-pronunciation':
        return stats.data.bestPronunciationScore !== null && stats.data.bestPronunciationDate !== null
          ? t('achievements.detail.pronunciation', {
              score: Math.round(stats.data.bestPronunciationScore),
              date: formatShortDate(stats.data.bestPronunciationDate, i18n.language),
            })
          : undefined;
      case 'pr-saved-words':
        return t('achievements.detail.savedWords', { count: stats.data.savedVocabWordCount });
      default:
        return undefined;
    }
  };

  const badgesBySection = (section: BadgeMeta['section']) => BADGES.filter((badge) => badge.section === section);

  // Only ever called for an unlocked badge (see AchievementBadge - locked
  // ones aren't pressable), but stats.data could theoretically still be
  // missing content for it (e.g. the PR badges' null-guard in
  // getBadgeCelebrationContent) - silently do nothing rather than show a
  // broken celebration.
  const handlePressBadge = (badge: BadgeMeta) => {
    if (!stats.data) return;
    const content = getBadgeCelebrationContent(badge.id, stats.data, t);
    if (!content) return;
    showCelebration({
      ...content,
      primaryLabel: t('celebration.previewCloseCta'),
      onPrimary: () => {},
    });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('achievements.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('achievements.title')}
          </ThemedText>

          {stats.isLoading && (
            <ThemedText type="small" themeColor="textDim">
              {t('achievements.loading')}
            </ThemedText>
          )}

          {!stats.isLoading && stats.isError && (
            <ThemedText type="small" themeColor="amber">
              {t('achievements.loadError')}
            </ThemedText>
          )}

          {unlocked && (
            <>
              <ThemedText type="small" themeColor="textDim" style={styles.count}>
                {t('achievements.unlockedCount', { unlocked: unlockedCount, total: BADGES.length })}
              </ThemedText>

              <AchievementSection
                title={t('achievements.sections.milestone')}
                badges={badgesBySection('milestone')}
                unlocked={unlocked as Record<BadgeId, boolean>}
                labelFor={labelFor}
                detailFor={detailFor}
                onPressBadge={handlePressBadge}
              />
              <AchievementSection
                title={t('achievements.sections.personalRecord')}
                badges={badgesBySection('personalRecord')}
                unlocked={unlocked as Record<BadgeId, boolean>}
                labelFor={labelFor}
                detailFor={detailFor}
                onPressBadge={handlePressBadge}
              />
              <AchievementSection
                title={t('achievements.sections.goal')}
                badges={badgesBySection('goal')}
                unlocked={unlocked as Record<BadgeId, boolean>}
                labelFor={labelFor}
                detailFor={detailFor}
                onPressBadge={handlePressBadge}
              />
            </>
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
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  count: {
    marginTop: Spacing.one,
  },
});
