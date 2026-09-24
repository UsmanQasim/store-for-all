import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RequireAuth } from '@/components/RequireAuth';
import { Avatar, EmptyState, PressableCard, Segmented, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { formatDateTime, formatMoney, timeAgo } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useMyBookings } from '@/services/bookings';
import { useMyOrders } from '@/services/orders';
import { useAppTheme } from '@/theme';

type Tab = 'bookings' | 'orders';

export default function Activity() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');
  const bookings = useMyBookings(user?.id);
  const orders = useMyOrders(user?.id);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <RequireAuth>
        <View style={{ padding: 16, gap: 12 }}>
          <Text variant="h1">{t('activity.title')}</Text>
          <Segmented<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { value: 'bookings', label: t('activity.bookings') },
              { value: 'orders', label: t('activity.orders') },
            ]}
          />
        </View>
        {tab === 'bookings' ? (
          <FlatList
            data={bookings.data ?? []}
            keyExtractor={(b) => b.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={bookings.isRefetching} onRefresh={bookings.refetch} tintColor={colors.primary} />}
            ListEmptyComponent={bookings.isLoading ? null : <EmptyState icon="calendar-outline" title={t('activity.emptyBookings')} />}
            renderItem={({ item: b }) => (
              <PressableCard onPress={() => router.push(`/booking/${b.id}`)} style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Avatar uri={b.shop?.logo_url} name={b.shop?.name} rounded={false} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>{b.shop?.name}</Text>
                  <Text variant="caption" color="textMuted">{b.service_name ?? t('booking.anyService')} · {formatDateTime(b.starts_at, b.shop?.timezone)}</Text>
                </View>
                <StatusBadge status={b.status} />
              </PressableCard>
            )}
          />
        ) : (
          <FlatList
            data={orders.data ?? []}
            keyExtractor={(o) => o.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={orders.refetch} tintColor={colors.primary} />}
            ListEmptyComponent={orders.isLoading ? null : <EmptyState icon="bag-handle-outline" title={t('activity.emptyOrders')} />}
            renderItem={({ item: o }) => (
              <PressableCard onPress={() => router.push(`/order/${o.id}`)} style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Avatar uri={o.shop?.logo_url} name={o.shop?.name} rounded={false} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>{o.shop?.name}</Text>
                  <Text variant="caption" color="textMuted">{o.code} · {formatMoney(o.subtotal, o.currency)} · {timeAgo(o.created_at)}</Text>
                </View>
                <StatusBadge status={o.status} />
              </PressableCard>
            )}
          />
        )}
      </RequireAuth>
    </SafeAreaView>
  );
}
