import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type SkillChipProps = {
  label: string;
};

export function SkillChip({ label }: SkillChipProps) {
  const colors = useTheme();

  return (
    <ThemedText type="small" themeColor="textDim" style={[styles.chip, { backgroundColor: colors.surf, borderColor: colors.border }]}>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 11,
    lineHeight: 14,
  },
});
