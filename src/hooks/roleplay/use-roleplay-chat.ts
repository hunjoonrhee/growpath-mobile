import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { invalidateSessionQueries } from '@/hooks/sessions/use-create-session';
import { useSubmitGuard } from '@/hooks/use-submit-guard';
import { fetchAdoptedRoadmapId } from '@/lib/roadmap';
import {
  endRoleplaySession,
  saveRoleplayTilEntry,
  saveRoleplayTranscript,
  sendRoleplayTurn,
  startRoleplayTurn,
  RoleplayUnavailableError,
  type ChatMessage,
  type RoleplaySummary,
} from '@/lib/roleplay';

export type UseRoleplayChatInput = {
  userId: string;
  topic: string;
  language: string;
  goal: string;
  careerLevel: string;
  locale: string;
};

/** 'unavailable' means retrying won't help (missing config, expired session, no summary) - 'transient' means it might (network blip, 5xx). */
export type RoleplayErrorKind = 'unavailable' | 'transient';

function classifyError(error: unknown): RoleplayErrorKind {
  return error instanceof RoleplayUnavailableError ? 'unavailable' : 'transient';
}

type EndProgress = {
  summary: RoleplaySummary;
  // Fetched separately from the summary (see endSession) and tracked as its
  // own step, so a failure fetching it can't discard an already-generated
  // summary and force a redundant, possibly-inconsistent re-summarization.
  roadmapId: string | null;
  roadmapIdFetched: boolean;
  transcriptSaved: boolean;
  tilSaved: boolean;
};

/** Which operation retry() should resume - set alongside errorKind so retry doesn't have to guess from message-array shape (which is ambiguous once ending is involved). */
type FailedOperation = 'start' | 'send' | 'end' | null;

