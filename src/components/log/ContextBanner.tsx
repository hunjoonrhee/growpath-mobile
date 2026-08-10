import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type ContextBannerProps = {
  message: string;
  dismissAccessibilityLabel: string;
  onDismiss: () => void;
};

export function ContextBanner({ message, dismissAccessibilityLabel, onDismiss }: ContextBannerProps) {
  return (
    <View style={styles.banner}>
      <ThemedText type="small" themeColor="ok" style={styles.message}>
        ⏱️ {message}
      </ThemedText>
      <Pressable accessibilityRole="button" accessibilityLabel={dismissAccessibilityLabel} onPress={onDismiss} hitSlop={8}>
        <ThemedText themeColor="ok">✕</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
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
