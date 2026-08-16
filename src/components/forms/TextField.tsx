import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
};

export function TextField({ label, value, onChangeText, placeholder, keyboardType, editable = true }: TextFieldProps) {
  const colors = useTheme();

  return (
    <View>
      <ThemedText type="small" themeColor="textDim" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        editable={editable}
        style={[
          styles.input,
          { backgroundColor: colors.surf, borderColor: colors.border, color: colors.text },
          !editable && styles.inputDisabled,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.one + 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two + 3,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.5,
  },
});
