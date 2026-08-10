import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type OtherGoalRowProps = {
  goal: string;
  careerLevel: string;
  onPress: () => void;
  disabled?: boolean;
};

export function OtherGoalRow({ goal, careerLevel, onPress, disabled }: OtherGoalRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={goal}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.row, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <View>
        <ThemedText type="smallBold">{goal}</ThemedText>
        <ThemedText type="small" themeColor="textFaint" style={styles.meta}>
          {careerLevel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  meta: {
    marginTop: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
