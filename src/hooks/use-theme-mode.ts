import { useThemeContext } from '@/lib/theme-context';

/** The user's raw preference ('system' included) plus the resolved light/dark scheme it currently maps to - for the theme picker UI and navigation chrome. */
export function useThemeMode() {
  const { mode, resolvedScheme, setMode } = useThemeContext();
  return { mode, resolvedScheme, setMode };
}
