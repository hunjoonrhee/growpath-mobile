import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { TagList } from '@/components/log/TagList';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { relativeDateLabel } from '@/lib/date';
import type { SessionRecord } from '@/lib/sessions';

export type SessionLogCardProps = {
  session: SessionRecord;
  onPress: () => void;
};

export function SessionLogCard({ session, onPress }: SessionLogCardProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const dateLabel = relativeDateLabel(session.date, t);
  const timeLabel =
    session.durationMinutes !== null ? t('log.durationAndDate', { minutes: session.durationMinutes, date: dateLabel }) : dateLabel;
  const tagsLabel = session.tags.map((tag) => `#${tag}`).join(', ');
  const accessibilityLabel = [session.title, timeLabel, tagsLabel].filter(Boolean).join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.surf, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={styles.top}>
        <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
          {session.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textFaint">
          {timeLabel}
        </ThemedText>
      </View>
      {session.tags.length > 0 && (
        <View style={styles.tagsRow}>
          <TagList tags={session.tags} maxVisible={3} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three - 2,
    marginBottom: Spacing.two - 2,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  top: {
    flex: 1,
    gap: 2,
  },
  title: {
    marginRight: Spacing.two,
  },
  tagsRow: {
    flexShrink: 0,
    maxWidth: '40%',
  },
});
