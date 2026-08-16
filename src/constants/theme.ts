/**
 * Light/dark palettes from the Growpath redesign mockup (docs/Growpath
 * Redesign (standalone).html, "1b" direction) - dark derived from 1b's own
 * mapping rule (bg F4F6F1->121815, card FFFFFF->1A211D, accent 2F5D50->6FBF95,
 * shadow->1px border 2A342D, text-on-accent white->10201A for contrast).
 */

import { Platform } from 'react-native';

export type Palette = {
  bg: string;
  surf: string;
  surf2: string;
  pri: string;
  pri2: string;
  /** Large filled surfaces that use the primary color as a background (e.g. the day's focus card) - `pri` itself is legible enough for this in light mode, but too bright in dark mode, so dark substitutes a deeper filled green here. */
  priFilled: string;
  /** Text/icon color for content sitting on top of `pri` or `priFilled` - not always white (dark mode's mint `pri` needs near-black text to hit contrast). */
  onPri: string;
  ok: string;
  amber: string;
  text: string;
  textDim: string;
  textFaint: string;
  border: string;
};

export const LightColors: Palette = {
  bg: '#F4F6F1',
  surf: '#FFFFFF',
  surf2: '#E4EFE7',
  pri: '#2F5D50',
  pri2: '#4E8C71',
  priFilled: '#2F5D50',
  onPri: '#F4F6F1',
  ok: '#2F5D50',
  amber: '#D18B3C',
  text: '#1E2A24',
  textDim: '#5C6B62',
  textFaint: '#93A099',
  border: '#E4E9E0',
};

export const DarkColors: Palette = {
  bg: '#121815',
  surf: '#1A211D',
  surf2: '#222B26',
  pri: '#6FBF95',
  pri2: '#9FD9B8',
  priFilled: '#1E4438',
  onPri: '#10201A',
  ok: '#6FBF95',
  amber: '#E0A75B',
  text: '#E9EFE9',
  textDim: '#9BA89F',
  textFaint: '#6E7C74',
  border: '#2A342D',
};

// Static default for the ~60 screen/component files not yet migrated off a
// direct import (see src/lib/theme-context.tsx) - always resolves to dark
// until each file switches to useTheme(). Kept as the same Palette shape so
// migrating a file later is a search-and-replace, not a rewrite.
export const Colors = DarkColors;

export type ThemeColor = keyof Palette;

// IBM Plex Sans KR (redesign mockup's typeface) - loaded via useFonts in
// _layout.tsx, weight-specific font files (RN can't fake bold on a custom
// font the way it can on a system font, so every weight used in ThemedText
// needs its own named entry here rather than a single family + fontWeight).
export const Fonts = {
  regular: 'IBMPlexSansKR_400Regular',
  medium: 'IBMPlexSansKR_500Medium',
  semiBold: 'IBMPlexSansKR_600SemiBold',
  bold: 'IBMPlexSansKR_700Bold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
};

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

export const Typography = {
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
    fontSize: 12,
  },
} as const;
