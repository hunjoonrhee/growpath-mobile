import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { VocabWord } from '@/lib/vocab';

export type VocabWordCardProps = {
  word: VocabWord;
};

export function VocabWordCard({ word }: VocabWordCardProps) {
  return (
    <View style={styles.card}>
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
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
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
