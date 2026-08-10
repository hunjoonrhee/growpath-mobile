import { useRef } from 'react';

/**
 * Guards a submit handler against a fast double-tap firing it twice.
 * A mutation's `isPending` flag only feeds a disabled prop after a
 * re-render commits, which isn't fast enough to block a second tap that
 * lands before that render - this ref-based check is synchronous.
 */
export function useSubmitGuard() {
  const isSubmittingRef = useRef(false);

  function tryStart(): boolean {
    if (isSubmittingRef.current) return false;
    isSubmittingRef.current = true;
    return true;
  }

  function release() {
    isSubmittingRef.current = false;
  }

  return { tryStart, release };
}
