import {
  IBMPlexSansKR_400Regular,
  IBMPlexSansKR_500Medium,
  IBMPlexSansKR_600SemiBold,
  IBMPlexSansKR_700Bold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans-kr';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrationOverlay } from '@/components/celebration/CelebrationOverlay';
import { ToastHost } from '@/components/toast/ToastHost';
import { useTheme } from '@/hooks/use-theme';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { CelebrationProvider } from '@/lib/celebration-context';
import '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { AppThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/lib/toast-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_600SemiBold,
    IBMPlexSansKR_700Bold,
  });
  const colors = useTheme();
  const { resolvedScheme } = useThemeMode();

  const navigationTheme = {
    ...(resolvedScheme === 'light' ? DefaultTheme : DarkTheme),
    colors: {
      ...(resolvedScheme === 'light' ? DefaultTheme.colors : DarkTheme.colors),
      background: colors.bg,
      card: colors.surf,
      primary: colors.pri2,
      text: colors.text,
      border: colors.border,
    },
  };

  const isReady = !isLoading && fontsLoaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={resolvedScheme === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }} />
      <ToastHost />
      <CelebrationOverlay />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <ToastProvider>
              <CelebrationProvider>
                <AuthProvider>
                  <RootNavigator />
                </AuthProvider>
              </CelebrationProvider>
            </ToastProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
