import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Icon, Image, Text } from '@/components/nw';
import { useEnsureAuth } from '@/components/RequireAuth';
import { CustomerScreen } from '@/components/shell';
import { ShopCard, ShopTile } from '@/components/ShopCard';
import { EmptyState } from '@/components/ui';
import { t } from '@/i18n';
import { categoryIcon, categoryShort } from '@/lib/categories';
import { isOpenNow, timeAgo } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useUserLocation } from '@/providers/LocationProvider';
import { usePostsFeed } from '@/services/catalog';
import { useCategories, useNearbyShops } from '@/services/shops';
import { useFavorites, useToggleFavorite } from '@/services/social';

/** C01 — Home. */
export default function Home() {
  const { user, profile } = useAuth();
  const ensureAuth = useEnsureAuth();
  const loc = useUserLocation();
  const categories = useCategories();
  const favorites = useFavorites(!!user);
  const toggleFav = useToggleFavorite();
  const nearby = useNearbyShops({ lat: loc.coords?.lat, lng: loc.coords?.lng, limit: 20 });
  const favIds = (favorites.data ?? []).map((s) => s.id);
  const feed = usePostsFeed(favIds);
  const firstName = profile?.full_name?.split(' ')[0];
  const openCount = (nearby.data ?? []).filter((s) => isOpenNow(s.opening_hours, s.timezone)).length;
  const area = loc.label?.split(',')[0];

  const onRefresh = () => {
    loc.refresh(false);
    nearby.refetch();
    favorites.refetch();
    feed.refetch();
  };

  return (
    <CustomerScreen
      active="home"
      subtitle={t('tabs.home')}
      refreshControl={<RefreshControl refreshing={nearby.isRefetching} onRefresh={onRefresh} tintColor="#0B6E4F" />}
    >
      <View className="px-margin pt-space-md pb-space-lg gap-space-lg">
        {/* Greeting */}
        <View>
          <Text className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('home.greeting', { name: firstName ? `, ${firstName}` : '' })}</Text>
          <Pressable accessibilityRole="button" onPress={() => loc.refresh(true)} className="flex-row items-center gap-1 mt-0.5 min-h-[48px] active:opacity-75">
            <Icon name="location_on" className="text-primary text-[18px]" />
            <Text numberOfLines={1} className="font-body-md text-body-md text-on-surface-variant font-medium shrink">{loc.label ?? t('home.locationUnknown')}</Text>
            <Icon name="arrow_drop_down" className="text-on-surface-variant text-[18px]" />
          </Pressable>
        </View>

        {/* Search */}
        <Pressable accessibilityRole="search" onPress={() => router.navigate('/(tabs)/explore')} className="w-full h-[52px] bg-surface-card rounded-xl shadow-sm flex-row items-center px-4 gap-3">
          <Icon name="search" className="text-text-muted text-[22px]" />
          <Text className="font-body-md text-body-md text-text-muted flex-1">{t('home.searchPlaceholder')}</Text>
        </Pressable>

        {/* Open-now note */}
        {openCount > 0 ? (
          <View className="bg-primary-soft/60 rounded-xl p-space-md flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-primary-container items-center justify-center">
              <Icon name="store" className="text-on-primary text-[18px]" />
            </View>
            <Text className="font-caption text-caption text-primary-pressed flex-1">
              {openCount} trusted neighbourhood {openCount === 1 ? 'shop' : 'shops'} open right now{area ? ` in ${area}` : ''}.
            </Text>
          </View>
        ) : null}
      </View>

      {/* Categories */}
      <View className="gap-space-md mb-space-xl">
        <View className="px-margin flex-row items-center justify-between">
          <Text className="font-headline-sm text-headline-sm text-on-surface">{t('home.categories')}</Text>
          <Pressable onPress={() => router.navigate('/(tabs)/explore')} className="min-h-[40px] justify-center" accessibilityRole="button">
            <Text className="font-caption text-caption text-text-muted">Explore all</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 px-margin pb-1">
          {(categories.data ?? []).map((c) => (
            <Pressable key={c.slug} accessibilityRole="button" onPress={() => router.navigate({ pathname: '/(tabs)/explore', params: { category: c.slug } })} className="items-center gap-1.5 active:opacity-80">
              <View className="w-[60px] h-[60px] rounded-2xl bg-primary-soft items-center justify-center shadow-sm">
                <Icon name={categoryIcon(c.slug)} className="text-primary text-[28px]" />
              </View>
              <Text numberOfLines={1} className="font-caption text-caption text-on-surface font-medium text-center w-[64px]">{categoryShort(c)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Your shops (favorites) */}
      {user ? (
        <View className="gap-space-md mb-space-xl">
          <View className="px-margin flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Icon name="star" fill className="text-warning-amber text-[20px]" />
              <Text className="font-headline-sm text-headline-sm text-on-surface">{t('home.favorites')}</Text>
            </View>
            {favIds.length ? <Text className="font-caption text-caption text-primary font-medium">{favIds.length} pinned</Text> : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-margin pb-1">
            {(favorites.data ?? []).map((s) => (
              <ShopTile key={s.id} shop={s} />
            ))}
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/(tabs)/scan')} className="w-[96px] bg-surface-alt/70 p-2.5 rounded-2xl items-center justify-center active:opacity-80">
              <View className="w-10 h-10 rounded-full bg-surface-card items-center justify-center mb-1 shadow-sm">
                <Icon name="add" className="text-text-muted text-[20px]" />
              </View>
              <Text className="font-caption text-caption font-medium text-text-muted text-center leading-tight">Add Shop</Text>
            </Pressable>
          </ScrollView>
        </View>
      ) : null}

      {/* Offers from your shops */}
      {feed.data?.length ? (
        <View className="gap-space-md mb-space-xl">
          <View className="px-margin flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Icon name="local_activity" className="text-secondary text-[20px]" />
              <Text className="font-headline-sm text-headline-sm text-on-surface">{t('home.offers')}</Text>
            </View>
            <View className="bg-warning-soft px-2 py-0.5 rounded-full">
              <Text className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Special</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-margin pb-1">
            {feed.data.map((p) => (
              <Pressable key={p.id} accessibilityRole="button" onPress={() => router.push(`/shop/${p.shop_id}`)} className="w-[280px] bg-accent-soft p-space-lg rounded-2xl shadow-sm justify-between">
                <View>
                  <View className="flex-row items-center gap-2 mb-2.5">
                    {p.shop.logo_url ? <Image source={{ uri: p.shop.logo_url }} className="w-7 h-7 rounded-lg" /> : <View className="w-7 h-7 rounded-lg bg-surface-card" />}
                    <Text numberOfLines={1} className="font-caption text-caption font-semibold text-secondary shrink">{p.shop.name}</Text>
                  </View>
                  <Text numberOfLines={2} className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-snug mb-1">{p.title}</Text>
                  {p.body ? <Text numberOfLines={2} className="font-caption text-caption text-text-muted">{p.body}</Text> : null}
                </View>
                <View className="mt-4 pt-3 flex-row items-center justify-between">
                  <Text className="font-label-sm text-label-sm text-on-surface-variant font-semibold">{timeAgo(p.created_at)}</Text>
                  <View className="bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
                    <Text className="font-caption text-caption font-semibold text-on-surface">Shop Now</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Near you */}
      <View className="px-margin gap-space-lg mb-space-xl">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-headline-sm text-headline-sm text-on-surface">{loc.coords ? t('home.nearYou') : t('home.popular')}</Text>
            <Text className="font-caption text-caption text-text-muted">Verified neighbourhood merchants</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/(tabs)/explore')} className="py-2 min-h-[48px] justify-center active:opacity-75">
            <Text className="text-primary font-headline-sm text-headline-sm">{t('common.seeAll')}</Text>
          </Pressable>
        </View>
        {nearby.data?.length
          ? nearby.data.map((s) => (
              <ShopCard key={s.id} shop={s} favorite={favIds.includes(s.id)} onToggleFavorite={() => ensureAuth() && toggleFav.mutate({ shopId: s.id, favorite: !favIds.includes(s.id) })} />
            ))
          : nearby.isLoading
            ? null
            : <EmptyState icon="storefront" title={t('home.noShops')} body={t('home.noShopsBody')} action={t('home.registerShop')} onAction={() => router.push(user ? '/business/create' : '/sign-in')} />}
      </View>

      {/* Community note */}
      <View className="px-margin mb-6">
        <View className="bg-surface-alt rounded-2xl p-4 flex-row items-center gap-3.5">
          <Icon name="handshake" className="text-primary text-[28px]" />
          <View className="flex-1">
            <Text className="font-body-lg text-body-lg text-on-surface font-semibold">Supporting local dukaandars</Text>
            <Text className="font-caption text-caption text-text-muted">Zero commission on direct community pre-orders.</Text>
          </View>
        </View>
      </View>
    </CustomerScreen>
  );
}
