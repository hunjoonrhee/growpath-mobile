import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { DOMAIN_LABEL_KEY, type Domain } from '@/lib/domain';

export type RecommendationCardProps = {
  /** Omitted when the recommendation isn't tied to a known domain (e.g. derived from roadmap data, which doesn't record one). */
  domain?: Domain;
  title: string;
  description: string;
  onPressCta: () => void;
};

export function RecommendationCard({ domain, title, description, onPressCta }: RecommendationCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {domain && (
        <View style={styles.domainChip}>
          <ThemedText type="smallBold" themeColor="pri2">
            {t(DOMAIN_LABEL_KEY[domain])}
          </ThemedText>
        </View>
      )}
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.description}>
        {description}
      </ThemedText>
      <Pressable
        style={styles.cta}
        onPress={onPressCta}
        accessibilityRole="button"
        accessibilityLabel={t('today.startCta')}>
        <ThemedText type="smallBold" themeColor="text">
          {t('today.startCta')}
        </ThemedText>
        <ThemedText themeColor="text">→</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: Spacing.four,
  },
  domainChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(108,99,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.half + 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    marginTop: Spacing.one,
    lineHeight: 19,
  },
  cta: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.pri,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 3,
  },
});
