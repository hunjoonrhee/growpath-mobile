import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type ChatComposerProps = {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder: string;
  sendLabel: string;
};

export function ChatComposer({ onSend, disabled, placeholder, sendLabel }: ChatComposerProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = !disabled && text.trim().length > 0;

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        style={styles.input}
        multiline
        editable={!disabled}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sendLabel}
        onPress={handleSend}
        disabled={!canSend}
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}>
        <ThemedText type="smallBold" style={styles.sendLabel}>
          {sendLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.pri,
    borderRadius: 18,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendLabel: {
    color: '#ffffff',
  },
});
