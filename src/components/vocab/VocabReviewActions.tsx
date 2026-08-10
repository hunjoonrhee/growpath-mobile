import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type VocabReviewActionsProps = {
  onPressAgain: () => void;
  onPressKnow: () => void;
  againLabel: string;
  knowLabel: string;
  disabled: boolean;
};

export function VocabReviewActions({ onPressAgain, onPressKnow, againLabel, knowLabel, disabled }: VocabReviewActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={againLabel}
        onPress={onPressAgain}
        disabled={disabled}
        style={[styles.button, styles.againButton, disabled && styles.disabled]}>
        <ThemedText type="smallBold" themeColor="textDim">
          🔁 {againLabel}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={knowLabel}
        onPress={onPressKnow}
        disabled={disabled}
        style={[styles.button, styles.knowButton, disabled && styles.disabled]}>
        <ThemedText type="smallBold" style={styles.knowLabel}>
          ✓ {knowLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    width: '100%',
    maxWidth: 320,
    marginTop: Spacing.five,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
  },
  againButton: {
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  knowButton: {
    backgroundColor: Colors.ok,
  },
  knowLabel: {
    color: '#ffffff',
  },
  disabled: {
    opacity: 0.5,
  },
});
