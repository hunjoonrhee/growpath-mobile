import { StyleSheet, View } from 'react-native';

import { SkillChip } from '@/components/roadmap/SkillChip';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { RoadmapStage } from '@/lib/roadmap';

export type StageStatus = 'done' | 'current' | 'upcoming';

export type StageTimelineItemProps = {
  stage: RoadmapStage;
  status: StageStatus;
  statusLabel: string;
  isLast: boolean;
};

function dotLabelStyle(status: StageStatus) {
  if (status === 'done') return styles.dotLabelDone;
  if (status === 'current') return styles.dotLabelCurrent;
  return styles.dotLabelDefault;
}

export function StageTimelineItem({ stage, status, statusLabel, isLast }: StageTimelineItemProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${stage.title} — ${statusLabel}`}>
      <View style={styles.rail}>
        <View style={[styles.dot, status === 'done' && styles.dotDone, status === 'current' && styles.dotCurrent]}>
          <ThemedText type="smallBold" style={dotLabelStyle(status)}>
            {status === 'done' ? '✓' : stage.level}
          </ThemedText>
        </View>
        {!isLast && <View style={[styles.line, status === 'done' && styles.lineDone]} />}
      </View>
      <View style={[styles.body, status === 'current' && styles.bodyCurrent]}>
        <ThemedText type="smallBold">{stage.title}</ThemedText>
        <View style={styles.skills}>
          {stage.skills.map((skill, index) => (
            <SkillChip key={`${index}-${skill.name}`} label={skill.name} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three + 2,
  },
  rail: {
    alignItems: 'center',
    width: 32,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surf2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: Colors.pri,
  },
  dotCurrent: {
    borderWidth: 2,
    borderColor: Colors.pri2,
  },
  dotLabelDefault: {
    color: Colors.textFaint,
  },
  dotLabelCurrent: {
    color: Colors.pri2,
  },
  dotLabelDone: {
    color: '#ffffff',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.half,
  },
  lineDone: {
    backgroundColor: Colors.pri2,
  },
  body: {
    flex: 1,
    paddingBottom: Spacing.four - 4,
  },
  bodyCurrent: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.pri,
    borderRadius: 14,
    padding: Spacing.three - 2,
    marginTop: 2,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + 2,
    marginTop: Spacing.two - 2,
  },
});
