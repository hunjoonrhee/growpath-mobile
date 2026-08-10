import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export type BackButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function BackButton({ accessibilityLabel, onPress }: BackButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.button}>
      <ThemedText type="smallBold">←</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surf2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
