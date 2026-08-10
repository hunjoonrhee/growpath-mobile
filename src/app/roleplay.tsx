import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function RoleplaySetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();

  const [language, setLanguage] = useState('');
  const [topic, setTopic] = useState('');

  if (!session) return <Redirect href="/login" />;

  const canStart = language.trim().length > 0 && topic.trim().length > 0;

  const handleStart = () => {
    router.push({ pathname: '/roleplay-chat', params: { language: language.trim(), topic: topic.trim() } });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('roleplay.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('roleplay.setupTitle')}
          </ThemedText>
          <ThemedText type="small" themeColor="textDim" style={styles.subtitle}>
            {t('roleplay.setupSubtitle')}
          </ThemedText>

          <TextField
            label={t('roleplay.languageLabel')}
            value={language}
            onChangeText={setLanguage}
            placeholder={t('roleplay.languagePlaceholder')}
          />

          <ThemedText type="small" themeColor="textDim" style={styles.topicLabel}>
            {t('roleplay.topicLabel')}
          </ThemedText>
          <MultilineTextInput value={topic} onChangeText={setTopic} placeholder={t('roleplay.topicPlaceholder')} minHeight={90} />

          <PrimaryButton label={t('roleplay.startCta')} onPress={handleStart} disabled={!canStart} style={styles.startButton} />
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
  },
  subtitle: {
    marginBottom: Spacing.two,
  },
  topicLabel: {
    marginTop: Spacing.one,
  },
  startButton: {
    marginTop: Spacing.three,
  },
});
