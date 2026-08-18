import { StyleSheet } from 'react-native';

import { FlipCard } from '@/components/common/FlipCard';
import { VocabCardBack } from '@/components/vocab/VocabCardBack';
import { VocabCardFront } from '@/components/vocab/VocabCardFront';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type VocabCardProps = {
  language: string;
  word: string;
  meaning: string;
  exampleSentence: string | null;
  exampleHint: string;
  flipHint: string;
  isFlipped: boolean;
  onPress: () => void;
};

/** Tap-to-flip review card - front shows only the word (self-testing recall before revealing the answer), back shows the meaning/example. `isFlipped` is controlled by the caller so it can reset the card to its front face when the deck advances to the next word. */
export function VocabCard({ language, word, meaning, exampleSentence, exampleHint, flipHint, isFlipped, onPress }: VocabCardProps) {
  const colors = useTheme();

  return (
    <FlipCard
      isFlipped={isFlipped}
      onPress={onPress}
      accessibilityLabel={flipHint}
      style={styles.card}
      faceStyle={[styles.face, { backgroundColor: colors.surf2, borderColor: colors.border }]}
      front={<VocabCardFront language={language} word={word} hint={flipHint} />}
      back={<VocabCardBack language={language} word={word} meaning={meaning} exampleSentence={exampleSentence} exampleHint={exampleHint} />}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 320,
    minHeight: 300,
  },
  face: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
