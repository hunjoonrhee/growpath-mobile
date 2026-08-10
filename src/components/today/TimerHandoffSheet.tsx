import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeAccessibilityLabel} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
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
          style={[styles.option, styles.optionPrimary]}>
          <View style={[styles.icon, styles.iconPrimary]}>
            <ThemedText style={styles.iconGlyph}>⏱️</ThemedText>
          </View>
          <View style={styles.optionText}>
            <ThemedText type="smallBold">{timerOptionLabel}</ThemedText>
            <ThemedText type="small" themeColor="textFaint">
              {timerOptionDescription}
            </ThemedText>
          </View>
          <ThemedText themeColor="textFaint">→</ThemedText>
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel={webOptionLabel} onPress={onSelectWeb} style={styles.option}>
          <View style={styles.icon}>
            <ThemedText style={styles.iconGlyph}>💻</ThemedText>
          </View>
          <View style={styles.optionText}>
            <ThemedText type="smallBold">{webOptionLabel}</ThemedText>
            <ThemedText type="small" themeColor="textFaint">
              {webOptionDescription}
            </ThemedText>
          </View>
          <ThemedText themeColor="textFaint">→</ThemedText>
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
    backgroundColor: Colors.surf,
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
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.three - 2,
    marginBottom: Spacing.two,
  },
  optionPrimary: {
    backgroundColor: 'rgba(108,99,255,0.14)',
    borderColor: Colors.pri,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPrimary: {
    backgroundColor: Colors.pri,
  },
  iconGlyph: {
    fontSize: 18,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
