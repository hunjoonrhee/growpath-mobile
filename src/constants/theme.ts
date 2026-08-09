/**
 * Growpath is a dark-only app - there is no light palette to switch to.
 * Values match the design tokens synced to Claude Design in Phase 1.
 */

import { Platform } from 'react-native';

export const Colors = {
  bg: '#0b0d12',
  surf: '#15181f',
  surf2: '#1c202b',
  pri: '#6c63ff',
  pri2: '#8b83ff',
  ok: '#10b981',
  amber: '#f59e0b',
  text: '#f3f4f6',
  textDim: '#9ca3af',
  textFaint: '#6b7280',
  border: '#252a35',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'DM Sans',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'DM Sans',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
