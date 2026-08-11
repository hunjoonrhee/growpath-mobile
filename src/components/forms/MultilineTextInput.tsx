import { StyleSheet, TextInput } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export type MultilineTextInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  minHeight?: number;
  editable?: boolean;
};

export function MultilineTextInput({ value, onChangeText, placeholder, minHeight = 110, editable = true }: MultilineTextInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textFaint}
      multiline
      textAlignVertical="top"
      editable={editable}
      style={[styles.textarea, { minHeight }, !editable && styles.textareaDisabled]}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.three,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  textareaDisabled: {
    opacity: 0.5,
  },
});
