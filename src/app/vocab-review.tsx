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
import { useSubmitGuard } from '@/hooks/use-submit-guard';
import { useDueVocabWords } from '@/hooks/vocab/use-due-vocab-words';
import { useReviewVocabWord } from '@/hooks/vocab/use-review-vocab-word';
import { useAuth } from '@/lib/auth-context';
import type { VocabWord } from '@/lib/vocab';

export default function VocabReviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const dueWords = useDueVocabWords(session?.user.id);
  const reviewWord = useReviewVocabWord(session?.user.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Reviewing a word invalidates the due-words query, which then refetches
  // with that word removed. Reading dueWords.data directly here would shift
  // every later word down one slot mid-session and skip it. Snapshotting
  // the deck once, on first load, keeps the session's word order stable
  // regardless of what the query refetches in the background.
  const [deck, setDeck] = useState<VocabWord[] | null>(null);
  const submitGuard = useSubmitGuard();
  // Set directly during render (React's documented pattern for deriving
  // state from data that just arrived), not in a useEffect - the guard
  // means this only fires once, the first render after dueWords.data
  // arrives, so it can't loop.
  if (deck === null && dueWords.data) {
    setDeck(dueWords.data);
  }

  if (!session) return <Redirect href="/login" />;

  const words = deck ?? [];
  const total = words.length;
  const currentWord = words[currentIndex];
  const isInitializing = dueWords.isLoading || deck === null;

  const handleReview = (knew: boolean) => {
    if (!currentWord || !submitGuard.tryStart()) return;
    reviewWord.mutate(
      {
        id: currentWord.id,
        current: { intervalDays: currentWord.intervalDays, easeFactor: currentWord.easeFactor, reviewCount: currentWord.reviewCount },
        knew,
      },
      {
        onSuccess: () => {
          submitGuard.release();
          setCurrentIndex((index) => index + 1);
        },
        onError: () => {
          submitGuard.release();
          Alert.alert(t('vocab.errorGeneric'));
        },
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
          {isInitializing && !dueWords.isError && (
            <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
              {t('vocab.loading')}
            </ThemedText>
          )}

          {dueWords.isError && (
            <ThemedText type="small" themeColor="amber" style={styles.centerText}>
              {t('vocab.loadError')}
            </ThemedText>
          )}

          {!isInitializing && !dueWords.isError && total === 0 && (
            <ThemedText type="subtitle" style={styles.centerText}>
              {t('vocab.emptyDeck')}
            </ThemedText>
          )}

          {!isInitializing && !dueWords.isError && total > 0 && currentIndex >= total && (
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
