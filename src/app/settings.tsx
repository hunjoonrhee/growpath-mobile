import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { BackHeader } from '@/components/navigation/BackHeader';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { ThemeModeSelector } from '@/components/settings/ThemeModeSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { clearTodayWidgetSnapshot } from '@/hooks/widgets/use-today-widget-sync';
import { setAppLanguage, type SupportedLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const themeMode = useThemeMode();

  const handleSelectLanguage = (language: SupportedLanguage) => {
    setAppLanguage(language).catch(() => Alert.alert(t('settings.languageError')));
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logoutConfirmTitle'), t('settings.logoutConfirmMessage'), [
      { text: t('settings.logoutCancel'), style: 'cancel' },
      {
        text: t('settings.logoutConfirm'),
        style: 'destructive',
        onPress: () => {
          // AuthProvider's onAuthStateChange listener picks up the cleared
          // session and the (tabs) layout redirects to /login on its own -
          // no manual navigation needed here.
          clearTodayWidgetSnapshot();
          supabase.auth.signOut().catch(() => Alert.alert(t('settings.logoutError')));
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <BackHeader accessibilityLabel={t('settings.backAccessibilityLabel')} onPress={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {t('settings.title')}
          </ThemedText>

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('settings.languageSectionTitle')}
          </ThemedText>
          <LanguageSelector current={i18n.language} onSelect={handleSelectLanguage} />

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('settings.themeSectionTitle')}
          </ThemedText>
          <ThemeModeSelector current={themeMode.mode} onSelect={themeMode.setMode} />

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('settings.accountSectionTitle')}
          </ThemedText>
          <NavRow icon={LogOut} label={t('settings.logoutCta')} onPress={handleLogout} />
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
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    marginTop: Spacing.four,
    marginBottom: Spacing.two + 2,
  },
});
