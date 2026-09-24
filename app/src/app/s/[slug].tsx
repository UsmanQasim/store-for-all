import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Icon, Image, Text } from '@/components/nw';
import { useEnsureAuth } from '@/components/RequireAuth';
import { CustomerScreen } from '@/components/shell';
import { EmptyState, LoadingState } from '@/components/ui';
import { getLocale, t } from '@/i18n';
import { distanceBetween, formatDistance } from '@/lib/format';
import { PAYMENT_LABELS } from '@/lib/payments';
import { useAuth } from '@/providers/AuthProvider';
import { useUserLocation } from '@/providers/LocationProvider';
import { usePaymentMethods } from '@/services/catalog';
import { useCategories, useShop } from '@/services/shops';
import { useFavorites, useToggleFavorite } from '@/services/social';

/** C09 — landing after scanning a shop QR / opening https://<domain>/s/<slug>. */
export default function ScanResult() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const ensureAuth = useEnsureAuth();
  const loc = useUserLocation();
  const shop = useShop(slug);
  const methods = usePaymentMethods(shop.data?.id);
  const categories = useCategories();
  const favorites = useFavorites(!!user);
  const toggle = useToggleFavorite();

  if (shop.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s)
    return (
      <CustomerScreen active="scan" subtitle={t('tabs.scan')}>
        <EmptyState icon="qr_code_2" title={t('shop.notFound')} action={t('common.close')} onAction={() => router.back()} />
      </CustomerScreen>
    );

  const isFav = !!favorites.data?.some((f) => f.id === s.id);
  const cat = categories.data?.find((c) => c.slug === s.category_slug);
  const dist = formatDistance(distanceBetween(loc.coords, s.lat, s.lng));
  const rails = [...new Set((methods.data ?? []).map((m) => PAYMENT_LABELS[m.type]))].slice(0, 2);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <CustomerScreen active="scan" subtitle={t('tabs.scan')} contentClassName="px-margin pb-space-xl">
      {/* Top dismiss bar */}
      <View className="flex-row items-center justify-between py-space-sm">
        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft">
          <Icon name="qr_code_scanner" fill className="text-primary text-[16px]" />
          <Text className="text-primary font-label-sm text-label-sm">QR Code Recognized</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={close} className="w-12 h-12 rounded-full bg-surface-container flex-row items-center justify-center active:opacity-80">
          <Icon name="close" className="text-on-surface text-[22px]" />
        </Pressable>
      </View>

      {/* Emblem & details */}
      <View className="flex-col items-center mt-2">
        <View className="relative w-[88px] h-[88px]">
          <View className="w-[88px] h-[88px] rounded-xl overflow-hidden shadow-md bg-surface-container-high items-center justify-center">
            {s.logo_url ? <Image source={{ uri: s.logo_url }} className="w-full h-full" contentFit="cover" /> : <Text className="font-display text-display text-primary">{s.name[0]}</Text>}
          </View>
          <View className="absolute -bottom-1 -right-1 bg-surface-card rounded-full p-0.5 shadow-sm">
            <Icon name="verified" fill className="text-primary text-[20px]" />
          </View>
        </View>
        <Text className="text-center font-headline-lg text-headline-lg text-on-surface mt-3 tracking-tight">{s.name}</Text>
        {s.tagline ? <Text className="text-center font-body-md text-body-md text-text-muted mt-1 max-w-[320px]">{s.tagline}</Text> : null}
        <View className="flex-row items-center justify-center flex-wrap gap-x-2 gap-y-1 mt-2.5">
          <View className="flex-row items-center gap-1 bg-warning-soft px-2.5 py-1 rounded-full">
            <Icon name="star" fill className="text-warning-amber text-[15px]" />
            <Text className="text-warning-amber font-price-display text-price-display">{s.rating_count ? Number(s.rating_avg).toFixed(1) : t('common.new')}</Text>
            {s.rating_count ? <Text className="text-text-muted font-caption text-caption">({s.rating_count})</Text> : null}
          </View>
          {cat ? (
            <>
              <Text className="text-text-muted text-[12px]">•</Text>
              <View className="bg-surface-container px-2.5 py-1 rounded-full">
                <Text className="font-label-sm text-label-sm text-on-surface-variant">{getLocale() === 'ur' ? cat.name_ur : cat.name_en}</Text>
              </View>
            </>
          ) : null}
          {dist ? (
            <>
              <Text className="text-text-muted text-[12px]">•</Text>
              <View className="flex-row items-center gap-1">
                <Icon name="near_me" className="text-text-muted text-[15px]" />
                <Text className="font-label-sm text-label-sm text-text-muted">{dist} away</Text>
              </View>
            </>
          ) : null}
        </View>
      </View>

      {/* Stacked actions */}
      <View className="flex-col gap-space-md mt-6">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/shop/${s.id}/pay`)}
          className="w-full bg-primary-container rounded-xl p-space-lg shadow-md active:bg-primary-pressed flex-row items-center justify-between gap-3"
        >
          <View className="flex-row items-center gap-3.5 min-w-0 flex-1">
            <View className="w-12 h-12 rounded-full bg-surface-card flex-row items-center justify-center shrink-0 shadow-sm">
              <Icon name="account_balance_wallet" fill className="text-primary-container text-[26px]" />
            </View>
            <View className="flex-col min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <Text numberOfLines={1} className="shrink font-headline-sm text-headline-sm text-on-primary">{t('pay.title', { shop: s.name })}</Text>
                <View className="px-2 py-0.5 rounded-full bg-primary">
                  <Text className="text-on-primary font-label-sm text-[11px] tracking-wide uppercase">Direct</Text>
                </View>
              </View>
              <Text numberOfLines={1} className="font-caption text-caption text-on-primary-container mt-0.5">
                {rails.length ? `Send money directly via ${[...new Set((methods.data ?? []).map((m) => PAYMENT_LABELS[m.type]))].join(', ')}` : t('pay.subtitle')}
              </Text>
            </View>
          </View>
          <View className="w-8 h-8 rounded-full bg-primary/40 flex-row items-center justify-center shrink-0">
            <Icon name="chevron_right" className="text-on-primary text-[20px]" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(`/shop/${s.id}`)}
          className="w-full bg-surface-card rounded-xl p-space-lg shadow-sm active:opacity-90 flex-row items-center justify-between gap-3"
        >
          <View className="flex-row items-center gap-3.5 min-w-0 flex-1">
            <View className="w-12 h-12 rounded-full bg-surface-container flex-row items-center justify-center shrink-0">
              <Icon name="storefront" className="text-primary text-[26px]" />
            </View>
            <View className="flex-col min-w-0 flex-1">
              <Text className="font-headline-sm text-headline-sm text-on-surface">Open Shop Profile</Text>
              <Text numberOfLines={1} className="font-caption text-caption text-text-muted mt-0.5">
                {[s.accepts_bookings && t('shop.book'), s.accepts_orders && t('shop.order'), t('shop.reviews')].filter(Boolean).join(' • ')}
              </Text>
            </View>
          </View>
          <View className="w-8 h-8 rounded-full bg-surface-container-low flex-row items-center justify-center shrink-0">
            <Icon name="chevron_right" className="text-text-muted text-[20px]" />
          </View>
        </Pressable>
      </View>

      {/* Saffron favorite action */}
      <View className="mt-4">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isFav, busy: toggle.isPending }}
          onPress={() => ensureAuth() && toggle.mutate({ shopId: s.id, favorite: !isFav })}
          className="w-full bg-secondary-container rounded-xl p-space-md shadow-sm active:opacity-90 flex-row items-center justify-between gap-3"
        >
          <View className="flex-row items-center gap-3 min-w-0 flex-1">
            <View className="w-10 h-10 rounded-full bg-surface-card/60 flex-row items-center justify-center shrink-0">
              <Icon name="favorite" fill={isFav} className="text-[22px] text-on-secondary-container" />
            </View>
            <View className="flex-col min-w-0 flex-1">
              <Text className="text-on-secondary-container font-headline-sm text-headline-sm">{isFav ? t('shop.following') : 'Favorite Shop'}</Text>
              <Text numberOfLines={1} className="font-caption text-caption text-on-secondary-container/85">Pins {s.name} to your home screen for quick access</Text>
            </View>
          </View>
          <Icon name="push_pin" fill={isFav} className="text-[20px] text-on-secondary-container/70" />
        </Pressable>
      </View>

      {/* Safety pill */}
      <View className="mt-6 flex-row items-center justify-center">
        <View className="flex-row items-center gap-2 px-3.5 py-2 rounded-full bg-success-soft max-w-full">
          <Icon name="gshield" fill className="text-success-green text-[18px]" />
          <Text numberOfLines={1} className="shrink text-success-green font-label-sm text-label-sm">
            Verified {t('common.appName')} Merchant{s.area ? ` • ${s.area}` : ''}
          </Text>
        </View>
      </View>

      {/* Payment rails strip */}
      <View className="mt-5 bg-surface-container-low rounded-xl p-3 flex-row items-center justify-around">
        {(rails.length ? rails : [PAYMENT_LABELS.raast]).map((r, i) => (
          <View key={r} className="flex-row items-center gap-3">
            {i > 0 ? <View className="w-1 h-3 rounded-full bg-border-hairline" /> : null}
            <View className="flex-row items-center gap-1.5 opacity-80">
              <Icon name={i === 0 ? 'bolt' : 'account_balance'} className={`text-[16px] ${i === 0 ? 'text-primary' : 'text-secondary'}`} />
              <Text className="font-label-sm text-label-sm text-on-surface">{r}</Text>
            </View>
          </View>
        ))}
        <View className="w-1 h-3 rounded-full bg-border-hairline" />
        <View className="flex-row items-center gap-1.5 opacity-80">
          <Icon name="verified_user" className="text-[16px] text-success-green" />
          <Text className="font-label-sm text-label-sm text-on-surface">0% Fee</Text>
        </View>
      </View>
    </CustomerScreen>
  );
}

