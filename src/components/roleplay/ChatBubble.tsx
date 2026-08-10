import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/lib/roleplay';

export type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleModel]}>
        <ThemedText type="small" style={isUser ? styles.textUser : styles.textModel}>
          {message.text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  bubbleModel: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.pri,
    borderTopRightRadius: 4,
  },
  textModel: {
    color: Colors.text,
  },
  textUser: {
    color: '#ffffff',
  },
});
