import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StageProgressBarProps = {
  totalStages: number;
  /** 1-indexed current stage. */
  currentStage: number;
  currentStageLabel: string;
};

export function StageProgressBar({ totalStages, currentStage, currentStageLabel }: StageProgressBarProps) {
  const { t } = useTranslation();
  const colors = useTheme();

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
                { backgroundColor: colors.surf2 },
                (isDone || isCurrent) && { backgroundColor: colors.pri2, opacity: isCurrent ? 0.55 : 1 },
              ]}
            />
          );
        })}
      </View>
      <ThemedText type="small" themeColor="textFaint" style={styles.label}>
        {t('today.currentStage', { stage: currentStage, label: currentStageLabel })}
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
  },
  label: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontSize: 11,
  },
});
