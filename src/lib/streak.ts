import { toDateString } from '@/lib/date';

/**
 * Consecutive-day streak ending today, given the set of dates (any order,
 * duplicates fine) a user has logged a session on. If today has no session
 * yet, counts back from yesterday instead of treating the streak as broken -
 * the day isn't over yet.
 */
export function computeStreakDays(sessionDates: string[], today: Date = new Date()): number {
  const dateSet = new Set(sessionDates);
  const cursor = new Date(today);

  if (!dateSet.has(toDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dateSet.has(toDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Longest run of consecutive days anywhere in the given dates, not just the
 * one ending today - for permanent "streak milestone" achievements, which
 * stay earned even after a later gap breaks the current streak (unlike
 * computeStreakDays, which is deliberately "as of right now").
 */
export function computeLongestStreakDays(sessionDates: string[]): number {
  const sorted = Array.from(new Set(sessionDates)).sort();
  if (sorted.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}
