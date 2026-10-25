import 'expo-sqlite/localStorage/install';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import '../../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRealtimeSync } from '@/hooks/useRealtime';
import { routeFromNotificationData } from '@/lib/notifications';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { AppThemeProvider, useAppTheme } from '@/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

/** Tapping a push notification deep-links into the right screen (native only). */
function NotificationRouter() {
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (lastResponse) routeFromNotificationData(lastResponse.notification.request.content.data as Record<string, unknown>);
  }, [lastResponse]);
  return null;
}

function AppStack() {
  const { colors, dark } = useAppTheme();
  const { ready, user } = useAuth();
  useRealtimeSync(user?.id);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {Platform.OS !== 'web' ? <NotificationRouter /> : null}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
        <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  useEffect(() => {
    if (Platform.OS !== 'web' || !loaded) return;
    // Web only: expose the files as one 'Plus Jakarta Sans' family with real weights, so Tailwind's
    // font-* classes resolve exactly like the Stitch HTML.
    const files: [string | number, number][] = [
      [PlusJakartaSans_400Regular, 400],
      [PlusJakartaSans_500Medium, 500],
      [PlusJakartaSans_600SemiBold, 600],
      [PlusJakartaSans_700Bold, 700],
      [PlusJakartaSans_800ExtraBold, 800],
    ];
    for (const [mod, weight] of files) {
      const uri = typeof mod === 'string' ? mod : (Asset.fromModule(mod).uri as string);
      const face = new FontFace('Plus Jakarta Sans', `url(${uri})`, { weight: String(weight) });
      face.load().then((f) => document.fonts.add(f)).catch(() => undefined);
    }
  }, [loaded]);
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <LocationProvider>
                <CartProvider>
                  <AppStack />
                </CartProvider>
              </LocationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
