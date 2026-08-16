import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type QuickStat = {
  id: string;
  icon: string;
  label: string;
};

export type QuickStatsRowProps = {
  stats: QuickStat[];
};

export function QuickStatsRow({ stats }: QuickStatsRowProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.id} style={[styles.card, { backgroundColor: colors.surf, borderColor: colors.border }]}>
          <ThemedText style={[styles.icon, { fontFamily: undefined }]}>{stat.icon}</ThemedText>
          <ThemedText type="small" themeColor="textDim" style={styles.label}>
            {stat.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    marginTop: Spacing.three + 2,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three - 2,
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    textAlign: 'center',
  },
});
