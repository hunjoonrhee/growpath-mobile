import { useEffect } from 'react';

import TodayProgressWidget from '@/widgets/TodayProgressWidget';

export type TodayWidgetSyncInput = {
  goalTitle: string;
  progressLabel: string;
  stageLabel: string;
  streakLabel: string;
  percent: number;
};

/**
 * Pushes the Today tab's already-loaded data into the home screen widget's
 * snapshot whenever it changes. Only called once a roadmap is actually
 * adopted - the widget keeps showing its last snapshot rather than being
 * cleared while the user has no active goal. Takes primitive fields (not one
 * object) so the effect only re-fires when a value actually changes, not on
 * every render of a caller that builds a fresh object literal each time.
 */
export function useTodayWidgetSync(input: TodayWidgetSyncInput | null): void {
  const goalTitle = input?.goalTitle;
  const progressLabel = input?.progressLabel;
  const stageLabel = input?.stageLabel;
  const streakLabel = input?.streakLabel;
  const percent = input?.percent;

  useEffect(() => {
    if (goalTitle === undefined || progressLabel === undefined || stageLabel === undefined || streakLabel === undefined || percent === undefined) {
      return;
    }
    TodayProgressWidget.updateSnapshot({ goalTitle, progressLabel, stageLabel, streakLabel, percent });
  }, [goalTitle, progressLabel, stageLabel, streakLabel, percent]);
}
