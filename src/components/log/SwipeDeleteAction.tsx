import { Pressable, StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type SwipeDeleteActionProps = {
  progress: SharedValue<number>;
  label: string;
  onPress: () => void;
};

/** The red action revealed by swiping a SwipeableSessionLogCard open. */
export function SwipeDeleteAction({ progress, label, onPress }: SwipeDeleteActionProps) {
  // Slides the delete button in from behind the card as the swipe
  // progresses, matching the native iOS reveal instead of popping in at
  // full width immediately.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - Math.min(progress.value, 1)) * 72 }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.button}>
        <ThemedText type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    marginBottom: Spacing.two - 2,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.amber,
    borderRadius: 14,
    marginLeft: Spacing.two - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.bg,
  },
});
