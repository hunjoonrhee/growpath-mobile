import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type FlipCardProps = {
  isFlipped: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  front: React.ReactNode;
  back: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
};

const FLIP_MS = 350;

/**
 * Generic tap-to-flip 3D card. Sizes itself to the `back` face's natural
 * layout height (rendered once, invisibly, in-flow, purely to reserve
 * space) - built for callers where `back` has at least as much content as
 * `front` (e.g. front = word only, back = word + meaning), which is the
 * case for every current caller. A future caller with a taller front would
 * get it clipped/centered oddly - a sign to size explicitly instead.
 */
export function FlipCard({ isFlipped, onPress, accessibilityLabel, front, back, style, faceStyle }: FlipCardProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: FLIP_MS });
  }, [isFlipped, rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value}deg` }],
  }));
  // Offsetting by 180deg means the back face lands at 360deg (visually
  // identical to 0deg, right-reading) exactly when the front has rotated
  // out of view - the standard flip-card trick, relying on
  // backfaceVisibility:'hidden' to hide whichever face is edge-on/away.
  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value + 180}deg` }],
  }));

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={style}>
      <View pointerEvents="none" style={styles.sizer}>
        {back}
      </View>
      <Animated.View style={[styles.face, faceStyle, frontAnimatedStyle]}>{front}</Animated.View>
      <Animated.View style={[styles.face, faceStyle, backAnimatedStyle]}>{back}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sizer: {
    opacity: 0,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
});
