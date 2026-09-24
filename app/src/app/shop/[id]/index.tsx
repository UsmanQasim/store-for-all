import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReportSheet } from '@/components/ReportSheet';
import { useEnsureAuth } from '@/components/RequireAuth';
import { Avatar, Badge, Button, Card, EmptyState, IconButton, LoadingState, RatingInline, SectionHeader, Stars, Stepper, Text } from '@/components/ui';
import { t } from '@/i18n';
import { DAY_KEYS, formatMoney, isOpenNow, timeAgo } from '@/lib/format';
import { open, shareShop } from '@/lib/links';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useCatalog, useShopPosts } from '@/services/catalog';
import { useShop } from '@/services/shops';
import { useFavorites, useReviews, useToggleFavorite } from '@/services/social';
import { useAppTheme } from '@/theme';
import type { CatalogItem, Shop } from '@/types/models';

export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius, shadow } = useAppTheme();
  const { user } = useAuth();
  const ensureAuth = useEnsureAuth();
  const shop = useShop(id);
  const items = useCatalog(shop.data?.id);
  const posts = useShopPosts(shop.data?.id);
  const reviews = useReviews(shop.data?.id);
  const favorites = useFavorites(!!user);
  const toggleFav = useToggleFavorite();
  const cart = useCart();
  const [reporting, setReporting] = useState(false);

  if (shop.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return <EmptyState icon="storefront-outline" title={t('shop.notFound')} action={t('common.close')} onAction={() => router.back()} />;

  const isFav = !!favorites.data?.some((f) => f.id === s.id);
  const isOwner = user?.id === s.owner_id;
  const services = (items.data ?? []).filter((i) => i.kind === 'service' && i.is_available);
  const products = (items.data ?? []).filter((i) => i.kind === 'product' && i.is_available);
  const openNow = isOpenNow(s.opening_hours, s.timezone);
  const cartHere = cart.shopId === s.id && cart.count > 0;

  const addToCart = (item: CatalogItem) => {
    if (!cart.add(s.id, item)) {
      Alert.alert(t('cart.title'), t('cart.otherShop'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('cart.startNew'), onPress: () => { cart.reset(s.id); cart.add(s.id, item); } },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <IconButton icon="share-social-outline" label={t('common.share')} background={colors.surface} onPress={() => shareShop(s.name, s.slug)} />
              {!isOwner ? <IconButton icon="flag-outline" label={t('shop.report')} background={colors.surface} onPress={() => ensureAuth() && setReporting(true)} /> : null}
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: cartHere ? 120 : 40 }}>
        {/* Cover + identity */}
        <View style={{ height: 200, backgroundColor: colors.primarySoft }}>
          {s.cover_url ? <Image source={{ uri: s.cover_url }} style={{ flex: 1 }} contentFit="cover" /> : null}
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: -40, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <View style={[{ borderRadius: 20, borderWidth: 4, borderColor: colors.background }, shadow.card]}>
              <Avatar uri={s.logo_url} name={s.name} size={84} rounded={false} />
            </View>
            <View style={{ flex: 1 }} />
            {!isOwner ? (
              <Button
                title={isFav ? t('shop.following') : t('shop.follow')}
                icon={isFav ? 'heart' : 'heart-outline'}
                variant={isFav ? 'secondary' : 'primary'}
                size="sm"
                loading={toggleFav.isPending}
                onPress={() => ensureAuth() && toggleFav.mutate({ shopId: s.id, favorite: !isFav })}
              />
            ) : (
              <Button title={t('business.manage')} icon="settings-outline" size="sm" variant="secondary" onPress={() => router.push('/business')} />
            )}
          </View>
          <View style={{ gap: 4 }}>
            <Text variant="h1">{s.name}</Text>
            {s.tagline ? <Text color="textMuted">{s.tagline}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
              <RatingInline avg={s.rating_avg} count={s.rating_count} />
              <Badge label={openNow ? t('common.openNow') : t('common.closed')} tone={openNow ? 'success' : 'neutral'} />
              {s.area ? <Text variant="caption" color="textMuted">{[s.area, s.city].filter(Boolean).join(', ')}</Text> : null}
            </View>
          </View>

          {/* Quick actions */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {s.phone ? <QuickAction icon="call-outline" label={t('common.call')} onPress={() => open.call(s.phone!)} /> : null}
            {s.whatsapp ? <QuickAction icon="logo-whatsapp" label={t('common.whatsapp')} onPress={() => open.whatsapp(s.whatsapp!, `Hi ${s.name}!`, s.country_code)} /> : null}
            {s.lat != null && s.lng != null ? <QuickAction icon="navigate-outline" label={t('common.directions')} onPress={() => open.maps(s.lat!, s.lng!)} /> : null}
            <QuickAction icon="wallet-outline" label={t('shop.pay')} onPress={() => router.push(`/shop/${s.id}/pay`)} highlight />
          </View>

          {/* Primary CTAs */}
          {s.accepts_bookings || s.accepts_orders ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {s.accepts_bookings ? <Button title={t('shop.book')} icon="calendar" style={{ flex: 1 }} onPress={() => router.push(`/shop/${s.id}/book`)} /> : null}
              {s.accepts_orders && !s.accepts_bookings ? <Button title={t('shop.order')} icon="bag-handle" variant="accent" style={{ flex: 1 }} onPress={() => router.push(`/shop/${s.id}/cart`)} /> : null}
            </View>
          ) : null}

          {/* Offers */}
          {posts.data?.length ? (
            <View style={{ gap: 10 }}>
              <SectionHeader title={t('shop.offers')} />
              {posts.data.slice(0, 3).map((p) => (
                <View key={p.id} style={{ backgroundColor: colors.accentSoft, borderRadius: radius.lg, padding: 14, gap: 4 }}>
                  <Text variant="bodyStrong">{p.title}</Text>
                  {p.body ? <Text variant="caption" color="textMuted">{p.body}</Text> : null}
                  <Text variant="caption" color="textMuted">{timeAgo(p.created_at)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Services */}
          {services.length ? (
            <View style={{ gap: 10 }}>
              <SectionHeader title={t('shop.services')} />
              <Card padded={false}>
                {services.map((item, i) => (
                  <ItemRow key={item.id} item={item} shop={s} first={i === 0}
                    right={s.accepts_bookings ? <Button title={t('shop.book')} size="sm" variant="secondary" onPress={() => router.push({ pathname: '/shop/[id]/book', params: { id: s.id, service: item.id } })} /> : null} />
                ))}
              </Card>
            </View>
          ) : null}

          {/* Products */}
          {products.length ? (
            <View style={{ gap: 10 }}>
              <SectionHeader title={t('shop.products')} />
              <Card padded={false}>
                {products.map((item, i) => {
                  const qty = cart.shopId === s.id ? cart.quantityOf(item.id) : 0;
                  return (
                    <ItemRow key={item.id} item={item} shop={s} first={i === 0}
                      right={!s.accepts_orders ? null : qty > 0 ? <Stepper value={qty} onChange={(v) => cart.setQuantity(item.id, v)} /> : <Button title={t('shop.addToCart')} size="sm" icon="add" onPress={() => addToCart(item)} />} />
                  );
                })}
              </Card>
            </View>
          ) : null}

          {!services.length && !products.length && !items.isLoading ? <EmptyState icon="list-outline" title={t('shop.noItems')} /> : null}

          {/* Reviews preview */}
          <View style={{ gap: 10 }}>
            <SectionHeader title={t('shop.reviews')} action={t('common.seeAll')} onAction={() => router.push(`/shop/${s.id}/reviews`)} />
            {reviews.data?.slice(0, 2).map((r) => (
              <Card key={r.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar uri={r.author_avatar} name={r.author_name} size={32} />
                  <Text variant="bodyStrong" style={{ flex: 1 }}>{r.author_name}</Text>
                  <Stars value={r.rating} />
                </View>
                {r.comment ? <Text numberOfLines={3}>{r.comment}</Text> : null}
              </Card>
            ))}
            {!isOwner ? <Button title={t('reviews.write')} variant="secondary" icon="create-outline" onPress={() => router.push(`/shop/${s.id}/reviews`)} /> : null}
          </View>

          {/* About */}
          <View style={{ gap: 10 }}>
            <SectionHeader title={t('shop.about')} />
            <Card style={{ gap: 12 }}>
              {s.description ? <Text>{s.description}</Text> : null}
              {s.address ? (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                  <Text style={{ flex: 1 }}>{[s.address, s.area, s.city].filter(Boolean).join(', ')}</Text>
                </View>
              ) : null}
              <View style={{ gap: 4 }}>
                <Text variant="bodyStrong">{t('shop.hours')}</Text>
                {DAY_KEYS.map((d) => (
                  <View key={d} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="caption" color="textMuted" style={{ textTransform: 'capitalize' }}>{d}</Text>
                    <Text variant="caption">{s.opening_hours[d]?.length ? s.opening_hours[d]!.map((r) => `${r.open}–${r.close}`).join(', ') : t('common.closed')}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Sticky cart bar */}
      {cartHere ? (
        <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 }}>
          <Pressable onPress={() => router.push(`/shop/${s.id}/cart`)} accessibilityRole="button" style={[{ backgroundColor: colors.primary, borderRadius: radius.lg, minHeight: 56, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, shadow.floating]}>
            <Text variant="bodyStrong" style={{ color: colors.onPrimary }}>{t('shop.viewCart', { n: cart.count })}</Text>
            <Text variant="price" style={{ color: colors.onPrimary }}>{formatMoney(cart.subtotal, s.currency)}</Text>
          </Pressable>
        </SafeAreaView>
      ) : null}

      <ReportSheet visible={reporting} onClose={() => setReporting(false)} targetType="shop" targetId={s.id} />
    </View>
  );
}

function QuickAction({ icon, label, onPress, highlight }: { icon: never | string; label: string; onPress: () => void; highlight?: boolean }) {
  const { colors, radius } = useAppTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ flex: 1, minHeight: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: highlight ? colors.accentSoft : colors.surface, borderWidth: 1, borderColor: highlight ? colors.accent : colors.border, opacity: pressed ? 0.8 : 1 })}>
      <Ionicons name={icon as never} size={22} color={highlight ? colors.warning : colors.primary} />
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}

function ItemRow({ item, shop, right, first }: { item: CatalogItem; shop: Shop; right: React.ReactNode; first: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: first ? 0 : 1, borderTopColor: colors.border }}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={{ width: 56, height: 56, borderRadius: 12 }} contentFit="cover" /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{item.name}</Text>
        {item.description ? <Text variant="caption" color="textMuted" numberOfLines={2}>{item.description}</Text> : null}
        <Text variant="price" color="primary">
          {formatMoney(item.price, shop.currency)}
          <Text variant="caption" color="textMuted">{item.unit ? ` / ${item.unit}` : item.duration_minutes ? ` · ${t('shop.minutes', { n: item.duration_minutes })}` : ''}</Text>
        </Text>
      </View>
      {right}
    </View>
  );
}
