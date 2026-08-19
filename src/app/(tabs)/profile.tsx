import { useRouter } from 'expo-router';
import { Check, Trophy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavRow } from '@/components/common/NavRow';
import { SettingsButton } from '@/components/navigation/SettingsButton';
import { CertificationsSection } from '@/components/profile/CertificationsSection';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { useProfileInfo } from '@/hooks/profile/use-profile-info';
import { useSaveProfileInfo } from '@/hooks/profile/use-save-profile-info';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

// TODO(phase-3+): avatar upload, stats.
export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const profileInfo = useProfileInfo(userId);
  const saveProfileInfo = useSaveProfileInfo(userId);
  const showToast = useToast();

  const handleSaveInfo = (info: { name: string; bio: string }) => {
    saveProfileInfo.mutate(info, {
      onSuccess: () => showToast({ icon: Check, title: t('profile.savedToastTitle') }),
      onError: () => Alert.alert(t('profile.saveError')),
    });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            {t('profile.title')}
          </ThemedText>
          <SettingsButton accessibilityLabel={t('profile.settingsNavLabel')} onPress={() => router.push('/settings')} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
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

          <NavRow
            icon={Trophy}
            label={t('profile.achievementsNavLabel')}
            onPress={() => router.push('/achievements')}
            style={styles.achievementsNavRow}
          />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  achievementsNavRow: {
    marginTop: Spacing.four,
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    marginTop: Spacing.four,
    marginBottom: Spacing.two + 2,
  },
});
