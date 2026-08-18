import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DividerProps = {
  label: string;
};

export function Divider({ label }: DividerProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <ThemedText type="small" themeColor="textFaint">
        {label}
      </ThemedText>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginVertical: Spacing.four - 6,
  },
  line: {
    flex: 1,
    height: 1,
  },
});
