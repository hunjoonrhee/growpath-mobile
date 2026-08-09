import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// TODO(phase-4): voice/photo capture buttons + recent logs list.
export default function LogScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        기록
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  title: {
    marginTop: Spacing.four,
    fontSize: 22,
    lineHeight: 28,
  },
});
