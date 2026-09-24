import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Avatar, EmptyState, PressableCard, Segmented, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { formatMoney, timeAgo } from '@/lib/format';
import { useShopOrders } from '@/services/orders';
import { useAppTheme } from '@/theme';

type Filter = 'open' | 'done';
const OPEN = ['placed', 'accepted', 'packing', 'ready', 'out_for_delivery'];

export default function OrderQueue() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useAppTheme();
  const q = useShopOrders(shopId);
  const [filter, setFilter] = useState<Filter>('open');
  const data = (q.data ?? []).filter((o) => (filter === 'open' ? OPEN.includes(o.status) : !OPEN.includes(o.status)));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('business.orders') }} />
      <View style={{ padding: 16 }}>
        <Segmented<Filter> value={filter} onChange={setFilter} options={[{ value: 'open', label: t('business.openOrders') }, { value: 'done', label: t('activity.past') }]} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={colors.primary} />}
        ListEmptyComponent={q.isLoading ? null : <EmptyState icon="bag-outline" title={t('business.queueEmpty')} />}
        renderItem={({ item: o }) => (
          <PressableCard onPress={() => router.push(`/business/order/${o.id}`)} style={{ padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar uri={o.customer?.avatar_url} name={o.customer?.full_name} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{o.customer?.full_name ?? 'Customer'} · {o.code}</Text>
                <Text variant="caption" color="textMuted">
                  {o.items?.length ?? 0} items · {formatMoney(o.subtotal, o.currency)} · {o.fulfillment === 'delivery' ? t('cart.delivery') : t('cart.pickup')} · {timeAgo(o.created_at)}
                </Text>
              </View>
              <StatusBadge status={o.status} />
            </View>
          </PressableCard>
        )}
      />
    </View>
  );
}
