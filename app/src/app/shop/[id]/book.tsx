import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Button, Chip, EmptyState, Input, LoadingState, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatMoney, formatTime, isoDateInTz } from '@/lib/format';
import { registerForPush } from '@/lib/notifications';
import { useBookingMutations, useSlots } from '@/services/bookings';
import { useCatalog } from '@/services/catalog';
import { useShop } from '@/services/shops';
import { useAppTheme } from '@/theme';

export default function Book() {
  const { id, service } = useLocalSearchParams<{ id: string; service?: string }>();
  const { colors, radius } = useAppTheme();
  const shop = useShop(id);
  const items = useCatalog(shop.data?.id);
  const tz = shop.data?.timezone ?? 'Asia/Karachi';
  const services = (items.data ?? []).filter((i) => i.kind === 'service' && i.is_available);
  const [serviceId, setServiceId] = useState<string | null>(service ?? null);
  const days = useMemo(() => {
    const n = Math.min(shop.data?.booking_days_ahead ?? 7, 14);
    return Array.from({ length: n + 1 }, (_, i) => {
      const d = new Date(Date.now() + i * 86_400_000);
      return { iso: isoDateInTz(d, tz), label: i === 0 ? t('common.today') : i === 1 ? t('common.tomorrow') : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', timeZone: tz }) };
    });
  }, [shop.data?.booking_days_ahead, tz]);
  const [date, setDate] = useState<string | null>(null);
  const activeDate = date ?? days[0]?.iso ?? '';
  const slots = useSlots(shop.data?.id, activeDate, serviceId);
  const [slot, setSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const { create } = useBookingMutations();

  if (shop.isLoading || items.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s || !s.accepts_bookings) return <EmptyState title={t('errors.bookingsDisabled')} />;
  const selectedService = services.find((x) => x.id === serviceId);

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
      <Stack.Screen options={{ title: t('booking.title') }} />
      <Screen
        footer={
          <Button
            title={slot ? `${t('booking.confirm')} · ${formatTime(slot, tz)}` : t('booking.chooseTime')}
            onPress={submit}
            disabled={!slot}
            loading={create.isPending}
            fullWidth
          />
        }
      >
        <Text variant="h2">{s.name}</Text>

        {services.length ? (
          <View style={{ gap: 10 }}>
            <Text variant="h3">{t('booking.chooseService')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {services.map((x) => (
                <Chip key={x.id} label={`${x.name} · ${formatMoney(x.price, s.currency)}`} selected={serviceId === x.id} onPress={() => { setServiceId(x.id); setSlot(null); }} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <Text variant="h3">{t('booking.chooseDate')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((d) => <Chip key={d.iso} label={d.label} selected={activeDate === d.iso} onPress={() => { setDate(d.iso); setSlot(null); }} />)}
          </ScrollView>
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="h3">{t('booking.chooseTime')}</Text>
          {slots.isLoading ? (
            <LoadingState />
          ) : slots.data?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {slots.data.map((x) => {
                const active = slot === x.slot_start;
                return (
                  <Pressable
                    key={x.slot_start}
                    onPress={() => setSlot(x.slot_start)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{ width: '31%', minHeight: 56, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.surface }}
                  >
                    <Text variant="bodyStrong" style={{ color: active ? colors.onPrimary : colors.text }}>{formatTime(x.slot_start, tz)}</Text>
                    {s.booking_capacity > 1 ? <Text variant="label" style={{ color: active ? colors.onPrimary : colors.textMuted }}>{t('booking.seatsLeft', { n: x.remaining })}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text color="textMuted">{t('booking.noSlots')}</Text>
          )}
        </View>

        <Input label={t('booking.note')} placeholder={t('booking.notePlaceholder')} value={note} onChangeText={setNote} maxLength={300} />
        {selectedService ? <Text variant="caption" color="textMuted">{selectedService.name} · {formatMoney(selectedService.price, s.currency)} · {t('cart.payNote')}</Text> : null}
      </Screen>
    </RequireAuth>
  );
}
