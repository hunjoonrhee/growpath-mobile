import { useEffect, useRef } from 'react';

import { formatElapsedSeconds } from '@/lib/date';
import StudyTimerActivity from '@/widgets/StudyTimerActivity';

export type StudyTimerActivityStatus = 'running' | 'paused';

export type UseStudyTimerActivityInput = {
  topic: string;
  status: StudyTimerActivityStatus;
  elapsedSeconds: number;
  statusLabel: string;
};

/**
 * Starts a Lock Screen / Dynamic Island Live Activity when the timer screen
 * mounts, keeps it in sync with pause/resume, and ends it on unmount
 * (finish or back-navigation both unmount this screen, so one cleanup path
 * covers both). Live Activities are best-effort - a device with them
 * disabled, or a simulator that doesn't support them, shouldn't block the
 * timer itself, so every call is wrapped in try/catch with a console.warn.
 */
export function useStudyTimerActivity({ topic, status, elapsedSeconds, statusLabel }: UseStudyTimerActivityInput): void {
  const activityRef = useRef<ReturnType<typeof StudyTimerActivity.start> | null>(null);
  // Mirrors the values the running effects below need, so the unmount-only
  // cleanup effect (empty deps) can still read the *latest* elapsed/status
  // instead of whatever they were on first mount.
  const latestRef = useRef({ elapsedSeconds, statusLabel });
  useEffect(() => {
    latestRef.current = { elapsedSeconds, statusLabel };
  });

  useEffect(() => {
    try {
      activityRef.current = StudyTimerActivity.start({
        topic,
        statusLabel,
        isPaused: status === 'paused',
        virtualStartEpochMs: Date.now() - elapsedSeconds * 1000,
        pausedElapsedLabel: formatElapsedSeconds(elapsedSeconds),
      });
    } catch (error) {
      console.warn('Could not start Live Activity', error);
    }
    return () => {
      // .end() returns a Promise - a synchronous try/catch around the call
      // only catches failures in building the call itself, not an
      // asynchronous rejection from the native side, so that needs its own
      // .catch() to actually reach the console.warn this comment promises.
      try {
        activityRef.current
          ?.end('default', {
            topic,
            statusLabel: latestRef.current.statusLabel,
            isPaused: true,
            virtualStartEpochMs: Date.now(),
            pausedElapsedLabel: formatElapsedSeconds(latestRef.current.elapsedSeconds),
          })
          .catch((error) => console.warn('Could not end Live Activity', error));
      } catch (error) {
        console.warn('Could not end Live Activity', error);
      }
      activityRef.current = null;
    };
    // Runs once per screen instance - start()/end() bracket the whole
    // session, updates while it's running go through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    // The mount effect above already sends this exact state via start() -
    // skip the redundant first update() so status changes don't double-send.
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    if (!activityRef.current) return;
    // .update() returns a Promise - see the matching note in the cleanup
    // above, the .catch() is what actually reaches this console.warn.
    try {
      activityRef.current
        .update({
          topic,
          statusLabel,
          isPaused: status === 'paused',
          virtualStartEpochMs: Date.now() - elapsedSeconds * 1000,
          pausedElapsedLabel: formatElapsedSeconds(elapsedSeconds),
        })
        .catch((error) => console.warn('Could not update Live Activity', error));
    } catch (error) {
      console.warn('Could not update Live Activity', error);
    }
    // Only status transitions (not every elapsedSeconds tick) should push an
    // update - virtualStartEpochMs already makes the Lock Screen clock
    // self-updating while running, so re-sending it every second would just
    // be redundant work for no visual difference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, statusLabel, topic]);
}
