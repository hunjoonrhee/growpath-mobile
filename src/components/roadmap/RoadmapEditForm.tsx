import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
  /** Shown next to a spinner while isSaving - regenerating calls the same AI roadmap generation as creating a goal, so it isn't instant. */
  savingLabel: string;
  onSave: (input: { goal: string; careerLevel: string }) => void;
  onCancel: () => void;
};

/** Edits the goal text/career level and regenerates the roadmap's stages/domain/targetLanguage to match (same AI call as creating a goal) - see useRegenerateRoadmap. */
export function RoadmapEditForm({
  goal,
  careerLevel,
  goalLabel,
  careerLevelLabel,
  saveLabel,
  cancelLabel,
  isSaving,
  savingLabel,
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
      {isSaving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={Colors.pri2} />
          <ThemedText type="small" themeColor="textDim">
            {savingLabel}
          </ThemedText>
        </View>
      )}
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
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
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
