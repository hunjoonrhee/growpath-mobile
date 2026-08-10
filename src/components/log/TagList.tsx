import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type TagListProps = {
  tags: string[];
  /** Caps how many tags render before collapsing the rest into a "+N" chip. Omit to show all. */
  maxVisible?: number;
};

export function TagList({ tags, maxVisible }: TagListProps) {
  if (tags.length === 0) return null;

  const visibleTags = maxVisible !== undefined ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <View style={styles.tags}>
      {visibleTags.map((tag) => (
        <ThemedText key={tag} type="small" themeColor="textDim" style={styles.tag}>
          #{tag}
        </ThemedText>
      ))}
      {hiddenCount > 0 && (
        <ThemedText type="small" themeColor="textFaint" style={styles.tag}>
          +{hiddenCount}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + 2,
  },
  tag: {
    backgroundColor: Colors.surf2,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 11,
  },
});
