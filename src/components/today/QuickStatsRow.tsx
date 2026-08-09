import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type QuickStat = {
  icon: string;
  label: string;
};

export type QuickStatsRowProps = {
  stats: QuickStat[];
};

export function QuickStatsRow({ stats }: QuickStatsRowProps) {
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.card}>
          <ThemedText style={styles.icon}>{stat.icon}</ThemedText>
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
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
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
