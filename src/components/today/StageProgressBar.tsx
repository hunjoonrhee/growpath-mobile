import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type StageProgressBarProps = {
  totalStages: number;
  /** 1-indexed current stage. */
  currentStage: number;
  currentStageLabel: string;
};

export function StageProgressBar({ totalStages, currentStage, currentStageLabel }: StageProgressBarProps) {
  return (
    <View>
      <View style={styles.row}>
        {Array.from({ length: totalStages }, (_, i) => {
          const stageNumber = i + 1;
          const isDone = stageNumber < currentStage;
          const isCurrent = stageNumber === currentStage;
          return (
            <View
              key={stageNumber}
              style={[
                styles.segment,
                isDone && styles.segmentDone,
                isCurrent && styles.segmentCurrent,
              ]}
            />
          );
        })}
      </View>
      <ThemedText type="small" themeColor="textFaint" style={styles.label}>
        현재 {currentStage}단계 — {currentStageLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: Colors.surf2,
  },
  segmentDone: {
    backgroundColor: Colors.pri2,
  },
  segmentCurrent: {
    backgroundColor: Colors.pri2,
    opacity: 0.55,
  },
  label: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontSize: 11,
  },
});
