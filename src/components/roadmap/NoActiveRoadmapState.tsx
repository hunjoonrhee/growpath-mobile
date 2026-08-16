import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type NoActiveRoadmapStateProps = {
  onPressSetGoal: () => void;
};

export function NoActiveRoadmapState({ onPressSetGoal }: NoActiveRoadmapStateProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.centerText}>
        {t('roadmap.emptyTitle')}
      </ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
        {t('roadmap.emptySubtitle')}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('roadmap.emptyCta')}
        onPress={onPressSetGoal}
        style={[styles.cta, { backgroundColor: colors.pri }]}>
        <ThemedText type="smallBold" style={{ color: colors.onPri }}>
          {t('roadmap.emptyCta')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.six,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  cta: {
    marginTop: Spacing.three,
    alignSelf: 'center',
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
  },
});
