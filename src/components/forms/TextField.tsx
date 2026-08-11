import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
};

export function TextField({ label, value, onChangeText, placeholder, keyboardType, editable = true }: TextFieldProps) {
  return (
    <View>
      <ThemedText type="small" themeColor="textDim" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        keyboardType={keyboardType}
        editable={editable}
        style={[styles.input, !editable && styles.inputDisabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.one + 2,
  },
  input: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.two + 3,
    paddingHorizontal: Spacing.three,
    color: Colors.text,
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.5,
  },
});
