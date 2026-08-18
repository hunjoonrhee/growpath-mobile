import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { NewCertificationInput } from '@/lib/profile';

export type CertificationAddFormProps = {
  nameLabel: string;
  namePlaceholder: string;
  issuerLabel: string;
  issuerPlaceholder: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  saveLabel: string;
  cancelLabel: string;
  isSaving: boolean;
  onSave: (input: NewCertificationInput) => void;
  onCancel: () => void;
};

export function CertificationAddForm({
  nameLabel,
  namePlaceholder,
  issuerLabel,
  issuerPlaceholder,
  tagsLabel,
  tagsPlaceholder,
  saveLabel,
  cancelLabel,
  isSaving,
  onSave,
  onCancel,
}: CertificationAddFormProps) {
  const colors = useTheme();
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const canSave = name.trim().length > 0 && !isSaving;

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    onSave({ name: name.trim(), issuer: issuer.trim() || null, tags });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surf2 }]}>
      <TextField label={nameLabel} value={name} onChangeText={setName} placeholder={namePlaceholder} editable={!isSaving} />
      <TextField label={issuerLabel} value={issuer} onChangeText={setIssuer} placeholder={issuerPlaceholder} editable={!isSaving} />
      <TextField label={tagsLabel} value={tagsInput} onChangeText={setTagsInput} placeholder={tagsPlaceholder} editable={!isSaving} />
      <View style={styles.actions}>
        <PrimaryButton label={saveLabel} onPress={handleSave} disabled={!canSave} style={styles.saveButton} />
        <ThemedText
          type="smallBold"
          themeColor="textDim"
          style={[styles.cancel, { borderBottomColor: colors.border }]}
          onPress={isSaving ? undefined : onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}>
          {cancelLabel}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three - 2,
    borderRadius: 16,
    padding: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  saveButton: {
    flex: 1,
  },
  cancel: {
    borderBottomWidth: 1,
    paddingBottom: 1,
  },
});
