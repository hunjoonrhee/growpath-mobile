import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type InputMode = 'text' | 'voice';

export type InputModeToggleProps = {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
  textLabel: string;
  voiceLabel: string;
};

export function InputModeToggle({ mode, onChange, textLabel, voiceLabel }: InputModeToggleProps) {
  return (
    <View style={styles.track}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: mode === 'text' }}
        onPress={() => onChange('text')}
        style={[styles.segment, mode === 'text' && styles.segmentActive]}>
        <ThemedText type="smallBold" themeColor={mode === 'text' ? 'text' : 'textFaint'} style={styles.label}>
          {textLabel}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: mode === 'voice' }}
        onPress={() => onChange('voice')}
        style={[styles.segment, mode === 'voice' && styles.segmentActive]}>
        <ThemedText type="smallBold" themeColor={mode === 'voice' ? 'text' : 'textFaint'} style={styles.label}>
          {voiceLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.surf2,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.two + 1,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.pri,
  },
  label: {
    fontSize: 12,
  },
});
