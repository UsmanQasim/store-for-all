import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { Avatar, Button, Card, EmptyState, Segmented, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatDate, formatTime } from '@/lib/format';
import { open } from '@/lib/links';
import { useBookingMutations, useShopBookings } from '@/services/bookings';
import { useShop } from '@/services/shops';
import { useAppTheme } from '@/theme';
import type { Booking, BookingStatus } from '@/types/models';

type Filter = 'requests' | 'upcoming' | 'done';

export default function BookingQueue() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useAppTheme();
  const shop = useShop(shopId);
  const q = useShopBookings(shopId);
  const { setStatus } = useBookingMutations();
  const [filter, setFilter] = useState<Filter>('requests');
  const tz = shop.data?.timezone;

  const data = (q.data ?? []).filter((b) =>
    filter === 'requests' ? b.status === 'pending' : filter === 'upcoming' ? b.status === 'confirmed' : !['pending', 'confirmed'].includes(b.status),
  );

  const act = (b: Booking, status: BookingStatus) => setStatus.mutateAsync({ id: b.id, status }).catch((e) => Alert.alert(toAppError(e).message));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('business.bookings') }} />
      <View style={{ padding: 16 }}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'requests', label: `${t('status.pending')} (${(q.data ?? []).filter((b) => b.status === 'pending').length})` },
            { value: 'upcoming', label: t('status.confirmed') },
            { value: 'done', label: t('activity.past') },
          ]}
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={colors.primary} />}
        ListEmptyComponent={q.isLoading ? null : <EmptyState icon="calendar-clear-outline" title={t('business.queueEmpty')} />}
        renderItem={({ item: b }) => (
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'center', minWidth: 64 }}>
                <Text variant="h3" color="primary">{formatTime(b.starts_at, tz)}</Text>
                <Text variant="label" color="textMuted">{formatDate(b.starts_at, tz)}</Text>
              </View>
              <Avatar uri={b.customer?.avatar_url} name={b.customer?.full_name} size={36} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" numberOfLines={1}>{b.customer?.full_name ?? 'Customer'}</Text>
                <Text variant="caption" color="textMuted" numberOfLines={1}>{b.service_name ?? t('booking.anyService')} · {b.code}</Text>
              </View>
              <StatusBadge status={b.status} />
            </View>
            {b.customer_note ? <Text variant="caption" color="textMuted">“{b.customer_note}”</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {b.status === 'pending' ? (
                <>
                  <Button title={t('business.confirm')} size="sm" icon="checkmark" onPress={() => act(b, 'confirmed')} />
                  <Button title={t('business.reject')} size="sm" variant="danger" onPress={() => act(b, 'rejected')} />
                </>
              ) : null}
              {b.status === 'confirmed' ? (
                <>
                  <Button title={t('business.complete')} size="sm" icon="checkmark-done" onPress={() => act(b, 'completed')} />
                  <Button title={t('business.noShow')} size="sm" variant="secondary" onPress={() => act(b, 'no_show')} />
                </>
              ) : null}
              {b.customer?.phone ? <Button title={t('common.call')} size="sm" variant="ghost" icon="call-outline" onPress={() => open.call(b.customer!.phone!)} /> : null}
            </View>
          </Card>
        )}
      />
    </View>
  );
}
