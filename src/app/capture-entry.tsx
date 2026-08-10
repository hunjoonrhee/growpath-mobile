import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateSession } from '@/hooks/sessions/use-create-session';
import { useAuth } from '@/lib/auth-context';

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function CaptureEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const createSession = useCreateSession(session?.user.id);
  const prefill = useLocalSearchParams<{ title?: string; minutes?: string; timerSessionId?: string }>();

  const [title, setTitle] = useState(prefill.title ?? '');
  const [durationText, setDurationText] = useState(prefill.minutes ?? '');
  const [til, setTil] = useState('');
  const [tagsText, setTagsText] = useState('');
  // createSession.isPending only feeds canSave after a re-render commits, so
  // a fast double-tap before that lands can still fire mutate() twice.
  const isSubmittingRef = useRef(false);

  if (!session) return <Redirect href="/login" />;

  const trimmedDuration = durationText.trim();
  // Digits-only on purpose: catches non-numeric input (including a decimal
  // comma, which German-locale users commonly type) instead of letting
  // Number() silently turn it into NaN -> null on save.
  const isDurationValid = trimmedDuration.length === 0 || /^\d+$/.test(trimmedDuration);
  const canSave = title.trim().length > 0 && isDurationValid && !createSession.isPending;

  const handleSave = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    const durationMinutes = trimmedDuration.length > 0 ? Number(trimmedDuration) : null;
    createSession.mutate(
      { title: title.trim(), durationMinutes, til: til.trim(), tags: parseTags(tagsText) },
      {
        onSuccess: () => {
          // Saving a timer-prefilled entry logs that session - replace
          // (not back()) into /log with no params so its ContextBanner,
          // which is keyed on this same timerSessionId, doesn't reappear
          // and invite logging the same session again.
          if (prefill.timerSessionId) {
            router.replace('/log');
          } else {
            router.back();
          }
        },
        onError: () => {
          isSubmittingRef.current = false;
          Alert.alert(t('captureEntry.errorGeneric'));
        },
      }
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('captureEntry.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('captureEntry.title')}
          </ThemedText>

          <TextField label={t('captureEntry.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('captureEntry.titlePlaceholder')} />

          <TextField
            label={t('captureEntry.durationLabel')}
            value={durationText}
            onChangeText={setDurationText}
            placeholder={t('captureEntry.durationPlaceholder')}
            keyboardType="number-pad"
          />

          <View style={styles.tilField}>
            <ThemedText type="small" themeColor="textDim">
              {t('captureEntry.tilLabel')}
            </ThemedText>
            <MultilineTextInput value={til} onChangeText={setTil} placeholder={t('captureEntry.tilPlaceholder')} />
          </View>

          <TextField label={t('captureEntry.tagsLabel')} value={tagsText} onChangeText={setTagsText} placeholder={t('captureEntry.tagsPlaceholder')} />

          <PrimaryButton label={t('captureEntry.saveCta')} onPress={handleSave} disabled={!canSave} style={styles.saveButton} />
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
    gap: Spacing.three,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.two,
  },
  tilField: {
    gap: Spacing.one + 2,
  },
  saveButton: {
    marginTop: Spacing.three,
  },
});
