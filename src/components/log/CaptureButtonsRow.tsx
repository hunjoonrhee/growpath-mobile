import { Camera, Mic } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CaptureButtonsRowProps = {
  voiceLabel: string;
  photoLabel: string;
  onPressVoice: () => void;
  onPressPhoto: () => void;
};

export function CaptureButtonsRow({ voiceLabel, photoLabel, onPressVoice, onPressPhoto }: CaptureButtonsRowProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={voiceLabel}
        onPress={onPressVoice}
        style={[styles.button, { backgroundColor: colors.surf, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: colors.pri }]}>
          <Mic size={19} color={colors.onPri} strokeWidth={1.8} />
        </View>
        <ThemedText type="smallBold" style={styles.label}>
          {voiceLabel}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoLabel}
        onPress={onPressPhoto}
        style={[styles.button, { backgroundColor: colors.surf, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: colors.pri }]}>
          <Camera size={19} color={colors.onPri} strokeWidth={1.8} />
        </View>
        <ThemedText type="smallBold" style={styles.label}>
          {photoLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: Spacing.four - 4,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
  },
});
