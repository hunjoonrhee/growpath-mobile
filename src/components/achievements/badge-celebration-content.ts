import { getBadgeImage } from '@/components/achievements/badge-registry';
import type { AchievementStats, BadgeId } from '@/lib/achievements';
import type { CelebrationColorTheme } from '@/lib/celebration-context';

export type BadgeCelebrationContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  colorTheme: CelebrationColorTheme;
  percent?: number;
  centerIcon: number;
};

const STREAK_THRESHOLDS: Partial<Record<BadgeId, number>> = {
  'streak-3-green': 3,
  'streak-7-green': 7,
  'streak-30-gold': 30,
  'streak-100-purple': 100,
};
const RECORDS_THRESHOLDS: Partial<Record<BadgeId, number>> = {
  'records-10-green': 10,
  'records-50-gold': 50,
  'records-100-purple': 100,
};
const HOURS_THRESHOLDS: Partial<Record<BadgeId, number>> = {
  'hours-10-green': 10,
  'hours-50-gold': 50,
  'hours-100-purple': 100,
};

function tierFor(threshold: number, purpleAt: number, goldAt: number): CelebrationColorTheme {
  return threshold >= purpleAt ? 'purple' : threshold >= goldAt ? 'gold' : 'green';
}

/**
 * Preview content for tapping an already-unlocked badge on the Achievements
 * screen - reuses the same celebration copy the live detectors show (see
 * index.tsx's handle* callbacks), fed with the badge's own fixed threshold
 * for milestone badges (its identity never changes, so this is always
 * accurate) or the current all-time-best stat for personal records. Not
 * the exact historical value that triggered the *original* unlock, which
 * isn't tracked anywhere - a reasonable stand-in for a replay.
 *
 * Returns null for a personal-record badge whose stat isn't actually
 * present yet - shouldn't happen for a badge the caller already confirmed
 * unlocked, but keeps this honest about what it needs rather than
 * rendering a celebration with a blank value.
 */
export function getBadgeCelebrationContent(
  badgeId: BadgeId,
  stats: AchievementStats,
  t: (key: string, options?: Record<string, unknown>) => string
): BadgeCelebrationContent | null {
  if (badgeId in STREAK_THRESHOLDS) {
    const count = STREAK_THRESHOLDS[badgeId] as number;
    return {
      eyebrow: t('celebration.streakMilestone.eyebrow'),
      title: t('celebration.streakMilestone.title', { count }),
      subtitle: t('celebration.streakMilestone.subtitle', { count }),
      colorTheme: tierFor(count, 100, 30),
      centerIcon: getBadgeImage(badgeId),
    };
  }
  if (badgeId in RECORDS_THRESHOLDS) {
    const count = RECORDS_THRESHOLDS[badgeId] as number;
    return {
      eyebrow: t('celebration.recordsMilestone.eyebrow'),
      title: t('celebration.recordsMilestone.title', { count }),
      subtitle: t('celebration.recordsMilestone.subtitle'),
      colorTheme: tierFor(count, 100, 50),
      centerIcon: getBadgeImage(badgeId),
    };
  }
  if (badgeId in HOURS_THRESHOLDS) {
    const count = HOURS_THRESHOLDS[badgeId] as number;
    return {
      eyebrow: t('celebration.hoursMilestone.eyebrow'),
      title: t('celebration.hoursMilestone.title', { count }),
      subtitle: t('celebration.hoursMilestone.subtitle'),
      colorTheme: tierFor(count, 100, 50),
      centerIcon: getBadgeImage(badgeId),
    };
  }

  switch (badgeId) {
    case 'pr-longest-session':
      if (stats.longestSessionMinutes === null) return null;
      return {
        eyebrow: t('celebration.prLongestSession.eyebrow'),
        title: t('celebration.prLongestSession.title'),
        subtitle: t('celebration.prLongestSession.subtitle', { minutes: stats.longestSessionMinutes }),
        colorTheme: 'gold',
        centerIcon: getBadgeImage(badgeId),
      };
    case 'pr-pronunciation':
      if (stats.bestPronunciationScore === null) return null;
      return {
        eyebrow: t('celebration.prPronunciation.eyebrow'),
        title: t('celebration.prPronunciation.title'),
        subtitle: t('celebration.prPronunciation.subtitle', { score: Math.round(stats.bestPronunciationScore) }),
        colorTheme: 'gold',
        centerIcon: getBadgeImage(badgeId),
      };
    case 'pr-saved-words':
      // Not celebration.prSavedWords - that copy ("you saved your first
      // word!") is only true the one time the live detector fires it. A
      // preview tap happens long after, with many more words saved by
      // then, so it needs its own copy built around the current count.
      return {
        eyebrow: t('celebration.prSavedWords.eyebrow'),
        title: t('achievements.badgePreview.savedWordsTitle'),
        subtitle: t('achievements.badgePreview.savedWordsSubtitle', { count: stats.savedVocabWordCount }),
        colorTheme: 'gold',
        centerIcon: getBadgeImage(badgeId),
      };
    case 'goal-stage-complete':
      // No specific stage name here (unlike the live celebration) - which
      // stage originally crossed this isn't tracked historically, only
      // "currentStageLevel > 1" is, so the preview uses generic phrasing
      // instead of interpolating a blank/wrong stage title.
      return {
        eyebrow: t('celebration.stageComplete.eyebrow'),
        title: t('achievements.badgePreview.stageCompleteTitle'),
        subtitle: t('celebration.stageComplete.subtitle'),
        colorTheme: 'purple',
        centerIcon: getBadgeImage(badgeId),
      };
    case 'goal-roadmap-100':
      return {
        eyebrow: t('celebration.roadmapComplete.eyebrow'),
        title: t('celebration.roadmapComplete.title'),
        subtitle: t('celebration.roadmapComplete.subtitle'),
        percent: 100,
        colorTheme: 'purple',
        centerIcon: getBadgeImage(badgeId),
      };
    default:
      return null;
  }
}
