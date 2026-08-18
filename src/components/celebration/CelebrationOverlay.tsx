import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { CompassDial } from '@/components/compass-dial';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCelebrationContext, type CelebrationColorTheme } from '@/lib/celebration-context';

type ResolvedCelebrationTheme = {
  gradient: readonly [string, string];
  ringColor: string;
  eyebrowColor: string;
  titleColor: string;
  subtitleColor: string;
  buttonBg: string;
  buttonText: string;
  secondaryColor: string;
  dialTrack: string;
  dialColorFrom: string;
  dialColorTo: string;
  markerFill: string;
};

// Celebration is deliberately theme-independent - "라이트/다크 모두 어두운
// 배경(축하는 한 가지 얼굴로)" in the mockup's spec: this look is fixed
// regardless of the app's current light/dark mode, so these are plain
// constants, not useTheme() reads. `colorTheme` (green/gold/purple) is a
// separate axis - a milestone *tier* signal, not a light/dark variant.
const CELEBRATION_THEMES: Record<CelebrationColorTheme, ResolvedCelebrationTheme> = {
  green: {
    gradient: ['rgba(47,93,80,1)', 'rgba(30,42,36,1)'],
    ringColor: '#9FD9B8',
    eyebrowColor: '#9FD9B8',
    titleColor: '#F4F6F1',
    subtitleColor: '#C4DCCE',
    buttonBg: '#F4F6F1',
    buttonText: '#1E2A24',
    secondaryColor: '#9FD9B8',
    dialTrack: 'rgba(255,255,255,0.15)',
    dialColorFrom: '#6FBF95',
    dialColorTo: '#9FD9B8',
    markerFill: '#1E4438',
  },
  gold: {
    gradient: ['rgba(51,38,22,1)', 'rgba(28,20,12,1)'],
    ringColor: '#D8B778',
    eyebrowColor: '#D8B778',
    titleColor: '#F7F3EA',
    subtitleColor: '#CBB68C',
    buttonBg: '#F7F3EA',
    buttonText: '#2A2013',
    secondaryColor: '#D8B778',
    dialTrack: 'rgba(255,255,255,0.12)',
    dialColorFrom: '#B8925A',
    dialColorTo: '#D8B778',
    markerFill: '#241A10',
  },
  purple: {
    gradient: ['rgba(58,33,89,1)', 'rgba(31,18,51,1)'],
    ringColor: '#C9A6FF',
    eyebrowColor: '#C9A6FF',
    titleColor: '#F5F1FF',
    subtitleColor: '#CBB8E8',
    buttonBg: '#F5F1FF',
    buttonText: '#241542',
    secondaryColor: '#C9A6FF',
    dialTrack: 'rgba(255,255,255,0.12)',
    dialColorFrom: '#9B72D6',
    dialColorTo: '#C9A6FF',
    markerFill: '#1F1233',
  },
};

const DIAL_MS = 340;
const RING_LOOP_MS = 1700;
const RING_DELAY_MS = 550;

function Ring({ delay, color }: { delay: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: RING_LOOP_MS, easing: Easing.out(Easing.ease) })), -1, false));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.4 }],
    opacity: 1 - progress.value,
  }));

  return <Animated.View style={[styles.ring, { borderColor: color }, style]} />;
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
  const theme = CELEBRATION_THEMES[celebration?.colorTheme ?? 'green'];

  useEffect(() => {
    if (celebration) {
      // Once/day rate limiting is the caller's job (see useCelebration) -
      // this always fires when actually shown.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [celebration]);

  return (
    <Modal visible={celebration !== null} transparent animationType="fade" onRequestClose={hideCelebration}>
      <LinearGradient colors={theme.gradient} style={styles.overlay}>
        {celebration && (
          <View style={styles.content}>
            <View style={styles.dialWrap}>
              <Ring delay={0} color={theme.ringColor} />
              <Ring delay={RING_DELAY_MS} color={theme.ringColor} />
              <CompassDial
                percent={animatedPercent}
                colorFrom={theme.dialColorFrom}
                colorTo={theme.dialColorTo}
                tickActiveColor={theme.ringColor}
                tickInactiveColor="rgba(255,255,255,0.2)"
                trackColor={theme.dialTrack}
                markerFill={theme.markerFill}
                textColor={theme.titleColor}
                subLabelColor={theme.subtitleColor}
                showLabel={celebration.percent !== undefined}
              />
              {celebration.centerLabel && (
                <View style={styles.dialCenterLabel} pointerEvents="none">
                  <ThemedText type="title" style={[styles.dialCenterValue, { color: theme.titleColor }]}>
                    {celebration.centerLabel.value}
                  </ThemedText>
                  {celebration.centerLabel.caption && (
                    <ThemedText type="small" style={[styles.dialCenterCaption, { color: theme.subtitleColor }]}>
                      {celebration.centerLabel.caption}
                    </ThemedText>
                  )}
                </View>
              )}
            </View>

            <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.eyebrowColor }]}>
              {celebration.eyebrow}
            </ThemedText>
            <ThemedText type="title" style={[styles.title, { color: theme.titleColor }]}>
              {celebration.title}
            </ThemedText>
            <ThemedText type="small" style={[styles.subtitle, { color: theme.subtitleColor }]}>
              {celebration.subtitle}
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={celebration.primaryLabel}
              onPress={() => {
                celebration.onPrimary();
                hideCelebration();
              }}
              style={[styles.primaryButton, { backgroundColor: theme.buttonBg }]}>
              <ThemedText type="smallBold" style={[styles.primaryButtonLabel, { color: theme.buttonText }]}>
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
                <ThemedText type="smallBold" style={[styles.secondaryLabel, { color: theme.secondaryColor }]}>
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
  },
  dialCenterLabel: {
    position: 'absolute',
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialCenterValue: {
    fontSize: 40,
    lineHeight: 50,
  },
  dialCenterCaption: {
    marginTop: 2,
  },
  eyebrow: {
    letterSpacing: 2,
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    marginTop: Spacing.five,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  primaryButtonLabel: {},
  secondaryButton: {
    marginTop: Spacing.three - 2,
    padding: Spacing.one,
  },
  secondaryLabel: {},
});
