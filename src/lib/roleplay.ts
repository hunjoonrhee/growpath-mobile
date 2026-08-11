import { env } from '@/lib/env';
import { fetchAdoptedRoadmapId } from '@/lib/roadmap';
import { createSession } from '@/lib/sessions';
import { insertWithUser, supabase } from '@/lib/supabase';

export class RoleplayUnavailableError extends Error {}

export type ChatMessage = { role: 'user' | 'model'; text: string };
export type RoleplaySummary = { concepts: string[]; tags: string[]; tilNote: string };
export type RoleplayContext = { goal: string; careerLevel: string };

type TutorChatResponse = { text: string; quiz: unknown; summary: RoleplaySummary | null };

function toApiMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] }));
}

// projects/recentTags/gapSkills mirror what joon-dashboard's dashboard
// aggregates client-side for richer tutoring context - mobile doesn't have
// that aggregation built yet, so these stay empty. The prompt already
// degrades gracefully for empty context ("None yet"/"Unknown").
function buildUserContext(context: RoleplayContext) {
  return {
    careerLevel: context.careerLevel,
    recentTags: [] as string[],
    gapSkills: [] as string[],
    projects: [] as string[],
    goal: context.goal,
    tilHistory: [] as string[],
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
    throw new RoleplayUnavailableError('Not authenticated.');
  }

  const res = await fetch(`${env.roadmapApiUrl}/api/tutor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new RoleplayUnavailableError(`Tutor chat failed (${res.status}).`);
  }

  return (await res.json()) as TutorChatResponse;
}

/** Normalizes a possibly-partial API summary so callers never have to null-check its fields. */
function toRoleplaySummary(raw: RoleplaySummary): RoleplaySummary {
  return {
    concepts: raw.concepts ?? [],
    tags: raw.tags ?? [],
    tilNote: raw.tilNote ?? '',
  };
}

/**
 * First turn - no history yet, the API opens the roleplay based on `topic`.
 * `locale` and `targetLanguage` are deliberately different things: `locale`
 * is the learner's own UI language (corrections/meta-commentary go there),
 * `targetLanguage` is the language being practiced (the roleplay dialogue
 * itself goes there) - see joon-dashboard's tutor/chat route.
 */
export async function startRoleplayTurn(
  topic: string,
  context: RoleplayContext,
  locale: string,
  targetLanguage: string
): Promise<string> {
  const { text } = await callTutorChat({ topic, messages: [], locale, targetLanguage, userContext: buildUserContext(context) });
  return text;
}

/** `messages` must already include the new user turn at the end. */
export async function sendRoleplayTurn(
  topic: string,
  messages: ChatMessage[],
  context: RoleplayContext,
  locale: string,
  targetLanguage: string
): Promise<string> {
  const { text } = await callTutorChat({
    topic,
    messages: toApiMessages(messages),
    locale,
    targetLanguage,
    userContext: buildUserContext(context),
  });
  return text;
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
    throw new RoleplayUnavailableError('No summary returned.');
  }
  return toRoleplaySummary(summary);
}

export type SaveRoleplayTranscriptInput = {
  userId: string;
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
 */
export async function saveRoleplayTranscript(input: SaveRoleplayTranscriptInput): Promise<void> {
  const roadmapId = await fetchAdoptedRoadmapId(input.userId);

  const { error } = await insertWithUser('roleplay_sessions', {
    roadmap_id: roadmapId,
    scenario: input.scenario,
    language: input.language,
    transcript: input.messages,
    summary: input.summary.tilNote,
  });
  if (error) throw error;
}

export type SaveRoleplayTilEntryInput = {
  userId: string;
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
  });
}
