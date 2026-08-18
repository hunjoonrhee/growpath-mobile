import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeMode } from '@/lib/theme-context';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];

export type ThemeModeSelectorProps = {
  current: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
};

export function ThemeModeSelector({ current, onSelect }: ThemeModeSelectorProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <View style={styles.row}>
      {MODES.map((mode) => {
        const isActive = mode === current;
        const label = t(`settings.themeModes.${mode}`);
        return (
          <Pressable
            key={mode}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
            onPress={() => onSelect(mode)}
            style={[
              styles.chip,
              { backgroundColor: colors.surf, borderColor: colors.border },
              isActive && { backgroundColor: `${colors.pri}29`, borderColor: colors.pri },
            ]}>
            <ThemedText type="smallBold" themeColor={isActive ? 'pri2' : 'textDim'}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
  },
});
