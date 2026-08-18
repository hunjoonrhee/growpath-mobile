import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { SkillChip } from '@/components/roadmap/SkillChip';
import { ThemedText } from '@/components/themed-text';
import { Spacing, type Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RoadmapStage } from '@/lib/roadmap';

export type StageStatus = 'done' | 'current' | 'upcoming';

export type StageTimelineItemProps = {
  stage: RoadmapStage;
  status: StageStatus;
  statusLabel: string;
  isLast: boolean;
};

function dotLabelColor(status: StageStatus, colors: Palette) {
  if (status === 'done') return colors.onPri;
  if (status === 'current') return colors.pri2;
  return colors.textFaint;
}

export function StageTimelineItem({ stage, status, statusLabel, isLast }: StageTimelineItemProps) {
  const colors = useTheme();

  return (
    <View style={styles.row} accessible accessibilityLabel={`${stage.title} — ${statusLabel}`}>
      <View style={styles.rail}>
        <View
          style={[
            styles.dot,
            { backgroundColor: colors.surf2 },
            status === 'done' && { backgroundColor: colors.pri },
            status === 'current' && { borderWidth: 2, borderColor: colors.pri2 },
          ]}>
          {status === 'done' ? (
            <Check size={16} color={dotLabelColor(status, colors)} strokeWidth={2.2} />
          ) : (
            <ThemedText type="smallBold" style={{ color: dotLabelColor(status, colors) }}>
              {stage.level}
            </ThemedText>
          )}
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: status === 'done' ? colors.pri2 : colors.border }]} />}
      </View>
      <View
        style={[
          styles.body,
          status === 'current' && [styles.bodyCurrent, { backgroundColor: colors.surf, borderColor: colors.pri }],
        ]}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: Spacing.half,
  },
  body: {
    flex: 1,
    paddingBottom: Spacing.four - 4,
  },
  bodyCurrent: {
    borderWidth: 1,
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
