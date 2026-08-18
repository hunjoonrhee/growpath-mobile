import { Settings } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type SettingsButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function SettingsButton({ accessibilityLabel, onPress }: SettingsButtonProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.surf2 }]}>
      <Settings size={18} color={colors.text} strokeWidth={1.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
