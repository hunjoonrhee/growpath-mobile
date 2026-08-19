import { Image, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const BADGE_SIZE = 96;

export type AchievementBadgeProps = {
  image: number;
  label: string;
  /** Second line for personal-record badges (e.g. "45분 · 8/15") - the streak/records/hours/goal badges' threshold is already baked into their art as a numeral, so only PRs need a dynamic value shown in text. */
  detail?: string;
  unlocked: boolean;
  /** Replays the badge's celebration - only unlocked badges are tappable, there's nothing to celebrate yet for a locked one. */
  onPress?: () => void;
};

/** One badge tile in the Achievements grid - see BADGES_SPEC.md's "성과 screen rules" for the layout this is built to. */
export function AchievementBadge({ image, label, detail, unlocked, onPress }: AchievementBadgeProps) {
  return (
    <Pressable
      onPress={unlocked ? onPress : undefined}
      accessibilityRole={unlocked ? 'button' : undefined}
      accessibilityLabel={unlocked ? label : undefined}
      style={styles.wrap}>
      <Image source={image} style={[styles.image, !unlocked && styles.locked]} resizeMode="cover" />
      <ThemedText type="small" themeColor={unlocked ? 'textDim' : 'textFaint'} style={styles.label} numberOfLines={1}>
        {label}
      </ThemedText>
      {unlocked && detail && (
        <ThemedText type="small" themeColor="textFaint" style={styles.detail} numberOfLines={1}>
          {detail}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BADGE_SIZE,
    alignItems: 'center',
  },
  image: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
  },
  // The unlocked art itself never renders for a locked badge (see
  // AchievementSection - it swaps in the shared locked.png instead, per
  // BADGES_SPEC.md: "the silhouette stays a reward"), so this is just a
  // little extra dimming on that placeholder image, not a filter over the
  // real art.
  locked: {
    opacity: 0.7,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  detail: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
