import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type RoadmapEditFormProps = {
  goal: string;
  careerLevel: string;
  goalLabel: string;
  careerLevelLabel: string;
  saveLabel: string;
  cancelLabel: string;
  isSaving: boolean;
  onSave: (input: { goal: string; careerLevel: string }) => void;
  onCancel: () => void;
};

/** Edits the goal text/career level only - the AI-generated stages, domain, and targetLanguage stay as originally generated (a full re-classify would need a fresh /api/roadmap/generate call, not a plain field edit). */
export function RoadmapEditForm({
  goal,
  careerLevel,
  goalLabel,
  careerLevelLabel,
  saveLabel,
  cancelLabel,
  isSaving,
  onSave,
  onCancel,
}: RoadmapEditFormProps) {
  const [editedGoal, setEditedGoal] = useState(goal);
  const [editedCareerLevel, setEditedCareerLevel] = useState(careerLevel);
  const canSave = editedGoal.trim().length > 0 && editedCareerLevel.trim().length > 0 && !isSaving;

  return (
    <View style={styles.container}>
      <TextField label={goalLabel} value={editedGoal} onChangeText={setEditedGoal} editable={!isSaving} />
      <TextField label={careerLevelLabel} value={editedCareerLevel} onChangeText={setEditedCareerLevel} editable={!isSaving} />
      <View style={styles.actions}>
        <PrimaryButton
          label={saveLabel}
          onPress={() => onSave({ goal: editedGoal.trim(), careerLevel: editedCareerLevel.trim() })}
          disabled={!canSave}
          style={styles.saveButton}
        />
        <ThemedText
          type="smallBold"
          themeColor="textDim"
          style={styles.cancel}
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
    paddingVertical: Spacing.two,
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
    borderBottomColor: Colors.border,
    paddingBottom: 1,
  },
});
