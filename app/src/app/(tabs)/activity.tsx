import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { Icon, Image, Text, type IconName } from '@/components/nw';
import { RequireAuth } from '@/components/RequireAuth';
import { CustomerScreen } from '@/components/shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { t } from '@/i18n';
import { formatDate, formatMoney, formatTime, timeAgo } from '@/lib/format';
import { open } from '@/lib/links';
import { useAuth } from '@/providers/AuthProvider';
import { useMyBookings } from '@/services/bookings';
import { useMyOrders } from '@/services/orders';
import type { Booking, Order } from '@/types/models';

type Tab = 'bookings' | 'orders';
const ACTIVE_B = ['pending', 'confirmed'];
const ACTIVE_O = ['placed', 'accepted', 'packing', 'ready', 'out_for_delivery'];
const PROGRESS: Record<string, number> = { placed: 0.2, accepted: 0.4, packing: 0.66, ready: 0.85, out_for_delivery: 0.92 };

/** C10 — Activity (bookings & orders). */
export default function Activity() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');
  const bookings = useMyBookings(user?.id);
  const orders = useMyOrders(user?.id);
  const nb = bookings.data?.length ?? 0;
  const no = orders.data?.length ?? 0;
  const q = tab === 'bookings' ? bookings : orders;

  return (
    <RequireAuth>
      <CustomerScreen
        active="activity"
        subtitle={t('tabs.activity')}
        contentClassName="px-margin pb-6 gap-space-lg"
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor="#0B6E4F" />}
      >
        <View className="gap-space-xs pt-space-xs">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('activity.title')}</Text>
            <View className="px-2.5 py-1 rounded-full bg-primary-soft flex-row items-center gap-1 shadow-sm">
              <View className="w-2 h-2 rounded-full bg-primary" />
              <Text className="text-primary font-label-sm text-label-sm">{nb + no} Records</Text>
            </View>
          </View>
          <Text className="font-caption text-caption text-text-muted">Keep track of your neighbourhood appointments and kiryana orders</Text>
        </View>

        {/* Segmented */}
        <View className="w-full bg-surface-alt p-1 rounded-xl flex-row items-center">
          <Seg icon="calendar_month" label={t('activity.bookings')} count={nb} on={tab === 'bookings'} onPress={() => setTab('bookings')} />
          <Seg icon="local_mall" label={t('activity.orders')} count={no} on={tab === 'orders'} onPress={() => setTab('orders')} />
        </View>

        <View className="gap-space-lg">
          {tab === 'bookings'
            ? nb
              ? bookings.data!.map((b) => <BookingCard key={b.id} b={b} />)
              : bookings.isLoading
                ? null
                : <EmptyState icon="calendar_month" title={t('activity.emptyBookings')} action={t('tabs.explore')} onAction={() => router.navigate('/(tabs)/explore')} />
            : no
              ? orders.data!.map((o) => <OrderCard key={o.id} o={o} />)
              : orders.isLoading
                ? null
                : <EmptyState icon="local_mall" title={t('activity.emptyOrders')} action={t('tabs.explore')} onAction={() => router.navigate('/(tabs)/explore')} />}
        </View>

        <View className="bg-surface-container-low rounded-xl p-space-lg flex-row items-start gap-space-md">
          <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
            <Icon name="handshake" className="text-primary text-[22px]" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-headline-sm text-headline-sm text-on-surface">Neighbourhood Assurance</Text>
            <Text className="font-caption text-caption text-text-muted">Direct pay & pickup at store counters. Cancel pending requests anytime without hidden penalties.</Text>
          </View>
        </View>
      </CustomerScreen>
    </RequireAuth>
  );
}

