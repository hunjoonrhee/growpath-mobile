import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type NoActiveRoadmapStateProps = {
  onPressSetGoal: () => void;
};

export function NoActiveRoadmapState({ onPressSetGoal }: NoActiveRoadmapStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.centerText}>
        {t('roadmap.emptyTitle')}
      </ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
        {t('roadmap.emptySubtitle')}
      </ThemedText>
      <Pressable accessibilityRole="button" accessibilityLabel={t('roadmap.emptyCta')} onPress={onPressSetGoal} style={styles.cta}>
        <ThemedText type="smallBold" style={styles.ctaLabel}>
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
    backgroundColor: Colors.pri,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
  },
  ctaLabel: {
    color: '#ffffff',
  },
});
