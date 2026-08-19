import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

/**
 * Fires whenever `currentValue` beats the previous best seen for
 * `storageKey` - unlike the milestone detectors (fixed thresholds), a
 * personal record has no threshold list, any increase counts. Generic
 * across both personal-record badges (longest session minutes,
 * pronunciation score) since the comparison logic doesn't depend on what
 * the number represents.
 */
export function useNewRecordDetector(
  storageKey: string | null,
  currentValue: number | null | undefined,
  onNewRecord: (value: number) => void
) {
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!storageKey || currentValue == null) return;
    const dedupeKey = `${storageKey}:${currentValue}`;
    if (checkedRef.current === dedupeKey) return;
    checkedRef.current = dedupeKey;

    (async () => {
      const storedRaw = await AsyncStorage.getItem(storageKey);
      const stored = storedRaw !== null ? Number(storedRaw) : null;

      if (stored !== null && currentValue > stored) onNewRecord(currentValue);
      if (stored !== currentValue) {
        await AsyncStorage.setItem(storageKey, String(currentValue));
      }
    })();
  }, [storageKey, currentValue, onNewRecord]);
}