function Seg({ icon, label, count, on, onPress }: { icon: IconName; label: string; count: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={onPress} className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5 ${on ? 'bg-surface-card shadow-sm' : ''}`}>
      <Icon name={icon} className={`${on ? 'text-primary' : 'text-text-muted'} text-[18px]`} />
      <Text className={on ? 'font-headline-sm text-headline-sm text-primary' : 'font-body-lg text-body-lg text-text-muted'}>{label}</Text>
      <View className={`px-2 py-0.5 rounded-full ml-0.5 ${on ? 'bg-primary-soft' : 'bg-surface-container-high'}`}>
        <Text className={`${on ? 'text-primary' : 'text-text-muted'} font-label-sm text-label-sm`}>{count}</Text>
      </View>
    </Pressable>
  );
}

function CardHead({ logo, name, sub, badge }: { logo?: string | null; name?: string; sub: string; badge: ReactNode }) {
  return (
    <View className="flex-row items-start justify-between gap-space-sm">
      <View className="flex-row items-center gap-space-sm flex-1 min-w-0">
        <View className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high shadow-sm items-center justify-center">
          {logo ? <Image source={{ uri: logo }} className="w-full h-full" /> : <Icon name="storefront" className="text-text-muted text-[22px]" />}
        </View>
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-1.5">
            <Text numberOfLines={1} className="shrink font-headline-sm text-headline-sm text-on-surface">{name}</Text>
            <Icon name="verified" fill className="text-primary text-[17px]" />
          </View>
          <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{sub}</Text>
        </View>
      </View>
      {badge}
    </View>
  );
}

function Act({ icon, label, onPress, tone = 'muted', grow }: { icon: IconName; label: string; onPress: () => void; tone?: 'soft' | 'solid' | 'muted'; grow?: boolean }) {
  const c = { soft: ['bg-primary-soft', 'text-primary', 'font-headline-sm text-headline-sm text-primary'], solid: ['bg-primary', 'text-on-primary', 'font-headline-sm text-headline-sm text-on-primary'], muted: ['bg-surface-alt', 'text-text-muted', 'font-body-lg text-body-lg text-on-surface'] }[tone];
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className={`${grow ? 'flex-1' : ''} h-10 px-4 rounded-lg ${c[0]} flex-row items-center justify-center gap-1.5 active:opacity-80`}>
      <Icon name={icon} fill={icon === 'star'} className={`${icon === 'star' ? 'text-secondary-container' : c[1]} text-[18px]`} />
      <Text numberOfLines={1} className={c[2]}>{label}</Text>
    </Pressable>
  );
}

function BookingCard({ b }: { b: Booking }) {
  const tz = b.shop?.timezone;
  const active = ACTIVE_B.includes(b.status);
  const mins = Math.round((new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60000);
  const day = new Date(b.starts_at);
  const isTomorrow = new Date(Date.now() + 86400e3).toDateString() === day.toDateString();
  const isToday = new Date().toDateString() === day.toDateString();
  const when = `${isToday ? `${t('common.today')}, ` : isTomorrow ? `${t('common.tomorrow')}, ` : ''}${formatDate(b.starts_at, tz)} • ${formatTime(b.starts_at, tz)}`;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/booking/${b.id}`)} className={`bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md ${active ? '' : 'opacity-95'}`}>
      <CardHead logo={b.shop?.logo_url} name={b.shop?.name} sub={active ? b.service_name ?? t('booking.anyService') : `${b.service_name ?? t('booking.anyService')} • ${formatDate(b.starts_at, tz)}`} badge={<StatusBadge status={b.status} />} />
      {active ? (
        <View className="bg-surface-alt rounded-lg p-space-md gap-2">
          <View className="flex-row items-center gap-2">
            <Icon name="event" className="text-primary text-[20px]" />
            <Text numberOfLines={1} className="text-on-surface font-body-lg text-body-lg font-semibold shrink">{when}</Text>
          </View>
          <View className="flex-row items-center justify-between pt-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-caption text-caption text-text-muted">Booking Code:</Text>
              <View className="px-2 py-0.5 rounded bg-surface-card shadow-sm">
                <Text className="text-on-surface font-label-sm text-label-sm tracking-wide">{b.code}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="schedule" className="text-[16px] text-primary" />
              <Text className="font-caption text-caption text-text-muted">{mins} mins</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="bg-surface-alt rounded-lg px-space-md py-2.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Icon name="check_circle" className="text-text-muted text-[18px]" />
            <Text className="text-text-muted font-caption text-caption">{t(`status.${b.status}`)} · {b.code}</Text>
          </View>
          {b.price != null ? <Text className="font-price-display text-price-display text-primary">{formatMoney(b.price, b.shop?.currency)}</Text> : null}
        </View>
      )}
      <View className="flex-row items-center gap-space-sm pt-space-xs">
        {active ? (
          <>
            <Act icon="confirmation_number" label="View ticket" tone="soft" grow onPress={() => router.push(`/booking/${b.id}`)} />
            {b.shop?.phone ? <Act icon="call" label="Call shop" onPress={() => open.call(b.shop!.phone!)} /> : null}
          </>
        ) : (
          <>
            <Act icon="refresh" label="Book again" tone="solid" grow onPress={() => router.push(`/shop/${b.shop_id}/book`)} />
            <Act icon="star" label="Rate & Review" grow onPress={() => router.push(`/shop/${b.shop_id}/reviews`)} />
          </>
        )}
      </View>
    </Pressable>
  );
}

function OrderCard({ o }: { o: Order }) {
  const active = ACTIVE_O.includes(o.status);
  const n = o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const preview = (o.items ?? []).slice(0, 2).map((i) => i.name).join(', ') + ((o.items?.length ?? 0) > 2 ? ` + ${(o.items?.length ?? 0) - 2} more` : '');
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/order/${o.id}`)} className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
      <CardHead logo={o.shop?.logo_url} name={o.shop?.name} sub={`Order #${o.code} • ${formatMoney(o.subtotal, o.currency)} • ${n} items`} badge={<StatusBadge status={o.status} />} />
      {active ? (
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Icon name="inventory_2" className="text-info-blue text-[16px]" />
              <Text className="font-caption text-caption text-info-blue font-semibold">{t(`status.${o.status}`)}</Text>
            </View>
            <Text className="font-caption text-caption text-on-surface font-semibold">{timeAgo(o.updated_at)}</Text>
          </View>
          <View className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
            <View className="h-full bg-info-blue rounded-full" style={{ width: `${(PROGRESS[o.status] ?? 0) * 100}%` }} />
          </View>
        </View>
      ) : null}
      <View className="bg-surface-alt rounded-lg p-space-md gap-1.5">
        <View className="flex-row justify-between items-center gap-2">
          <Text numberOfLines={1} className="font-caption text-caption text-text-muted shrink">{preview}</Text>
          <Text className="font-price-display text-price-display text-primary">{formatMoney(o.subtotal, o.currency)}</Text>
        </View>
        <View className="flex-row items-center gap-2 pt-1">
          <View className="px-2 py-0.5 rounded bg-warning-soft">
            <Text className="text-warning-amber font-label-sm text-label-sm">Pay shop directly</Text>
          </View>
          <Text className="text-text-muted font-caption text-caption">• {o.fulfillment === 'delivery' ? 'Home Delivery' : 'Pickup at shop'}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-space-sm pt-space-xs">
        {active ? (
          <Act icon="navigation" label="Track order" grow onPress={() => router.push(`/order/${o.id}`)} />
        ) : (
          <Act icon="refresh" label="Order again" tone="solid" grow onPress={() => router.push(`/shop/${o.shop_id}`)} />
        )}
        {o.shop?.phone ? <Act icon="call" label="Call shop" onPress={() => open.call(o.shop!.phone!)} /> : null}
      </View>
    </Pressable>
  );
}
