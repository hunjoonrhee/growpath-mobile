import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export type CaptureFabProps = {
  onPress: () => void;
};

export function CaptureFab({ onPress }: CaptureFabProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('today.captureAccessibilityLabel')}>
      <ThemedText style={styles.icon}>🎙️</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.pri,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pri,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  icon: {
    fontSize: 22,
  },
});
