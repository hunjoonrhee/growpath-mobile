import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type BackHeaderProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function BackHeader({ accessibilityLabel, onPress }: BackHeaderProps) {
  return (
    <View style={styles.navHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.backButton}>
        <ThemedText type="smallBold">←</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two + 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surf2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
