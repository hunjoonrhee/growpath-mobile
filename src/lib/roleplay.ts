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
  return summary;
}

export type SaveRoleplayInput = {
  userId: string;
  scenario: string;
  language: string;
  messages: ChatMessage[];
  summary: RoleplaySummary;
};

/** Persists the finished session to roleplay_sessions, and auto-saves a TIL entry (same shape as a manual capture) so it shows up in the Log tab. */
export async function saveRoleplaySession(input: SaveRoleplayInput): Promise<void> {
  const roadmapId = await fetchAdoptedRoadmapId(input.userId);

  const { error } = await insertWithUser('roleplay_sessions', {
    roadmap_id: roadmapId,
    scenario: input.scenario,
    language: input.language,
    transcript: input.messages,
    summary: input.summary.tilNote,
  });
  if (error) throw error;

  await createSession(input.userId, {
    title: input.scenario,
    durationMinutes: null,
    til: input.summary.tilNote,
    tags: input.summary.tags,
  });
}
