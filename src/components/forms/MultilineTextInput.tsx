import { StyleSheet, TextInput } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MultilineTextInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  minHeight?: number;
  maxHeight?: number;
  editable?: boolean;
};

export function MultilineTextInput({
  value,
  onChangeText,
  placeholder,
  minHeight = 110,
  maxHeight,
  editable = true,
}: MultilineTextInputProps) {
  const colors = useTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      multiline
      textAlignVertical="top"
      editable={editable}
      style={[
        styles.textarea,
        { backgroundColor: colors.surf, borderColor: colors.border, color: colors.text, minHeight, maxHeight },
        !editable && styles.textareaDisabled,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  textareaDisabled: {
    opacity: 0.5,
  },
});
