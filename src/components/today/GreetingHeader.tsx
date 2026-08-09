import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type GreetingHeaderProps = {
  name: string;
  streakDays: number;
};

export function GreetingHeader({ name, streakDays }: GreetingHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.greeting}>
        {t('today.greeting', { name })}
      </ThemedText>
      <View style={styles.streak}>
        <ThemedText type="smallBold" themeColor="amber">
          {t('today.streak', { count: streakDays })}
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
