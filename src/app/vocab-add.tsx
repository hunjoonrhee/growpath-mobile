import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { TextField } from '@/components/forms/TextField';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useCreateVocabWord } from '@/hooks/vocab/use-create-vocab-word';
import { useAuth } from '@/lib/auth-context';

export default function VocabAddScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const createVocabWord = useCreateVocabWord(session?.user.id);

  const [language, setLanguage] = useState('');
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');

  if (!session) return <Redirect href="/login" />;

  const canSave = language.trim().length > 0 && word.trim().length > 0 && meaning.trim().length > 0 && !createVocabWord.isPending;

  const handleSave = () => {
    createVocabWord.mutate(
      { language: language.trim(), word: word.trim(), meaning: meaning.trim(), exampleSentence: exampleSentence.trim() },
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert(t('vocabAdd.errorGeneric')),
      }
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('vocabAdd.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('vocabAdd.title')}
          </ThemedText>

          <TextField label={t('vocabAdd.languageLabel')} value={language} onChangeText={setLanguage} placeholder={t('vocabAdd.languagePlaceholder')} />
          <TextField label={t('vocabAdd.wordLabel')} value={word} onChangeText={setWord} placeholder={t('vocabAdd.wordPlaceholder')} />
          <TextField label={t('vocabAdd.meaningLabel')} value={meaning} onChangeText={setMeaning} placeholder={t('vocabAdd.meaningPlaceholder')} />

          <ThemedText type="small" themeColor="textDim">
            {t('vocabAdd.exampleLabel')}
          </ThemedText>
          <MultilineTextInput
            value={exampleSentence}
            onChangeText={setExampleSentence}
            placeholder={t('vocabAdd.examplePlaceholder')}
            minHeight={80}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('vocabAdd.saveCta')}
            onPress={handleSave}
            disabled={!canSave}
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
            <ThemedText type="smallBold" style={styles.saveLabel}>
              {t('vocabAdd.saveCta')}
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
    gap: Spacing.three,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.two,
  },
  saveButton: {
    marginTop: Spacing.three,
    backgroundColor: Colors.pri,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveLabel: {
    color: '#ffffff',
    fontSize: 15,
  },
});
