import type { BadgeId } from '@/lib/achievements';

export type BadgeSection = 'milestone' | 'personalRecord' | 'goal';

export type BadgeMeta = {
  id: BadgeId;
  section: BadgeSection;
  image: number;
  /** Under achievements.badges.<labelKey> in the locale files. */
  labelKey: string;
};

// Grouped and ordered per BADGES_SPEC.md's "성과 screen rules": 마일스톤 →
// 퍼스널 레코드 → 목표 달성, image assets from docs/badges/png/ (source of
// truth - see docs/badges/BADGES_SPEC.md for the full design spec).
export const BADGES: BadgeMeta[] = [
  { id: 'streak-3-green', section: 'milestone', image: require('../../../assets/badges/streak-3-green.png'), labelKey: 'streak3' },
  { id: 'streak-7-green', section: 'milestone', image: require('../../../assets/badges/streak-7-green.png'), labelKey: 'streak7' },
  { id: 'streak-30-gold', section: 'milestone', image: require('../../../assets/badges/streak-30-gold.png'), labelKey: 'streak30' },
  { id: 'streak-100-purple', section: 'milestone', image: require('../../../assets/badges/streak-100-purple.png'), labelKey: 'streak100' },
  { id: 'records-10-green', section: 'milestone', image: require('../../../assets/badges/records-10-green.png'), labelKey: 'records10' },
  { id: 'records-50-gold', section: 'milestone', image: require('../../../assets/badges/records-50-gold.png'), labelKey: 'records50' },
  { id: 'records-100-purple', section: 'milestone', image: require('../../../assets/badges/records-100-purple.png'), labelKey: 'records100' },
  { id: 'hours-10-green', section: 'milestone', image: require('../../../assets/badges/hours-10-green.png'), labelKey: 'hours10' },
  { id: 'hours-50-gold', section: 'milestone', image: require('../../../assets/badges/hours-50-gold.png'), labelKey: 'hours50' },
  { id: 'hours-100-purple', section: 'milestone', image: require('../../../assets/badges/hours-100-purple.png'), labelKey: 'hours100' },
  { id: 'pr-longest-session', section: 'personalRecord', image: require('../../../assets/badges/pr-longest-session.png'), labelKey: 'prLongestSession' },
  { id: 'pr-pronunciation', section: 'personalRecord', image: require('../../../assets/badges/pr-pronunciation.png'), labelKey: 'prPronunciation' },
  { id: 'pr-saved-words', section: 'personalRecord', image: require('../../../assets/badges/pr-saved-words.png'), labelKey: 'prSavedWords' },
  { id: 'goal-stage-complete', section: 'goal', image: require('../../../assets/badges/goal-stage-complete.png'), labelKey: 'goalStageComplete' },
  { id: 'goal-roadmap-100', section: 'goal', image: require('../../../assets/badges/goal-roadmap-100.png'), labelKey: 'goalRoadmap100' },
];

export const LOCKED_BADGE_IMAGE = require('../../../assets/badges/locked.png');

/** For a celebration that wants to show a specific badge's art in its dial (see CelebrationOptions.centerIcon) rather than a numeric value. */
export function getBadgeImage(id: BadgeId): number {
  const badge = BADGES.find((b) => b.id === id);
  if (!badge) throw new Error(`Unknown badge id: ${id}`);
  return badge.image;
}
