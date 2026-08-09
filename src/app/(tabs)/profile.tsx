import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// TODO(phase-3+): avatar upload, stats, career goal summary, settings, logout.
export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        {t('profile.title')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  title: {
    marginTop: Spacing.four,
    fontSize: 22,
    lineHeight: 28,
  },
});
