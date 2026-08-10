import { useCallback, useRef, useState } from 'react';

import {
  endRoleplaySession,
  saveRoleplaySession,
  sendRoleplayTurn,
  startRoleplayTurn,
  type ChatMessage,
  type RoleplayContext,
  type RoleplaySummary,
} from '@/lib/roleplay';

export type UseRoleplayChatInput = {
  userId: string;
  topic: string;
  language: string;
  context: RoleplayContext;
  locale: string;
};

export function useRoleplayChat({ userId, topic, language, context, locale }: UseRoleplayChatInput) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStarting, setIsStarting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [summary, setSummary] = useState<RoleplaySummary | null>(null);
  const [error, setError] = useState(false);
  // start() is triggered from a useEffect keyed on the caller's own loading
  // state, which can legitimately re-run - this guards against firing a
  // second opening turn (and a second API call) if that happens.
  const hasStartedRef = useRef(false);

  const start = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsStarting(true);
    setError(false);
    try {
      const reply = await startRoleplayTurn(topic, context, locale, language);
      setMessages([{ role: 'model', text: reply }]);
    } catch {
      setError(true);
    } finally {
      setIsStarting(false);
    }
  }, [topic, context, locale, language]);

  const sendMessage = useCallback(
    async (text: string) => {
      const next: ChatMessage[] = [...messages, { role: 'user', text }];
      setMessages(next);
      setIsSending(true);
      setError(false);
      try {
        const reply = await sendRoleplayTurn(topic, next, context, locale, language);
        setMessages((current) => [...current, { role: 'model', text: reply }]);
      } catch {
        setError(true);
      } finally {
        setIsSending(false);
      }
    },
    [messages, topic, context, locale, language]
  );

  const endSession = useCallback(async () => {
    setIsEnding(true);
    setError(false);
    try {
      const result = await endRoleplaySession(topic, messages, context, locale, language);
      await saveRoleplaySession({ userId, scenario: topic, language, messages, summary: result });
      setSummary(result);
    } catch {
      setError(true);
    } finally {
      setIsEnding(false);
    }
  }, [topic, messages, context, locale, userId, language]);

  return { messages, isStarting, isSending, isEnding, summary, error, start, sendMessage, endSession };
}
