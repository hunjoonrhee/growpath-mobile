import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type BackButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function BackButton({ accessibilityLabel, onPress }: BackButtonProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.surf2 }]}>
      <ArrowLeft size={18} color={colors.text} strokeWidth={1.8} />
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
