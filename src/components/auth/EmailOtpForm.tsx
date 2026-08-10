import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type EmailOtpFormProps = {
  email: string;
  onChangeEmail: (email: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  placeholder: string;
  submitLabel: string;
};

export function EmailOtpForm({ email, onChangeEmail, onSubmit, isSubmitting, placeholder, submitLabel }: EmailOtpFormProps) {
  return (
    <View style={styles.row}>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        onPress={onSubmit}
        disabled={isSubmitting || email.length === 0}
        style={({ pressed }) => [styles.submit, (isSubmitting || email.length === 0) && styles.submitDisabled, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
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
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three,
    color: Colors.text,
    fontSize: 14,
  },
  submit: {
    backgroundColor: Colors.pri,
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
  submitLabel: {
    color: '#ffffff',
  },
});
