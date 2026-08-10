import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DomainChipSelector } from '@/components/goal-setup/DomainChipSelector';
import { GoalTextInput } from '@/components/goal-setup/GoalTextInput';
import { InputModeToggle, type InputMode } from '@/components/goal-setup/InputModeToggle';
import { VoiceInputPlaceholder } from '@/components/goal-setup/VoiceInputPlaceholder';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import type { Domain } from '@/lib/domain';
import { generateRoadmap, RoadmapGenerationUnavailableError } from '@/lib/roadmap-generation';

export default function GoalSetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();

  const [domain, setDomain] = useState<Domain | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [goalText, setGoalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return <Redirect href="/login" />;

  const canSubmit = domain !== null && goalText.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!domain) return;
    setIsSubmitting(true);
    try {
      await generateRoadmap({ domain, goalText: goalText.trim() });
    } catch (error) {
      const message =
        error instanceof RoadmapGenerationUnavailableError ? t('goalSetup.generationUnavailable') : t('goalSetup.errorGeneric');
      Alert.alert(message);
    } finally {
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

          <View style={styles.inputSection}>
            <InputModeToggle
              mode={inputMode}
              onChange={setInputMode}
              textLabel={t('goalSetup.inputMode.text')}
              voiceLabel={t('goalSetup.inputMode.voice')}
            />
            {inputMode === 'text' ? (
              <GoalTextInput value={goalText} onChangeText={setGoalText} placeholder={t('goalSetup.textPlaceholder')} />
            ) : (
              <VoiceInputPlaceholder message={t('goalSetup.voiceComingSoon')} />
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('goalSetup.submitCta')}
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}>
            <ThemedText type="smallBold" style={styles.submitLabel}>
              {t('goalSetup.submitCta')}
            </ThemedText>
          </Pressable>
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
  inputSection: {
    marginTop: Spacing.four,
    gap: Spacing.two + 2,
  },
  submitButton: {
    marginTop: Spacing.five,
    backgroundColor: Colors.pri,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    color: '#ffffff',
    fontSize: 15,
  },
});
