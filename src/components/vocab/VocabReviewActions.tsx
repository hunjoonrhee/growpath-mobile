import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type VocabReviewActionsProps = {
  onPressAgain: () => void;
  onPressKnow: () => void;
  againLabel: string;
  knowLabel: string;
  disabled: boolean;
};

export function VocabReviewActions({ onPressAgain, onPressKnow, againLabel, knowLabel, disabled }: VocabReviewActionsProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={againLabel}
        onPress={onPressAgain}
        disabled={disabled}
        style={[styles.button, { backgroundColor: colors.surf2, borderWidth: 1, borderColor: colors.border }, disabled && styles.disabled]}>
        <ThemedText type="smallBold" themeColor="textDim">
          🔁 {againLabel}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={knowLabel}
        onPress={onPressKnow}
        disabled={disabled}
        style={[styles.button, { backgroundColor: colors.ok }, disabled && styles.disabled]}>
        <ThemedText type="smallBold" style={{ color: colors.onPri }}>
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
  disabled: {
    opacity: 0.5,
  },
});
