import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { SessionLogCard } from '@/components/log/SessionLogCard';
import { SwipeDeleteAction } from '@/components/log/SwipeDeleteAction';
import type { SessionRecord } from '@/lib/sessions';

export type SwipeableSessionLogCardProps = {
  session: SessionRecord;
  onPress: () => void;
  onDelete: () => void;
};

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
      renderRightActions={(progress) => <SwipeDeleteAction progress={progress} label={t('log.deleteCta')} onPress={handleDelete} />}>
      <SessionLogCard session={session} onPress={onPress} />
    </ReanimatedSwipeable>
  );
}
