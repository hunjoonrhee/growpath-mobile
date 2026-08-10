import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type SocialLoginVariant = 'apple' | 'google' | 'github';

export type SocialLoginButtonProps = {
  variant: SocialLoginVariant;
  icon?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SocialLoginButton({ variant, icon, label, onPress, disabled }: SocialLoginButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'apple' && styles.apple,
        variant !== 'apple' && styles.neutral,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {icon ? <ThemedText style={styles.icon}>{icon}</ThemedText> : null}
      <ThemedText type="smallBold" style={variant === 'apple' ? styles.appleLabel : styles.neutralLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    width: '100%',
    paddingVertical: Spacing.three - 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apple: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
  },
  neutral: {
    backgroundColor: Colors.surf2,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 16,
  },
  appleLabel: {
    color: '#000000',
  },
  neutralLabel: {
    color: Colors.text,
  },
});
