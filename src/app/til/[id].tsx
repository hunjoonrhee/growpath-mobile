import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TagList } from '@/components/log/TagList';
import { TilMarkdown } from '@/components/log/TilMarkdown';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { useDeleteSession } from '@/hooks/sessions/use-delete-session';
import { useSession } from '@/hooks/sessions/use-session';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { relativeDateLabel } from '@/lib/date';

export default function TilDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session: authSession } = useAuth();
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const session = useSession(id, authSession?.user.id);
  const deleteSession = useDeleteSession(authSession?.user.id);

  if (!authSession) return <Redirect href="/login" />;

  const handleEdit = () => {
    if (!id) return;
    router.push({ pathname: '/capture-entry', params: { id } });
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(t('tilDetail.deleteConfirmTitle'), t('tilDetail.deleteConfirmMessage'), [
      { text: t('tilDetail.deleteCancel'), style: 'cancel' },
      {
        text: t('tilDetail.deleteConfirm'),
        style: 'destructive',
        onPress: () => {
          deleteSession.mutate(id, {
            onSuccess: () => router.back(),
            onError: () => Alert.alert(t('tilDetail.deleteError')),
          });
        },
      },
    ]);
  };

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

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('tilDetail.editCta')}
                  onPress={handleEdit}
                  style={[styles.actionButton, { backgroundColor: colors.surf2, borderColor: colors.border }]}>
                  <ThemedText type="smallBold">{t('tilDetail.editCta')}</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('tilDetail.deleteCta')}
                  onPress={handleDelete}
                  disabled={deleteSession.isPending}
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.surf2, borderColor: colors.border },
                    deleteSession.isPending && styles.actionButtonDisabled,
                  ]}>
                  <ThemedText type="smallBold" themeColor="amber">
                    {t('tilDetail.deleteCta')}
                  </ThemedText>
                </Pressable>
              </View>
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
    ...Typography.sectionLabel,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    marginTop: Spacing.five,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});
