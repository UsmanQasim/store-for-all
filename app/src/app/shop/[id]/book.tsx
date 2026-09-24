import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Icon, Image, Text, TextInput } from '@/components/nw';
import { RequireAuth } from '@/components/RequireAuth';
import { CustomerScreen, SubHeader } from '@/components/shell';
import { EmptyState, LoadingState } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { DAY_KEYS, formatMoney, formatTime, isOpenNow, isoDateInTz } from '@/lib/format';
import { registerForPush } from '@/lib/notifications';
import { useBookingMutations, useSlots } from '@/services/bookings';
import { useCatalog } from '@/services/catalog';
import { useShop } from '@/services/shops';
import type { DayKey } from '@/types/models';

/** C04 — Book a seat. */
export default function Book() {
  const { id, service } = useLocalSearchParams<{ id: string; service?: string }>();
  const shop = useShop(id);
  const items = useCatalog(shop.data?.id);
  const tz = shop.data?.timezone ?? 'Asia/Karachi';
  const services = (items.data ?? []).filter((i) => i.kind === 'service' && i.is_available);
  const [serviceId, setServiceId] = useState<string | null>(service ?? null);
  const days = useMemo(() => {
    const n = Math.min(shop.data?.booking_days_ahead ?? 7, 14);
    return Array.from({ length: n + 1 }, (_, i) => {
      const d = new Date(Date.now() + i * 86_400_000);
      const wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d).toLowerCase().slice(0, 3) as DayKey;
      const dm = d.toLocaleDateString('en-GB', { day: 'numeric', timeZone: tz });
      const short = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', timeZone: tz });
      return {
        iso: isoDateInTz(d, tz),
        closed: DAY_KEYS.includes(wd) && !(shop.data?.opening_hours?.[wd]?.length ?? 0),
        label: i === 0 ? `${t('common.today')} (${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: tz })})` : i === 1 ? `${t('common.tomorrow')} (${short.replace(dm, '').trim()} ${dm})` : short,
        long: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz }),
      };
    });
  }, [shop.data?.booking_days_ahead, shop.data?.opening_hours, tz]);
  const [date, setDate] = useState<string | null>(null);
  const activeDay = days.find((d) => d.iso === date) ?? days.find((d) => !d.closed) ?? days[0];
  const slots = useSlots(shop.data?.id, activeDay?.iso ?? '', serviceId);
  const [slot, setSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const { create } = useBookingMutations();

  if (shop.isLoading || items.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s || !s.accepts_bookings)
    return (
      <CustomerScreen subtitle={t('tabs.explore')}>
        <EmptyState icon="event_busy" title={t('errors.bookingsDisabled')} />
      </CustomerScreen>
    );
  const selected = services.find((x) => x.id === serviceId);
  const openNow = isOpenNow(s.opening_hours, tz);

  const submit = async () => {
    if (!slot) return;
    try {
      const b = await create.mutateAsync({ shopId: s.id, serviceId, startsAt: slot, note });
      registerForPush().catch(() => undefined);
      Alert.alert(t('booking.success'), t('booking.successBody', { code: b.code }));
      router.replace(`/booking/${b.id}`);
    } catch (e) {
      Alert.alert(toAppError(e).message);
      slots.refetch();
      setSlot(null);
    }
  };

  return (
    <RequireAuth>
      <CustomerScreen subtitle={t('tabs.explore')} header={<SubHeader title={t('booking.title')} subtitle="Instant seat reservation" />}>
        {/* Shop summary */}
        <View className="px-margin mt-space-md">
          <View className="flex-row items-center gap-space-md p-space-md bg-surface-card rounded-xl shadow-sm">
            <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center overflow-hidden">
              {s.logo_url ? <Image source={{ uri: s.logo_url }} className="w-full h-full" /> : <Text className="font-headline-sm text-primary">{s.name[0]}</Text>}
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-space-xs">
                <Text numberOfLines={1} className="shrink font-headline-sm text-headline-sm text-on-surface">{s.name}</Text>
                <Icon name="verified" fill className="text-[18px] text-primary" />
              </View>
              {s.area || s.city ? (
                <View className="flex-row items-center gap-space-xs mt-0.5">
                  <Icon name="location_on" className="text-[15px] text-secondary" />
                  <Text numberOfLines={1} className="text-text-muted font-caption text-caption shrink">{[s.area, s.city].filter(Boolean).join(', ')}</Text>
                </View>
              ) : null}
            </View>
            <View className={`px-space-sm py-0.5 rounded-full ${openNow ? 'bg-success-soft' : 'bg-surface-alt'}`}>
              <Text className={`font-label-sm text-label-sm ${openNow ? 'text-success-green' : 'text-text-muted'}`}>{openNow ? 'OPEN' : t('common.closed').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View className="gap-space-xl px-margin mt-space-lg">
          {/* 1. Service */}
          {services.length ? (
            <View className="gap-space-sm">
              <View className="flex-row items-center justify-between">
                <Text className="font-headline-sm text-headline-sm text-on-surface">1. {t('booking.chooseService')}</Text>
                <Text className="font-label-sm text-label-sm text-primary font-bold">{selected ? '1 Selected' : t('common.optional')}</Text>
              </View>
              <View className="flex-row flex-wrap gap-space-sm">
                {services.map((x) => {
                  const on = serviceId === x.id;
                  return (
                    <Pressable
                      key={x.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      onPress={() => {
                        setServiceId(on ? null : x.id);
                        setSlot(null);
                      }}
                      className={`flex-row items-center gap-space-xs h-10 px-space-md rounded-full shadow-sm ${on ? 'bg-primary-container' : 'bg-surface-card'}`}
                    >
                      {on ? <Icon name="check_circle" fill className="text-on-primary text-[18px]" /> : null}
                      <Text className={on ? 'text-on-primary font-body-lg text-body-lg' : 'text-on-surface font-body-md text-body-md'}>
                        {x.name} · {formatMoney(x.price, s.currency)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* 2. Day */}
          <View className="gap-space-sm">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline-sm text-headline-sm text-on-surface">{services.length ? '2. ' : '1. '}{t('booking.chooseDate')}</Text>
              <Text className="font-caption text-caption text-text-muted">{activeDay?.long}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-margin" contentContainerClassName="gap-space-sm px-margin pb-1">
              {days.map((d) => {
                const on = activeDay?.iso === d.iso;
                if (d.closed)
                  return (
                    <View key={d.iso} className="flex-row items-center gap-1 h-10 px-space-md rounded-full bg-surface-container-high opacity-60">
                      <Text className="text-text-muted font-body-md text-body-md">{d.label}</Text>
                      <View className="bg-error-container/40 px-1.5 py-0.5 rounded-full">
                        <Text className="font-label-sm text-label-sm text-error">{t('common.closed')}</Text>
                      </View>
                    </View>
                  );
                return (
                  <Pressable
                    key={d.iso}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      setDate(d.iso);
                      setSlot(null);
                    }}
                    className={`h-10 px-space-md rounded-full shadow-sm justify-center ${on ? 'bg-primary-container' : 'bg-surface-card'}`}
                  >
                    <Text className={on ? 'text-on-primary font-body-lg text-body-lg' : 'text-on-surface font-body-md text-body-md'}>{d.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 3. Time */}
          <View className="gap-space-sm">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline-sm text-headline-sm text-on-surface">{services.length ? '3. ' : '2. '}Choose a time slot</Text>
              {s.booking_capacity > 1 ? <Text className="font-caption text-caption text-text-muted">Multi-chair shop</Text> : null}
            </View>
            {slots.isLoading ? (
              <LoadingState />
            ) : slots.data?.length ? (
              <View className="flex-row flex-wrap gap-space-sm">
                {slots.data.map((x) => {
                  const on = slot === x.slot_start;
                  return (
                    <Pressable
                      key={x.slot_start}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      onPress={() => setSlot(x.slot_start)}
                      style={{ width: '31.7%' }}
                      className={`min-h-[56px] p-space-xs items-center justify-center rounded-xl shadow-sm ${on ? 'bg-primary-container' : 'bg-surface-card'}`}
                    >
                      <Text className={`font-headline-sm text-headline-sm leading-tight ${on ? 'text-on-primary font-bold' : 'text-on-surface'}`}>{formatTime(x.slot_start, tz)}</Text>
                      {s.booking_capacity > 1 ? (
                        <Text className={`font-label-sm text-label-sm ${on ? 'text-on-primary-container' : x.remaining <= 1 ? 'text-warning-amber' : 'text-text-muted'}`}>
                          {t('booking.seatsLeft', { n: x.remaining })}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View className="bg-surface-card rounded-xl p-space-lg items-center gap-2 shadow-sm">
                <Icon name="event_busy" className="text-text-muted text-[28px]" />
                <Text className="font-body-md text-body-md text-text-muted text-center">{t('booking.noSlots')}</Text>
              </View>
            )}
          </View>

          {/* Note */}
          <View>
            <Text className="font-caption text-caption text-text-muted mb-1.5 font-medium">{t('booking.note')} ({t('common.optional').toLowerCase()})</Text>
            <View className="flex-row items-center bg-surface-card rounded-xl shadow-sm px-space-md min-h-[52px]">
              <Icon name="edit_note" className="text-[20px] text-text-muted mr-2" />
              <TextInput
                value={note}
                onChangeText={setNote}
                maxLength={300}
                placeholder={t('booking.notePlaceholder')}
                accessibilityLabel={t('booking.note')}
                className="flex-1 font-body-md text-body-md text-on-surface py-3"
              />
            </View>
          </View>

          {/* Price summary */}
          <View className="bg-primary-soft rounded-xl p-space-md shadow-sm flex-row items-start gap-space-md">
            <View className="w-8 h-8 rounded-full bg-primary-container items-center justify-center mt-0.5">
              <Icon name="payments" className="text-on-primary text-[18px]" />
            </View>
            <View className="flex-1 gap-1">
              {selected ? (
                <Text className="font-headline-sm text-headline-sm text-primary">
                  {selected.name} · <Text className="font-bold">{formatMoney(selected.price, s.currency)}</Text>
                </Text>
              ) : (
                <Text className="font-headline-sm text-headline-sm text-primary">{t('booking.anyService')}</Text>
              )}
              <Text className="font-caption text-caption text-on-surface-variant leading-relaxed">Pay at the shop in cash or directly using the shop&apos;s QR / wallet details.</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-space-xs py-1">
            <Icon name="verified_user" className="text-[18px] text-success-green" />
            <Text className="text-text-muted font-caption text-caption shrink">Zero booking fees · Free cancellation before your slot</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !slot, busy: create.isPending }}
            disabled={!slot || create.isPending}
            onPress={submit}
            className={`w-full min-h-[52px] px-3 bg-primary-container rounded-xl flex-row items-center justify-center gap-space-sm shadow-md active:bg-primary-pressed ${!slot ? 'opacity-50' : ''}`}
          >
            <Icon name="calendar_month" className="text-on-primary text-[20px]" />
            <Text numberOfLines={1} className="text-on-primary font-headline-sm text-headline-sm shrink">
              {slot ? `${t('booking.confirm')} · ${activeDay?.long} at ${formatTime(slot, tz)}` : 'Choose a time slot'}
            </Text>
          </Pressable>
        </View>
      </CustomerScreen>
    </RequireAuth>
  );
}
