import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type VocabProgressHeaderProps = {
  onBack: () => void;
  backAccessibilityLabel: string;
  current: number;
  total: number;
};

export function VocabProgressHeader({ onBack, backAccessibilityLabel, current, total }: VocabProgressHeaderProps) {
  const progress = total > 0 ? Math.min(1, current / total) : 0;

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={backAccessibilityLabel} onPress={onBack} style={styles.backButton}>
        <ThemedText type="smallBold">←</ThemedText>
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <ThemedText type="smallBold" themeColor="textDim">
        {current} / {total}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    height: 52,
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
  track: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: Colors.surf2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.pri2,
  },
});
