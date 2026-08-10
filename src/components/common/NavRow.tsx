import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export type NavRowProps = {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

export function NavRow({ icon, label, subtitle, onPress }: NavRowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <View style={styles.text}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textFaint">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText themeColor="textFaint">→</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 2,
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.three - 2,
    marginBottom: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
