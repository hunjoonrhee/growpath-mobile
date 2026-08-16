import { useThemeContext } from '@/lib/theme-context';

/** Live palette for the current mode (light/dark/system) - use this instead of the static `Colors` import wherever a screen has been migrated to react to the theme toggle (see `redesign/dark-light-mode-infra`). */
export function useTheme() {
  return useThemeContext().colors;
}
