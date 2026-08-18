import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';
import { useToastContext, type ToastOptions } from '@/lib/toast-context';

const ENTER_MS = 280;
const EXIT_MS = 180;
const SWIPE_DISMISS_THRESHOLD = -20;

type DisplayedToast = ToastOptions & { id: number };

/** Mounted once at the app root (see _layout.tsx) - renders whatever useToast()/showToast() currently has active. */
export function ToastHost() {
  const { toast, dismissToast } = useToastContext();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const [displayed, setDisplayed] = useState<DisplayedToast | null>(null);
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast) {
      // Syncing local state from context here (not deferring to a callback)
      // is deliberate - the enter animation below needs `displayed` set
      // before this effect returns, not on a later tick.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayed(toast);
      translateY.value = 24;
      opacity.value = 0;
      translateY.value = withTiming(0, { duration: ENTER_MS, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: ENTER_MS });
      // Spec: light selection haptic normally, a stronger error notification
      // only for the error variant - not on every toast alike.
      if (toast.variant === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        Haptics.selectionAsync().catch(() => {});
      }
    } else if (displayed) {
      translateY.value = withTiming(-16, { duration: EXIT_MS });
      opacity.value = withTiming(0, { duration: EXIT_MS }, (finished) => {
        if (finished) runOnJS(setDisplayed)(null);
      });
    }
    // Only toast (context state) should retrigger this - translateY/opacity/displayed are refs into the same animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // Mutating shared_value.value inside a gesture worklet is Reanimated's
  // normal, required API - not the kind of external-state mutation
  // react-hooks/immutability is meant to catch.
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      // eslint-disable-next-line react-hooks/immutability
      if (e.translationY < 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY < SWIPE_DISMISS_THRESHOLD) {
        runOnJS(dismissToast)();
      } else {
        // eslint-disable-next-line react-hooks/immutability
        translateY.value = withTiming(0, { duration: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!displayed) return null;

  const Icon = displayed.icon;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.toast, { backgroundColor: colors.surf, bottom: insets.bottom + Spacing.four }, animatedStyle]}
        pointerEvents="box-none">
        {Icon && (
          <View style={[styles.iconWrap, { backgroundColor: withAlpha(colors.pri, 0.14) }]}>
            <Icon size={18} color={colors.pri} strokeWidth={1.8} />
          </View>
        )}
        <View style={styles.textWrap}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {displayed.title}
          </ThemedText>
          {displayed.subtitle && (
            <ThemedText type="small" themeColor="textDim" numberOfLines={1}>
              {displayed.subtitle}
            </ThemedText>
          )}
        </View>
        {displayed.actionLabel && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={displayed.actionLabel}
            onPress={() => {
              displayed.onAction?.();
              dismissToast();
            }}
            hitSlop={8}>
            <ThemedText type="smallBold" themeColor="pri2">
              {displayed.actionLabel}
            </ThemedText>
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 2,
    borderRadius: 18,
    padding: Spacing.two + 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
