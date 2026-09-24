import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';
import { BusinessScreen } from '@/components/shell';
import { Avatar, Icon, LoadingState, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatMoney, isoDateInTz, timeAgo } from '@/lib/format';
import { open } from '@/lib/links';
import { useBookingMutations, useCustomerVisits, useShopBookings } from '@/services/bookings';
import { useShop } from '@/services/shops';
import type { Booking, BookingStatus } from '@/types/models';

type Filter = 'pending' | 'confirmed' | 'past';

const timeParts = (iso: string, timeZone?: string) => {
  const s = new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone });
  const [hm, ap] = s.split(' ');
  return { hm: hm ?? s, ap: ap ?? '' };
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dayLabel = (iso: string, timeZone = 'Asia/Karachi') => {
  const d = isoDateInTz(new Date(iso), timeZone);
  const today = isoDateInTz(new Date(), timeZone);
  const tomorrow = isoDateInTz(new Date(Date.now() + 864e5), timeZone);
  const [, m, day] = d.split('-').map(Number);
  const short = `${day} ${MONTHS[m! - 1]}`;
  if (d === today) return `Today, ${short}`;
  if (d === tomorrow) return 'Tomorrow';
  return `${new Date(iso).toLocaleDateString('en-US', { weekday: 'short', timeZone })}, ${short}`;
};

