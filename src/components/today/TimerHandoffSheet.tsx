import { ChevronRight, Laptop, Timer } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';

export type TimerHandoffSheetProps = {
  visible: boolean;
  onClose: () => void;
  closeAccessibilityLabel: string;
  onSelectWeb: () => void;
  onSelectTimer: () => void;
  title: string;
  subtitle: string;
  webOptionLabel: string;
  webOptionDescription: string;
  timerOptionLabel: string;
  timerOptionDescription: string;
};

export function TimerHandoffSheet({
  visible,
  onClose,
  closeAccessibilityLabel,
  onSelectWeb,
  onSelectTimer,
  title,
  subtitle,
  webOptionLabel,
  webOptionDescription,
  timerOptionLabel,
  timerOptionDescription,
}: TimerHandoffSheetProps) {
  const colors = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeAccessibilityLabel} />
      <View style={[styles.sheet, { backgroundColor: colors.surf }]}>
        <View style={[styles.grabber, { backgroundColor: colors.border }]} />
        <ThemedText type="smallBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textDim" style={styles.subtitle}>
          {subtitle}
        </ThemedText>

        {/* Timer option is listed first and styled as primary because it's
            the one that actually works right now - "Continue on the web"
            only opens a coming-soon alert, so it shouldn't look like the
            recommended, working path. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={timerOptionLabel}
          onPress={onSelectTimer}
          style={[styles.option, { backgroundColor: withAlpha(colors.pri, 0.14), borderColor: colors.pri }]}>
          <View style={[styles.icon, { backgroundColor: colors.pri }]}>
            <Timer size={18} color={colors.onPri} strokeWidth={1.8} />
          </View>
          <View style={styles.optionText}>
            <ThemedText type="smallBold">{timerOptionLabel}</ThemedText>
            <ThemedText type="small" themeColor="textFaint">
              {timerOptionDescription}
            </ThemedText>
          </View>
          <ChevronRight size={18} color={colors.textFaint} strokeWidth={1.8} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={webOptionLabel}
          onPress={onSelectWeb}
          style={[styles.option, { backgroundColor: colors.surf2, borderColor: colors.border }]}>
          <View style={[styles.icon, { backgroundColor: colors.bg }]}>
            <Laptop size={18} color={colors.text} strokeWidth={1.8} />
          </View>
          <View style={styles.optionText}>
            <ThemedText type="smallBold">{webOptionLabel}</ThemedText>
            <ThemedText type="small" themeColor="textFaint">
              {webOptionDescription}
            </ThemedText>
          </View>
          <ChevronRight size={18} color={colors.textFaint} strokeWidth={1.8} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three - 2,
    paddingBottom: Spacing.six,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.four - 6,
  },
  title: {
    fontSize: 17,
  },
  subtitle: {
    marginTop: Spacing.one,
    marginBottom: Spacing.four - 4,
    lineHeight: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 2,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three - 2,
    marginBottom: Spacing.two,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
