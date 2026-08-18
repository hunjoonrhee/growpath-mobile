import { Redirect, Tabs } from 'expo-router';
import { Compass, NotebookText, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { TabIcon } from '@/components/navigation/TabIcon';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const colors = useTheme();

  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pri2,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surf,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ focused }) => <TabIcon icon={Compass} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t('tabs.log'),
          tabBarIcon: ({ focused }) => <TabIcon icon={NotebookText} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
