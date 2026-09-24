/**
 * App chrome ported from the Stitch designs: top app bar, sub-header with back
 * arrow, customer bottom nav (raised Scan button) and business bottom nav.
 */
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View, type ScrollViewProps } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { t } from '@/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/services/social';
import { Icon, Image, SafeAreaView, Text, type IconName } from './nw';

/** Brand mark from designs/dukaan_brand_logo. */
export function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Rect width={96} height={96} rx={24} fill="#0B6E4F" />
      <Path d="M24 38L28 26H68L72 38V42C72 45.3137 69.3137 48 66 48C62.6863 48 60 45.3137 60 42C60 45.3137 57.3137 48 54 48C50.6863 48 48 45.3137 48 42C48 45.3137 45.3137 48 42 48C38.6863 48 36 45.3137 36 42C36 45.3137 33.3137 48 30 48C26.6863 48 24 45.3137 24 42V38Z" fill="#F5A000" />
      <Path d="M26 48V70C26 71.1046 26.8954 72 28 72H68C69.1046 72 70 71.1046 70 70V48" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      <Path d="M42 72V56C42 54.8954 42.8954 54 44 54H52C53.1046 54 54 54.8954 54 56V72" stroke="#FFFFFF" strokeWidth={3} />
      <Circle cx={62} cy={58} r={3} fill="#F5A000" />
    </Svg>
  );
}

function Bell() {
  const { user } = useAuth();
  const n = useNotifications(!!user);
  const unread = n.data?.some((x) => !x.read_at);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('activity.notifications')}
      onPress={() => router.push(user ? '/notifications' : '/sign-in')}
      className="w-12 h-12 flex-row items-center justify-center rounded-full active:bg-surface-container-high"
    >
      <Icon name="notifications" className="text-on-surface-variant text-[24px]" />
      {unread ? <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-danger-red" /> : null}
    </Pressable>
  );
}

function AvatarDot() {
  const { profile } = useAuth();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t('tabs.profile')} onPress={() => router.navigate('/(tabs)/profile')} className="w-12 h-12 items-center justify-center">
      {profile?.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} className="w-8 h-8 rounded-full" />
      ) : (
        <View className="w-8 h-8 rounded-full bg-primary flex-row items-center justify-center shadow-sm">
          <Icon name="person" className="text-on-primary text-[18px]" />
        </View>
      )}
    </Pressable>
  );
}

/** Customer top app bar: logo, "Dukaan" + section, bell, avatar. */
export function AppHeader({ subtitle }: { subtitle: string }) {
  return (
    <View className="bg-surface/90 z-50" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
      <View className="h-16 px-margin flex-row items-center justify-between">
        <View className="flex-row items-center gap-space-sm">
          <BrandLogo />
          <View className="flex-col">
            <Text className="font-headline-sm text-headline-sm text-primary tracking-tight">{t('common.appName')}</Text>
            <Text className="font-caption text-caption text-text-muted">{subtitle}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Bell />
          <AvatarDot />
        </View>
      </View>
    </View>
  );
}

