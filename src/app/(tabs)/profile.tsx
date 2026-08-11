import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { LanguageSelector } from '@/components/profile/LanguageSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { clearTodayWidgetSnapshot } from '@/hooks/widgets/use-today-widget-sync';
import { setAppLanguage, type SupportedLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

// TODO(phase-3+): avatar upload, stats, career goal summary.
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();

  const handleSelectLanguage = (language: SupportedLanguage) => {
    setAppLanguage(language).catch(() => Alert.alert(t('profile.languageError')));
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmMessage'), [
      { text: t('profile.logoutCancel'), style: 'cancel' },
      {
        text: t('profile.logoutConfirm'),
        style: 'destructive',
        onPress: () => {
          // AuthProvider's onAuthStateChange listener picks up the cleared
          // session and the (tabs) layout redirects to /login on its own -
          // no manual navigation needed here.
          clearTodayWidgetSnapshot();
          supabase.auth.signOut().catch(() => Alert.alert(t('profile.logoutError')));
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {t('profile.title')}
          </ThemedText>

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('profile.settingsSectionTitle')}
          </ThemedText>
          <LanguageSelector current={i18n.language} onSelect={handleSelectLanguage} />

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('profile.accountSectionTitle')}
          </ThemedText>
          <NavRow icon="🚪" label={t('profile.logoutCta')} onPress={handleLogout} />
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    marginTop: Spacing.four,
    marginBottom: Spacing.two + 2,
  },
});
