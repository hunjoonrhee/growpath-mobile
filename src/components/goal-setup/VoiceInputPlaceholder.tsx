import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type VoiceInputPlaceholderProps = {
  message: string;
};

/** Voice capture isn't wired up yet - the STT approach hasn't been decided. */
export function VoiceInputPlaceholder({ message }: VoiceInputPlaceholderProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.icon}>🎙️</ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 110,
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  icon: {
    fontSize: 28,
  },
  message: {
    textAlign: 'center',
    lineHeight: 19,
  },
});
