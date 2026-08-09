import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type RecommendationDomain = 'dev' | 'language' | 'art' | 'other';

const DOMAIN_LABEL: Record<RecommendationDomain, string> = {
  dev: '💻 개발',
  language: '🗣️ 언어',
  art: '🎨 예술',
  other: '✨ 기타',
};

export type RecommendationCardProps = {
  domain: RecommendationDomain;
  title: string;
  description: string;
  ctaLabel: string;
  onPressCta: () => void;
};

export function RecommendationCard({ domain, title, description, ctaLabel, onPressCta }: RecommendationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.domainChip}>
        <ThemedText type="smallBold" themeColor="pri2">
          {DOMAIN_LABEL[domain]}
        </ThemedText>
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.description}>
        {description}
      </ThemedText>
      <Pressable style={styles.cta} onPress={onPressCta}>
        <ThemedText type="smallBold" themeColor="text">
          {ctaLabel}
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
