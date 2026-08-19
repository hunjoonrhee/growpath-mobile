import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { CelebrationPage } from '@/components/celebration/CelebrationPage';
import { useCelebrationContext } from '@/lib/celebration-context';

/**
 * Mounted once at the app root (see _layout.tsx) - renders whatever
 * useCelebration()/showCelebration() has queued as a horizontal swipeable
 * stack (Nike Run Club's post-run achievement cards, not a single
 * take-it-or-leave-it screen): several celebrations firing around the same
 * time (e.g. a roadmap stage completing on the same day a streak milestone
 * lands) all get their own full card instead of one silently winning.
 * Swiping between cards is free browsing; acting on any one of them (or the
 * explicit close button) ends the review session for the whole batch.
 */
export function CelebrationOverlay() {
  const { t } = useTranslation();
  const { queue, clearQueue } = useCelebrationContext();
  const { width } = useWindowDimensions();
  const [pageIndex, setPageIndex] = useState(0);
  const wasVisible = useRef(false);

  useEffect(() => {
    const isVisible = queue.length > 0;
    if (isVisible && !wasVisible.current) {
      // Once per batch, not once per card swiped into view - swiping to
      // preview an upcoming card isn't a new "moment" worth a haptic buzz.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setPageIndex(0);
    }
    wasVisible.current = isVisible;
  }, [queue.length]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPageIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <Modal visible={queue.length > 0} transparent animationType="fade" onRequestClose={clearQueue}>
      <View style={styles.root}>
        {queue.length > 0 && (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              style={styles.pager}>
              {queue.map((item, index) => (
                <CelebrationPage key={index} celebration={item} width={width} onAct={clearQueue} />
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('celebration.closeAccessibilityLabel')}
              onPress={clearQueue}
              hitSlop={12}
              style={styles.closeButton}>
              <X size={20} color="rgba(255,255,255,0.85)" strokeWidth={2} />
            </Pressable>

            {queue.length > 1 && (
              <View style={styles.dots} pointerEvents="none">
                {queue.map((_, index) => (
                  <View key={index} style={[styles.dot, index === pageIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dots: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
