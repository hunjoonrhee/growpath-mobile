import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

export type TabIconProps = {
  icon: LucideIcon;
  focused: boolean;
};

export function TabIcon({ icon: Icon, focused }: TabIconProps) {
  const colors = useTheme();

  return <Icon size={24} color={focused ? colors.pri2 : colors.textFaint} strokeWidth={1.8} />;
}
