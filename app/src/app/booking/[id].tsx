import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, Share, View } from 'react-native';
import { Icon, Image, Text } from '@/components/nw';
import { CustomerScreen } from '@/components/shell';
import { LoadingState } from '@/components/ui';
import { t } from '@/i18n';
import { categoryIcon } from '@/lib/categories';
import { toAppError } from '@/lib/errors';
import { distanceBetween, formatDistance, formatMoney, formatTime } from '@/lib/format';
import { open } from '@/lib/links';
import { useUserLocation } from '@/providers/LocationProvider';
import { useBooking, useBookingMutations } from '@/services/bookings';
import type { BookingStatus } from '@/types/models';

const HEAD: Record<BookingStatus, [string, string, string]> = {
  pending: ['bg-warning-soft', 'text-warning-amber', 'Awaiting shop confirmation'],
  confirmed: ['bg-success-soft', 'text-success-green', 'Confirmed booking'],
  completed: ['bg-success-soft', 'text-success-green', 'Completed'],
  cancelled: ['bg-surface-alt', 'text-text-muted', 'Cancelled'],
  rejected: ['bg-danger-soft', 'text-danger-red', 'Declined by shop'],
  no_show: ['bg-danger-soft', 'text-danger-red', 'Marked no-show'],
};

/** C11 — Booking detail / ticket. */
export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loc = useUserLocation();
  const q = useBooking(id);
  const { cancel } = useBookingMutations();
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  if (q.isLoading || !q.data) return <LoadingState />;
  const b = q.data;
  const s = b.shop;
  const tz = s?.timezone;
  const canCancel = (b.status === 'pending' || b.status === 'confirmed') && new Date(b.starts_at) > new Date();
  const mins = Math.round((new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60000);
  const d = new Date(b.starts_at);
  const rel = new Date().toDateString() === d.toDateString() ? `${t('common.today')}, ` : new Date(Date.now() + 86400e3).toDateString() === d.toDateString() ? `${t('common.tomorrow')}, ` : '';
  const longDate = rel + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: tz });
  const dist = formatDistance(distanceBetween(loc.coords, s?.lat, s?.lng));
  const head = HEAD[b.status];
  const addr = [s?.address, s?.area, s?.city].filter(Boolean).join(', ');

  const copy = async () => {
    await Clipboard.setStringAsync(b.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <CustomerScreen subtitle={t('tabs.activity')} contentClassName="pb-space-xl">
      {/* Top bar */}
      <View className="px-margin py-space-sm flex-row items-center justify-between">
        <View className="flex-row items-center gap-space-sm">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/activity'))} className="w-12 h-12 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high">
            <Icon name="arrow_back" className="text-on-surface text-[24px]" />
          </Pressable>
          <Text className="font-headline-sm text-headline-sm text-on-surface">Booking Details</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.share')}
          onPress={() => Share.share({ message: `${s?.name} · ${b.service_name ?? ''} · ${longDate} ${formatTime(b.starts_at, tz)} · ${b.code}` })}
          className="w-12 h-12 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
        >
          <Icon name="share" className="text-on-surface text-[22px]" />
        </Pressable>
      </View>

      <View className="px-margin gap-space-xl">
        {/* Ticket */}
        <View className="bg-surface-card rounded-[24px] shadow-md overflow-hidden">
          <View className="bg-primary-soft/40 p-space-lg items-center">
            <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full shadow-sm ${head[0]}`}>
              <Icon name="check_circle" fill className={`${head[1]} text-[15px]`} />
              <Text className={`${head[1]} font-label-sm text-label-sm uppercase tracking-wider`}>{head[2]}</Text>
            </View>
            <View className="mt-3 items-center">
              <Text className="font-display text-display text-primary tracking-tight">{formatTime(b.starts_at, tz)}</Text>
              <Text className="text-center font-headline-sm text-headline-sm text-on-surface mt-0.5">{longDate}</Text>
            </View>
            <View className="mt-4 w-full bg-surface-alt rounded-xl p-space-md items-center">
              <Text className="font-caption text-caption text-text-muted">BOOKING CODE</Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <Text selectable className="font-headline-md text-headline-md tracking-[0.2em] text-primary font-bold">{b.code}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={t('common.copy')} onPress={copy} className="w-8 h-8 rounded-full bg-surface-card items-center justify-center shadow-sm">
                  <Icon name={copied ? 'check' : 'content_copy'} className="text-primary text-[16px]" />
                </Pressable>
              </View>
              <Text className="font-caption text-caption text-text-muted mt-1 text-center">Show this code or tell your name at the counter</Text>
            </View>
          </View>

          {/* Notches */}
          <View className="flex-row items-center">
            <View className="w-5 h-8 bg-surface rounded-r-full" />
            <View className="flex-1 mx-2 h-px bg-surface-variant" />
            <View className="w-5 h-8 bg-surface rounded-l-full" />
          </View>

          <View className="p-space-lg gap-space-lg">
            <View className="flex-row items-start gap-space-sm">
              <View className="w-12 h-12 rounded-full overflow-hidden bg-surface-container shadow-sm items-center justify-center">
                {s?.logo_url ? <Image source={{ uri: s.logo_url }} className="w-full h-full" /> : <Icon name="storefront" className="text-text-muted text-[22px]" />}
              </View>
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center gap-1">
                  <Text numberOfLines={1} className="shrink font-headline-sm text-headline-sm text-on-surface">{s?.name}</Text>
                  <Icon name="verified" fill className="text-primary text-[18px]" />
                </View>
                {addr ? <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{addr}</Text> : null}
                <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${b.shop_id}`)} className="flex-row items-center gap-1 mt-1">
                  <Text className="font-caption text-caption text-primary font-semibold">Open Shop Profile</Text>
                  <Icon name="arrow_forward" className="text-primary text-[14px]" />
                </Pressable>
              </View>
            </View>

            <View className="bg-surface-container-low rounded-xl p-space-md gap-space-sm">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-row items-center gap-2 flex-1">
                  <View className="w-7 h-7 rounded-lg bg-primary-soft items-center justify-center">
                    <Icon name={categoryIcon(s?.category_slug ?? '')} className="text-primary text-[16px]" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-lg text-body-lg text-on-surface">{b.service_name ?? t('booking.anyService')}</Text>
                    <Text className="font-caption text-caption text-text-muted">Duration: {mins} mins</Text>
                  </View>
                </View>
                {b.price != null ? <Text className="font-price-display text-price-display text-primary">{formatMoney(b.price, s?.currency)}</Text> : null}
              </View>
              {b.customer_note ? (
                <View className="mt-1 bg-surface-card/90 rounded-lg p-space-sm flex-row items-start gap-2">
                  <Icon name="format_quote" className="text-secondary text-[16px] mt-0.5" />
                  <Text className="flex-1 font-caption text-caption text-on-surface italic">&quot;{b.customer_note}&quot;</Text>
                </View>
              ) : null}
              {b.owner_note ? (
                <View className="flex-row items-start gap-2">
                  <Icon name="storefront" className="text-primary text-[16px] mt-0.5" />
                  <Text className="flex-1 font-caption text-caption text-primary">{b.owner_note}</Text>
                </View>
              ) : null}
            </View>

            {b.price != null ? (
              <View className="bg-accent-soft/70 rounded-xl p-space-md gap-1 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <Text className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider">Payment Status</Text>
                  <View className="px-2 py-0.5 rounded-full bg-secondary">
                    <Text className="text-on-secondary font-label-sm text-label-sm font-bold">DUE AT COUNTER</Text>
                  </View>
                </View>
                <View className="flex-row items-baseline justify-between mt-1">
                  <Text className="font-headline-sm text-headline-sm text-on-surface">Total Amount:</Text>
                  <Text className="font-headline-md text-headline-md text-secondary font-bold">{formatMoney(b.price, s?.currency)}</Text>
                </View>
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <Icon name="payments" className="text-secondary text-[16px]" />
                  <Text className="flex-1 font-caption text-caption text-on-surface-variant">Pay via cash or the shop&apos;s wallet / Raast details upon arrival.</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Quick actions */}
        <View className="flex-row gap-space-sm">
          <Pressable accessibilityRole="button" disabled={!s?.phone} onPress={() => s?.phone && open.call(s.phone)} className={`flex-1 h-[52px] bg-surface-card active:bg-surface-container rounded-xl flex-row items-center justify-center gap-2 shadow-sm ${!s?.phone ? 'opacity-40' : ''}`}>
            <Icon name="call" className="text-primary text-[20px]" />
            <Text className="font-body-lg text-body-lg text-on-surface">Call Shop</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={s?.lat == null} onPress={() => s?.lat != null && s.lng != null && open.maps(s.lat, s.lng)} className={`flex-1 h-[52px] bg-surface-card active:bg-surface-container rounded-xl flex-row items-center justify-center gap-2 shadow-sm ${s?.lat == null ? 'opacity-40' : ''}`}>
            <Icon name="directions" className="text-primary text-[20px]" />
            <Text className="font-body-lg text-body-lg text-on-surface">{t('common.directions')}</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${b.shop_id}/pay`)} className="h-[52px] w-full bg-secondary-container active:opacity-90 rounded-xl flex-row items-center justify-center gap-2 shadow-md">
          <Icon name="qr_code_2" className="text-on-secondary-container text-[22px]" />
          <Text className="text-on-secondary-container font-body-lg text-body-lg font-bold">Pay Now via QR</Text>
        </Pressable>

        {/* Location */}
        {s?.lat != null && s.lng != null ? (
          <Pressable accessibilityRole="button" onPress={() => open.maps(s.lat!, s.lng!)} className="bg-surface-card rounded-2xl p-space-md shadow-sm gap-space-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="location_on" className="text-primary text-[20px]" />
                <Text className="font-body-lg text-body-lg text-on-surface font-semibold">Store Location</Text>
              </View>
              {dist ? <Text className="font-caption text-caption text-text-muted">{dist} away</Text> : null}
            </View>
            <View className="w-full h-32 rounded-xl overflow-hidden bg-surface-container-high items-center justify-center">
              <View className="absolute inset-0 bg-primary/10" />
              <Icon name="map" className="absolute text-primary/20 text-[120px]" />
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-lg">
                <Icon name="storefront" className="text-on-primary text-[18px]" />
              </View>
            </View>
            {addr ? <Text className="font-caption text-caption text-text-muted">{addr}</Text> : null}
          </Pressable>
        ) : null}

        {/* Policy */}
        <View className="bg-surface-card rounded-2xl p-space-lg shadow-sm gap-space-xs">
          <View className="flex-row items-center gap-2">
            <Icon name="info" className="text-primary text-[20px]" />
            <Text className="text-on-surface font-body-lg text-body-lg font-bold">Cancellation Policy</Text>
          </View>
          <Text className="font-caption text-caption text-text-muted mt-1 leading-relaxed">
            Free cancellation any time <Text className="text-on-surface">before your appointment starts</Text> ({formatTime(b.starts_at, tz)}). No cancellation charges apply.
          </Text>
        </View>

        {canCancel ? (
          <View className="pt-space-xs items-center">
            <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} className="h-12 px-6 rounded-xl bg-danger-soft active:bg-error-container flex-row items-center justify-center gap-2">
              <Icon name="cancel" className="text-danger-red text-[20px]" />
              <Text className="text-danger-red font-body-lg text-body-lg font-semibold">Cancel Appointment</Text>
            </Pressable>
            <Text className="font-caption text-caption text-text-muted mt-2">{t('common.appName')} Guarantee & Safe Walk-in Policy</Text>
          </View>
        ) : null}
      </View>

      {/* Cancel confirmation */}
      <Modal visible={confirming} transparent animationType="fade" onRequestClose={() => setConfirming(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center p-margin">
          <View className="bg-surface-card rounded-2xl p-space-lg w-full max-w-sm gap-space-md">
            <View className="w-12 h-12 rounded-full bg-danger-soft items-center justify-center self-center">
              <Icon name="event_busy" className="text-danger-red text-[28px]" />
            </View>
            <View>
              <Text className="text-center font-headline-sm text-headline-sm text-on-surface font-bold">{t('booking.cancelConfirm')}</Text>
              <Text className="text-center font-body-md text-body-md text-text-muted mt-1">Your seat will be released for other customers. You can re-book anytime.</Text>
            </View>
            <View className="gap-2 mt-2">
              <Pressable
                accessibilityRole="button"
                disabled={cancel.isPending}
                onPress={async () => {
                  try {
                    await cancel.mutateAsync(b.id);
                    setConfirming(false);
                  } catch (e) {
                    setConfirming(false);
                    Alert.alert(toAppError(e).message);
                  }
                }}
                className="h-[52px] bg-danger-red rounded-xl items-center justify-center"
              >
                <Text className="text-white font-body-lg text-body-lg font-bold">{cancel.isPending ? t('common.loading') : 'Yes, Cancel Booking'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} className="h-[52px] bg-surface-container rounded-xl items-center justify-center">
                <Text className="text-on-surface font-body-lg text-body-lg font-medium">Keep Appointment</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerScreen>
  );
}
