import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type BrandHeaderProps = {
  tagline: string;
};

export function BrandHeader({ tagline }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <ThemedText style={styles.markGlyph}>🧭</ThemedText>
      </View>
      <ThemedText type="title" style={styles.title}>
        Growpath
      </ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.tagline}>
        {tagline}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.pri,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four - 6,
  },
  markGlyph: {
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  tagline: {
    marginTop: Spacing.two,
    textAlign: 'center',
    lineHeight: 20,
  },
});
