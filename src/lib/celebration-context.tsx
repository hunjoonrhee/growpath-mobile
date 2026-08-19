import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

/** A milestone-tier color scheme for the celebration screen (not a light/dark variant - see CelebrationOverlay). Defaults to 'green'. */
export type CelebrationColorTheme = 'green' | 'gold' | 'purple';

export type CelebrationOptions = {
  /** Small uppercase label above the title, e.g. "MILESTONE". */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Drives the dial's fill-up animation (0-100) - omit for celebrations with no natural percent (e.g. "roadmap created"), which renders the dial at 100. */
  percent?: number;
  /** Overrides the dial's center text for celebrations whose milestone isn't a percent (e.g. a streak day count) - shown instead of CompassDial's own "N %" label. */
  centerLabel?: { value: string; caption?: string };
  /** Shows this image (an achievement badge's art) in the dial's center instead of text - for celebrations with no natural number to display (e.g. "you saved your first word"). Takes priority over centerLabel if both are somehow set. */
  centerIcon?: number;
  colorTheme?: CelebrationColorTheme;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

type CelebrationContextValue = {
  /** Every pending celebration in the order they fired - see CelebrationOverlay, which renders this as a swipeable stack (like Nike Run Club's post-run achievement cards) instead of showing only one and silently dropping the rest. */
  queue: CelebrationOptions[];
  showCelebration: (options: CelebrationOptions) => void;
  /** Clears the whole batch - browsing between queued cards is free (plain horizontal swipe, no side effects), but acting on any one of them or explicitly closing ends the review session for all of them, not just that card. */
  clearQueue: () => void;
};

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<CelebrationOptions[]>([]);

  const showCelebration = useCallback((options: CelebrationOptions) => {
    setQueue((current) => [...current, options]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return <CelebrationContext.Provider value={{ queue, showCelebration, clearQueue }}>{children}</CelebrationContext.Provider>;
}

export function useCelebrationContext(): CelebrationContextValue {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebrationContext must be used within CelebrationProvider');
  return ctx;
}
