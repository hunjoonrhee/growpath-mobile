import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type NavRowProps = {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

export function NavRow({ icon: Icon, label, subtitle, onPress }: NavRowProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: colors.surf, borderColor: colors.border }, pressed && styles.pressed]}>
      <Icon size={20} color={colors.textDim} strokeWidth={1.8} />
      <View style={styles.text}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textFaint">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <ChevronRight size={18} color={colors.textFaint} strokeWidth={1.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 2,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three - 2,
    marginBottom: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
