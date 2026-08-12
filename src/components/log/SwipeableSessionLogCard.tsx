import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { SessionLogCard } from '@/components/log/SessionLogCard';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { SessionRecord } from '@/lib/sessions';

export type SwipeableSessionLogCardProps = {
  session: SessionRecord;
  onPress: () => void;
  onDelete: () => void;
};

function DeleteAction({ progress, label, onPress }: { progress: SharedValue<number>; label: string; onPress: () => void }) {
  // Slides the delete button in from behind the card as the swipe
  // progresses, matching the native iOS reveal instead of popping in at
  // full width immediately.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - Math.min(progress.value, 1)) * 72 }],
  }));

  return (
    <Animated.View style={[styles.actionContainer, animatedStyle]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.actionButton}>
        <ThemedText type="smallBold" style={styles.actionLabel}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Wraps SessionLogCard with the native iOS "swipe left to delete" gesture -
 * swiping and tapping the revealed button *is* the confirmation, so unlike
 * the explicit Delete button on the detail screen this doesn't show an
 * additional Alert.
 */
export function SwipeableSessionLogCard({ session, onPress, onDelete }: SwipeableSessionLogCardProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={(progress) => <DeleteAction progress={progress} label={t('log.deleteCta')} onPress={handleDelete} />}>
      <SessionLogCard session={session} onPress={onPress} />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    width: 72,
    marginBottom: Spacing.two - 2,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.amber,
    borderRadius: 14,
    marginLeft: Spacing.two - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: Colors.bg,
  },
});
