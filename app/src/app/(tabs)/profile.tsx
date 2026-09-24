import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import { Icon, Image, Text, type IconName } from '@/components/nw';
import { CustomerScreen } from '@/components/shell';
import { getLocale, setLocale, t } from '@/i18n';
import { config, legalUrls } from '@/lib/config';
import { initials } from '@/lib/format';
import { open } from '@/lib/links';
import { useAuth } from '@/providers/AuthProvider';
import { useUserLocation } from '@/providers/LocationProvider';
import { useMyBookings } from '@/services/bookings';
import { useMyOrders } from '@/services/orders';
import { useMyShops } from '@/services/shops';
import { profileApi, useFavorites } from '@/services/social';

/** C14 — Profile & settings. */
export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const loc = useUserLocation();
  const myShops = useMyShops(user?.id);
  const favorites = useFavorites(!!user);
  const bookings = useMyBookings(user?.id);
  const orders = useMyOrders(user?.id);
  const done = [...(bookings.data ?? []), ...(orders.data ?? [])].filter((x) => x.status === 'completed').length;
  const total = (bookings.data?.length ?? 0) + (orders.data?.length ?? 0);
  const ownsShop = !!myShops.data?.length;

  const switchLanguage = () => {
    const next = getLocale() === 'en' ? 'ur' : 'en';
    const restart = setLocale(next);
    if (user) profileApi.update(user.id, { locale: next }).catch(() => undefined);
    Alert.alert(next === 'ur' ? 'اردو' : 'English', restart ? 'Please close and reopen the app to apply the layout direction.' : undefined);
  };

  return (
    <CustomerScreen active="profile" subtitle={t('tabs.profile')} contentClassName="px-margin pb-8 gap-space-xl">
      <View className="flex-row items-center justify-between pt-2 gap-2">
        <View className="flex-1">
          <Text className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('profile.title')}</Text>
          <Text className="font-caption text-caption text-text-muted mt-0.5">Manage your account and neighbourhood activity</Text>
        </View>
        {user ? (
          <View className="flex-row items-center gap-1.5 px-3 py-1 bg-success-soft rounded-full shadow-sm">
            <Icon name="verified" fill className="text-success-green text-[16px]" />
            <Text className="text-success-green font-label-sm text-label-sm uppercase tracking-wider">Verified Email</Text>
          </View>
        ) : null}
      </View>

      {/* User card */}
      <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
        <View className="flex-row items-center gap-space-md">
          <View className="relative w-[60px] h-[60px] rounded-full p-0.5 bg-primary-soft">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-full h-full rounded-full bg-primary-soft items-center justify-center">
                <Text className="font-headline-md text-headline-md text-primary">{initials(profile?.full_name ?? user?.email ?? '?')}</Text>
              </View>
            )}
            {user ? (
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-success-green rounded-full items-center justify-center">
                <Icon name="check" className="text-on-primary text-[10px]" />
              </View>
            ) : null}
          </View>
          <View className="flex-1 min-w-0">
            <Text numberOfLines={1} className="font-headline-md text-headline-md text-on-surface">{profile?.full_name ?? t('profile.guest')}</Text>
            <Text numberOfLines={1} className="font-caption text-caption text-text-muted mt-0.5">{user ? [profile?.phone, user.email].filter(Boolean).join(' • ') : t('profile.guestBody')}</Text>
            {loc.label ? (
              <View className="flex-row items-center gap-1 mt-1">
                <Icon name="location_on" className="text-primary text-[16px]" />
                <Text numberOfLines={1} className="font-caption text-caption text-on-surface-variant font-medium shrink">{loc.label}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View className="flex-row items-center justify-between pt-space-xs">
          {user ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/settings/edit-profile')} className="h-10 px-4 rounded-full bg-surface-alt flex-row items-center gap-1.5 active:opacity-80">
              <Icon name="edit" className="text-[18px] text-text-muted" />
              <Text className="text-on-surface font-label-sm text-label-sm">{t('profile.editProfile')}</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.push('/sign-in')} className="h-10 px-4 rounded-full bg-primary-container flex-row items-center gap-1.5">
              <Icon name="person" className="text-[18px] text-on-primary" />
              <Text className="text-on-primary font-label-sm text-label-sm">{t('common.signIn')}</Text>
            </Pressable>
          )}
          {user ? (
            <View>
              <Text className="text-right font-label-sm text-label-sm text-text-muted">Your shops</Text>
              <Text className="text-right font-headline-sm text-headline-sm text-primary">{favorites.data?.length ?? 0} ♥</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Merchant spotlight */}
      <View className="bg-warning-soft rounded-xl p-space-lg shadow-sm overflow-hidden">
        <View className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary-soft" />
        <View className="flex-row items-start justify-between">
          <View className="px-2.5 py-1 rounded-full bg-secondary">
            <Text className="text-on-secondary font-label-sm text-label-sm uppercase tracking-wide">{ownsShop ? t('profile.myBusiness') : 'Merchant Spotlight'}</Text>
          </View>
          <Icon name="store" className="text-secondary text-[26px]" />
        </View>
        <View className="mt-space-md">
          <Text className="font-headline-sm text-headline-sm text-on-surface font-bold">{ownsShop ? myShops.data!.map((s) => s.name).join(', ') : 'Own a local shop or service?'}</Text>
          <Text className="font-body-md text-body-md text-on-surface-variant mt-1">
            {ownsShop
              ? 'Manage bookings, orders, payment details and your counter QR poster.'
              : `List your salon, kiryana, bakery or clinic on ${config.brand.name}. Get orders, bookings & a free counter QR code with 0% commission.`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(!user ? '/sign-in' : ownsShop ? '/business' : '/business/create')}
          className="mt-space-lg w-full h-[52px] rounded-xl bg-secondary-container flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
        >
          <Icon name="storefront" className="text-on-surface text-[22px]" />
          <Text className="text-on-surface font-headline-sm text-headline-sm">{ownsShop ? 'Open Business Dashboard' : 'Register Your Shop (Free) 🚀'}</Text>
        </Pressable>
      </View>

      {user ? (
        <Group title="My Neighbourhood">
          <Row icon="favorite" fill tone="danger" title="Favorite Shops" sub={`${favorites.data?.length ?? 0} pinned stores`} onPress={() => router.navigate('/(tabs)')} />
          <Row icon="schedule" tone="primary" title="Past Bookings & Orders" sub={`${done} completed · ${total} total`} onPress={() => router.navigate('/(tabs)/activity')} />
          <Row icon="local_offer" tone="warning" title="Offers & Notifications" sub="Deals from shops you favorite" onPress={() => router.push('/notifications')} last />
        </Group>
      ) : null}

      <Group title="Preferences & Settings">
        <Row
          icon="language"
          tone="info"
          title={t('profile.language')}
          sub={getLocale() === 'ur' ? 'اردو (English available)' : 'English (Urdu available)'}
          right={
            <View className="flex-row items-center gap-1">
              <Text className="font-label-sm text-label-sm text-primary font-semibold">EN / اردو</Text>
              <Icon name="chevron_right" className="text-outline-variant text-[22px]" />
            </View>
          }
          onPress={switchLanguage}
        />
        {user && profile ? (
          <Row
            icon="notifications_active"
            tone="neutral"
            title="Shop Offers & Alerts"
            sub="Offers from shops you favorite"
            right={
              <Switch
                value={profile.shop_updates_opt_in}
                onValueChange={async (v) => {
                  await profileApi.update(user.id, { shop_updates_opt_in: v });
                  refreshProfile();
                }}
                trackColor={{ true: '#00543b', false: '#E6E1D9' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Shop Offers & Alerts"
              />
            }
          />
        ) : null}
        <Row icon="pin_drop" tone="primary" title="My Location" sub={loc.label ?? t('home.locationUnknown')} onPress={() => loc.refresh(true)} last />
      </Group>

      <Group title="Support & Trust">
        <Row icon="verified_user" tone="success" title={`${config.brand.name} Buyer Protection`} sub="Community guidelines, reporting & safety" onPress={() => open.url(legalUrls.guidelines)} />
        <Row icon="chat" tone="success" title={t('profile.help')} sub={config.brand.supportEmail} onPress={() => open.url(`mailto:${config.brand.supportEmail}`)} />
        <Row icon="description" tone="neutral" title="Terms of Service & Privacy" sub="Consumer standards & data privacy" onPress={() => open.url(legalUrls.privacy)} last />
      </Group>

      {user ? (
        <View className="bg-surface-card rounded-xl overflow-hidden shadow-sm">
          <Row icon="logout" tone="neutral" title={t('profile.signOut')} onPress={() => signOut()} />
          <Row icon="delete_forever" tone="danger" title={t('profile.deleteAccount')} sub="Permanently erase history & data" danger onPress={() => router.push('/settings/delete-account')} last />
        </View>
      ) : null}

      <View className="pt-2 pb-6 items-center gap-1.5">
        <Text className="text-center font-caption text-caption text-text-muted font-medium">
          {config.brand.name} App v{Constants.expoConfig?.version ?? '1.0.0'} • Made with ❤️ for local neighbourhood commerce
        </Text>
        {loc.label ? <Text className="text-center font-caption text-caption text-outline">{loc.label}</Text> : null}
      </View>
    </CustomerScreen>
  );
}

const TONE = {
  danger: ['bg-danger-soft', 'text-danger-red'],
  primary: ['bg-primary-soft', 'text-primary'],
  warning: ['bg-warning-soft', 'text-secondary'],
  info: ['bg-info-soft', 'text-info-blue'],
  success: ['bg-success-soft', 'text-success-green'],
  neutral: ['bg-surface-alt', 'text-on-surface-variant'],
} as const;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">{title}</Text>
      <View className="bg-surface-card rounded-xl overflow-hidden shadow-sm">{children}</View>
    </View>
  );
}

function Row({ icon, fill, tone, title, sub, right, onPress, last, danger }: { icon: IconName; fill?: boolean; tone: keyof typeof TONE; title: string; sub?: string; right?: ReactNode; onPress?: () => void; last?: boolean; danger?: boolean }) {
  return (
    <>
      <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} className="flex-row items-center justify-between p-space-lg min-h-[56px] active:bg-surface-alt gap-2">
        <View className="flex-row items-center gap-3 min-w-0 flex-1">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${TONE[tone][0]}`}>
            <Icon name={icon} fill={fill} className={`${TONE[tone][1]} text-[20px]`} />
          </View>
          <View className="flex-1 min-w-0">
            <Text numberOfLines={1} className={`font-body-lg text-body-lg ${danger ? 'text-danger-red font-semibold' : 'text-on-surface'}`}>{title}</Text>
            {sub ? <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{sub}</Text> : null}
          </View>
        </View>
        {right ?? (onPress ? <Icon name="chevron_right" className={`${danger ? 'text-danger-red' : 'text-outline-variant'} text-[22px]`} /> : null)}
      </Pressable>
      {!last ? <View className="h-[1px] bg-surface-alt mx-space-lg" /> : null}
    </>
  );
}
