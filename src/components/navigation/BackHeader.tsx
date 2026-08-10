import { StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/navigation/BackButton';
import { Spacing } from '@/constants/theme';

export type BackHeaderProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function BackHeader({ accessibilityLabel, onPress }: BackHeaderProps) {
  return (
    <View style={styles.navHeader}>
      <BackButton accessibilityLabel={accessibilityLabel} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two + 4,
  },
});
