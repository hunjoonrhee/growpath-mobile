import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SocialLoginVariant = 'apple' | 'google' | 'github';

export type SocialLoginButtonProps = {
  variant: SocialLoginVariant;
  // Google/GitHub have no equivalent in the generic icon set (real brand
  // marks aren't included, and a look-alike risks reading as wrong/fake) -
  // those two variants go icon-less, text-only.
  icon?: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SocialLoginButton({ variant, icon: Icon, label, onPress, disabled }: SocialLoginButtonProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        // Apple's "Sign in with Apple" button colors are fixed by Apple's
        // brand guidelines, not the app theme - white bg + black text
        // regardless of light/dark mode.
        variant === 'apple' ? styles.apple : { backgroundColor: colors.surf2, borderColor: colors.border },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {Icon ? <Icon size={18} color={variant === 'apple' ? '#000000' : colors.text} strokeWidth={1.8} /> : null}
      <ThemedText type="smallBold" style={variant === 'apple' ? styles.appleLabel : { color: colors.text }}>
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
  },
  apple: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  appleLabel: {
    color: '#000000',
  },
});
