import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Asks for POST_NOTIFICATIONS (Android 13+) *in context* — call after the user
 * books/orders/registers a shop, not on first launch — then stores the Expo
 * push token so database triggers can deliver pushes.
 */
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Bookings, orders & offers',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user) {
    await supabase
      .from('push_tokens')
      .upsert({ token, platform: Platform.OS, updated_at: new Date().toISOString() }, { onConflict: 'token' });
  }
  return token;
}

export async function unregisterPush() {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId || !Device.isDevice) return;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await supabase.from('push_tokens').delete().eq('token', token);
  } catch {
    /* best effort */
  }
}

/** Deep-links a tapped notification to the right screen. */
export function routeFromNotificationData(data: Record<string, unknown> | undefined) {
  if (!data) return;
  const role = data.role as string | undefined;
  if (data.bookingId && role === 'owner' && data.shopId) router.push(`/business/${data.shopId as string}/bookings`);
  else if (data.bookingId) router.push(`/booking/${data.bookingId as string}`);
  else if (data.orderId && role === 'owner') router.push(`/business/order/${data.orderId as string}`);
  else if (data.orderId) router.push(`/order/${data.orderId as string}`);
  else if (data.shopId) router.push(`/shop/${data.shopId as string}`);
}
