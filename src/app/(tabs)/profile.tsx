import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { ProfileNavRow } from '@/components/profile/ProfileNavRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDueVocabWordCount } from '@/hooks/vocab/use-due-vocab-word-count';
import { useAuth } from '@/lib/auth-context';

// TODO(phase-3+): avatar upload, stats, career goal summary, settings, logout.
export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const dueVocabWordCount = useDueVocabWordCount(session?.user.id);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t('profile.title')}
        </ThemedText>

        <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
          {t('profile.learningSectionTitle')}
        </ThemedText>
        <ProfileNavRow
          icon="🗂️"
          label={t('profile.vocabReviewCta')}
          subtitle={t('profile.vocabDueCount', { count: dueVocabWordCount.data ?? 0 })}
          onPress={() => router.push('/vocab-review')}
        />
        <ProfileNavRow icon="➕" label={t('profile.vocabAddCta')} onPress={() => router.push('/vocab-add')} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: Spacing.two + 2,
  },
});
