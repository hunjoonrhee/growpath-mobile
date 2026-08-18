import { Timer, X } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';

export type ContextBannerProps = {
  message: string;
  dismissAccessibilityLabel: string;
  onDismiss: () => void;
};

export function ContextBanner({ message, dismissAccessibilityLabel, onDismiss }: ContextBannerProps) {
  const colors = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: withAlpha(colors.ok, 0.1), borderColor: withAlpha(colors.ok, 0.3) }]}>
      <Timer size={16} color={colors.ok} strokeWidth={1.8} />
      <ThemedText type="small" themeColor="ok" style={styles.message}>
        {message}
      </ThemedText>
      <Pressable accessibilityRole="button" accessibilityLabel={dismissAccessibilityLabel} onPress={onDismiss} hitSlop={8}>
        <X size={16} color={colors.ok} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  message: {
    flex: 1,
    lineHeight: 18,
  },
});
