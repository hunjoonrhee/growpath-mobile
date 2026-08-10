import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { ProfileNavRow } from '@/components/profile/ProfileNavRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDueVocabWordCount } from '@/hooks/vocab/use-due-vocab-word-count';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

// TODO(phase-3+): avatar upload, stats, career goal summary, settings.
export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const dueVocabWordCount = useDueVocabWordCount(session?.user.id);

  const handleLogout = () => {
    Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmMessage'), [
      { text: t('profile.logoutCancel'), style: 'cancel' },
      {
        text: t('profile.logoutConfirm'),
        style: 'destructive',
        onPress: () => {
          // AuthProvider's onAuthStateChange listener picks up the cleared
          // session and the (tabs) layout redirects to /login on its own -
          // no manual navigation needed here.
          supabase.auth.signOut().catch(() => Alert.alert(t('profile.logoutError')));
        },
      },
    ]);
  };

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

        <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
          {t('profile.accountSectionTitle')}
        </ThemedText>
        <ProfileNavRow icon="🚪" label={t('profile.logoutCta')} onPress={handleLogout} />
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
    marginTop: Spacing.four,
    marginBottom: Spacing.two + 2,
  },
});
