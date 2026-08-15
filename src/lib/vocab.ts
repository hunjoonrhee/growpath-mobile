import { computeNextReview, type ReviewState } from '@/lib/spaced-repetition';
import { supabase, upsertWithUser } from '@/lib/supabase';

export type VocabWord = {
  id: string;
  language: string;
  word: string;
  meaning: string;
  exampleSentence: string | null;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  nextReviewAt: string;
};

export type CreateVocabWordInput = {
  language: string;
  word: string;
  meaning: string;
  exampleSentence: string;
};

type VocabWordRow = {
  id: string;
  language: string;
  word: string;
  meaning: string;
  example_sentence: string | null;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  next_review_at: string;
};

function toVocabWord(row: VocabWordRow): VocabWord {
  return {
    id: row.id,
    language: row.language,
    word: row.word,
    meaning: row.meaning,
    exampleSentence: row.example_sentence,
    intervalDays: row.interval_days,
    easeFactor: Number(row.ease_factor),
    reviewCount: row.review_count,
    nextReviewAt: row.next_review_at,
  };
}

// Single source of truth for "due" so fetchDueVocabWords and
// fetchDueVocabWordCount can't silently disagree (e.g. if a grace period
// gets added to the definition later and only one call site is updated).
function dueCutoffIso(): string {
  return new Date().toISOString();
}

/** Due words for today, capped per the app's daily review limit (see supabase/README.md). */
export async function fetchDueVocabWords(userId: string, limit = 20): Promise<VocabWord[]> {
  const { data, error } = await supabase
    .from('vocab_words')
    .select('id, language, word, meaning, example_sentence, interval_days, ease_factor, review_count, next_review_at')
    .eq('user_id', userId)
    .lte('next_review_at', dueCutoffIso())
    .order('next_review_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => toVocabWord(row as VocabWordRow));
}

/**
 * True due count, uncapped - unlike fetchDueVocabWords, which limits to the
 * app's daily review-session size. Profile's badge needs the real number
 * (e.g. to show a backlog larger than one day's review cap), not the size
 * of a single review session.
 */
export async function fetchDueVocabWordCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('vocab_words')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_at', dueCutoffIso());
  if (error) throw error;
  return count ?? 0;
}

/** Every saved word regardless of review schedule, newest first - unlike fetchDueVocabWords this isn't meant to be paged through in a single sitting, so it isn't capped. */
export async function fetchAllVocabWords(userId: string): Promise<VocabWord[]> {
  const { data, error } = await supabase
    .from('vocab_words')
    .select('id, language, word, meaning, example_sentence, interval_days, ease_factor, review_count, next_review_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toVocabWord(row as VocabWordRow));
}

export async function deleteVocabWord(id: string): Promise<void> {
  const { error } = await supabase.from('vocab_words').delete().eq('id', id);
  if (error) throw error;
}

/** Upserts on (user_id, language, word) - re-saving an existing word updates its meaning/example instead of erroring. */
export async function createVocabWord(input: CreateVocabWordInput): Promise<void> {
  const { error } = await upsertWithUser(
    'vocab_words',
    {
      language: input.language,
      word: input.word,
      meaning: input.meaning,
      example_sentence: input.exampleSentence || null,
    },
    { onConflict: 'user_id,language,word' }
  );
  if (error) throw error;
}

export async function reviewVocabWord(id: string, current: ReviewState, knew: boolean): Promise<void> {
  const result = computeNextReview(current, knew);
  const { error } = await supabase
    .from('vocab_words')
    .update({
      interval_days: result.intervalDays,
      ease_factor: result.easeFactor,
      review_count: result.reviewCount,
      next_review_at: result.nextReviewAt.toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}