export function useRoleplayChat({ userId, topic, language, goal, careerLevel, locale }: UseRoleplayChatInput) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStarting, setIsStarting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [summary, setSummary] = useState<RoleplaySummary | null>(null);
  const [errorKind, setErrorKind] = useState<RoleplayErrorKind | null>(null);
  const failedOpRef = useRef<FailedOperation>(null);
  // start() is triggered from a useEffect keyed on the caller's own loading
  // state, which can legitimately re-run - this guards against firing a
  // second opening turn (and a second API call) if that happens. Reset only
  // by retry() below, so a genuine failure can still be retried.
  const hasStartedRef = useRef(false);
  // endSession() can be retried after a partial failure (e.g. the TIL save
  // fails after the transcript save already succeeded) - this caches which
  // steps already completed so a retry doesn't re-summarize (wasting Gemini
  // quota and risking a different summary each time) or re-insert a
  // duplicate row into a table with no unique constraint to catch it.
  const endProgressRef = useRef<EndProgress | null>(null);
  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const sendGuard = useSubmitGuard();
  const endGuard = useSubmitGuard();
  const retryGuard = useSubmitGuard();

  // Shared by sendMessage and retry's "resend the last reply" path - both
  // just need a model reply for a given history, they differ only in
  // whether a new user message needs appending first.
  const requestReply = useCallback(
    async (history: ChatMessage[]) => {
      setIsSending(true);
      setErrorKind(null);
      try {
        const reply = await sendRoleplayTurn(topic, history, { goal, careerLevel }, locale, language);
        if (!isMountedRef.current) return;
        setMessages((current) => [...current, { role: 'model', text: reply }]);
      } catch (error) {
        if (!isMountedRef.current) return;
        failedOpRef.current = 'send';
        setErrorKind(classifyError(error));
      } finally {
        if (isMountedRef.current) setIsSending(false);
      }
    },
    [topic, goal, careerLevel, locale, language]
  );

  const start = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsStarting(true);
    setErrorKind(null);
    try {
      const reply = await startRoleplayTurn(topic, { goal, careerLevel }, locale, language);
      if (!isMountedRef.current) return;
      setMessages([{ role: 'model', text: reply }]);
    } catch (error) {
      if (!isMountedRef.current) return;
      failedOpRef.current = 'start';
      setErrorKind(classifyError(error));
    } finally {
      if (isMountedRef.current) setIsStarting(false);
    }
  }, [topic, goal, careerLevel, locale, language]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!sendGuard.tryStart()) return;
      const next: ChatMessage[] = [...messages, { role: 'user', text }];
      setMessages(next);
      try {
        await requestReply(next);
      } finally {
        sendGuard.release();
      }
    },
    [messages, requestReply, sendGuard]
  );

  const endSession = useCallback(async () => {
    if (!endGuard.tryStart()) return;
    setIsEnding(true);
    setErrorKind(null);
    try {
      if (!endProgressRef.current) {
        const summaryResult = await endRoleplaySession(topic, messages, { goal, careerLevel }, locale, language);
        endProgressRef.current = { summary: summaryResult, roadmapId: null, roadmapIdFetched: false, transcriptSaved: false, tilSaved: false };
      }
      const progress = endProgressRef.current;

      if (!progress.roadmapIdFetched) {
        progress.roadmapId = await fetchAdoptedRoadmapId(userId);
        progress.roadmapIdFetched = true;
      }

      // Independent writes to different tables - run concurrently rather
      // than one-after-another. Each still only fires if its own step
      // hasn't completed yet, so a retry after a partial failure doesn't
      // redo (or double-insert) whichever one already succeeded. Each also
      // invalidates immediately on its own success (rather than once after
      // Promise.all settles), so a partial failure - one write persisted,
      // the other didn't - still refreshes the Log tab for the row that's
      // actually there instead of leaving it stale until an unrelated
      // invalidation happens to fire later.
      await Promise.all([
        progress.transcriptSaved
          ? undefined
          : saveRoleplayTranscript({
              userId,
              roadmapId: progress.roadmapId,
              scenario: topic,
              language,
              messages,
              summary: progress.summary,
            }).then(() => {
              progress.transcriptSaved = true;
              invalidateSessionQueries(queryClient, userId);
            }),
        progress.tilSaved
          ? undefined
          : saveRoleplayTilEntry({ userId, scenario: topic, summary: progress.summary }).then(() => {
              progress.tilSaved = true;
              invalidateSessionQueries(queryClient, userId);
            }),
      ]);

      if (!isMountedRef.current) return;
      setSummary(progress.summary);
    } catch (error) {
      if (!isMountedRef.current) return;
      failedOpRef.current = 'end';
      setErrorKind(classifyError(error));
    } finally {
      endGuard.release();
      if (isMountedRef.current) setIsEnding(false);
    }
  }, [topic, messages, goal, careerLevel, locale, userId, language, queryClient, endGuard]);

  // Dispatches to whichever operation actually failed, tracked via
  // failedOpRef rather than inferred from messages/summary shape - end can
  // fail with the last message still being the model's (the common case),
  // which is indistinguishable from "nothing has failed yet" by shape alone.
  // Guarded on its own: the 'start' branch resets hasStartedRef so start()
  // can run again, which means start()'s own re-entry guard can't protect
  // against two overlapping taps of this function itself.
  const retry = useCallback(async () => {
    if (!retryGuard.tryStart()) return;
    setErrorKind(null);
    try {
      const failedOp = failedOpRef.current;
      if (failedOp === 'start') {
        hasStartedRef.current = false;
        await start();
      } else if (failedOp === 'end') {
        await endSession();
      } else if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        if (!sendGuard.tryStart()) return;
        try {
          await requestReply(messages);
        } finally {
          sendGuard.release();
        }
      }
    } finally {
      retryGuard.release();
    }
  }, [messages, start, endSession, requestReply, sendGuard, retryGuard]);

  return { messages, isStarting, isSending, isEnding, summary, errorKind, start, sendMessage, retry, endSession };
}
