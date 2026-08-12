import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MultilineTextInput } from '@/components/forms/MultilineTextInput';
import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type CaptureEntryFormValues = {
  title: string;
  durationMinutes: number | null;
  til: string;
  tags: string[];
};

export type CaptureEntryFormProps = {
  screenTitle: string;
  // Mounted once the caller has whatever data it needs (nothing for a new
  // entry, the existing record for an edit) - useState below only needs to
  // be correct on that first render, not kept in sync afterward.
  initialValues: CaptureEntryFormValues;
  isSaving: boolean;
  onSave: (values: CaptureEntryFormValues) => void;
};

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function formatTags(tags: string[]): string {
  return tags.join(', ');
}

export function CaptureEntryForm({ screenTitle, initialValues, isSaving, onSave }: CaptureEntryFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialValues.title);
  const [durationText, setDurationText] = useState(initialValues.durationMinutes !== null ? String(initialValues.durationMinutes) : '');
  const [til, setTil] = useState(initialValues.til);
  const [tagsText, setTagsText] = useState(formatTags(initialValues.tags));

  const trimmedDuration = durationText.trim();
  // Digits-only on purpose: catches non-numeric input (including a decimal
  // comma, which German-locale users commonly type) instead of letting
  // Number() silently turn it into NaN -> null on save.
  const isDurationValid = trimmedDuration.length === 0 || /^\d+$/.test(trimmedDuration);
  const canSave = title.trim().length > 0 && isDurationValid && !isSaving;

  const handleSave = () => {
    const durationMinutes = trimmedDuration.length > 0 ? Number(trimmedDuration) : null;
    onSave({ title: title.trim(), durationMinutes, til: til.trim(), tags: parseTags(tagsText) });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="subtitle" style={styles.title}>
        {screenTitle}
      </ThemedText>

      <TextField label={t('captureEntry.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('captureEntry.titlePlaceholder')} />

      <TextField
        label={t('captureEntry.durationLabel')}
        value={durationText}
        onChangeText={setDurationText}
        placeholder={t('captureEntry.durationPlaceholder')}
        keyboardType="number-pad"
      />

      <View style={styles.tilField}>
        <ThemedText type="small" themeColor="textDim">
          {t('captureEntry.tilLabel')}
        </ThemedText>
        <MultilineTextInput value={til} onChangeText={setTil} placeholder={t('captureEntry.tilPlaceholder')} />
      </View>

      <TextField label={t('captureEntry.tagsLabel')} value={tagsText} onChangeText={setTagsText} placeholder={t('captureEntry.tagsPlaceholder')} />

      <PrimaryButton label={t('captureEntry.saveCta')} onPress={handleSave} disabled={!canSave} style={styles.saveButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.two,
  },
  tilField: {
    gap: Spacing.one + 2,
  },
  saveButton: {
    marginTop: Spacing.three,
  },
});
