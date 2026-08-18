import { Compass } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BrandHeaderProps = {
  tagline: string;
};

export function BrandHeader({ tagline }: BrandHeaderProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.mark, { backgroundColor: colors.pri }]}>
        <Compass size={30} color={colors.onPri} strokeWidth={1.8} />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four - 6,
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
