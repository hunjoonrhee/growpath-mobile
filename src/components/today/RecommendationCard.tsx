import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DOMAIN_LABEL_KEY, type Domain } from '@/lib/domain';
import { withAlpha } from '@/lib/color';

export type RecommendationCardProps = {
  /** Omitted when the recommendation isn't tied to a known domain (e.g. derived from roadmap data, which doesn't record one). */
  domain?: Domain;
  title: string;
  description: string;
  onPressCta: () => void;
};

export function RecommendationCard({ domain, title, description, onPressCta }: RecommendationCardProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surf, borderColor: colors.border }]}>
      {domain && (
        <View style={[styles.domainChip, { backgroundColor: withAlpha(colors.pri, 0.14) }]}>
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
        style={[styles.cta, { backgroundColor: colors.pri }]}
        onPress={onPressCta}
        accessibilityRole="button"
        accessibilityLabel={t('today.startCta')}>
        <ThemedText type="smallBold" style={{ color: colors.onPri }}>
          {t('today.startCta')}
        </ThemedText>
        <ArrowRight size={16} color={colors.onPri} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four,
  },
  domainChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.half + 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 17,
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
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 3,
  },
});
