import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type VocabCardFrontProps = {
  language: string;
  word: string;
  hint: string;
};

export function VocabCardFront({ language, word, hint }: VocabCardFrontProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold" themeColor="pri2" style={styles.language}>
        {language}
      </ThemedText>
      <ThemedText style={styles.word}>{word}</ThemedText>
      <ThemedText type="small" themeColor="textFaint" style={styles.hint}>
        {hint}
      </ThemedText>
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
  hint: {
    fontSize: 12,
    marginTop: Spacing.two,
  },
});
