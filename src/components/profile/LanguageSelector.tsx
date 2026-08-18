import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';

export type LanguageSelectorProps = {
  current: string;
  onSelect: (language: SupportedLanguage) => void;
};

export function LanguageSelector({ current, onSelect }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = language === current;
        // Language names are each language's own self-name (e.g. "한국어"
        // stays "한국어" no matter what the app's current language is - the
        // standard convention for language pickers) - identical across all
        // three locale files by design, not a translation of one another.
        const label = t(`profile.languageNames.${language}`);
        return (
          <Pressable
            key={language}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
            onPress={() => onSelect(language)}
            style={[
              styles.chip,
              { backgroundColor: colors.surf, borderColor: colors.border },
              isActive && { backgroundColor: withAlpha(colors.pri, 0.16), borderColor: colors.pri },
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
