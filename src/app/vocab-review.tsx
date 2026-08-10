import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VocabCard } from '@/components/vocab/VocabCard';
import { VocabProgressHeader } from '@/components/vocab/VocabProgressHeader';
import { VocabReviewActions } from '@/components/vocab/VocabReviewActions';
import { Spacing } from '@/constants/theme';
import { useDueVocabWords } from '@/hooks/vocab/use-due-vocab-words';
import { useReviewVocabWord } from '@/hooks/vocab/use-review-vocab-word';
import { useAuth } from '@/lib/auth-context';

export default function VocabReviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const dueWords = useDueVocabWords(session?.user.id);
  const reviewWord = useReviewVocabWord(session?.user.id);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!session) return <Redirect href="/login" />;

  const words = dueWords.data ?? [];
  const total = words.length;
  const currentWord = words[currentIndex];

  const handleReview = (knew: boolean) => {
    if (!currentWord) return;
    reviewWord.mutate(
      {
        id: currentWord.id,
        current: { intervalDays: currentWord.intervalDays, easeFactor: currentWord.easeFactor, reviewCount: currentWord.reviewCount },
        knew,
      },
      {
        onSuccess: () => setCurrentIndex((index) => index + 1),
        onError: () => Alert.alert(t('vocab.errorGeneric')),
      }
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <VocabProgressHeader
          onBack={() => router.back()}
          backAccessibilityLabel={t('vocab.backAccessibilityLabel')}
          current={Math.min(currentIndex, total)}
          total={total}
        />

        <ScrollView contentContainerStyle={styles.content}>
          {dueWords.isLoading && (
            <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
              {t('vocab.loading')}
            </ThemedText>
          )}

          {!dueWords.isLoading && dueWords.isError && (
            <ThemedText type="small" themeColor="amber" style={styles.centerText}>
              {t('vocab.loadError')}
            </ThemedText>
          )}

          {!dueWords.isLoading && !dueWords.isError && total === 0 && (
            <ThemedText type="subtitle" style={styles.centerText}>
              {t('vocab.emptyDeck')}
            </ThemedText>
          )}

          {!dueWords.isLoading && !dueWords.isError && total > 0 && currentIndex >= total && (
            <ThemedText type="subtitle" style={styles.centerText}>
              {t('vocab.deckComplete')}
            </ThemedText>
          )}

          {currentWord && (
            <>
              <VocabCard
                language={currentWord.language}
                word={currentWord.word}
                meaning={currentWord.meaning}
                exampleSentence={currentWord.exampleSentence}
                exampleHint={t('vocab.exampleHint')}
              />
              <VocabReviewActions
                onPressAgain={() => handleReview(false)}
                onPressKnow={() => handleReview(true)}
                againLabel={t('vocab.againCta')}
                knowLabel={t('vocab.knowCta')}
                disabled={reviewWord.isPending}
              />
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
});
