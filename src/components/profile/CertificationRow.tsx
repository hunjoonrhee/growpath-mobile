import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';
import type { Certification } from '@/lib/profile';

export type CertificationRowProps = {
  certification: Certification;
  deleteLabel: string;
  onDelete: () => void;
  disabled: boolean;
};

export function CertificationRow({ certification, deleteLabel, onDelete, disabled }: CertificationRowProps) {
  const colors = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surf, borderColor: colors.border }]}>
      <View style={styles.info}>
        <ThemedText type="smallBold">{certification.name}</ThemedText>
        {certification.issuer && (
          <ThemedText type="small" themeColor="textDim">
            {certification.issuer}
          </ThemedText>
        )}
        {certification.tags.length > 0 && (
          <View style={styles.tags}>
            {certification.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: withAlpha(colors.pri, 0.16) }]}>
                <ThemedText type="small" themeColor="pri2">
                  {tag}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={deleteLabel} onPress={onDelete} disabled={disabled} style={styles.deleteButton}>
        <ThemedText type="small" themeColor="amber">
          {deleteLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  tag: {
    borderRadius: 10,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  deleteButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
});
