import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BusinessScreen } from '@/components/shell';
import { Button, EmptyState, Icon, Image, LoadingState, Segmented, Text } from '@/components/ui';
import { t } from '@/i18n';
import { formatMoney } from '@/lib/format';
import { useCatalog } from '@/services/catalog';
import { useShop } from '@/services/shops';
import type { ItemKind } from '@/types/models';

/** Owner catalogue: services (barber menu) and products (kiryana shelf). */
export default function Catalog() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const items = useCatalog(shopId);
  const [picked, setKind] = useState<ItemKind | null>(null);
  const kind: ItemKind = picked ?? (shop.data?.accepts_orders && !shop.data?.accepts_bookings ? 'product' : 'service');
  const all = items.data ?? [];
  const list = all.filter((i) => i.kind === kind);
  const add = () => router.push({ pathname: '/business/[shopId]/item', params: { shopId, kind } });

  return (
    <BusinessScreen
      active="manage"
      shopId={shopId}
      shopName={shop.data?.name ?? ''}
      section={t('business.catalog')}
      footer={<Button title={t('business.addItem')} icon="add" onPress={add} fullWidth />}
    >
      <View className="pt-2">
        <Text className="font-headline-lg text-headline-lg text-on-surface">{t('business.catalog')}</Text>
        <Text className="font-caption text-caption text-text-muted">What customers can book or pre-order</Text>
      </View>
      <Segmented<ItemKind>
        value={kind}
        onChange={setKind}
        options={[
          { value: 'service', label: t('shop.services'), count: all.filter((i) => i.kind === 'service').length },
          { value: 'product', label: t('shop.products'), count: all.filter((i) => i.kind === 'product').length },
        ]}
      />
      {items.isLoading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState icon={kind === 'service' ? 'content_cut' : 'shopping_basket'} title={t('shop.noItems')} action={t('business.addItem')} onAction={add} />
      ) : (
        <View className="gap-space-sm">
          {list.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/business/[shopId]/item', params: { shopId, itemId: item.id } })}
              accessibilityRole="button"
              className={`flex-row items-center gap-space-md p-space-md rounded-xl bg-surface-card shadow-sm active:opacity-90 ${item.is_available ? '' : 'opacity-60'}`}
            >
              <View className="w-14 h-14 rounded-lg bg-surface-container-low overflow-hidden items-center justify-center">
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} className="w-full h-full" contentFit="cover" />
                ) : (
                  <Icon name={item.kind === 'service' ? 'content_cut' : 'shopping_basket'} className="text-text-muted text-[24px]" />
                )}
              </View>
              <View className="flex-1 min-w-0">
                <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface font-semibold">{item.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="font-price-display text-price-display text-primary font-bold">{formatMoney(item.price, shop.data?.currency)}</Text>
                  {item.unit || item.duration_minutes ? (
                    <Text className="font-caption text-caption text-text-muted">{item.unit ? `/ ${item.unit}` : `• ${item.duration_minutes} min`}</Text>
                  ) : null}
                </View>
              </View>
              {!item.is_available ? (
                <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
                  <Text className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">Hidden</Text>
                </View>
              ) : null}
              <Icon name="chevron_right" className="text-[22px] text-text-muted" />
            </Pressable>
          ))}
        </View>
      )}
    </BusinessScreen>
  );
}
