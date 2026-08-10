import { StyleSheet, View } from 'react-native';

import { SessionLogCard } from '@/components/log/SessionLogCard';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import type { SessionRecord } from '@/lib/sessions';

export type SessionLogListProps = {
  title: string;
  sessions: SessionRecord[];
  isLoading: boolean;
  isError: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
  onPressSession: (id: string) => void;
};

export function SessionLogList({
  title,
  sessions,
  isLoading,
  isError,
  loadingLabel,
  errorLabel,
  emptyLabel,
  onPressSession,
}: SessionLogListProps) {
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
        sessions.map((session) => <SessionLogCard key={session.id} session={session} onPress={() => onPressSession(session.id)} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.four,
  },
  title: {
    ...Typography.sectionLabel,
    marginBottom: Spacing.two + 2,
  },
});
