import { ThemedText } from '@/components/themed-text';

export type TabIconProps = {
  icon: string;
  focused: boolean;
};

export function TabIcon({ icon, focused }: TabIconProps) {
  return (
    // The default type's fontFamily (IBM Plex Sans KR) doesn't cover emoji -
    // iOS falls back to the system emoji font for the glyph itself, but
    // still vertically positions it using IBM Plex's (taller) line metrics,
    // which was pushing the glyph up out of the tab bar's fixed icon slot.
    // Resetting fontFamily back to the system default for this icon-only
    // text avoids that mismatch.
    <ThemedText themeColor={focused ? 'pri2' : 'textFaint'} style={{ fontFamily: undefined, fontSize: 20, lineHeight: 24 }}>
      {icon}
    </ThemedText>
  );
}
