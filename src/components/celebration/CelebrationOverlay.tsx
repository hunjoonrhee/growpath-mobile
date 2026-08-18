import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { CompassDial } from '@/components/compass-dial';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCelebrationContext } from '@/lib/celebration-context';

// Celebration is deliberately theme-independent - "라이트/다크 모두 어두운
// 배경(축하는 한 가지 얼굴로)" in the mockup's spec: this look is fixed
// regardless of the app's current light/dark mode, so these are plain
// constants, not useTheme() reads.
const GRADIENT = ['rgba(47,93,80,0.94)', 'rgba(30,42,36,0.97)'] as const;
const RING_COLOR = '#9FD9B8';
const EYEBROW_COLOR = '#9FD9B8';
const TITLE_COLOR = '#F4F6F1';
const SUBTITLE_COLOR = '#C4DCCE';
const BUTTON_BG = '#F4F6F1';
const BUTTON_TEXT = '#1E2A24';
const SECONDARY_COLOR = '#9FD9B8';
const DIAL_TRACK = 'rgba(255,255,255,0.15)';

const DIAL_MS = 340;
const RING_LOOP_MS = 1700;
const RING_DELAY_MS = 550;

function Ring({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: RING_LOOP_MS, easing: Easing.out(Easing.ease) })), -1, false));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.4 }],
    opacity: 1 - progress.value,
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

/** Animates a plain number from 0 to `target` over `durationMs` - CompassDial takes percent as a plain prop, not a shared value, so this drives it with ordinary React state instead of reaching into the dial's internals. */
function useCountUp(target: number, durationMs: number): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Resetting to 0 synchronously (not deferred) so the very first animation
    // frame below starts from a known value, not whatever's left from a
    // previous celebration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(0);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}

/** Mounted once at the app root (see _layout.tsx) - renders whatever useCelebration()/showCelebration() currently has active. */
export function CelebrationOverlay() {
  const { celebration, hideCelebration } = useCelebrationContext();
  const targetPercent = celebration?.percent ?? 100;
  const animatedPercent = useCountUp(celebration ? targetPercent : 0, DIAL_MS);

  useEffect(() => {
    if (celebration) {
      // Once/day rate limiting is the caller's job (see useCelebration) -
      // this always fires when actually shown.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [celebration]);

  return (
    <Modal visible={celebration !== null} transparent animationType="fade" onRequestClose={hideCelebration}>
      <LinearGradient colors={GRADIENT} style={styles.overlay}>
        {celebration && (
          <View style={styles.content}>
            <View style={styles.dialWrap}>
              <Ring delay={0} />
              <Ring delay={RING_DELAY_MS} />
              <CompassDial
                percent={animatedPercent}
                colorFrom="#6FBF95"
                colorTo={RING_COLOR}
                tickActiveColor={RING_COLOR}
                tickInactiveColor="rgba(255,255,255,0.2)"
                trackColor={DIAL_TRACK}
                markerFill="#1E4438"
                textColor={TITLE_COLOR}
                subLabelColor={SUBTITLE_COLOR}
                showLabel={celebration.percent !== undefined}
              />
            </View>

            <ThemedText type="smallBold" style={styles.eyebrow}>
              {celebration.eyebrow}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {celebration.title}
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              {celebration.subtitle}
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={celebration.primaryLabel}
              onPress={() => {
                celebration.onPrimary();
                hideCelebration();
              }}
              style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonLabel}>
                {celebration.primaryLabel}
              </ThemedText>
            </Pressable>

            {celebration.secondaryLabel && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={celebration.secondaryLabel}
                onPress={() => {
                  celebration.onSecondary?.();
                  hideCelebration();
                }}
                hitSlop={8}
                style={styles.secondaryButton}>
                <ThemedText type="smallBold" style={styles.secondaryLabel}>
                  {celebration.secondaryLabel}
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  dialWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  ring: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 2,
    borderColor: RING_COLOR,
  },
  eyebrow: {
    color: EYEBROW_COLOR,
    letterSpacing: 2,
    fontSize: 12,
  },
  title: {
    color: TITLE_COLOR,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  subtitle: {
    color: SUBTITLE_COLOR,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  primaryButton: {
    backgroundColor: BUTTON_BG,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    marginTop: Spacing.five,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: BUTTON_TEXT,
  },
  secondaryButton: {
    marginTop: Spacing.three - 2,
    padding: Spacing.one,
  },
  secondaryLabel: {
    color: SECONDARY_COLOR,
  },
});
