import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { invalidateSessionQueries } from '@/hooks/sessions/use-create-session';
import { useSubmitGuard } from '@/hooks/use-submit-guard';
import type { PronunciationResult } from '@/lib/speech-transcription';
import {
  endRoleplaySession,
  saveRoleplayTilEntry,
  saveRoleplayTranscript,
  saveRoleplayVocabWords,
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
  // The caller (roleplay-chat.tsx) already holds this via useActiveRoadmap's
  // React Query cache - passed in rather than re-fetched here so the
  // transcript and TIL writes at the end of a session always agree on the
  // same value instead of each independently reading a possibly-different
  // one. undefined means "not resolved yet" (caller's own query still
  // loading); endSession isn't reachable before that.
  roadmapId: string | null | undefined;
};

/** 'unavailable' means retrying won't help (missing config, expired session, no summary) - 'transient' means it might (network blip, 5xx). */
export type RoleplayErrorKind = 'unavailable' | 'transient';

function classifyError(error: unknown): RoleplayErrorKind {
  return error instanceof RoleplayUnavailableError ? 'unavailable' : 'transient';
}

type EndProgress = {
  summary: RoleplaySummary;
  transcriptSaved: boolean;
  tilSaved: boolean;
  vocabSaved: boolean;
};

/** Which operation retry() should resume - set alongside errorKind so retry doesn't have to guess from message-array shape (which is ambiguous once ending is involved). */
type FailedOperation = 'start' | 'send' | 'end' | null;

export type UseRoleplayChatResult = {
  messages: ChatMessage[];
  isStarting: boolean;
  isSending: boolean;
  isEnding: boolean;
  summary: RoleplaySummary | null;
  errorKind: RoleplayErrorKind | null;
  start: () => Promise<void>;
  sendMessage: (text: string, pronunciation?: PronunciationResult) => Promise<void>;
  retry: () => Promise<void>;
  endSession: () => Promise<void>;
};

export function useRoleplayChat({
  userId,
  topic,
  language,
  goal,
  careerLevel,
  locale,
  roadmapId,
}: UseRoleplayChatInput): UseRoleplayChatResult {
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
        setMessages((current) => [...current, { role: 'model', text: reply.text, dialogueText: reply.dialogueText }]);
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
      setMessages([{ role: 'model', text: reply.text, dialogueText: reply.dialogueText }]);
    } catch (error) {
      if (!isMountedRef.current) return;
      failedOpRef.current = 'start';
      setErrorKind(classifyError(error));
    } finally {
      if (isMountedRef.current) setIsStarting(false);
    }
  }, [topic, goal, careerLevel, locale, language]);

  const sendMessage = useCallback(
    async (text: string, pronunciation?: PronunciationResult) => {
      if (!sendGuard.tryStart()) return;
      const next: ChatMessage[] = [...messages, { role: 'user', text, pronunciation }];
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
        endProgressRef.current = { summary: summaryResult, transcriptSaved: false, tilSaved: false, vocabSaved: false };
      }
      const progress = endProgressRef.current;
      const resolvedRoadmapId = roadmapId ?? null;
      // Both saves can invalidate independently on a partial failure (one
      // persisted, the other didn't - the Log tab should still refresh for
      // the row that's actually there), but on the common happy path both
      // succeed and would otherwise invalidate the same 3 queries twice.
      let hasInvalidated = false;
      const invalidateOnce = () => {
        if (hasInvalidated) return;
        hasInvalidated = true;
        invalidateSessionQueries(queryClient, userId);
      };
      // Separate guard from invalidateOnce - vocab queries are unrelated to
      // the session/log queries above and shouldn't be conflated with them.
      let hasInvalidatedVocab = false;
      const invalidateVocabOnce = () => {
        if (hasInvalidatedVocab) return;
        hasInvalidatedVocab = true;
        queryClient.invalidateQueries({ queryKey: ['vocab', 'due', userId] });
        queryClient.invalidateQueries({ queryKey: ['vocab', 'dueCount', userId] });
        queryClient.invalidateQueries({ queryKey: ['vocab', 'all', userId] });
      };

      // Independent writes to different tables - run concurrently rather
      // than one-after-another. Each still only fires if its own step
      // hasn't completed yet, so a retry after a partial failure doesn't
      // redo (or double-insert) whichever one already succeeded.
      await Promise.all([
        progress.transcriptSaved
          ? undefined
          : saveRoleplayTranscript({
              roadmapId: resolvedRoadmapId,
              scenario: topic,
              language,
              messages,
              summary: progress.summary,
            }).then(() => {
              progress.transcriptSaved = true;
              invalidateOnce();
            }),
        progress.tilSaved
          ? undefined
          : saveRoleplayTilEntry({ userId, roadmapId: resolvedRoadmapId, scenario: topic, summary: progress.summary }).then(() => {
              progress.tilSaved = true;
              invalidateOnce();
            }),
        // No-op when the summary had no vocabWords (non-language sessions,
        // or the model found nothing worth flagging) - still marked saved
        // so a retry after a different step's failure doesn't redo it.
        progress.vocabSaved || progress.summary.vocabWords.length === 0
          ? undefined
          : saveRoleplayVocabWords({ language, words: progress.summary.vocabWords }).then(() => {
              progress.vocabSaved = true;
              invalidateVocabOnce();
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
  }, [topic, messages, goal, careerLevel, locale, userId, language, roadmapId, queryClient, endGuard]);

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
      } else if (failedOp === 'send' && messages.length > 0 && messages[messages.length - 1].role === 'user') {
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
