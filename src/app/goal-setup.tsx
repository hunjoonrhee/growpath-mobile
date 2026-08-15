import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { DomainChipSelector } from '@/components/goal-setup/DomainChipSelector';
import { InputModeToggle, type InputMode } from '@/components/goal-setup/InputModeToggle';
import { VoiceDictationField } from '@/components/voice/VoiceDictationField';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSwitchActiveRoadmap } from '@/hooks/roadmap/use-switch-active-roadmap';
import { useSubmitGuard } from '@/hooks/use-submit-guard';
import { useAuth } from '@/lib/auth-context';
import type { Domain } from '@/lib/domain';
import { toBcp47 } from '@/lib/locale-bcp47';
import { generateRoadmap, RoadmapGenerationUnavailableError } from '@/lib/roadmap-generation';

/** Wraps a setter so any edit to that field also invalidates a cached pendingRoadmapId (see below). */
function withPendingReset<T>(setPendingRoadmapId: (id: string | null) => void, setValue: (next: T) => void) {
  return (next: T) => {
    setPendingRoadmapId(null);
    setValue(next);
  };
}

export default function GoalSetupScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const switchRoadmap = useSwitchActiveRoadmap(session?.user.id);

  const [domain, setDomain] = useState<Domain | null>(null);
  const [careerLevel, setCareerLevel] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [goalText, setGoalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once generateRoadmap succeeds, so a retry after a failed adopt below
  // doesn't call generateRoadmap again and create a second, orphaned
  // ai_roadmaps row for the same submission - it just retries adoption.
  // Cleared on any field edit so a retry after changing the goal doesn't
  // silently adopt a roadmap generated for the old input. Fields are
  // disabled while isSubmitting (below), so an edit can only happen between
  // submit attempts, never while one is in flight - no snapshot/ref
  // comparison needed to catch a mid-flight edit, because one can't happen.
  const [pendingRoadmapId, setPendingRoadmapId] = useState<string | null>(null);
  const submitGuard = useSubmitGuard();

  if (!session) return <Redirect href="/login" />;

  const handleDomainSelect = withPendingReset(setPendingRoadmapId, setDomain);
  const handleCareerLevelChange = withPendingReset(setPendingRoadmapId, setCareerLevel);
  const handleGoalTextChange = withPendingReset(setPendingRoadmapId, setGoalText);

  const canSubmit = domain !== null && careerLevel.trim().length > 0 && goalText.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!domain || !submitGuard.tryStart()) return;
    setIsSubmitting(true);
    try {
      const roadmapId =
        pendingRoadmapId ??
        (
          await generateRoadmap({
            goalText: goalText.trim(),
            careerLevel: careerLevel.trim(),
            locale: i18n.language,
          })
        ).id;

      setPendingRoadmapId(roadmapId);
      await switchRoadmap.mutateAsync(roadmapId);
      router.replace('/roadmap');
    } catch (error) {
      const message =
        error instanceof RoadmapGenerationUnavailableError ? t('goalSetup.generationUnavailable') : t('goalSetup.errorGeneric');
      Alert.alert(message);
    } finally {
      submitGuard.release();
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('goalSetup.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('goalSetup.title')}
          </ThemedText>
          <ThemedText type="small" themeColor="textDim" style={styles.subtitle}>
            {t('goalSetup.subtitle')}
          </ThemedText>

          <DomainChipSelector selected={domain} onSelect={handleDomainSelect} disabled={isSubmitting} />

          <View style={styles.careerLevelField}>
            <TextField
              label={t('goalSetup.careerLevelLabel')}
              value={careerLevel}
              onChangeText={handleCareerLevelChange}
              placeholder={t('goalSetup.careerLevelPlaceholder')}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputSection}>
            <InputModeToggle
              mode={inputMode}
              onChange={setInputMode}
              textLabel={t('goalSetup.inputMode.text')}
              voiceLabel={t('goalSetup.inputMode.voice')}
            />
            {inputMode === 'text' ? (
              <MultilineTextInput
                value={goalText}
                onChangeText={handleGoalTextChange}
                placeholder={t('goalSetup.textPlaceholder')}
                editable={!isSubmitting}
              />
            ) : (
              <VoiceDictationField
                language={toBcp47(i18n.language)}
                onTranscript={(text) => handleGoalTextChange(goalText ? `${goalText} ${text}` : text)}
                idleLabel={t('goalSetup.voiceIdle')}
                recordingLabel={t('goalSetup.voiceRecording')}
                transcribingLabel={t('goalSetup.voiceTranscribing')}
                errorLabel={t('goalSetup.voiceError')}
              />
            )}
          </View>

          <PrimaryButton label={t('goalSetup.submitCta')} onPress={handleSubmit} disabled={!canSubmit} style={styles.submitButton} />
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
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  careerLevelField: {
    marginTop: Spacing.four,
  },
  inputSection: {
    marginTop: Spacing.four,
    gap: Spacing.two + 2,
  },
  submitButton: {
    marginTop: Spacing.five,
  },
});
