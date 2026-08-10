import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { daysAgo } from '@/lib/date';
import type { SessionRecord } from '@/lib/sessions';

export type SessionLogCardProps = {
  session: SessionRecord;
};

function relativeDateLabel(dateString: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const days = daysAgo(dateString);
  // A negative diff (session dated in the future relative to the device
  // clock - skew, or a date recorded in a different timezone) shouldn't be
  // mislabeled as "today" - fall back to the raw date instead of guessing.
  if (days < 0) return dateString;
  if (days === 0) return t('log.relativeToday');
  if (days === 1) return t('log.relativeYesterday');
  return t('log.relativeDaysAgo', { count: days });
}

export function SessionLogCard({ session }: SessionLogCardProps) {
  const { t } = useTranslation();
  const dateLabel = relativeDateLabel(session.date, t);
  const timeLabel =
    session.durationMinutes !== null ? t('log.durationAndDate', { minutes: session.durationMinutes, date: dateLabel }) : dateLabel;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <ThemedText type="smallBold" style={styles.title}>
          {session.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textFaint">
          {timeLabel}
        </ThemedText>
      </View>
      {session.tags.length > 0 && (
        <View style={styles.tags}>
          {session.tags.map((tag) => (
            <ThemedText key={tag} type="small" themeColor="textDim" style={styles.tag}>
              #{tag}
            </ThemedText>
          ))}
        </View>
      )}
      {session.til && (
        <ThemedText type="small" themeColor="textDim" style={styles.til}>
          {session.til}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.three - 2,
    marginBottom: Spacing.two,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: Spacing.two,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + 2,
    marginTop: Spacing.two,
  },
  tag: {
    backgroundColor: Colors.surf2,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 11,
  },
  til: {
    marginTop: Spacing.two,
    lineHeight: 18,
  },
});
