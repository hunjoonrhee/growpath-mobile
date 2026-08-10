import { StyleSheet, View } from 'react-native';

import { SessionLogCard } from '@/components/log/SessionLogCard';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { SessionRecord } from '@/lib/sessions';

export type SessionLogListProps = {
  title: string;
  sessions: SessionRecord[];
  isLoading: boolean;
  isError: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
};

export function SessionLogList({ title, sessions, isLoading, isError, loadingLabel, errorLabel, emptyLabel }: SessionLogListProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textFaint" style={styles.title}>
        {title}
      </ThemedText>

      {isLoading && (
        <ThemedText type="small" themeColor="textDim">
          {loadingLabel}
        </ThemedText>
      )}

      {!isLoading && isError && (
        <ThemedText type="small" themeColor="amber">
          {errorLabel}
        </ThemedText>
      )}

      {!isLoading && !isError && sessions.length === 0 && (
        <ThemedText type="small" themeColor="textDim">
          {emptyLabel}
        </ThemedText>
      )}

      {!isLoading &&
        !isError &&
        sessions.map((session) => <SessionLogCard key={session.id} session={session} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.four,
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: Spacing.two + 2,
  },
});
