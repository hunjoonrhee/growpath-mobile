import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type VocabCardBackProps = {
  language: string;
  word: string;
  meaning: string;
  exampleSentence: string | null;
  exampleHint: string;
};

export function VocabCardBack({ language, word, meaning, exampleSentence, exampleHint }: VocabCardBackProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold" themeColor="pri2" style={styles.language}>
        {language}
      </ThemedText>
      <ThemedText style={styles.word}>{word}</ThemedText>
      {exampleSentence && (
        <ThemedText type="small" themeColor="textDim" style={styles.example}>
          “{exampleSentence}”
        </ThemedText>
      )}
      <ThemedText type="smallBold" themeColor="ok" style={styles.meaning}>
        {meaning}
      </ThemedText>
      {exampleSentence && (
        <ThemedText type="small" themeColor="textFaint" style={styles.hint}>
          {exampleHint}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  language: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  word: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  example: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 19,
  },
  meaning: {
    fontSize: 15,
  },
  hint: {
    fontSize: 11,
  },
});
