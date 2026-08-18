import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ProfileInfoFormProps = {
  name: string;
  bio: string;
  nameLabel: string;
  namePlaceholder: string;
  bioLabel: string;
  bioPlaceholder: string;
  saveLabel: string;
  savingLabel: string;
  isSaving: boolean;
  onSave: (info: { name: string; bio: string }) => void;
};

/** Name/bio, stored as 'name'/'bio' rows in the shared `settings` table - see lib/profile.ts. Bio has no web equivalent yet; it's here ahead of task #31 (feeding it into roadmap-generation context). */
export function ProfileInfoForm({
  name,
  bio,
  nameLabel,
  namePlaceholder,
  bioLabel,
  bioPlaceholder,
  saveLabel,
  savingLabel,
  isSaving,
  onSave,
}: ProfileInfoFormProps) {
  const colors = useTheme();
  const [editedName, setEditedName] = useState(name);
  const [editedBio, setEditedBio] = useState(bio);
  const canSave = !isSaving && (editedName !== name || editedBio !== bio);

  return (
    <View style={styles.container}>
      <TextField label={nameLabel} value={editedName} onChangeText={setEditedName} placeholder={namePlaceholder} editable={!isSaving} />
      <View>
        <ThemedText type="small" themeColor="textDim" style={styles.bioLabel}>
          {bioLabel}
        </ThemedText>
        <MultilineTextInput value={editedBio} onChangeText={setEditedBio} placeholder={bioPlaceholder} editable={!isSaving} minHeight={90} />
      </View>
      {isSaving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={colors.pri2} />
          <ThemedText type="small" themeColor="textDim">
            {savingLabel}
          </ThemedText>
        </View>
      )}
      <PrimaryButton label={saveLabel} onPress={() => onSave({ name: editedName.trim(), bio: editedBio.trim() })} disabled={!canSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  bioLabel: {
    marginBottom: Spacing.one + 2,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
