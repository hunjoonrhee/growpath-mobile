import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TagList } from '@/components/log/TagList';
import { TilMarkdown } from '@/components/log/TilMarkdown';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/sessions/use-session';
import { useAuth } from '@/lib/auth-context';
import { relativeDateLabel } from '@/lib/date';

export default function TilDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session: authSession } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSession(id, authSession?.user.id);

  if (!authSession) return <Redirect href="/login" />;

  const dateLabel = session.data ? relativeDateLabel(session.data.date, t) : '';
  const timeLabel =
    session.data && session.data.durationMinutes !== null
      ? t('log.durationAndDate', { minutes: session.data.durationMinutes, date: dateLabel })
      : dateLabel;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('tilDetail.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          {session.isPending && (
            <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
              {t('tilDetail.loading')}
            </ThemedText>
          )}

          {!session.isPending && (session.isError || !session.data) && (
            <ThemedText type="small" themeColor="amber" style={styles.centerText}>
              {t('tilDetail.loadError')}
            </ThemedText>
          )}

          {session.data && (
            <>
              <ThemedText type="subtitle" style={styles.title}>
                {session.data.title}
              </ThemedText>
              <ThemedText type="small" themeColor="textFaint" style={styles.meta}>
                {timeLabel}
              </ThemedText>

              <TagList tags={session.data.tags} />

              <ThemedText type="small" themeColor="textFaint" style={styles.sectionLabel}>
                {t('tilDetail.tilLabel')}
              </ThemedText>
              {session.data.til ? (
                <TilMarkdown content={session.data.til} />
              ) : (
                <ThemedText type="small" themeColor="textDim">
                  {t('tilDetail.noTil')}
                </ThemedText>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  meta: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
    fontSize: 12,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
});
