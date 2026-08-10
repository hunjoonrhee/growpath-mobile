export type ReviewState = {
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
};

export type ReviewResult = ReviewState & {
  nextReviewAt: Date;
};

const MIN_EASE_FACTOR = 1.3;

/**
 * Simplified SM-2: reviews here are binary (didn't know it / knew it), not
 * SM-2's 0-5 quality score, so this collapses to two fixed adjustments
 * rather than the full formula.
 */
export function computeNextReview(current: ReviewState, knew: boolean, now: Date = new Date()): ReviewResult {
  if (!knew) {
    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);
    return {
      intervalDays: 1,
      easeFactor: Math.max(MIN_EASE_FACTOR, current.easeFactor - 0.2),
      reviewCount: 0,
      nextReviewAt,
    };
  }

  const reviewCount = current.reviewCount + 1;
  const easeFactor = current.easeFactor + 0.1;
  let intervalDays: number;
  if (reviewCount === 1) {
    intervalDays = 1;
  } else if (reviewCount === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(current.intervalDays * easeFactor);
  }

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { intervalDays, easeFactor, reviewCount, nextReviewAt };
}
