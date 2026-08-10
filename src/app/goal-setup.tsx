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
import { VoiceInputPlaceholder } from '@/components/goal-setup/VoiceInputPlaceholder';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSwitchActiveRoadmap } from '@/hooks/roadmap/use-switch-active-roadmap';
import { useSubmitGuard } from '@/hooks/use-submit-guard';
import { useAuth } from '@/lib/auth-context';
import type { Domain } from '@/lib/domain';
import { generateRoadmap, RoadmapGenerationUnavailableError } from '@/lib/roadmap-generation';

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
  const submitGuard = useSubmitGuard();

  if (!session) return <Redirect href="/login" />;

  const canSubmit = domain !== null && careerLevel.trim().length > 0 && goalText.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!domain || !submitGuard.tryStart()) return;
    setIsSubmitting(true);
    try {
      const roadmap = await generateRoadmap({
        domain,
        goalText: goalText.trim(),
        careerLevel: careerLevel.trim(),
        locale: i18n.language,
      });
      await switchRoadmap.mutateAsync(roadmap.id);
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

          <DomainChipSelector selected={domain} onSelect={setDomain} />

          <View style={styles.careerLevelField}>
            <TextField
              label={t('goalSetup.careerLevelLabel')}
              value={careerLevel}
              onChangeText={setCareerLevel}
              placeholder={t('goalSetup.careerLevelPlaceholder')}
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
              <MultilineTextInput value={goalText} onChangeText={setGoalText} placeholder={t('goalSetup.textPlaceholder')} />
            ) : (
              <VoiceInputPlaceholder message={t('goalSetup.voiceComingSoon')} />
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
