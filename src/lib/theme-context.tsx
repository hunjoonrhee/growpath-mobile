import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import { DarkColors, LightColors, type Palette } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedScheme = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'growpath.themeMode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function toScheme(scheme: ColorSchemeName | null | undefined): ResolvedScheme {
  return scheme === 'light' ? 'light' : 'dark';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ResolvedScheme>(toScheme(Appearance.getColorScheme()));

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored);
    });
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(toScheme(colorScheme)));
    return () => subscription.remove();
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const resolvedScheme = mode === 'system' ? systemScheme : mode;
  const colors = resolvedScheme === 'light' ? LightColors : DarkColors;

  const value = useMemo(() => ({ mode, resolvedScheme, colors, setMode }), [mode, resolvedScheme, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within AppThemeProvider');
  return ctx;
}
