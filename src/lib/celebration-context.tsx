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
  colorTheme?: CelebrationColorTheme;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

type CelebrationContextValue = {
  celebration: CelebrationOptions | null;
  showCelebration: (options: CelebrationOptions) => void;
  hideCelebration: () => void;
};

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [celebration, setCelebration] = useState<CelebrationOptions | null>(null);

  const showCelebration = useCallback((options: CelebrationOptions) => {
    setCelebration(options);
  }, []);

  const hideCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebration, showCelebration, hideCelebration }}>{children}</CelebrationContext.Provider>
  );
}

export function useCelebrationContext(): CelebrationContextValue {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebrationContext must be used within CelebrationProvider');
  return ctx;
}
