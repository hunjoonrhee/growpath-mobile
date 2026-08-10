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
