import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'growpath.lastSeenStreak';
// Matches the mockup's spec: "스트릭 마일스톤(3·7·30·100일)".
const MILESTONES = [3, 7, 30, 100];

function highestCrossedMilestone(previous: number, current: number): number | null {
  const crossed = MILESTONES.filter((milestone) => previous < milestone && milestone <= current);
  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}

/**
 * Detects a study streak crossing one of the milestone thresholds since the
 * last time this ran. Unlike roadmap stage completion, streak has no
 * separate "did it actually change" server signal to lean on - useStudyStreak
 * recomputes it fresh from session dates on every load - so this just
 * remembers the last value it saw (per user, in AsyncStorage) and compares.
 *
 * A reset to 0 (a missed day) is recorded too, not skipped - crossing the
 * same milestone again after rebuilding a broken streak celebrates again,
 * the same way it did the first time.
 */
export function useStreakMilestoneDetector(
  userId: string | undefined,
  currentStreak: number | null | undefined,
  onMilestoneReached: (milestone: number) => void
) {
  // Dedupes against effect re-runs from an unstable onMilestoneReached
  // reference - the async body below has no other guard against firing
  // twice for the same (userId, currentStreak) pair.
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || currentStreak == null) return;
    const dedupeKey = `${userId}:${currentStreak}`;
    if (checkedRef.current === dedupeKey) return;
    checkedRef.current = dedupeKey;

    (async () => {
      const key = `${STORAGE_KEY_PREFIX}.${userId}`;
      const storedRaw = await AsyncStorage.getItem(key);
      const stored = storedRaw !== null ? Number(storedRaw) : null;

      if (stored !== null) {
        const milestone = highestCrossedMilestone(stored, currentStreak);
        if (milestone !== null) onMilestoneReached(milestone);
      }
      if (stored !== currentStreak) {
        await AsyncStorage.setItem(key, String(currentStreak));
      }
    })();
  }, [userId, currentStreak, onMilestoneReached]);
}
