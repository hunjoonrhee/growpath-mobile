import { LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { CertificationsSection } from '@/components/profile/CertificationsSection';
import { LanguageSelector } from '@/components/profile/LanguageSelector';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';
import { ThemeModeSelector } from '@/components/profile/ThemeModeSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { useProfileInfo } from '@/hooks/profile/use-profile-info';
import { useSaveProfileInfo } from '@/hooks/profile/use-save-profile-info';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { clearTodayWidgetSnapshot } from '@/hooks/widgets/use-today-widget-sync';
import { useAuth } from '@/lib/auth-context';
import { setAppLanguage, type SupportedLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

// TODO(phase-3+): avatar upload, stats.
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const userId = session?.user.id;
  const profileInfo = useProfileInfo(userId);
  const saveProfileInfo = useSaveProfileInfo(userId);
  const themeMode = useThemeMode();

  const handleSelectLanguage = (language: SupportedLanguage) => {
    setAppLanguage(language).catch(() => Alert.alert(t('profile.languageError')));
  };

  const handleSaveInfo = (info: { name: string; bio: string }) => {
    saveProfileInfo.mutate(info, { onError: () => Alert.alert(t('profile.saveError')) });
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
            {t('profile.infoSectionTitle')}
          </ThemedText>
          {profileInfo.isLoading && (
            <ThemedText type="small" themeColor="textDim">
              {t('profile.loading')}
            </ThemedText>
          )}
          {!profileInfo.isLoading && profileInfo.isError && (
            <ThemedText type="small" themeColor="amber">
              {t('profile.loadError')}
            </ThemedText>
          )}
          {profileInfo.data && (
            <ProfileInfoForm
              name={profileInfo.data.name}
              bio={profileInfo.data.bio}
              nameLabel={t('profile.nameLabel')}
              namePlaceholder={t('profile.namePlaceholder')}
              bioLabel={t('profile.bioLabel')}
              bioPlaceholder={t('profile.bioPlaceholder')}
              saveLabel={t('profile.saveCta')}
              savingLabel={t('profile.saving')}
              isSaving={saveProfileInfo.isPending}
              onSave={handleSaveInfo}
            />
          )}

          <CertificationsSection userId={userId} />

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('profile.settingsSectionTitle')}
          </ThemedText>
          <LanguageSelector current={i18n.language} onSelect={handleSelectLanguage} />
          <ThemedText type="small" themeColor="textDim" style={styles.subLabel}>
            {t('profile.themeLabel')}
          </ThemedText>
          <ThemeModeSelector current={themeMode.mode} onSelect={themeMode.setMode} />

          <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
            {t('profile.accountSectionTitle')}
          </ThemedText>
          <NavRow icon={LogOut} label={t('profile.logoutCta')} onPress={handleLogout} />
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
  subLabel: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
});
