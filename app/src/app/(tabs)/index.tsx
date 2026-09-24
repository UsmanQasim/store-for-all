import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopCard, ShopTile } from '@/components/ShopCard';
import { Avatar, Card, EmptyState, IconButton, SectionHeader, Text } from '@/components/ui';
import { getLocale, t } from '@/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { useUserLocation } from '@/providers/LocationProvider';
import { usePostsFeed } from '@/services/catalog';
import { useCategories, useNearbyShops } from '@/services/shops';
import { useFavorites, useNotifications } from '@/services/social';
import { useAppTheme } from '@/theme';

export default function Home() {
  const { colors, radius } = useAppTheme();
  const { user, profile } = useAuth();
  const loc = useUserLocation();
  const categories = useCategories();
  const favorites = useFavorites(!!user);
  const notifications = useNotifications(!!user);
  const unread = notifications.data?.filter((n) => !n.read_at).length ?? 0;
  const nearby = useNearbyShops({ lat: loc.coords?.lat, lng: loc.coords?.lng, limit: 20 });
  const feed = usePostsFeed((favorites.data ?? []).map((s) => s.id));
  const firstName = profile?.full_name?.split(' ')[0];

  const refreshing = nearby.isRefetching || favorites.isRefetching;
  const onRefresh = () => {
    loc.refresh(false);
    nearby.refetch();
    favorites.refetch();
    notifications.refetch();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {/* Header: greeting + location + bell */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="h2">{t('home.greeting', { name: firstName ? `, ${firstName}` : '' })}</Text>
            <Pressable onPress={() => loc.refresh(true)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32 }}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text variant="caption" color="textMuted" numberOfLines={1}>{loc.label ?? t('home.locationUnknown')}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </Pressable>
          </View>
          <View>
            <IconButton icon="notifications-outline" label={t('activity.notifications')} onPress={() => router.push(user ? '/notifications' : '/sign-in')} background={colors.surface} />
            {unread > 0 ? <View style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }} /> : null}
          </View>
        </View>

        {/* Search entry */}
        <Pressable
          onPress={() => router.push('/explore')}
          accessibilityRole="search"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text color="textMuted">{t('home.searchPlaceholder')}</Text>
        </Pressable>

        {/* Categories */}
        <View style={{ gap: 12 }}>
          <SectionHeader title={t('home.categories')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {(categories.data ?? []).map((c) => (
              <Pressable key={c.slug} onPress={() => router.push({ pathname: '/explore', params: { category: c.slug } })} accessibilityRole="button" style={{ width: 76, alignItems: 'center', gap: 6 }}>
                <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={c.icon as never} size={26} color={colors.primary} />
                </View>
                <Text variant="caption" numberOfLines={2} align="center">{getLocale() === 'ur' ? c.name_ur : c.name_en}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Favorites ("your shops" pinned on home) */}
        {user ? (
          <View style={{ gap: 12 }}>
            <SectionHeader title={t('home.favorites')} />
            {favorites.data?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {favorites.data.map((s) => <ShopTile key={s.id} shop={s} />)}
              </ScrollView>
            ) : (
              <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Ionicons name="heart-outline" size={22} color={colors.primary} />
                <Text variant="caption" color="textMuted" style={{ flex: 1 }}>{t('home.favoritesEmpty')}</Text>
              </Card>
            )}
          </View>
        ) : null}

        {/* Offers from favorite shops */}
        {feed.data?.length ? (
          <View style={{ gap: 12 }}>
            <SectionHeader title={t('home.offers')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {feed.data.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/shop/${p.shop_id}`)} style={{ width: 260, borderRadius: radius.lg, padding: 16, gap: 8, backgroundColor: colors.accentSoft }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Avatar uri={p.shop.logo_url} name={p.shop.name} size={28} rounded={false} />
                    <Text variant="caption" numberOfLines={1}>{p.shop.name}</Text>
                  </View>
                  <Text variant="h3" numberOfLines={2}>{p.title}</Text>
                  {p.body ? <Text variant="caption" color="textMuted" numberOfLines={2}>{p.body}</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Near you */}
        <View style={{ gap: 12 }}>
          <SectionHeader title={loc.coords ? t('home.nearYou') : t('home.popular')} action={t('common.seeAll')} onAction={() => router.push('/explore')} />
          {nearby.data?.length ? (
            nearby.data.map((s) => <ShopCard key={s.id} shop={s} />)
          ) : nearby.isLoading ? null : (
            <EmptyState icon="storefront-outline" title={t('home.noShops')} body={t('home.noShopsBody')} action={t('home.registerShop')} onAction={() => router.push(user ? '/business/create' : '/sign-in')} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
