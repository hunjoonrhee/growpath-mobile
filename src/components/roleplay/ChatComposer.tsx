import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
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
      <View style={styles.inputWrap}>
        <MultilineTextInput value={text} onChangeText={setText} placeholder={placeholder} minHeight={40} maxHeight={100} editable={!disabled} />
      </View>
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
  inputWrap: {
    flex: 1,
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
