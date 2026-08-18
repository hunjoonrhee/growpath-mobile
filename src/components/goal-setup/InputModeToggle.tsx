import { Mic, Type } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type InputMode = 'text' | 'voice';

export type InputModeToggleProps = {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
  textLabel: string;
  voiceLabel: string;
};

export function InputModeToggle({ mode, onChange, textLabel, voiceLabel }: InputModeToggleProps) {
  const colors = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surf2 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: mode === 'text' }}
        onPress={() => onChange('text')}
        style={[styles.segment, mode === 'text' && { backgroundColor: colors.pri }]}>
        <Type size={14} color={mode === 'text' ? colors.onPri : colors.textFaint} strokeWidth={1.8} />
        <ThemedText type="smallBold" themeColor={mode === 'text' ? 'onPri' : 'textFaint'} style={styles.label}>
          {textLabel}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: mode === 'voice' }}
        onPress={() => onChange('voice')}
        style={[styles.segment, mode === 'voice' && { backgroundColor: colors.pri }]}>
        <Mic size={14} color={mode === 'voice' ? colors.onPri : colors.textFaint} strokeWidth={1.8} />
        <ThemedText type="smallBold" themeColor={mode === 'voice' ? 'onPri' : 'textFaint'} style={styles.label}>
          {voiceLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two + 1,
    borderRadius: 9,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
  },
});
