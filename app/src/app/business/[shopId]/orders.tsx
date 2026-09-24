import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { BusinessScreen } from '@/components/shell';
import { Avatar, EmptyState, Icon, LoadingState, Segmented, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { formatMoney, timeAgo } from '@/lib/format';
import { useShopOrders } from '@/services/orders';
import { useShop } from '@/services/shops';

type Filter = 'open' | 'done';
const OPEN = ['placed', 'accepted', 'packing', 'ready', 'out_for_delivery'];

/** Owner order queue (list → B10 detail). */
export default function OrderQueue() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const q = useShopOrders(shopId);
  const [filter, setFilter] = useState<Filter>('open');
  const all = q.data ?? [];
  const open = all.filter((o) => OPEN.includes(o.status));
  const data = filter === 'open' ? open : all.filter((o) => !OPEN.includes(o.status));
  const fresh = open.filter((o) => o.status === 'placed').length;

  return (
    <BusinessScreen
      active="orders"
      shopId={shopId}
      shopName={shop.data?.name ?? ''}
      section={t('business.orders')}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor="#00543b" />}
    >
      <View className="pt-2">
        <View className="flex-row items-center gap-1.5">
          <Icon name="store" className="text-[16px] text-primary" />
          <Text numberOfLines={1} className="text-text-muted font-caption text-caption uppercase tracking-wider font-semibold">{shop.data?.name}</Text>
        </View>
        <Text className="font-headline-lg text-headline-lg text-on-surface">Order Queue</Text>
      </View>

      {fresh > 0 ? (
        <View className="flex-row items-center gap-3 p-3.5 rounded-xl bg-warning-soft shadow-sm">
          <View className="w-9 h-9 rounded-full bg-secondary-container/20 items-center justify-center">
            <Icon name="notifications_active" className="text-[20px] text-warning-amber" />
          </View>
          <Text className="flex-1 font-body-lg text-body-lg text-on-surface font-semibold">
            {fresh} new {fresh === 1 ? 'order' : 'orders'} to accept
          </Text>
        </View>
      ) : null}

      <Segmented<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: t('business.openOrders'), count: open.length },
          { value: 'done', label: t('activity.past') },
        ]}
      />

      {q.isLoading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState icon="shopping_bag" title={t('business.queueEmpty')} />
      ) : (
        <View className="gap-space-md">
          {data.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => router.push(`/business/order/${o.id}`)}
              accessibilityRole="button"
              className="rounded-xl bg-surface-card p-space-md shadow-sm gap-3 active:opacity-90"
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-2">
                  <StatusBadge status={o.status} />
                  <View className="px-2 py-0.5 rounded-md bg-surface-container">
                    <Text className="font-label-sm text-label-sm text-text-muted">{o.code}</Text>
                  </View>
                </View>
                <Text className="font-caption text-caption text-text-muted">{timeAgo(o.created_at)}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Avatar uri={o.customer?.avatar_url} name={o.customer?.full_name} size={40} />
                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface font-bold">{o.customer?.full_name ?? 'Customer'}</Text>
                  <View className="flex-row items-center gap-1">
                    <Icon name={o.fulfillment === 'delivery' ? 'two_wheeler' : 'storefront'} className="text-[14px] text-text-muted" />
                    <Text className="font-caption text-caption text-text-muted">
                      {o.fulfillment === 'delivery' ? t('cart.delivery') : t('cart.pickup')} • {o.items?.length ?? 0} {(o.items?.length ?? 0) === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </View>
                <Text className="font-price-display text-price-display text-primary font-bold">{formatMoney(o.subtotal, o.currency)}</Text>
                <Icon name="chevron_right" className="text-[22px] text-text-muted" />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </BusinessScreen>
  );
}
