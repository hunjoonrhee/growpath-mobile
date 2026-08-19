import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'growpath.lastSeenRecordsCount';
const MILESTONES = [10, 50, 100];

function highestCrossedMilestone(previous: number, current: number): number | null {
  const crossed = MILESTONES.filter((milestone) => previous < milestone && milestone <= current);
  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}

/** Same shape as use-streak-milestone-detector.ts, applied to total logged session count instead of consecutive days - see BADGES_SPEC.md's records-10/50/100 badges. */
export function useRecordsMilestoneDetector(
  userId: string | undefined,
  totalSessionCount: number | null | undefined,
  onMilestoneReached: (milestone: number) => void
) {
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || totalSessionCount == null) return;
    const dedupeKey = `${userId}:${totalSessionCount}`;
    if (checkedRef.current === dedupeKey) return;
    checkedRef.current = dedupeKey;

    (async () => {
      const key = `${STORAGE_KEY_PREFIX}.${userId}`;
      const storedRaw = await AsyncStorage.getItem(key);
      const stored = storedRaw !== null ? Number(storedRaw) : null;

      if (stored !== null) {
        const milestone = highestCrossedMilestone(stored, totalSessionCount);
        if (milestone !== null) onMilestoneReached(milestone);
      }
      if (stored !== totalSessionCount) {
        await AsyncStorage.setItem(key, String(totalSessionCount));
      }
    })();
  }, [userId, totalSessionCount, onMilestoneReached]);
}
