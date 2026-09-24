import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { categoryName } from '@/lib/categories';
import { formatDistance, isOpenNow } from '@/lib/format';
import { t } from '@/i18n';
import type { Category, NearbyShop, Shop } from '@/types/models';
import { Icon, Image, Text } from './nw';

type CardShop = Pick<
  NearbyShop,
  'id' | 'name' | 'tagline' | 'area' | 'logo_url' | 'cover_url' | 'rating_avg' | 'rating_count' | 'accepts_bookings' | 'accepts_orders' | 'offers_delivery' | 'category_slug' | 'address' | 'opening_hours' | 'timezone'
> & { distance_m?: number | null };

function Cover({ uri, className }: { uri: string | null; className: string }) {
  return (
    <View className={`relative w-full overflow-hidden bg-surface-container ${className}`}>
      {uri ? <Image source={{ uri }} className="w-full h-full" contentFit="cover" transition={150} /> : null}
      {/* bg-gradient-to-t from-on-surface/40 → a soft bottom shade */}
      <View className="absolute left-0 right-0 bottom-0 h-1/2 bg-on-surface/10" />
    </View>
  );
}

function OpenBadge({ open, dot }: { open: boolean; dot?: boolean }) {
  return (
    <View className={`absolute top-2.5 right-2.5 ${open ? 'bg-success-soft' : 'bg-surface-alt'} px-2.5 py-1 rounded-full flex-row items-center gap-1`}>
      {dot ? <View className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-success-green' : 'bg-text-muted'}`} /> : null}
      <Text className={`${open ? 'text-success-green' : 'text-text-muted'} font-label-sm text-label-sm font-bold uppercase tracking-wider`}>
        {open ? t('common.openNow') : t('common.closed')}
      </Text>
    </View>
  );
}

/** C01 "Near you" card: cover, overlapping logo, favourite button, verified name, rating · distance, feature pills. */
export function ShopCard({ shop, favorite, onToggleFavorite }: { shop: CardShop; favorite?: boolean; onToggleFavorite?: () => void }) {
  const distance = formatDistance(shop.distance_m);
  const open = isOpenNow(shop.opening_hours, shop.timezone);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={shop.name} onPress={() => router.push(`/shop/${shop.id}`)} className="w-full bg-surface-card rounded-2xl shadow-sm overflow-hidden active:opacity-95">
      <View className="relative">
        <Cover uri={shop.cover_url} className="h-[120px]" />
        <OpenBadge open={open} />
      </View>
      <View className="p-space-lg pt-0">
        <View className="flex-row justify-between items-end -mt-7 mb-2.5">
          <View className="w-14 h-14 rounded-[14px] bg-surface-card p-1 shadow-md">
            {shop.logo_url ? (
              <Image source={{ uri: shop.logo_url }} className="w-full h-full rounded-[10px]" contentFit="cover" />
            ) : (
              <View className="w-full h-full rounded-[10px] bg-primary-soft items-center justify-center">
                <Text className="font-headline-md text-headline-md text-primary">{shop.name[0]}</Text>
              </View>
            )}
          </View>
          {onToggleFavorite ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('shop.follow')}
              accessibilityState={{ selected: !!favorite }}
              onPress={onToggleFavorite}
              hitSlop={4}
              className="w-10 h-10 rounded-full bg-surface-alt items-center justify-center active:opacity-70"
            >
              <Icon name="favorite" fill={favorite} className={`${favorite ? 'text-primary' : 'text-text-muted'} text-[20px]`} />
            </Pressable>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className="shrink font-headline-md text-headline-md text-on-surface">{shop.name}</Text>
          <Icon name="verified" fill className="text-primary text-[18px]" />
        </View>
        {shop.tagline ? <Text numberOfLines={1} className="font-caption text-caption text-text-muted mt-0.5">{shop.tagline}</Text> : null}
        <View className="flex-row items-center gap-3 mt-3">
          <View className="flex-row items-center gap-1">
            <Icon name="star" fill className="text-secondary-container text-[16px]" />
            <Text className="font-price-display text-price-display text-on-surface">{shop.rating_count ? Number(shop.rating_avg).toFixed(1) : t('common.new')}</Text>
            {shop.rating_count ? <Text className="font-caption text-caption text-text-muted">({shop.rating_count})</Text> : null}
          </View>
          {distance ? (
            <>
              <View className="w-1 h-1 rounded-full bg-text-muted/40" />
              <View className="flex-row items-center gap-0.5">
                <Icon name="near_me" className="text-primary text-[16px]" />
                <Text className="font-body-lg text-body-lg text-primary">{distance}</Text>
              </View>
            </>
          ) : null}
        </View>
        <View className="flex-row flex-wrap items-center gap-2 mt-4">
          {shop.accepts_bookings ? <Pill tone="success" label={t('shop.book')} /> : null}
          {shop.accepts_orders ? <Pill tone="warning" label={t('shop.order')} /> : null}
          {shop.offers_delivery ? <Pill tone="info" label={t('cart.delivery')} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function Pill({ tone, label }: { tone: 'success' | 'warning' | 'info'; label: string }) {
  const c = { success: 'bg-success-soft text-success-green', warning: 'bg-warning-soft text-warning-amber', info: 'bg-info-soft text-info-blue' }[tone].split(' ');
  return (
    <View className={`${c[0]} px-2.5 py-1 rounded-full`}>
      <Text className={`font-label-sm text-label-sm font-semibold ${c[1]}`}>{label}</Text>
    </View>
  );
}

/** C02 Explore card: cover with OPEN badge + distance chip, name, category • address, rating box, feature pills with icons. */
export function ExploreShopCard({ shop, category }: { shop: CardShop; category?: Category }) {
  const distance = formatDistance(shop.distance_m);
  const open = isOpenNow(shop.opening_hours, shop.timezone);
  const sub = [category ? categoryName(category) : null, shop.address || shop.area].filter(Boolean).join(' • ');
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={shop.name} onPress={() => router.push(`/shop/${shop.id}`)} className="w-full bg-surface-card rounded-xl shadow-sm overflow-hidden active:opacity-95">
      <View className="relative">
        <Cover uri={shop.cover_url} className="h-[124px]" />
        <OpenBadge open={open} dot />
        {distance ? (
          <View className="absolute bottom-2 left-2 bg-surface-card/90 px-2 py-0.5 rounded-full flex-row items-center gap-1">
            <Icon name="near_me" className="text-[14px] text-primary" />
            <Text className="font-label-sm text-label-sm text-on-surface">{distance} away</Text>
          </View>
        ) : null}
      </View>
      <View className="p-space-lg gap-space-sm">
        <View className="flex-row items-start justify-between gap-space-sm">
          <View className="flex-1 min-w-0">
            <Text numberOfLines={1} className="font-headline-md text-headline-md text-on-surface">{shop.name}</Text>
            {sub ? <Text numberOfLines={2} className="font-caption text-caption text-text-muted mt-0.5">{sub}</Text> : null}
          </View>
          <View className="flex-row items-center gap-1 bg-surface-container-high px-2 py-1 rounded-lg">
            <Icon name="star" fill className="text-warning-amber text-[16px]" />
            <Text className="font-headline-sm text-on-surface text-[14px]">{shop.rating_count ? Number(shop.rating_avg).toFixed(1) : t('common.new')}</Text>
            {shop.rating_count ? <Text className="font-caption text-text-muted text-[11px]">({shop.rating_count})</Text> : null}
          </View>
        </View>
        <View className="flex-row flex-wrap items-center gap-space-xs pt-1">
          {shop.accepts_bookings ? <IconPill bg="bg-primary-soft" fg="text-primary" icon="event_seat" label={t('shop.book')} /> : null}
          {shop.accepts_orders ? <IconPill bg="bg-accent-soft" fg="text-secondary" icon="shopping_bag" label={t('shop.order')} /> : null}
          {shop.accepts_orders ? (
            shop.offers_delivery ? (
              <IconPill bg="bg-info-soft" fg="text-info-blue" icon="two_wheeler" label={t('cart.delivery')} />
            ) : (
              <IconPill bg="bg-success-soft" fg="text-success-green" icon="takeout_dining" label={t('cart.pickup')} />
            )
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function IconPill({ bg, fg, icon, label }: { bg: string; fg: string; icon: 'event_seat' | 'shopping_bag' | 'two_wheeler' | 'takeout_dining'; label: string }) {
  return (
    <View className={`${bg} px-2.5 py-1 rounded-full flex-row items-center gap-1`}>
      <Icon name={icon} className={`${fg} text-[14px]`} />
      <Text className={`${fg} font-label-sm text-label-sm`}>{label}</Text>
    </View>
  );
}

/** C01 "Your shops" tile. */
export function ShopTile({ shop }: { shop: Pick<Shop, 'id' | 'name' | 'logo_url'> }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={shop.name} onPress={() => router.push(`/shop/${shop.id}`)} className="w-[96px] bg-surface-card p-2.5 rounded-2xl items-center shadow-sm active:opacity-90">
      {shop.logo_url ? (
        <Image source={{ uri: shop.logo_url }} className="w-12 h-12 rounded-[14px] mb-2" contentFit="cover" />
      ) : (
        <View className="w-12 h-12 rounded-[14px] mb-2 bg-primary-soft items-center justify-center">
          <Text className="font-headline-sm text-headline-sm text-primary">{shop.name[0]}</Text>
        </View>
      )}
      <Text numberOfLines={2} className="font-caption text-caption font-semibold text-on-surface text-center leading-tight">{shop.name}</Text>
    </Pressable>
  );
}
