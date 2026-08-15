import { StyleSheet, View } from 'react-native';

import { TagList } from '@/components/log/TagList';
import { TilMarkdown } from '@/components/log/TilMarkdown';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { RoleplaySummary } from '@/lib/roleplay';

export type SessionSummaryCardProps = {
  summary: RoleplaySummary;
  label: string;
  vocabAddedLabel: string;
};

export function SessionSummaryCard({ summary, label, vocabAddedLabel }: SessionSummaryCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText type="small" themeColor="textFaint" style={styles.label}>
        {label}
      </ThemedText>
      {/* Same field, rendered the same way TilMarkdown renders it when this session is later viewed from the Log tab. */}
      <TilMarkdown content={summary.tilNote} />
      {summary.tags.length > 0 && (
        <View style={styles.tagsRow}>
          <TagList tags={summary.tags} />
        </View>
      )}
      {summary.vocabWords.length > 0 && (
        <View style={styles.vocabSection}>
          <ThemedText type="small" themeColor="ok">
            {vocabAddedLabel}
          </ThemedText>
          <ThemedText type="small" themeColor="textDim">
            {summary.vocabWords.map((word) => word.word).join(', ')}
          </ThemedText>
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
  vocabSection: {
    marginTop: Spacing.one,
    gap: 2,
  },
});
