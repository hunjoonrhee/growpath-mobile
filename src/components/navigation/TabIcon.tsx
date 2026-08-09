import { ThemedText } from '@/components/themed-text';

export type TabIconProps = {
  icon: string;
  focused: boolean;
};

export function TabIcon({ icon, focused }: TabIconProps) {
  return (
    <ThemedText themeColor={focused ? 'pri2' : 'textFaint'} style={{ fontSize: 20 }}>
      {icon}
    </ThemedText>
  );
}
