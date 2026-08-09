import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type PlaceholderScreenProps = {
  title: string;
};

/** Stand-in for a tab whose real content lands in a later phase. */
export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        {title}
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