const minutes = (b: Booking) => Math.round((new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60000);

/** B08 — Booking queue. */
export default function BookingQueue() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const q = useShopBookings(shopId);
  const { setStatus } = useBookingMutations();
  const [filter, setFilter] = useState<Filter>('pending');
  const [toast, setToast] = useState<string | null>(null);
  const [bulk, setBulk] = useState(false);
  const tz = shop.data?.timezone;
  const currency = shop.data?.currency;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const all = q.data ?? [];
  const byStart = (a: Booking, b: Booking) => a.starts_at.localeCompare(b.starts_at);
  const pending = useMemo(() => all.filter((b) => b.status === 'pending').sort(byStart), [all]);
  const confirmed = useMemo(() => all.filter((b) => b.status === 'confirmed').sort(byStart), [all]);
  const past = useMemo(() => all.filter((b) => !['pending', 'confirmed'].includes(b.status)).sort((a, b) => byStart(b, a)), [all]);
  const list = filter === 'pending' ? pending : filter === 'confirmed' ? confirmed : past;
  const visits = useCustomerVisits(shopId).data;
  const estRevenue = pending.reduce((s, b) => s + (b.price ?? 0), 0);

  const act = async (b: Booking, status: BookingStatus) => {
    try {
      await setStatus.mutateAsync({ id: b.id, status });
      setToast(status === 'confirmed' ? 'Appointment confirmed!' : status === 'rejected' ? 'Request declined' : status === 'completed' ? 'Marked as done' : 'Marked as no-show');
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  const acceptAll = async () => {
    setBulk(true);
    try {
      for (const b of pending) await setStatus.mutateAsync({ id: b.id, status: 'confirmed' });
      setToast(`${pending.length} appointments confirmed!`);
    } catch (e) {
      Alert.alert(toAppError(e).message);
    } finally {
      setBulk(false);
    }
  };

  if (shop.isLoading) return <LoadingState />;

  const seg = (key: Filter, label: string, count?: number) => {
    const on = filter === key;
    return (
      <Pressable
        key={key}
        onPress={() => setFilter(key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        className={`flex-1 py-2 px-3 rounded-lg flex-row items-center justify-center gap-1.5 ${on ? 'bg-primary shadow-sm' : ''}`}
      >
        <Text className={`font-body-lg text-body-lg ${on ? 'text-on-primary' : 'text-text-muted'}`}>{label}</Text>
        {count != null ? (
          <View className={`px-1.5 rounded-full ${on ? 'bg-primary-soft' : 'bg-surface-variant'}`}>
            <Text className={`font-label-sm text-label-sm font-bold ${on ? 'text-primary' : 'text-on-surface-variant'}`}>{count}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <BusinessScreen
      active="bookings"
      shopId={shopId}
      shopName={shop.data?.name ?? ''}
      section={t('business.bookings')}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor="#00543b" />}
      footer={
        filter === 'pending' && pending.length > 0 ? (
          <View className="p-3.5 rounded-xl bg-inverse-surface flex-row items-center justify-between shadow-xl">
            <View className="flex-row items-center gap-2.5">
              <View className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
              <View>
                <Text className="font-caption text-caption text-surface-dim uppercase tracking-wider font-semibold">{pending.length} Pending</Text>
                <Text className="font-headline-sm text-headline-sm text-surface-bright font-bold">Est. Rev: {formatMoney(estRevenue, currency)}</Text>
              </View>
            </View>
            <Pressable
              onPress={acceptAll}
              disabled={bulk}
              accessibilityRole="button"
              className={`px-3.5 py-2 rounded-lg bg-secondary-container flex-row items-center gap-1 ${bulk ? 'opacity-60' : ''}`}
            >
              <Icon name="done_all" className="text-on-secondary-fixed text-[18px]" />
              <Text className="font-body-md text-body-md text-on-secondary-fixed font-bold">{bulk ? 'Accepting…' : 'Accept All'}</Text>
            </Pressable>
          </View>
        ) : undefined
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Icon name="store" className="text-[16px] text-primary" />
            <Text numberOfLines={1} className="text-text-muted font-caption text-caption uppercase tracking-wider font-semibold">{shop.data?.name}</Text>
          </View>
          <Text className="font-headline-lg text-headline-lg text-on-surface">Booking Queue</Text>
        </View>
        <Pressable
          onPress={() => q.refetch()}
          accessibilityRole="button"
          accessibilityLabel="Refresh"
          className="w-11 h-11 items-center justify-center rounded-xl bg-surface-container"
        >
          <Icon name="sync" className="text-on-surface text-[22px]" />
        </Pressable>
      </View>

      {pending.length > 0 ? (
        <View className="flex-row items-center gap-3 p-3.5 rounded-xl bg-warning-soft shadow-sm">
          <View className="w-9 h-9 rounded-full bg-secondary-container/20 items-center justify-center">
            <Icon name="notifications_active" fill className="text-[20px] text-warning-amber" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-body-lg text-body-lg text-on-surface font-semibold">
              {pending.length} new {pending.length === 1 ? 'request' : 'requests'} waiting
            </Text>
            <Text numberOfLines={1} className="font-caption text-caption text-on-surface-variant">Respond quickly to keep your shop rating high</Text>
          </View>
          <View className="bg-secondary-container px-2 py-0.5 rounded-full">
            <Text className="font-label-sm text-label-sm text-on-secondary-fixed font-bold">Live</Text>
          </View>
        </View>
      ) : null}

      <View className="p-1 rounded-xl bg-surface-container flex-row items-center gap-1" accessibilityRole="tablist">
        {seg('pending', t('status.pending'), pending.length)}
        {seg('confirmed', t('status.confirmed'), confirmed.length)}
        {seg('past', t('activity.past'))}
      </View>

      {toast ? (
        <View className="flex-row items-center gap-2 px-4 py-3 rounded-xl bg-inverse-surface shadow-xl" accessibilityLiveRegion="polite">
          <Icon name="check_circle" className="text-[20px] text-success-green" />
          <Text className="flex-1 text-inverse-on-surface font-body-md text-body-md">{toast}</Text>
        </View>
      ) : null}

      {q.isLoading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <View className="items-center justify-center p-8 rounded-xl bg-surface-card shadow-sm gap-3">
          <View className="w-16 h-16 rounded-full bg-success-soft items-center justify-center">
            <Icon name="task_alt" fill className="text-success-green text-[36px]" />
          </View>
          <Text className="text-center font-headline-sm text-headline-sm text-on-surface">{filter === 'pending' ? 'Queue Cleared!' : 'Nothing here yet'}</Text>
          <Text className="text-center font-body-md text-body-md text-text-muted">
            {filter === 'pending' ? 'All new booking requests have been handled.' : filter === 'confirmed' ? 'Confirmed appointments will show here.' : 'Completed and cancelled bookings will show here.'}
          </Text>
        </View>
      ) : (
        <View className="gap-space-md">
          {list.map((b, i) => {
            const { hm, ap } = timeParts(b.starts_at, tz);
            const n = visits?.get(b.customer_id) ?? 0;
            const tag =
              filter === 'pending' && i === 0
                ? { label: 'Next in line', cls: 'bg-primary-soft', txt: 'text-primary' }
                : n === 0
                  ? { label: 'New client', cls: 'bg-accent-soft', txt: 'text-warning-amber' }
                  : { label: 'Returning', cls: 'bg-surface-container-high', txt: 'text-on-surface-variant' };
            const mins = minutes(b);
            return (
              <View key={b.id} className="rounded-xl bg-surface-card p-space-lg shadow-sm">
                <View className="flex-row items-start justify-between gap-2 pb-3">
                  <View className="flex-row items-center gap-2 flex-1 flex-wrap">
                    {filter === 'past' ? (
                      <StatusBadge status={b.status} />
                    ) : (
                      <View className={`px-2.5 py-0.5 rounded-full ${tag.cls}`}>
                        <Text className={`font-label-sm text-label-sm font-bold tracking-wide uppercase ${tag.txt}`}>{tag.label}</Text>
                      </View>
                    )}
                    <View className="px-2 py-0.5 rounded-md bg-surface-container">
                      <Text className="font-label-sm text-label-sm text-text-muted">{b.code}</Text>
                    </View>
                  </View>
                  <Text className="font-caption text-caption text-text-muted font-medium">Requested {timeAgo(b.created_at)}</Text>
                </View>

                <View className="flex-row gap-3 items-start">
                  <View className="w-[31%] p-2.5 rounded-xl bg-surface-container-low items-center justify-center">
                    <Text className="text-center font-headline-md text-headline-md text-primary font-extrabold tracking-tight">{hm}</Text>
                    <Text className="text-center font-label-sm text-label-sm text-primary font-bold -mt-0.5">{ap}</Text>
                    <Text className="text-center font-caption text-caption text-text-muted mt-1">{dayLabel(b.starts_at, tz)}</Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2.5">
                      <Avatar uri={b.customer?.avatar_url} name={b.customer?.full_name} size={40} />
                      <View className="flex-1 min-w-0">
                        <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface font-bold">{b.customer?.full_name ?? 'Customer'}</Text>
                        {n > 0 ? (
                          <View className="flex-row items-center gap-1">
                            <Icon name="verified" fill className="text-[14px] text-success-green" />
                            <Text numberOfLines={1} className="font-caption text-caption text-success-green font-medium">
                              Regular ({n} {n === 1 ? 'visit' : 'visits'})
                            </Text>
                          </View>
                        ) : (
                          <Text numberOfLines={1} className="font-caption text-caption text-warning-amber font-semibold">New customer</Text>
                        )}
                      </View>
                    </View>
                    <View className="pt-1">
                      <Text numberOfLines={1} className="font-body-md text-body-md text-on-surface font-semibold">{b.service_name ?? t('booking.anyService')}</Text>
                      <View className="flex-row items-center gap-2 pt-0.5">
                        <View className="flex-row items-center gap-0.5">
                          <Icon name="schedule" className="text-text-muted text-[14px]" />
                          <Text className="text-text-muted font-caption text-caption">{mins} mins</Text>
                        </View>
                        {b.price != null ? (
                          <>
                            <Text className="text-text-muted font-caption text-caption">•</Text>
                            <Text className="font-price-display text-price-display text-primary font-bold">{formatMoney(b.price, currency)}</Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>

                {b.customer_note ? (
                  <View className="mt-3 p-2.5 rounded-lg bg-surface-alt flex-row items-start gap-2">
                    <Icon name="format_quote" className="text-[16px] text-warning-amber mt-0.5" />
                    <Text className="flex-1 font-caption text-caption text-on-surface-variant italic">“{b.customer_note}”</Text>
                  </View>
                ) : null}

                {b.status === 'pending' || b.status === 'confirmed' ? (
                  <View className="mt-3.5 pt-3 flex-row gap-2">
                    <Pressable
                      onPress={() => act(b, b.status === 'pending' ? 'confirmed' : 'completed')}
                      disabled={setStatus.isPending || bulk}
                      accessibilityRole="button"
                      className="flex-[5] h-12 px-2 rounded-xl bg-primary flex-row items-center justify-center gap-1 shadow-sm active:opacity-80"
                    >
                      <Icon name={b.status === 'pending' ? 'check' : 'done_all'} className="text-on-primary text-[18px]" />
                      <Text className="text-on-primary font-body-lg text-body-lg font-semibold">{b.status === 'pending' ? t('business.confirm') : 'Done'}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => act(b, b.status === 'pending' ? 'rejected' : 'no_show')}
                      disabled={setStatus.isPending || bulk}
                      accessibilityRole="button"
                      className="flex-[4] h-12 px-2 rounded-xl bg-danger-soft flex-row items-center justify-center gap-1 active:opacity-80"
                    >
                      <Icon name={b.status === 'pending' ? 'close' : 'person_off'} className="text-danger-red text-[18px]" />
                      <Text className="text-danger-red font-body-lg text-body-lg font-semibold">{b.status === 'pending' ? 'Decline' : t('business.noShow')}</Text>
                    </Pressable>
                    {b.customer?.phone ? (
                      <Pressable
                        onPress={() => open.call(b.customer!.phone!)}
                        accessibilityRole="button"
                        accessibilityLabel={`${t('common.call')} ${b.customer.full_name ?? ''}`}
                        className="flex-[3] h-12 rounded-xl bg-surface-container flex-row items-center justify-center gap-1"
                      >
                        <Icon name="call" className="text-[20px] text-primary" />
                        <Text className="text-on-surface font-caption text-caption font-semibold">{t('common.call')}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </BusinessScreen>
  );
}
