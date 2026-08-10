import { StyleSheet, TextInput } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export type GoalTextInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export function GoalTextInput({ value, onChangeText, placeholder }: GoalTextInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textFaint}
      multiline
      textAlignVertical="top"
      style={styles.textarea}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 110,
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
