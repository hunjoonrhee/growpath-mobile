import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type RoadmapActionsRowProps = {
  editLabel: string;
  deleteLabel: string;
  onPressEdit: () => void;
  onPressDelete: () => void;
  disabled: boolean;
};

export function RoadmapActionsRow({ editLabel, deleteLabel, onPressEdit, onPressDelete, disabled }: RoadmapActionsRowProps) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={editLabel} onPress={onPressEdit} disabled={disabled} style={styles.button}>
        <ThemedText type="small" themeColor="pri2">
          {editLabel}
        </ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={deleteLabel} onPress={onPressDelete} disabled={disabled} style={styles.button}>
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
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.one,
  },
  button: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
});
