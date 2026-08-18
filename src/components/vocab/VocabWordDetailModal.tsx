import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { VocabCard } from '@/components/vocab/VocabCard';
import { Spacing } from '@/constants/theme';
import type { VocabWord } from '@/lib/vocab';

export type VocabWordDetailModalProps = {
  word: VocabWord | null;
  isFlipped: boolean;
  onToggleFlip: () => void;
  onClose: () => void;
  closeAccessibilityLabel: string;
  flipHint: string;
  exampleHint: string;
};

/** Tapping a word in the vocab list opens this - same flashcard the daily review deck uses (front = word only, tap to flip), just without the "다시 볼래요/알고 있어요" review actions since this isn't a scheduled review session. */
export function VocabWordDetailModal({
  word,
  isFlipped,
  onToggleFlip,
  onClose,
  closeAccessibilityLabel,
  flipHint,
  exampleHint,
}: VocabWordDetailModalProps) {
  return (
    <Modal visible={word !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeAccessibilityLabel} />
      {word && (
        <View style={styles.centerWrap} pointerEvents="box-none">
          <VocabCard
            language={word.language}
            word={word.word}
            meaning={word.meaning}
            exampleSentence={word.exampleSentence}
            exampleHint={exampleHint}
            flipHint={flipHint}
            isFlipped={isFlipped}
            onPress={onToggleFlip}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
  },
});
