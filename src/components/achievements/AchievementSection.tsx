import { StyleSheet, View } from 'react-native';

import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { LOCKED_BADGE_IMAGE, type BadgeMeta } from '@/components/achievements/badge-registry';
import { ThemedText } from '@/components/themed-text';
import { Typography } from '@/constants/theme';
import type { BadgeId } from '@/lib/achievements';

export type AchievementSectionProps = {
  title: string;
  badges: BadgeMeta[];
  unlocked: Record<BadgeId, boolean>;
  labelFor: (badge: BadgeMeta) => string;
  detailFor: (badge: BadgeMeta) => string | undefined;
  onPressBadge: (badge: BadgeMeta) => void;
};

/** One titled 3-column badge grid (마일스톤/퍼스널 레코드/목표 달성) - see BADGES_SPEC.md's "성과 screen rules". */
export function AchievementSection({ title, badges, unlocked, labelFor, detailFor, onPressBadge }: AchievementSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="small" themeColor="textFaint" style={styles.title}>
        {title}
      </ThemedText>
      <View style={styles.grid}>
        {badges.map((badge) => {
          const isUnlocked = unlocked[badge.id];
          return (
            <AchievementBadge
              key={badge.id}
              image={isUnlocked ? badge.image : LOCKED_BADGE_IMAGE}
              label={labelFor(badge)}
              detail={detailFor(badge)}
              unlocked={isUnlocked}
              onPress={() => onPressBadge(badge)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
  title: {
    ...Typography.sectionLabel,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 20,
    columnGap: 12,
  },
});
