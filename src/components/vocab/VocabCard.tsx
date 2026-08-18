import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type VocabCardProps = {
  language: string;
  word: string;
  meaning: string;
  exampleSentence: string | null;
  exampleHint: string;
};

export function VocabCard({ language, word, meaning, exampleSentence, exampleHint }: VocabCardProps) {
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surf2, borderColor: colors.border }]}>
      <ThemedText type="smallBold" themeColor="pri2" style={styles.language}>
        {language}
      </ThemedText>
      <ThemedText style={[styles.word, { color: colors.text }]}>{word}</ThemedText>
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
  card: {
    width: '100%',
    maxWidth: 320,
    minHeight: 300,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
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
