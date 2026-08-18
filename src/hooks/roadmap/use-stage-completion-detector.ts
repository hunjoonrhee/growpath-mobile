import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

function storageKey(roadmapId: string): string {
  return `growpath.lastSeenStageLevel.${roadmapId}`;
}

/**
 * Detects a roadmap's focus stage advancing since the last time this ran -
 * there's no server-side "stage completed" event to listen for (is_focus/
 * stage_level are set by joon-dashboard's recommendation logic, not this
 * app), so this infers it by comparing the current level against the last
 * one it saw for this roadmapId, persisted in AsyncStorage.
 *
 * Fires onStageCompleted with the level that was just left behind - not the
 * new one, which the caller already has as currentStageLevel. The first
 * time it ever sees a given roadmapId, it just records a baseline and does
 * NOT fire (nothing to compare against, and firing on first load would read
 * as a false positive for a goal the user just adopted).
 */
export function useStageCompletionDetector(
  roadmapId: string | null | undefined,
  currentStageLevel: number | null | undefined,
  onStageCompleted: (completedStageLevel: number) => void
) {
  // Dedupes against effect re-runs from an unstable onStageCompleted
  // reference, not just StrictMode/dev double-invoke - the async body below
  // has no other guard against firing twice for the same transition.
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roadmapId || currentStageLevel == null) return;
    const dedupeKey = `${roadmapId}:${currentStageLevel}`;
    if (checkedRef.current === dedupeKey) return;
    checkedRef.current = dedupeKey;

    (async () => {
      const key = storageKey(roadmapId);
      const storedRaw = await AsyncStorage.getItem(key);
      const stored = storedRaw !== null ? Number(storedRaw) : null;

      if (stored !== null && currentStageLevel > stored) {
        onStageCompleted(stored);
      }
      if (stored !== currentStageLevel) {
        await AsyncStorage.setItem(key, String(currentStageLevel));
      }
    })();
  }, [roadmapId, currentStageLevel, onStageCompleted]);
}