/** Row under the app bar with a back arrow and a title (c04, c05, c06, c11, c12). */
export function SubHeader({ title, subtitle, right, onBack }: { title: string; subtitle?: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View className="flex-row items-center gap-space-sm px-margin py-space-sm bg-surface-container-lowest shadow-sm">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')))}
        className="w-12 h-12 flex-row items-center justify-center rounded-full active:bg-surface-container-high"
      >
        <Icon name="arrow_back" className="text-on-surface text-[24px]" />
      </Pressable>
      <View className="flex-col flex-1 min-w-0">
        <Text numberOfLines={1} className="font-headline-sm text-headline-sm text-on-surface">{title}</Text>
        {subtitle ? <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export type TabKey = 'home' | 'explore' | 'scan' | 'activity' | 'profile';
const TABS: { key: TabKey; icon: IconName; href: Href; label: string }[] = [
  { key: 'home', icon: 'storefront', href: '/(tabs)', label: 'tabs.home' },
  { key: 'explore', icon: 'explore', href: '/(tabs)/explore', label: 'tabs.explore' },
  { key: 'activity', icon: 'receipt_long', href: '/(tabs)/activity', label: 'tabs.activity' },
  { key: 'profile', icon: 'account_circle', href: '/(tabs)/profile', label: 'tabs.profile' },
];

/** Customer bottom nav with the raised emerald Scan button. */
export function CustomerNav({ active, onNavigate }: { active?: TabKey; onNavigate?: (key: TabKey) => void }) {
  const go = (key: TabKey, href: Href) => (onNavigate ? onNavigate(key) : router.navigate(href));
  const item = (tab: (typeof TABS)[number]) => {
    const on = tab.key === active;
    return (
      <Pressable
        key={tab.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        onPress={() => go(tab.key, tab.href)}
        className="flex-1 flex-col items-center justify-center min-h-[48px] py-1"
      >
        <Icon name={tab.icon} fill={on && tab.key !== 'home'} className={`${on ? 'text-primary' : 'text-text-muted'} text-[24px]`} />
        <Text className={`${on ? 'text-primary' : 'text-text-muted'} font-label-sm text-label-sm mt-0.5`}>{t(tab.label)}</Text>
      </Pressable>
    );
  };
  return (
    <SafeAreaView edges={['bottom']} className="bg-surface-card/95" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 8 }}>
      <View className="relative flex-row items-center justify-around h-16 px-space-xs">
        {item(TABS[0]!)}
        {item(TABS[1]!)}
        <View className="flex-1 flex-col items-center justify-center relative">
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={t('tabs.scan')}
            accessibilityState={{ selected: active === 'scan' }}
            onPress={() => go('scan', '/(tabs)/scan')}
            className="absolute -top-7 w-[52px] h-[52px] rounded-full bg-primary-container flex-row items-center justify-center border-4 border-surface-card active:bg-primary-pressed"
            style={{ width: 60, height: 60, top: -32, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
          >
            <Icon name="qr_code_scanner" className="text-on-primary text-[28px]" />
          </Pressable>
          <Text className={`font-label-sm text-label-sm mt-7 ${active === 'scan' ? 'text-primary' : 'text-text-muted'}`}>{t('tabs.scan')}</Text>
        </View>
        {item(TABS[2]!)}
        {item(TABS[3]!)}
      </View>
    </SafeAreaView>
  );
}

type Props = {
  active?: TabKey;
  subtitle: string;
  children: ReactNode;
  /** Sticky dock above the nav (e.g. "Place order"). */
  footer?: ReactNode;
  scroll?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
  contentClassName?: string;
  header?: ReactNode;
};

/** Customer screen frame: app bar · scrolling content · optional dock · bottom nav. */
export function CustomerScreen({ active, subtitle, children, footer, scroll = true, refreshControl, contentClassName, header }: Props) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <AppHeader subtitle={subtitle} />
      {header}
      {scroll ? (
        <ScrollView className="flex-1" contentContainerClassName={contentClassName ?? 'pb-6'} keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
      {footer ? (
        <View className="bg-surface-card/95 px-margin py-3" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 6 }}>
          {footer}
        </View>
      ) : null}
      <CustomerNav active={active} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------- Business
export type BizTab = 'dashboard' | 'bookings' | 'orders' | 'manage';

export function BusinessHeader({ shopName, section, onSwitch }: { shopName: string; section: string; onSwitch?: () => void }) {
  return (
    <View className="bg-surface/80 z-50" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
      <View className="h-16 px-margin flex-row items-center justify-between gap-space-sm">
        <View className="flex-row items-center gap-space-sm min-w-0 flex-1">
          <BrandLogo />
          <View className="flex-col min-w-0">
            <View className="flex-row items-center gap-1">
              <Text numberOfLines={1} className="font-headline-sm text-headline-sm text-primary tracking-tight">{t('common.appName')} Business</Text>
              <View className="bg-primary-soft px-1.5 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">PRO</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Pressable onPress={onSwitch} disabled={!onSwitch} className="flex-row items-center gap-1 bg-surface-alt px-2 py-0.5 rounded-full">
                <Text numberOfLines={1} className="font-caption text-caption text-on-surface max-w-[110px]">{shopName}</Text>
                {onSwitch ? <Icon name="arrow_drop_down" className="text-[16px] text-text-muted" /> : null}
              </Pressable>
              <Text className="font-caption text-caption text-text-muted">•</Text>
              <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{section}</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-space-xs">
          <Bell />
          <AvatarDot />
        </View>
      </View>
    </View>
  );
}

export function BusinessNav({ active, shopId }: { active?: BizTab; shopId?: string }) {
  const items: { key: BizTab; icon: IconName; label: string; href: Href | null }[] = [
    { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '/business' },
    { key: 'bookings', icon: 'calendar_today', label: t('activity.bookings'), href: shopId ? `/business/${shopId}/bookings` : null },
    { key: 'orders', icon: 'shopping_bag', label: t('activity.orders'), href: shopId ? `/business/${shopId}/orders` : null },
    { key: 'manage', icon: 'storefront', label: t('business.manage'), href: shopId ? `/business/${shopId}/edit` : null },
  ];
  return (
    <SafeAreaView edges={['bottom']} className="bg-surface/90" style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
      <View className="flex-row justify-around items-center h-16 px-space-sm">
        {items.map((i) => {
          const on = i.key === active;
          return (
            <Pressable
              key={i.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              disabled={!i.href}
              onPress={() => i.href && (i.key === 'dashboard' ? router.navigate(i.href) : router.replace(i.href))}
              className="flex-col items-center justify-center gap-0.5 min-w-[56px] h-12"
            >
              <Icon name={i.icon} className={`${on ? 'text-primary' : 'text-on-surface-variant'} text-[24px]`} />
              <Text className={`${on ? 'text-primary font-bold' : 'text-on-surface-variant'} font-label-sm text-label-sm`}>{i.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function BusinessScreen({
  active,
  shopId,
  shopName,
  section,
  onSwitch,
  children,
  footer,
  refreshControl,
  scroll = true,
}: {
  active?: BizTab;
  shopId?: string;
  shopName: string;
  section: string;
  onSwitch?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  refreshControl?: ScrollViewProps['refreshControl'];
  scroll?: boolean;
}) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <BusinessHeader shopName={shopName} section={section} onSwitch={onSwitch} />
      {scroll ? (
        <ScrollView className="flex-1" contentContainerClassName="px-margin pt-space-md pb-space-xl gap-space-lg" keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
      {footer ? (
        <View className="p-margin bg-surface/95" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 6 }}>
          {footer}
        </View>
      ) : null}
      <BusinessNav active={active} shopId={shopId} />
    </SafeAreaView>
  );
}
