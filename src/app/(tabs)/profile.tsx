import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/navigation/PlaceholderScreen';

// TODO(phase-3+): avatar upload, stats, career goal summary, settings, logout.
export default function ProfileScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('profile.title')} />;
}
