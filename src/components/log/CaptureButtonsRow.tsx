import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type CaptureButtonsRowProps = {
  voiceLabel: string;
  photoLabel: string;
  onPressVoice: () => void;
  onPressPhoto: () => void;
};

export function CaptureButtonsRow({ voiceLabel, photoLabel, onPressVoice, onPressPhoto }: CaptureButtonsRowProps) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={voiceLabel} onPress={onPressVoice} style={styles.button}>
        <View style={styles.icon}>
          <ThemedText style={styles.iconGlyph}>🎙️</ThemedText>
        </View>
        <ThemedText type="smallBold" style={styles.label}>
          {voiceLabel}
        </ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={photoLabel} onPress={onPressPhoto} style={styles.button}>
        <View style={styles.icon}>
          <ThemedText style={styles.iconGlyph}>📷</ThemedText>
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
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.pri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 19,
  },
  label: {
    fontSize: 12,
  },
});
