import { Flame } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';

export type GreetingHeaderProps = {
  name: string;
  streakDays: number;
};

export function GreetingHeader({ name, streakDays }: GreetingHeaderProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.greeting}>
        {t('today.greeting', { name })}
      </ThemedText>
      <View style={[styles.streak, { backgroundColor: withAlpha(colors.amber, 0.12), borderColor: withAlpha(colors.amber, 0.3) }]}>
        <Flame size={14} color={colors.amber} strokeWidth={1.8} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
});
