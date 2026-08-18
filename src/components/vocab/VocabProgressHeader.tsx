import { StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/navigation/BackButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type VocabProgressHeaderProps = {
  onBack: () => void;
  backAccessibilityLabel: string;
  current: number;
  total: number;
};

export function VocabProgressHeader({ onBack, backAccessibilityLabel, current, total }: VocabProgressHeaderProps) {
  const colors = useTheme();
  const progress = total > 0 ? Math.min(1, current / total) : 0;

  return (
    <View style={styles.row}>
      <BackButton accessibilityLabel={backAccessibilityLabel} onPress={onBack} />
      <View style={[styles.track, { backgroundColor: colors.surf2 }]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.pri2 }]} />
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
  track: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
