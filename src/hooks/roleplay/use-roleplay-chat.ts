import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

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
  transcriptSaved: boolean;
  tilSaved: boolean;
};

export function useRoleplayChat({ userId, topic, language, goal, careerLevel, locale }: UseRoleplayChatInput) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStarting, setIsStarting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [summary, setSummary] = useState<RoleplaySummary | null>(null);
  const [errorKind, setErrorKind] = useState<RoleplayErrorKind | null>(null);
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

  const start = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsStarting(true);
    setErrorKind(null);
    try {
      const reply = await startRoleplayTurn(topic, { goal, careerLevel }, locale, language);
      setMessages([{ role: 'model', text: reply }]);
    } catch (error) {
      setErrorKind(classifyError(error));
    } finally {
      setIsStarting(false);
    }
  }, [topic, goal, careerLevel, locale, language]);

  const sendMessage = useCallback(
    async (text: string) => {
      const next: ChatMessage[] = [...messages, { role: 'user', text }];
      setMessages(next);
      setIsSending(true);
      setErrorKind(null);
      try {
        const reply = await sendRoleplayTurn(topic, next, { goal, careerLevel }, locale, language);
        setMessages((current) => [...current, { role: 'model', text: reply }]);
      } catch (error) {
        setErrorKind(classifyError(error));
      } finally {
        setIsSending(false);
      }
    },
    [messages, topic, goal, careerLevel, locale, language]
  );

  // Covers both "the opening turn failed" (no messages yet) and "a reply to
  // the user's last message failed" (last message has no model reply after
  // it) with one retry affordance, instead of leaving either as a dead end.
  const retry = useCallback(async () => {
    setErrorKind(null);
    if (messages.length === 0) {
      hasStartedRef.current = false;
      await start();
      return;
    }
    if (messages[messages.length - 1].role === 'user') {
      setIsSending(true);
      try {
        const reply = await sendRoleplayTurn(topic, messages, { goal, careerLevel }, locale, language);
        setMessages((current) => [...current, { role: 'model', text: reply }]);
      } catch (error) {
        setErrorKind(classifyError(error));
      } finally {
        setIsSending(false);
      }
    }
  }, [messages, topic, goal, careerLevel, locale, language, start]);

  const endSession = useCallback(async () => {
    setIsEnding(true);
    setErrorKind(null);
    try {
      if (!endProgressRef.current) {
        const summaryResult = await endRoleplaySession(topic, messages, { goal, careerLevel }, locale, language);
        endProgressRef.current = { summary: summaryResult, transcriptSaved: false, tilSaved: false };
      }
      const progress = endProgressRef.current;

      if (!progress.transcriptSaved) {
        await saveRoleplayTranscript({ userId, scenario: topic, language, messages, summary: progress.summary });
        progress.transcriptSaved = true;
      }

      if (!progress.tilSaved) {
        await saveRoleplayTilEntry({ userId, scenario: topic, summary: progress.summary });
        progress.tilSaved = true;
      }

      // saveRoleplayTilEntry writes through createSession() directly rather
      // than the useCreateSession mutation (this hook already has its own
      // retry/idempotency handling above, which the mutation doesn't offer),
      // so its usual cache invalidation has to be mirrored here - otherwise
      // the Log tab, streak, and weekly count keep serving stale data after
      // router.replace('/log') even though a new session now exists.
      queryClient.invalidateQueries({ queryKey: ['sessions', 'recent', userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'weeklyCount', userId] });

      setSummary(progress.summary);
    } catch (error) {
      setErrorKind(classifyError(error));
    } finally {
      setIsEnding(false);
    }
  }, [topic, messages, goal, careerLevel, locale, userId, language, queryClient]);

  return { messages, isStarting, isSending, isEnding, summary, errorKind, start, sendMessage, retry, endSession };
}
