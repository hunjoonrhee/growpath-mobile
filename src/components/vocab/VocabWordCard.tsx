import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { VocabWord } from '@/lib/vocab';

export type VocabWordCardProps = {
  word: VocabWord;
};

export function VocabWordCard({ word }: VocabWordCardProps) {
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surf, borderColor: colors.border }]}>
      <View style={styles.top}>
        <ThemedText type="smallBold" style={styles.word}>
          {word.word}
        </ThemedText>
        <ThemedText type="small" themeColor="pri2" style={styles.language}>
          {word.language}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="ok">
        {word.meaning}
      </ThemedText>
      {word.exampleSentence && (
        <ThemedText type="small" themeColor="textDim" style={styles.example}>
          “{word.exampleSentence}”
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three - 2,
    marginBottom: Spacing.two - 2,
    gap: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  word: {
    flexShrink: 1,
    marginRight: Spacing.two,
  },
  language: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  example: {
    fontStyle: 'italic',
  },
});
