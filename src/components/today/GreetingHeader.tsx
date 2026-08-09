import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type GreetingHeaderProps = {
  name: string;
  streakDays: number;
};

export function GreetingHeader({ name, streakDays }: GreetingHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.greeting}>
        안녕, <ThemedText type="title" themeColor="pri2" style={styles.greeting}>{name}</ThemedText> 👋
      </ThemedText>
      <View style={styles.streak}>
        <ThemedText type="smallBold" themeColor="amber">
          🔥 {streakDays}일 연속 기록 중
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.two,
  },
  greeting: {
    fontSize: 22,
    lineHeight: 28,
  },
  streak: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
});
