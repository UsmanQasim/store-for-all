import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
    mutations: { retry: 0 },
  },
});

// Refetch on app foreground (React Native has no window focus).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (s) => focusManager.setFocused(s === 'active'));
}
onlineManager.setOnline(true);

/** Central query keys so invalidation stays consistent. */
export const qk = {
  categories: ['categories'] as const,
  nearby: (p: object) => ['nearby', p] as const,
  shop: (idOrSlug: string) => ['shop', idOrSlug] as const,
  shopItems: (id: string) => ['shop', id, 'items'] as const,
  shopPayments: (id: string) => ['shop', id, 'payments'] as const,
  shopReviews: (id: string) => ['shop', id, 'reviews'] as const,
  shopPosts: (id: string) => ['shop', id, 'posts'] as const,
  slots: (shopId: string, date: string, serviceId?: string | null) => ['slots', shopId, date, serviceId ?? null] as const,
  favorites: ['favorites'] as const,
  isFavorite: (id: string) => ['favorites', id] as const,
  myBookings: ['me', 'bookings'] as const,
  myOrders: ['me', 'orders'] as const,
  booking: (id: string) => ['booking', id] as const,
  order: (id: string) => ['order', id] as const,
  notifications: ['me', 'notifications'] as const,
  profile: ['me', 'profile'] as const,
  myShops: ['me', 'shops'] as const,
  dashboard: (id: string) => ['business', id, 'dashboard'] as const,
  shopBookings: (id: string) => ['business', id, 'bookings'] as const,
  shopOrders: (id: string) => ['business', id, 'orders'] as const,
  myReview: (shopId: string) => ['shop', shopId, 'my-review'] as const,
};
