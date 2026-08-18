import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type EmailOtpFormProps = {
  email: string;
  onChangeEmail: (email: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  placeholder: string;
  submitLabel: string;
};

export function EmailOtpForm({ email, onChangeEmail, onSubmit, isSubmitting, placeholder, submitLabel }: EmailOtpFormProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={[styles.input, { backgroundColor: colors.surf, borderColor: colors.border, color: colors.text }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        onPress={onSubmit}
        disabled={isSubmitting || email.length === 0}
        style={({ pressed }) => [
          styles.submit,
          { backgroundColor: colors.pri },
          (isSubmitting || email.length === 0) && styles.submitDisabled,
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={{ color: colors.onPri }}>
          {submitLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  submit: {
    borderRadius: 14,
    paddingHorizontal: Spacing.four - 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
