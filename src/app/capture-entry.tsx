import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaptureEntryForm, type CaptureEntryFormValues } from '@/components/log/CaptureEntryForm';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateSession } from '@/hooks/sessions/use-create-session';
import { useSession } from '@/hooks/sessions/use-session';
import { useUpdateSession } from '@/hooks/sessions/use-update-session';
import { useSubmitGuard } from '@/hooks/use-submit-guard';
import { useAuth } from '@/lib/auth-context';

export default function CaptureEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{ title?: string; minutes?: string; til?: string; timerSessionId?: string; id?: string }>();
  const editingId = params.id;
  const isEditing = editingId !== undefined;

  const createSession = useCreateSession(session?.user.id);
  const existingSession = useSession(editingId, session?.user.id);
  const updateSession = useUpdateSession(editingId, session?.user.id);
  const submitGuard = useSubmitGuard();

  if (!session) return <Redirect href="/login" />;

  const isSaving = createSession.isPending || updateSession.isPending;
  const isLoadingExisting = isEditing && existingSession.isPending;
  // Distinct from isLoadingExisting - covers both a real fetch error and a
  // successful-but-empty result (row deleted elsewhere, or hidden by RLS),
  // which !existingSession.data alone can't tell apart from "still
  // loading" once isPending has already settled to false.
  const hasLoadError = isEditing && !existingSession.isPending && (existingSession.isError || !existingSession.data);

  const handleSave = (values: CaptureEntryFormValues) => {
    if (!submitGuard.tryStart()) return;
    const onError = () => {
      submitGuard.release();
      Alert.alert(t('captureEntry.errorGeneric'));
    };

    if (isEditing) {
      updateSession.mutate(values, { onSuccess: () => router.back(), onError });
    } else {
      createSession.mutate(values, {
        onSuccess: () => {
          // Saving a timer-prefilled entry logs that session - replace
          // (not back()) into /log with no params so its ContextBanner,
          // which is keyed on this same timerSessionId, doesn't reappear
          // and invite logging the same session again.
          if (params.timerSessionId) {
            router.replace('/log');
          } else {
            router.back();
          }
        },
        onError,
      });
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('captureEntry.backAccessibilityLabel')} onPress={() => router.back()} />

        {isLoadingExisting && (
          <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
            {t('captureEntry.loading')}
          </ThemedText>
        )}

        {hasLoadError && (
          <ThemedText type="small" themeColor="amber" style={styles.centerText}>
            {t('captureEntry.loadError')}
          </ThemedText>
        )}

        {!isLoadingExisting && !hasLoadError && (
          <CaptureEntryForm
            // Forces a fresh mount (and fresh useState initializers) once the
            // record to edit has actually loaded, instead of syncing an
            // effect into state after the fact.
            key={editingId ?? 'new'}
            screenTitle={isEditing ? t('captureEntry.editTitle') : t('captureEntry.title')}
            initialValues={
              existingSession.data
                ? {
                    title: existingSession.data.title,
                    durationMinutes: existingSession.data.durationMinutes,
                    til: existingSession.data.til ?? '',
                    tags: existingSession.data.tags,
                  }
                : {
                    title: params.title ?? '',
                    durationMinutes: params.minutes ? Number(params.minutes) : null,
                    til: params.til ?? '',
                    tags: [],
                  }
            }
            isSaving={isSaving}
            onSave={handleSave}
          />
        )}
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
  centerText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
});
