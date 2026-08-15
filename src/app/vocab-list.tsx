import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/navigation/BackHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SwipeableVocabWordCard } from '@/components/vocab/SwipeableVocabWordCard';
import { Colors, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useAllVocabWords } from '@/hooks/vocab/use-all-vocab-words';
import { useDeleteVocabWord } from '@/hooks/vocab/use-delete-vocab-word';
import { useAuth } from '@/lib/auth-context';

export default function VocabListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const allVocabWords = useAllVocabWords(session?.user.id);
  const deleteVocabWord = useDeleteVocabWord(session?.user.id);
  const { refreshing, onRefresh } = usePullToRefresh();

  if (!session) return <Redirect href="/login" />;

  const words = allVocabWords.data ?? [];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <BackHeader accessibilityLabel={t('vocabList.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pri2} />}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('vocabList.title')}
          </ThemedText>

          {allVocabWords.isLoading && (
            <ThemedText type="small" themeColor="textDim">
              {t('vocabList.loading')}
            </ThemedText>
          )}

          {!allVocabWords.isLoading && allVocabWords.isError && (
            <ThemedText type="small" themeColor="amber">
              {t('vocabList.loadError')}
            </ThemedText>
          )}

          {!allVocabWords.isLoading && !allVocabWords.isError && words.length === 0 && (
            <ThemedText type="small" themeColor="textDim">
              {t('vocabList.empty')}
            </ThemedText>
          )}

          {!allVocabWords.isLoading &&
            !allVocabWords.isError &&
            words.map((word) => (
              <SwipeableVocabWordCard
                key={word.id}
                word={word}
                onDelete={() => deleteVocabWord.mutate(word.id, { onError: () => Alert.alert(t('vocabList.deleteError')) })}
              />
            ))}
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
    marginBottom: Spacing.three,
  },
});
