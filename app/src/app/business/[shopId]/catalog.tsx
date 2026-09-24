import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Avatar, Badge, Button, EmptyState, Segmented, Text } from '@/components/ui';
import { t } from '@/i18n';
import { formatMoney } from '@/lib/format';
import { useCatalog } from '@/services/catalog';
import { useShop } from '@/services/shops';
import { useAppTheme } from '@/theme';
import type { ItemKind } from '@/types/models';

export default function Catalog() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useAppTheme();
  const shop = useShop(shopId);
  const items = useCatalog(shopId);
  const [kind, setKind] = useState<ItemKind>(shop.data?.accepts_orders && !shop.data?.accepts_bookings ? 'product' : 'service');
  const list = (items.data ?? []).filter((i) => i.kind === kind);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('business.catalog'), headerRight: () => <Button title={t('common.add')} size="sm" variant="ghost" icon="add" onPress={() => router.push({ pathname: '/business/[shopId]/item', params: { shopId, kind } })} /> }} />
      <View style={{ padding: 16 }}>
        <Segmented<ItemKind> value={kind} onChange={setKind} options={[{ value: 'service', label: t('shop.services') }, { value: 'product', label: t('shop.products') }]} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
        ListEmptyComponent={items.isLoading ? null : <EmptyState icon="pricetags-outline" title={t('shop.noItems')} action={t('business.addItem')} onAction={() => router.push({ pathname: '/business/[shopId]/item', params: { shopId, kind } })} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/business/[shopId]/item', params: { shopId, itemId: item.id } })}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Avatar uri={item.image_url} name={item.name} rounded={false} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{item.name}</Text>
              <Text variant="caption" color="textMuted">
                {formatMoney(item.price, shop.data?.currency)}
                {item.unit ? ` / ${item.unit}` : item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}
              </Text>
            </View>
            {!item.is_available ? <Badge label="Hidden" tone="neutral" /> : null}
          </Pressable>
        )}
      />
    </View>
  );
}
