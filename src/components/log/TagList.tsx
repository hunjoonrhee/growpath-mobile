import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type TagListProps = {
  tags: string[];
};

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.tags}>
      {tags.map((tag) => (
        <ThemedText key={tag} type="small" themeColor="textDim" style={styles.tag}>
          #{tag}
        </ThemedText>
      ))}
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
