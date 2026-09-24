import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Icon, Image, Text, type IconName } from '@/components/nw';
import { ReportSheet } from '@/components/ReportSheet';
import { useEnsureAuth } from '@/components/RequireAuth';
import { CustomerScreen } from '@/components/shell';
import { EmptyState, LoadingState, Stepper } from '@/components/ui';
import { t } from '@/i18n';
import { categoryIcon } from '@/lib/categories';
import { formatMoney, groupHours, initials, isOpenNow, timeAgo } from '@/lib/format';
import { open, shareShop } from '@/lib/links';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useCatalog, useShopPosts } from '@/services/catalog';
import { useShop } from '@/services/shops';
import { useFavorites, useReviews, useToggleFavorite } from '@/services/social';
import type { CatalogItem } from '@/types/models';

/** C03 — Shop detail. */
export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  if (!s)
    return (
      <CustomerScreen subtitle={t('tabs.explore')}>
        <EmptyState icon="storefront" title={t('shop.notFound')} action={t('common.close')} onAction={() => router.back()} />
      </CustomerScreen>
    );

  const isFav = !!favorites.data?.some((f) => f.id === s.id);
  const isOwner = user?.id === s.owner_id;
  const services = (items.data ?? []).filter((i) => i.kind === 'service' && i.is_available);
  const products = (items.data ?? []).filter((i) => i.kind === 'product' && i.is_available);
  const openNow = isOpenNow(s.opening_hours, s.timezone);
  const cartHere = cart.shopId === s.id && cart.count > 0;
  const offer = posts.data?.find((p) => !p.expires_at || new Date(p.expires_at) > new Date());
  const hours = groupHours(s.opening_hours);

  const addToCart = (item: CatalogItem) => {
    if (!cart.add(s.id, item)) {
      Alert.alert(t('cart.title'), t('cart.otherShop'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('cart.startNew'),
          onPress: () => {
            cart.reset(s.id);
            cart.add(s.id, item);
          },
        },
      ]);
    }
  };

  const cartBar = cartHere ? (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${s.id}/cart`)} className="h-[60px] rounded-xl bg-primary-container px-space-md flex-row items-center gap-3 active:bg-primary-pressed shadow-md">
      <View className="w-9 h-9 rounded-lg bg-on-primary/15 items-center justify-center">
        <Icon name="shopping_bag" fill className="text-on-primary text-[20px]" />
      </View>
      <View className="flex-1">
        <Text className="font-headline-sm text-headline-sm text-on-primary">{t('shop.viewCart', { n: cart.count })}</Text>
        <Text numberOfLines={1} className="font-caption text-[11px] text-on-primary-container">{s.name} · {t('cart.payNote').split('.')[0]}</Text>
      </View>
      <Text className="font-headline-sm text-headline-sm text-on-primary">{formatMoney(cart.subtotal, s.currency)}</Text>
      <Icon name="arrow_forward" className="text-on-primary text-[20px]" />
    </Pressable>
  ) : undefined;

  return (
    <CustomerScreen subtitle={t('tabs.explore')} footer={cartBar} contentClassName="pb-8">
      {/* Cover */}
      <View className="relative w-full h-[200px] overflow-hidden bg-surface-container">
        {s.cover_url ? <Image source={{ uri: s.cover_url }} className="w-full h-full" contentFit="cover" /> : null}
        <View className="absolute top-0 left-0 right-0 h-16 bg-black/20" />
        <View className="absolute top-3 left-0 right-0 px-margin flex-row items-center justify-between">
          <RoundBtn icon="arrow_back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />
          <View className="flex-row items-center gap-space-sm">
            <RoundBtn icon="share" label={t('common.share')} onPress={() => shareShop(s.name, s.slug)} />
            {!isOwner ? <RoundBtn icon="flag" label={t('shop.report')} muted onPress={() => ensureAuth() && setReporting(true)} /> : null}
          </View>
        </View>
      </View>

      {/* Identity */}
      <View className="px-margin">
        <View className="flex-row items-end justify-between -mt-10 mb-3">
          <View className="w-[84px] h-[84px] rounded-xl shadow-md p-1 bg-surface-card">
            {s.logo_url ? (
              <Image source={{ uri: s.logo_url }} className="w-full h-full rounded-lg" contentFit="cover" />
            ) : (
              <View className="w-full h-full rounded-lg bg-primary-soft items-center justify-center">
                <Icon name={categoryIcon(s.category_slug)} fill className="text-primary text-[36px]" />
                <Text className="text-[10px] uppercase font-bold tracking-tight text-primary-pressed mt-0.5">Est. {new Date(s.created_at).getFullYear()}</Text>
              </View>
            )}
          </View>
          {isOwner ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/business')} className="h-10 px-space-md rounded-xl bg-surface-card shadow-sm flex-row items-center gap-1.5 active:bg-primary-soft">
              <Icon name="settings" className="text-primary text-[20px]" />
              <Text className="text-primary font-label-sm text-label-sm">{t('business.manage')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isFav }}
              onPress={() => ensureAuth() && toggleFav.mutate({ shopId: s.id, favorite: !isFav })}
              className="h-10 px-space-md rounded-xl bg-surface-card shadow-sm flex-row items-center gap-1.5 active:bg-primary-soft"
            >
              <Icon name="favorite" fill={isFav} className="text-primary text-[20px]" />
              <Text className="text-primary font-label-sm text-label-sm">{isFav ? t('shop.following') : t('shop.follow')}</Text>
            </Pressable>
          )}
        </View>

        <View className="gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="shrink font-headline-lg text-headline-lg text-on-surface tracking-tight">{s.name}</Text>
            <Icon name="verified" fill className="text-[20px] text-primary" />
          </View>
          {s.tagline ? <Text className="font-caption text-caption text-text-muted">{s.tagline}</Text> : null}
        </View>

        <View className="flex-row flex-wrap items-center gap-space-sm mt-2.5">
          <View className="flex-row items-center gap-1 bg-warning-soft px-2 py-0.5 rounded-full">
            <Icon name="star" fill className="text-[16px] text-warning-amber" />
            <Text className="font-label-sm text-label-sm text-warning-amber">{s.rating_count ? Number(s.rating_avg).toFixed(1) : t('common.new')}</Text>
            {s.rating_count ? <Text className="font-caption text-[11px] text-text-muted">({s.rating_count})</Text> : null}
          </View>
          <View className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full ${openNow ? 'bg-success-soft' : 'bg-surface-alt'}`}>
            <View className={`w-1.5 h-1.5 rounded-full ${openNow ? 'bg-success-green' : 'bg-text-muted'}`} />
            <Text className={`font-label-sm text-label-sm uppercase ${openNow ? 'text-success-green' : 'text-text-muted'}`}>{openNow ? t('common.openNow') : t('common.closed')}</Text>
          </View>
          {s.area || s.city ? (
            <View className="flex-row items-center gap-1">
              <Icon name="location_on" className="text-[16px] text-text-muted" />
              <Text numberOfLines={1} className="text-text-muted font-caption text-caption max-w-[180px]">{[s.area, s.city].filter(Boolean).join(', ')}</Text>
            </View>
          ) : null}
        </View>

        {/* Quick actions */}
        <View className="flex-row gap-2.5 mt-space-xl">
          <Quick icon="call" label={t('common.call')} tint="text-primary" disabled={!s.phone} onPress={() => s.phone && open.call(s.phone)} />
          <Quick icon="chat" fill label={t('common.whatsapp')} tint="text-success-green" disabled={!s.whatsapp} onPress={() => s.whatsapp && open.whatsapp(s.whatsapp, `Hi ${s.name}!`, s.country_code)} />
          <Quick icon="near_me" label={t('common.directions')} tint="text-info-blue" disabled={s.lat == null} onPress={() => s.lat != null && s.lng != null && open.maps(s.lat, s.lng)} />
          <Quick icon="account_balance_wallet" fill label={t('shop.pay')} tint="text-warning-amber" pay onPress={() => router.push(`/shop/${s.id}/pay`)} />
        </View>

        {s.accepts_bookings ? (
          <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${s.id}/book`)} className="w-full h-[52px] mt-3 rounded-xl bg-primary-container flex-row items-center justify-center gap-2 shadow-sm active:bg-primary-pressed">
            <Icon name="calendar_month" className="text-on-primary text-[22px]" />
            <Text className="text-on-primary font-body-lg text-body-lg">{t('shop.book')}</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="px-margin gap-space-xl mt-space-xl">
        {/* Offer */}
        {offer ? (
          <View className="w-full bg-accent-soft rounded-xl p-space-md shadow-sm">
            <View className="flex-row items-start gap-space-sm">
              <View className="w-8 h-8 rounded-full bg-warning-soft items-center justify-center mt-0.5">
                <Icon name="campaign" className="text-warning-amber text-[18px]" />
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">{t('shop.offers')}</Text>
                  <Text className="font-caption text-[11px] text-text-muted">{timeAgo(offer.created_at)}</Text>
                </View>
                <Text className="font-body-lg text-caption text-on-surface">{offer.title}</Text>
                {offer.body ? <Text className="font-caption text-caption text-on-surface-variant">{offer.body}</Text> : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* Services */}
        {services.length ? (
          <Section title={t('shop.services')} hint={s.accepts_bookings ? 'Chairs Ready' : undefined}>
            {services.map((item, i) => (
              <Row key={item.id} first={i === 0}>
                <View className="flex-1 min-w-0 pr-2">
                  <Text className="font-body-lg text-body-lg text-on-surface">{item.name}</Text>
                  {item.description ? <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{item.description}</Text> : null}
                  <Text className="font-price-display text-price-display text-primary mt-1">
                    {formatMoney(item.price, s.currency)}
                    {item.duration_minutes ? <Text className="font-caption text-caption text-text-muted font-normal"> · {t('shop.minutes', { n: item.duration_minutes })}</Text> : null}
                  </Text>
                </View>
                {s.accepts_bookings ? (
                  <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/shop/[id]/book', params: { id: s.id, service: item.id } })} className="h-9 px-space-md rounded-lg bg-surface-alt items-center justify-center active:opacity-80">
                    <Text className="text-primary font-label-sm text-label-sm">Book</Text>
                  </Pressable>
                ) : null}
              </Row>
            ))}
          </Section>
        ) : null}

        {/* Products */}
        {products.length ? (
          <Section title={t('shop.products')} hint={s.accepts_orders ? 'Fresh Local Stock' : undefined}>
            {products.map((item, i) => {
              const qty = cart.shopId === s.id ? cart.quantityOf(item.id) : 0;
              return (
                <Row key={item.id} first={i === 0}>
                  {item.image_url ? <Image source={{ uri: item.image_url }} className="w-14 h-14 rounded-lg bg-surface-container" contentFit="cover" /> : null}
                  <View className="flex-1 min-w-0 pr-2">
                    <Text className="font-body-lg text-body-lg text-on-surface">{item.name}</Text>
                    {item.description ? <Text numberOfLines={2} className="font-caption text-caption text-text-muted">{item.description}</Text> : null}
                    <Text className="font-price-display text-price-display text-primary mt-1">
                      {formatMoney(item.price, s.currency)}
                      {item.unit ? <Text className="font-caption text-caption text-text-muted font-normal"> / {item.unit}</Text> : null}
                    </Text>
                  </View>
                  {!s.accepts_orders ? null : qty > 0 ? (
                    <Stepper value={qty} onChange={(v) => cart.setQuantity(item.id, v)} />
                  ) : (
                    <Pressable accessibilityRole="button" accessibilityLabel={`${t('shop.addToCart')} ${item.name}`} onPress={() => addToCart(item)} className="h-8 px-3 rounded-full bg-primary-soft flex-row items-center gap-1 active:opacity-80">
                      <Icon name="add" className="text-primary text-[16px]" />
                      <Text className="text-primary font-label-sm text-label-sm">{t('shop.addToCart')}</Text>
                    </Pressable>
                  )}
                </Row>
              );
            })}
          </Section>
        ) : null}

        {!services.length && !products.length && !items.isLoading ? <EmptyState icon="list" title={t('shop.noItems')} /> : null}

        {/* Reviews */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="font-headline-sm text-headline-sm text-on-surface">{t('shop.reviews')}</Text>
              {s.rating_count ? (
                <View className="flex-row items-center gap-0.5">
                  <Icon name="star" fill className="text-warning-amber text-[14px]" />
                  <Text className="font-label-sm text-label-sm text-warning-amber font-bold">{Number(s.rating_avg).toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${s.id}/reviews`)} className="min-h-[40px] justify-center">
              <Text className="font-caption text-caption text-primary font-semibold">
                {t('common.seeAll')} ({s.rating_count})
              </Text>
            </Pressable>
          </View>
          {reviews.data?.slice(0, 2).map((r) => (
            <View key={r.id} className="bg-surface-card rounded-xl p-space-md shadow-sm gap-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1">
                  {r.author_avatar ? (
                    <Image source={{ uri: r.author_avatar }} className="w-8 h-8 rounded-full" />
                  ) : (
                    <View className="w-8 h-8 rounded-full bg-surface-alt items-center justify-center">
                      <Text className="text-on-surface font-bold text-caption">{initials(r.author_name)}</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-body-lg text-body-md font-semibold text-on-surface">{r.author_name}</Text>
                    <Text className="font-caption text-[11px] text-text-muted">{timeAgo(r.created_at)}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon key={n} name="star" fill={r.rating >= n} className={`${r.rating >= n ? 'text-warning-amber' : 'text-outline-variant'} text-[16px]`} />
                  ))}
                </View>
              </View>
              {r.comment ? <Text numberOfLines={4} className="font-body-md text-caption text-on-surface-variant">{r.comment}</Text> : null}
            </View>
          ))}
          {!isOwner ? (
            <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${s.id}/reviews`)} className="w-full h-11 rounded-xl bg-surface-card shadow-sm active:bg-surface-alt flex-row items-center justify-center gap-1.5 mt-1">
              <Icon name="rate_review" className="text-on-surface text-[18px]" />
              <Text className="text-on-surface font-label-sm text-label-sm">{t('reviews.write')}</Text>
            </Pressable>
          ) : null}
        </View>

        {/* About & timings */}
        <View className="gap-2.5">
          <Text className="font-headline-sm text-headline-sm text-on-surface">About & Timings</Text>
          <View className="bg-surface-card rounded-xl p-space-md shadow-sm gap-space-md">
            {s.description ? <Text className="font-body-md text-body-md text-on-surface-variant">{s.description}</Text> : null}
            {s.address || s.area ? (
              <View className="flex-row items-start gap-space-sm p-space-sm bg-surface-alt rounded-lg">
                <Icon name="location_on" className="text-primary text-[22px]" />
                <View className="flex-1">
                  {s.address ? <Text className="font-caption font-semibold text-on-surface text-[13px]">{s.address}</Text> : null}
                  <Text className="font-caption text-caption text-text-muted">{[s.area, s.city].filter(Boolean).join(', ')}</Text>
                </View>
              </View>
            ) : null}
            <View className="gap-2 pt-1">
              {hours.map((h, i) => (
                <View key={h.label}>
                  {i > 0 ? <View className="h-px bg-surface-alt mb-2" /> : null}
                  <View className="flex-row items-center justify-between">
                    <Text className="font-caption text-caption text-on-surface font-semibold">{h.label}</Text>
                    {h.closed ? (
                      <View className="bg-danger-soft px-2 py-0.5 rounded-full">
                        <Text className="font-caption text-danger-red font-semibold uppercase text-[11px]">{t('common.closed')}</Text>
                      </View>
                    ) : (
                      <Text className="font-caption text-caption text-text-muted">{h.value}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <ReportSheet visible={reporting} onClose={() => setReporting(false)} targetType="shop" targetId={s.id} />
    </CustomerScreen>
  );
}

function RoundBtn({ icon, label, onPress, muted }: { icon: IconName; label: string; onPress: () => void; muted?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} className="w-10 h-10 rounded-full bg-surface-card shadow-md items-center justify-center active:opacity-80">
      <Icon name={icon} className={`${muted ? 'text-on-surface-variant' : 'text-on-surface'} text-[20px]`} />
    </Pressable>
  );
}

function Quick({ icon, label, tint, onPress, fill, pay, disabled }: { icon: IconName; label: string; tint: string; onPress: () => void; fill?: boolean; pay?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 h-16 rounded-xl shadow-sm items-center justify-center gap-1 ${pay ? 'bg-accent-soft' : 'bg-surface-card active:bg-surface-alt'} ${disabled ? 'opacity-40' : ''}`}
    >
      <Icon name={icon} fill={fill} className={`text-[20px] ${tint}`} />
      <Text className={`font-label-sm text-[11px] ${pay ? 'font-bold text-secondary' : 'text-text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="font-headline-sm text-headline-sm text-on-surface">{title}</Text>
        {hint ? <Text className="font-caption text-caption text-primary font-semibold">{hint}</Text> : null}
      </View>
      <View className="bg-surface-card rounded-xl shadow-sm overflow-hidden">{children}</View>
    </View>
  );
}

function Row({ first, children }: { first: boolean; children: ReactNode }) {
  return (
    <View>
      {!first ? <View className="h-px bg-surface-alt mx-space-md" /> : null}
      <View className="p-space-md flex-row items-center justify-between gap-space-sm">{children}</View>
    </View>
  );
}
