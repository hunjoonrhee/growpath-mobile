import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ko: '한국어',
  de: 'Deutsch',
  en: 'English',
};

export type LanguageSelectorProps = {
  current: string;
  onSelect: (language: SupportedLanguage) => void;
};

export function LanguageSelector({ current, onSelect }: LanguageSelectorProps) {
  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = language === current;
        return (
          <Pressable
            key={language}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={LANGUAGE_LABELS[language]}
            onPress={() => onSelect(language)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <ThemedText type="smallBold" themeColor={isActive ? 'pri2' : 'textDim'}>
              {LANGUAGE_LABELS[language]}
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
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
  },
  chipActive: {
    backgroundColor: 'rgba(108,99,255,0.16)',
    borderColor: Colors.pri,
  },
});
