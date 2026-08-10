import { StyleSheet, View } from 'react-native';

import { OtherGoalRow } from '@/components/roadmap/OtherGoalRow';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import type { RoadmapSummary } from '@/lib/roadmap';

export type OtherGoalsListProps = {
  title: string;
  goals: RoadmapSummary[];
  onSelect: (roadmapId: string) => void;
  isSwitching: boolean;
};

export function OtherGoalsList({ title, goals, onSelect, isSwitching }: OtherGoalsListProps) {
  if (goals.length === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textFaint" style={styles.title}>
        {title}
      </ThemedText>
      {goals.map((roadmap) => (
        <OtherGoalRow
          key={roadmap.id}
          goal={roadmap.goal}
          careerLevel={roadmap.careerLevel}
          onPress={() => onSelect(roadmap.id)}
          disabled={isSwitching}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.five,
  },
  title: {
    ...Typography.sectionLabel,
    marginBottom: Spacing.two + 2,
  },
});
