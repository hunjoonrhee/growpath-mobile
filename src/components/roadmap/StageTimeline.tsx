import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { StageTimelineItem, type StageStatus } from '@/components/roadmap/StageTimelineItem';
import type { RoadmapStage } from '@/lib/roadmap';

export type StageTimelineProps = {
  stages: RoadmapStage[];
  /** Stage level the AI currently recommends focusing on; null means nothing is in progress yet. */
  focusLevel: number | null;
};

function statusFor(level: number, focusLevel: number | null): StageStatus {
  if (focusLevel === null) return level === 1 ? 'current' : 'upcoming';
  if (level < focusLevel) return 'done';
  if (level === focusLevel) return 'current';
  return 'upcoming';
}

export function StageTimeline({ stages, focusLevel }: StageTimelineProps) {
  const { t } = useTranslation();
  const statusLabels: Record<StageStatus, string> = {
    done: t('roadmap.stageStatus.done'),
    current: t('roadmap.stageStatus.current'),
    upcoming: t('roadmap.stageStatus.upcoming'),
  };

  return (
    <View style={styles.list}>
      {stages.map((stage, index) => {
        const status = statusFor(stage.level, focusLevel);
        return (
          <StageTimelineItem
            key={stage.level}
            stage={stage}
            status={status}
            statusLabel={statusLabels[status]}
            isLast={index === stages.length - 1}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'column',
  },
});
