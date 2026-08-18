import { Mic } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type CaptureFabProps = {
  onPress: () => void;
};

export function CaptureFab({ onPress }: CaptureFabProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <Pressable
      style={[styles.fab, { backgroundColor: colors.pri, shadowColor: colors.pri }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('today.captureAccessibilityLabel')}>
      <Mic size={24} color={colors.onPri} strokeWidth={1.8} />
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
