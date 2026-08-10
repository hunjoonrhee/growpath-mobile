import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export type SkillChipProps = {
  label: string;
};

export function SkillChip({ label }: SkillChipProps) {
  return (
    <ThemedText type="small" themeColor="textDim" style={styles.chip}>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 11,
    lineHeight: 14,
  },
});
