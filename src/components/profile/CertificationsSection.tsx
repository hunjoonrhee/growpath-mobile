import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { CertificationAddForm } from '@/components/profile/CertificationAddForm';
import { CertificationRow } from '@/components/profile/CertificationRow';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useAddCertification } from '@/hooks/profile/use-add-certification';
import { useCertifications } from '@/hooks/profile/use-certifications';
import { useDeleteCertification } from '@/hooks/profile/use-delete-certification';
import { useToast } from '@/hooks/use-toast';
import type { NewCertificationInput } from '@/lib/profile';

export type CertificationsSectionProps = {
  userId: string | undefined;
};

/** Self-contained (owns its own data/mutations) unlike LanguageSelector - its header has an interactive add-toggle, not just a static title. */
export function CertificationsSection({ userId }: CertificationsSectionProps) {
  const { t } = useTranslation();
  const certifications = useCertifications(userId);
  const addCertification = useAddCertification(userId);
  const deleteCertification = useDeleteCertification(userId);
  const showToast = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (input: NewCertificationInput) => {
    addCertification.mutate(input, {
      onSuccess: () => {
        setIsAdding(false);
        showToast({ icon: Check, title: t('profile.certAddedToastTitle') });
      },
      onError: () => Alert.alert(t('profile.certSaveError')),
    });
  };

  const handleDelete = (certificationId: string) => {
    deleteCertification.mutate(certificationId, {
      onSuccess: () => showToast({ icon: Check, title: t('profile.certDeletedToastTitle') }),
      onError: () => Alert.alert(t('profile.certDeleteError')),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textFaint" style={styles.sectionTitle}>
          {t('profile.certificationsSectionTitle')}
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => setIsAdding((v) => !v)}>
          <ThemedText type="small" themeColor="pri2">
            {isAdding ? t('profile.certCancelCta') : t('profile.certAddCta')}
          </ThemedText>
        </Pressable>
      </View>

      {isAdding && (
        <CertificationAddForm
          nameLabel={t('profile.certNameLabel')}
          namePlaceholder={t('profile.certNamePlaceholder')}
          issuerLabel={t('profile.certIssuerLabel')}
          issuerPlaceholder={t('profile.certIssuerPlaceholder')}
          tagsLabel={t('profile.certTagsLabel')}
          tagsPlaceholder={t('profile.certTagsPlaceholder')}
          saveLabel={t('profile.certSaveCta')}
          cancelLabel={t('profile.certCancelCta')}
          isSaving={addCertification.isPending}
          onSave={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {certifications.isLoading && (
        <ThemedText type="small" themeColor="textDim">
          {t('profile.loading')}
        </ThemedText>
      )}
      {!certifications.isLoading && certifications.isError && (
        <ThemedText type="small" themeColor="amber">
          {t('profile.loadError')}
        </ThemedText>
      )}
      {!certifications.isLoading && !certifications.isError && certifications.data?.length === 0 && (
        <ThemedText type="small" themeColor="textDim">
          {t('profile.certificationsEmpty')}
        </ThemedText>
      )}
      {(certifications.data ?? []).map((cert) => (
        <CertificationRow
          key={cert.id}
          certification={cert}
          deleteLabel={t('profile.certDeleteCta')}
          onDelete={() => handleDelete(cert.id)}
          disabled={deleteCertification.isPending}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two + 2,
    marginTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...Typography.sectionLabel,
  },
});
