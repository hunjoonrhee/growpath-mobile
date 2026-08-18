import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_CELEBRATED_DATE_KEY = 'growpath.lastCelebratedDate';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Shared "at most once a day" cap across every celebration trigger (roadmap
 * stage completion, streak milestones, ...) - per the mockup's spec
 * ("하루 최대 1회로 제한, 남발 금지"), the limit is on the celebration overlay
 * itself, not per-trigger, so a stage completing and a streak milestone
 * landing the same day only celebrates once.
 */
export async function canCelebrateToday(): Promise<boolean> {
  const last = await AsyncStorage.getItem(LAST_CELEBRATED_DATE_KEY);
  return last !== todayDateString();
}

export async function markCelebratedToday(): Promise<void> {
  await AsyncStorage.setItem(LAST_CELEBRATED_DATE_KEY, todayDateString());
}
