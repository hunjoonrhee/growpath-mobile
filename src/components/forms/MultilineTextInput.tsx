import { StyleSheet, TextInput } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export type MultilineTextInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  minHeight?: number;
};

export function MultilineTextInput({ value, onChangeText, placeholder, minHeight = 110 }: MultilineTextInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textFaint}
      multiline
      textAlignVertical="top"
      style={[styles.textarea, { minHeight }]}
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
});
