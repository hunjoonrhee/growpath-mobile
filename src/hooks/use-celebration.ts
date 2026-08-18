import { useCelebrationContext } from '@/lib/celebration-context';

/**
 * Shows the full-screen celebration overlay (see CelebrationOverlay) - for
 * genuinely rare, deliberate moments (streak milestones, a completed roadmap
 * stage, a new personal-best pronunciation score, a freshly generated
 * roadmap). It doesn't rate-limit itself - callers own deciding whether a
 * given moment has already been celebrated today (see task #34/#35, which
 * wire this up to those specific triggers).
 */
export function useCelebration() {
  return useCelebrationContext().showCelebration;
}
