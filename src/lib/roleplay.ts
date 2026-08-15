import { API_CALL_TIMEOUT_MS, env } from '@/lib/env';
import { createSession } from '@/lib/sessions';
import type { PronunciationResult } from '@/lib/speech-transcription';
import { insertWithUser, supabase } from '@/lib/supabase';
import { createVocabWord } from '@/lib/vocab';

export class RoleplayUnavailableError extends Error {}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  /** In-character roleplay dialogue only, extracted server-side from [DIALOGUE] tags - null for user messages and for model replies outside a roleplay session (or the rare formatting miss). TTS playback should read this instead of `text`, which mixes it with meta-commentary in a different language. */
  dialogueText?: string | null;
  /** Only set for user messages sent via voice input, scored against their own transcript (see ChatComposer's pendingPronunciation) - undefined for typed messages and for model replies. */
  pronunciation?: PronunciationResult;
};
export type RoleplayVocabWord = { word: string; meaning: string; example: string };
export type RoleplaySummary = { concepts: string[]; tags: string[]; tilNote: string; vocabWords: RoleplayVocabWord[] };
export type RoleplayContext = { goal: string; careerLevel: string };

type TutorChatResponse = { text: string; quiz: unknown; summary: RoleplaySummary | null; dialogueText: string | null };
type TutorApiMessage = { role: 'user' | 'model'; parts: { text: string }[] };
type TutorUserContext = {
  careerLevel: string;
  recentTags: string[];
  gapSkills: string[];
  projects: string[];
  goal: string;
  tilHistory: string[];
};

function toApiMessages(messages: ChatMessage[]): TutorApiMessage[] {
  return messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] }));
}

// projects/recentTags/gapSkills mirror what joon-dashboard's dashboard
// aggregates client-side for richer tutoring context - mobile doesn't have
// that aggregation built yet, so these stay empty. The prompt already
// degrades gracefully for empty context ("None yet"/"Unknown").
function buildUserContext(context: RoleplayContext): TutorUserContext {
  return {
    careerLevel: context.careerLevel,
    recentTags: [],
    gapSkills: [],
    projects: [],
    goal: context.goal,
    tilHistory: [],
  };
}

