import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'growpath.lastSeenStudyHours';
const MILESTONES = [10, 50, 100];

function highestCrossedMilestone(previous: number, current: number): number | null {
  const crossed = MILESTONES.filter((milestone) => previous < milestone && milestone <= current);
  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}

/** Same shape as use-streak-milestone-detector.ts, applied to cumulative study hours (whole hours, floored) - see BADGES_SPEC.md's hours-10/50/100 badges. */
export function useHoursMilestoneDetector(
  userId: string | undefined,
  totalStudyHours: number | null | undefined,
  onMilestoneReached: (milestone: number) => void
) {
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || totalStudyHours == null) return;
    const dedupeKey = `${userId}:${totalStudyHours}`;
    if (checkedRef.current === dedupeKey) return;
    checkedRef.current = dedupeKey;

    (async () => {
      const key = `${STORAGE_KEY_PREFIX}.${userId}`;
      const storedRaw = await AsyncStorage.getItem(key);
      const stored = storedRaw !== null ? Number(storedRaw) : null;

      if (stored !== null) {
        const milestone = highestCrossedMilestone(stored, totalStudyHours);
        if (milestone !== null) onMilestoneReached(milestone);
      }
      if (stored !== totalStudyHours) {
        await AsyncStorage.setItem(key, String(totalStudyHours));
      }
    })();
  }, [userId, totalStudyHours, onMilestoneReached]);
}
