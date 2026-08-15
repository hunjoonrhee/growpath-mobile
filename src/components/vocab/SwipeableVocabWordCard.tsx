import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { SwipeDeleteAction } from '@/components/log/SwipeDeleteAction';
import { VocabWordCard } from '@/components/vocab/VocabWordCard';
import type { VocabWord } from '@/lib/vocab';

export type SwipeableVocabWordCardProps = {
  word: VocabWord;
  onDelete: () => void;
};

/** Same "swipe left to delete" pattern as SwipeableSessionLogCard - the swipe + tapping the revealed button is the confirmation, so no additional Alert. */
export function SwipeableVocabWordCard({ word, onDelete }: SwipeableVocabWordCardProps) {
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
      renderRightActions={(progress) => <SwipeDeleteAction progress={progress} label={t('vocabList.deleteCta')} onPress={handleDelete} />}>
      <VocabWordCard word={word} />
    </ReanimatedSwipeable>
  );
}
