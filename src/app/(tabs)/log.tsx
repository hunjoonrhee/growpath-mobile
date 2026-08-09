import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/navigation/PlaceholderScreen';

// TODO(phase-4): voice/photo capture buttons + recent logs list.
export default function LogScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('log.title')} />;
}
