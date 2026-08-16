import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { Certification } from '@/lib/profile';

export type CertificationRowProps = {
  certification: Certification;
  deleteLabel: string;
  onDelete: () => void;
  disabled: boolean;
};

export function CertificationRow({ certification, deleteLabel, onDelete, disabled }: CertificationRowProps) {
  return (
    <View style={styles.row}>
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
              <View key={tag} style={styles.tag}>
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
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: 'rgba(108,99,255,0.16)',
    borderRadius: 10,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  deleteButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
});
