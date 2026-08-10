import { StyleSheet, View } from 'react-native';

import { TagList } from '@/components/log/TagList';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { RoleplaySummary } from '@/lib/roleplay';

export type SessionSummaryCardProps = {
  summary: RoleplaySummary;
  label: string;
};

export function SessionSummaryCard({ summary, label }: SessionSummaryCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText type="small" themeColor="textFaint" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type="small" themeColor="text">
        {summary.tilNote}
      </ThemedText>
      {summary.tags.length > 0 && (
        <View style={styles.tagsRow}>
          <TagList tags={summary.tags} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    ...Typography.sectionLabel,
  },
  tagsRow: {
    marginTop: Spacing.one,
  },
});
