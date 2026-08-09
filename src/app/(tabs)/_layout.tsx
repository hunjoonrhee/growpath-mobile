import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabIcon } from '@/components/navigation/TabIcon';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.pri2,
        tabBarInactiveTintColor: Colors.textFaint,
        tabBarStyle: {
          backgroundColor: Colors.surf,
          borderTopColor: Colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ focused }) => <TabIcon icon="🧭" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t('tabs.log'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📓" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
