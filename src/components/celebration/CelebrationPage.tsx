import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { CELEBRATION_THEMES } from '@/components/celebration/celebration-themes';
import { CompassDial } from '@/components/compass-dial';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { CelebrationOptions } from '@/lib/celebration-context';

export type CelebrationPageProps = {
  celebration: CelebrationOptions;
  /** One page = one full screen width, so the horizontal ScrollView in CelebrationOverlay snaps cleanly - can't use `100%` since the ScrollView's content itself is wider than the screen. */
  width: number;
  /** Runs the pressed button's own callback, then closes the whole review session (see CelebrationOverlay - swiping between cards is free browsing, but acting on one ends the session for all of them). */
  onAct: () => void;
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

/** One card in the celebration queue's swipeable stack - see CelebrationOverlay. */
export function CelebrationPage({ celebration, width, onAct }: CelebrationPageProps) {
  const targetPercent = celebration.percent ?? 100;
  const animatedPercent = useCountUp(targetPercent, DIAL_MS);
  const theme = CELEBRATION_THEMES[celebration.colorTheme ?? 'green'];

  return (
    <LinearGradient colors={theme.gradient} style={[styles.overlay, { width }]}>
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
            onAct();
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
              onAct();
            }}
            hitSlop={8}
            style={styles.secondaryButton}>
            <ThemedText type="smallBold" style={[styles.secondaryLabel, { color: theme.secondaryColor }]}>
              {celebration.secondaryLabel}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </LinearGradient>
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