async function callTutorChat(body: Record<string, unknown>): Promise<TutorChatResponse> {
  if (!env.roadmapApiUrl) {
    throw new RoleplayUnavailableError('EXPO_PUBLIC_ROADMAP_API_URL is not configured yet.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    // A plain Error, not RoleplayUnavailableError - a missing session read
    // here can be a transient refresh-token hiccup rather than a genuinely
    // logged-out user, and roadmap-generation.ts's generateRoadmap treats
    // the identical condition the same way; keeping the two consistent.
    throw new Error('Not authenticated.');
  }

  let res: Response;
  try {
    res = await fetch(`${env.roadmapApiUrl}/api/tutor/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(API_CALL_TIMEOUT_MS),
    });
  } catch (error) {
    // Covers both a network failure and AbortSignal.timeout() firing - a
    // dead connection must not hang isSending/isStarting forever with no
    // error ever surfacing.
    throw error instanceof Error ? error : new Error('Tutor chat request failed.');
  }

  if (!res.ok) {
    // A real, likely-transient failure (5xx, rate limit) - not "feature
    // unavailable" (that's reserved for cases retrying can't fix: missing
    // config, no session, no summary returned), so this must stay a plain
    // Error or the UI tells the user to stop retrying something that would
    // probably succeed on the next attempt.
    throw new Error(`Tutor chat failed (${res.status}).`);
  }

  return (await res.json()) as TutorChatResponse;
}

/** Normalizes a possibly-partial API summary so callers never have to null-check its fields. */
function toRoleplaySummary(raw: RoleplaySummary): RoleplaySummary {
  return {
    concepts: raw.concepts ?? [],
    tags: raw.tags ?? [],
    tilNote: raw.tilNote ?? '',
    // The model can omit the word/meaning/example fields it was asked for,
    // or send an empty string - filtered out here rather than left for
    // saveRoleplayVocabWords to discover, since vocab_words requires both
    // word and meaning to be non-empty.
    vocabWords: (raw.vocabWords ?? [])
      .filter((entry) => entry.word?.trim() && entry.meaning?.trim())
      .map((entry) => ({ word: entry.word.trim(), meaning: entry.meaning.trim(), example: entry.example?.trim() ?? '' })),
  };
}

/**
 * First turn - no history yet, the API opens the roleplay based on `topic`.
 * `locale` and `targetLanguage` are deliberately different things: `locale`
 * is the learner's own UI language (corrections/meta-commentary go there),
 * `targetLanguage` is the language being practiced (the roleplay dialogue
 * itself goes there) - see joon-dashboard's tutor/chat route.
 */
export type RoleplayReply = { text: string; dialogueText: string | null };

export async function startRoleplayTurn(
  topic: string,
  context: RoleplayContext,
  locale: string,
  targetLanguage: string
): Promise<RoleplayReply> {
  const { text, dialogueText } = await callTutorChat({ topic, messages: [], locale, targetLanguage, userContext: buildUserContext(context) });
  // Defensive - callTutorChat's response is cast, not runtime-validated, so
  // a 200 with a missing/malformed `text` field falls back to '' instead of
  // propagating undefined into chat history (which JSON.stringify would
  // then silently drop from the next turn's request body entirely).
  return { text: text ?? '', dialogueText: dialogueText ?? null };
}

/** `messages` must already include the new user turn at the end. */
export async function sendRoleplayTurn(
  topic: string,
  messages: ChatMessage[],
  context: RoleplayContext,
  locale: string,
  targetLanguage: string
): Promise<RoleplayReply> {
  const { text, dialogueText } = await callTutorChat({
    topic,
    messages: toApiMessages(messages),
    locale,
    targetLanguage,
    userContext: buildUserContext(context),
  });
  return { text: text ?? '', dialogueText: dialogueText ?? null };
}

export async function endRoleplaySession(
  topic: string,
  messages: ChatMessage[],
  context: RoleplayContext,
  locale: string,
  targetLanguage: string
): Promise<RoleplaySummary> {
  const { summary } = await callTutorChat({
    topic,
    messages: toApiMessages(messages),
    locale,
    targetLanguage,
    userContext: buildUserContext(context),
    requestSummary: true,
  });
  if (!summary) {
    // A plain Error - a missing summary is far more likely a one-off
    // Gemini hiccup than a permanent condition, and this is the one call
    // that, if treated as unretriable, would silently lose an entire
    // finished-but-unsaved conversation with no way to recover it.
    throw new Error('No summary returned.');
  }
  return toRoleplaySummary(summary);
}

export type SaveRoleplayTranscriptInput = {
  roadmapId: string | null;
  scenario: string;
  language: string;
  messages: ChatMessage[];
  summary: RoleplaySummary;
};

/**
 * Persists the finished session to roleplay_sessions. Split out from the TIL
 * save below (rather than one combined function) so a caller that retries
 * after the TIL save fails doesn't also re-insert this row - roleplay_sessions
 * has no unique constraint to fall back on, unlike vocab_words.
 *
 * Takes roadmapId as a param, sourced from the same value passed to
 * saveRoleplayTilEntry below, rather than each independently re-fetching
 * it - otherwise the roleplay_sessions row and its TIL/sessions row could
 * end up attributed to two different roadmaps if the active goal changed
 * between the two reads.
 */
export async function saveRoleplayTranscript(input: SaveRoleplayTranscriptInput): Promise<void> {
  const { error } = await insertWithUser('roleplay_sessions', {
    roadmap_id: input.roadmapId,
    scenario: input.scenario,
    language: input.language,
    transcript: input.messages,
    summary: input.summary.tilNote,
  });
  if (error) throw error;
}

export type SaveRoleplayTilEntryInput = {
  userId: string;
  roadmapId: string | null;
  scenario: string;
  summary: RoleplaySummary;
};

/** Auto-saves a TIL entry for the session (same shape as a manual capture) so it shows up in the Log tab. */
export async function saveRoleplayTilEntry(input: SaveRoleplayTilEntryInput): Promise<void> {
  await createSession(input.userId, {
    title: input.scenario,
    durationMinutes: null,
    til: input.summary.tilNote,
    tags: input.summary.tags,
    roadmapId: input.roadmapId,
  });
}

export type SaveRoleplayVocabWordsInput = {
  language: string;
  words: RoleplayVocabWord[];
};

/**
 * Auto-registers the session's key vocab words so they show up for spaced-
 * repetition review, same as a manually-added word. Reuses createVocabWord's
 * upsert-on-(user_id,language,word) behavior, so re-encountering a word in a
 * later session refreshes its meaning/example rather than duplicating it or
 * resetting review progress (those columns aren't touched by the upsert).
 */
export async function saveRoleplayVocabWords(input: SaveRoleplayVocabWordsInput): Promise<void> {
  await Promise.all(
    input.words.map((word) =>
      createVocabWord({ language: input.language, word: word.word, meaning: word.meaning, exampleSentence: word.example })
    )
  );
}
