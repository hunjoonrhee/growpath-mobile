export type BadgeId =
  | 'streak-3-green'
  | 'streak-7-green'
  | 'streak-30-gold'
  | 'streak-100-purple'
  | 'records-10-green'
  | 'records-50-gold'
  | 'records-100-purple'
  | 'hours-10-green'
  | 'hours-50-gold'
  | 'hours-100-purple'
  | 'pr-longest-session'
  | 'pr-pronunciation'
  | 'pr-saved-words'
  | 'goal-stage-complete'
  | 'goal-roadmap-100';

export type AchievementStats = {
  /** Longest run of consecutive study days ever, not just the current one - see computeLongestStreakDays. A milestone stays earned even after a later gap breaks the live streak. */
  longestStreakEver: number;
  totalSessionCount: number;
  totalStudyMinutes: number;
  longestSessionMinutes: number | null;
  longestSessionDate: string | null;
  bestPronunciationScore: number | null;
  bestPronunciationDate: string | null;
  savedVocabWordCount: number;
  /** From the currently adopted roadmap only - a switched-away-from or deleted roadmap's progress isn't tracked here, same simplification the rest of the app makes for "current stage". */
  currentStageLevel: number | null;
  totalStages: number | null;
};

const HOURS_TO_MINUTES = 60;

/**
 * Records/hours/pr/goal badges unlock off cumulative or max-so-far stats,
 * which can only go up (deletions aside) - so "unlocked" is just "stat
 * meets threshold right now", no separate history tracking needed. Streak
 * is the one exception (a live streak can reset), which is why it's fed
 * longestStreakEver instead of the current streak.
 */
export function computeUnlockedBadges(stats: AchievementStats): Record<BadgeId, boolean> {
  return {
    'streak-3-green': stats.longestStreakEver >= 3,
    'streak-7-green': stats.longestStreakEver >= 7,
    'streak-30-gold': stats.longestStreakEver >= 30,
    'streak-100-purple': stats.longestStreakEver >= 100,
    'records-10-green': stats.totalSessionCount >= 10,
    'records-50-gold': stats.totalSessionCount >= 50,
    'records-100-purple': stats.totalSessionCount >= 100,
    'hours-10-green': stats.totalStudyMinutes >= 10 * HOURS_TO_MINUTES,
    'hours-50-gold': stats.totalStudyMinutes >= 50 * HOURS_TO_MINUTES,
    'hours-100-purple': stats.totalStudyMinutes >= 100 * HOURS_TO_MINUTES,
    'pr-longest-session': stats.longestSessionMinutes !== null,
    'pr-pronunciation': stats.bestPronunciationScore !== null,
    'pr-saved-words': stats.savedVocabWordCount > 0,
    'goal-stage-complete': (stats.currentStageLevel ?? 0) > 1,
    'goal-roadmap-100': stats.currentStageLevel !== null && stats.totalStages !== null && stats.currentStageLevel >= stats.totalStages,
  };
}
