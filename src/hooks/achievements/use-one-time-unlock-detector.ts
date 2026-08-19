import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

/**
 * Fires exactly once, the first time `isUnlocked` is seen true for
 * `storageKey`, and never again after - for achievements that are a single
 * yes/no crossing rather than a repeatable milestone or improvable record
 * (saving your first vocab word, finishing a roadmap). Unlike the other
 * detectors here, there's no "current value" to keep re-storing on every
 * check - once true and recorded, this is permanently done.
 */
export function useOneTimeUnlockDetector(storageKey: string | null, isUnlocked: boolean, onUnlocked: () => void) {
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!storageKey || !isUnlocked) return;
    if (checkedRef.current === storageKey) return;
    checkedRef.current = storageKey;

    (async () => {
      const already = await AsyncStorage.getItem(storageKey);
      if (already === null) {
        onUnlocked();
        await AsyncStorage.setItem(storageKey, '1');
      }
    })();
  }, [storageKey, isUnlocked, onUnlocked]);
}
