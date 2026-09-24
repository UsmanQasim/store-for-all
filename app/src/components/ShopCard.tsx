import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { formatDistance } from '@/lib/format';
import { t } from '@/i18n';
import { useAppTheme } from '@/theme';
import type { NearbyShop, Shop } from '@/types/models';
import { Avatar, Badge, PressableCard, RatingInline, Text } from './ui';

type CardShop = Pick<NearbyShop, 'id' | 'name' | 'tagline' | 'area' | 'city' | 'logo_url' | 'cover_url' | 'rating_avg' | 'rating_count' | 'accepts_bookings' | 'accepts_orders'> & {
  distance_m?: number | null;
};

/** Full-width card used in lists (Home "near you", Explore). */
export function ShopCard({ shop }: { shop: CardShop }) {
  const { colors } = useAppTheme();
  const distance = formatDistance(shop.distance_m);
  return (
    <PressableCard onPress={() => router.push(`/shop/${shop.id}`)} accessibilityLabel={shop.name}>
      <View style={{ height: 120, backgroundColor: colors.primarySoft }}>
        {shop.cover_url ? <Image source={{ uri: shop.cover_url }} style={{ flex: 1 }} contentFit="cover" transition={150} /> : null}
      </View>
      <View style={{ padding: 14, flexDirection: 'row', gap: 12 }}>
        <View style={{ marginTop: -36, borderRadius: 14, borderWidth: 3, borderColor: colors.surface }}>
          <Avatar uri={shop.logo_url} name={shop.name} size={56} rounded={false} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="h3" numberOfLines={1}>{shop.name}</Text>
          {shop.tagline ? <Text variant="caption" color="textMuted" numberOfLines={1}>{shop.tagline}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
            <RatingInline avg={shop.rating_avg} count={shop.rating_count} />
            {distance ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                <Text variant="caption" color="textMuted">{distance}</Text>
              </View>
            ) : shop.area ? (
              <Text variant="caption" color="textMuted">{shop.area}</Text>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            {shop.accepts_bookings ? <Badge label={t('shop.book')} tone="primary" icon="calendar-outline" /> : null}
            {shop.accepts_orders ? <Badge label={t('shop.order')} tone="warning" icon="bag-handle-outline" /> : null}
          </View>
        </View>
      </View>
    </PressableCard>
  );
}

/** Compact square tile used in the horizontal "Your shops" favorites row. */
export function ShopTile({ shop }: { shop: Pick<Shop, 'id' | 'name' | 'logo_url'> }) {
  return (
    <PressableCard onPress={() => router.push(`/shop/${shop.id}`)} style={{ width: 96, padding: 10, alignItems: 'center', gap: 8 }} accessibilityLabel={shop.name}>
      <Avatar uri={shop.logo_url} name={shop.name} size={56} rounded={false} />
      <Text variant="caption" numberOfLines={2} align="center">{shop.name}</Text>
    </PressableCard>
  );
}
