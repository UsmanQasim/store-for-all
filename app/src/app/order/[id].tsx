import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Icon, Image, Text, type IconName } from '@/components/nw';
import { CustomerScreen } from '@/components/shell';
import { LoadingState } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatMoney, formatTime, timeAgo } from '@/lib/format';
import { open } from '@/lib/links';
import { PAYMENT_LABELS } from '@/lib/payments';
import { usePaymentMethods } from '@/services/catalog';
import { useOrder, useOrderMutations } from '@/services/orders';
import type { OrderStatus } from '@/types/models';

type Step = { key: OrderStatus; label: string; icon: IconName };
const PICKUP: Step[] = [
  { key: 'placed', label: 'Placed', icon: 'check' },
  { key: 'accepted', label: 'Accepted', icon: 'check' },
  { key: 'packing', label: 'Packing', icon: 'inventory_2' },
  { key: 'ready', label: 'Ready', icon: 'shopping_bag' },
  { key: 'completed', label: 'Collected', icon: 'task_alt' },
];
const DELIVERY: Step[] = [
  { key: 'placed', label: 'Placed', icon: 'check' },
  { key: 'accepted', label: 'Accepted', icon: 'check' },
  { key: 'packing', label: 'Packing', icon: 'inventory_2' },
  { key: 'out_for_delivery', label: 'Out', icon: 'two_wheeler' },
  { key: 'completed', label: 'Delivered', icon: 'home' },
];
const HEADLINE: Record<OrderStatus, string> = {
  placed: 'Waiting for the shop to accept',
  accepted: 'Shop accepted your order',
  packing: 'Your items are being packed',
  ready: 'Ready for pickup',
  out_for_delivery: 'On the way to you',
  completed: 'Order completed',
  cancelled: 'Order cancelled',
  rejected: 'Shop could not take this order',
};

/** C12 — Order tracking. */
export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useOrder(id);
  const methods = usePaymentMethods(q.data?.shop_id);
  const { cancel } = useOrderMutations();
  const [copied, setCopied] = useState<string | null>(null);

  if (q.isLoading || !q.data) return <LoadingState />;
  const o = q.data;
  const s = o.shop;
  const delivery = o.fulfillment === 'delivery';
  const steps = delivery ? DELIVERY : PICKUP;
  const idxOf = (st: OrderStatus) => (st === 'ready' && delivery ? 2.5 : steps.findIndex((x) => x.key === st));
  const cur = idxOf(o.status);
  const terminalBad = o.status === 'cancelled' || o.status === 'rejected';
  const pay = methods.data?.[0];
  const n = o.items?.reduce((a, i) => a + i.quantity, 0) ?? 0;

  const copy = async (v: string) => {
    await Clipboard.setStringAsync(v);
    setCopied(v);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <CustomerScreen subtitle={t('tabs.activity')} contentClassName="pb-8">
      {/* Top bar */}
      <View className="px-margin pt-space-md pb-space-sm flex-row items-center justify-between">
        <View className="flex-row items-center gap-space-sm flex-1">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/activity'))} className="w-12 h-12 rounded-full bg-surface-container items-center justify-center">
            <Icon name="arrow_back" className="text-on-surface text-[22px]" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-headline-sm text-headline-sm text-on-surface leading-tight">Order Tracking</Text>
            <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{s?.name}</Text>
          </View>
        </View>
        {s?.phone ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.call')} onPress={() => open.call(s.phone!)} className="w-12 h-12 rounded-full bg-primary-soft items-center justify-center">
            <Icon name="call" className="text-primary text-[22px]" />
          </Pressable>
        ) : null}
      </View>

      <View className="px-margin gap-space-lg mt-space-xs">
        {/* Status card */}
        <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
          <View className="flex-row items-start justify-between gap-2">
            <View className="gap-0.5 flex-1">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="font-label-sm text-label-sm text-text-muted">ORDER ID:</Text>
                <View className="flex-row items-center gap-1">
                  <Text className="font-headline-sm text-headline-sm tracking-wider font-bold text-on-surface">{o.code}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={t('common.copy')} onPress={() => copy(o.code)} className="w-8 h-8 items-center justify-center rounded-full">
                    <Icon name={copied === o.code ? 'check' : 'content_copy'} className="text-[16px] text-primary" />
                  </Pressable>
                </View>
              </View>
              <Text className="font-caption text-caption text-text-muted">Placed {timeAgo(o.created_at)} at {formatTime(o.created_at, s?.timezone)}</Text>
            </View>
            <View className={`${terminalBad ? 'bg-danger-soft' : 'bg-success-soft'} px-2.5 py-1 rounded-full`}>
              <Text className={`${terminalBad ? 'text-danger-red' : 'text-success-green'} font-label-sm text-label-sm tracking-wider uppercase`}>{t(`status.${o.status}`)}</Text>
            </View>
          </View>

          <View className={`${terminalBad ? 'bg-danger-soft' : 'bg-primary-soft'} rounded-lg p-space-md flex-row items-center justify-between gap-2`}>
            <View className="flex-row items-center gap-space-sm flex-1">
              <View className={`w-9 h-9 rounded-full items-center justify-center ${terminalBad ? 'bg-danger-red' : 'bg-primary-container'}`}>
                <Icon name={terminalBad ? 'cancel' : 'timer'} className="text-on-primary text-[20px]" />
              </View>
              <View className="flex-1">
                <Text className="font-caption text-caption text-text-muted leading-none">{delivery ? 'Home delivery' : 'Pickup at shop'}</Text>
                <Text className={`font-headline-sm text-headline-sm mt-1 ${terminalBad ? 'text-danger-red' : 'text-primary'}`}>{HEADLINE[o.status]}</Text>
              </View>
            </View>
            <View className="bg-surface-card px-2.5 py-1 rounded-full">
              <Text className="font-label-sm text-label-sm text-primary">{timeAgo(o.updated_at)}</Text>
            </View>
          </View>

          {!terminalBad ? (
            <View className="pt-space-xs">
              <View className="absolute left-4 right-4 top-[15px] h-1 bg-surface-alt">
                <View className="h-full bg-primary-container" style={{ width: `${Math.max(0, Math.min(1, cur / (steps.length - 1))) * 100}%` }} />
              </View>
              <View className="flex-row items-start justify-between">
                {steps.map((st, i) => {
                  const done = i < cur || (o.status === 'completed' && i === cur);
                  const active = i === Math.ceil(cur) && o.status !== 'completed';
                  return (
                    <View key={st.key} className="items-center w-[64px]">
                      <View className={`w-8 h-8 rounded-full items-center justify-center ${done ? 'bg-primary-container' : active ? 'bg-secondary-container border-4 border-warning-soft' : 'bg-surface-alt'}`}>
                        <Icon name={done ? 'check' : st.icon} className={`${done ? 'text-on-primary' : active ? 'text-on-secondary-container' : 'text-text-muted'} text-[16px]`} />
                      </View>
                      <Text className={`font-label-sm text-label-sm mt-1.5 ${done ? 'text-on-surface font-semibold' : active ? 'text-warning-amber font-bold' : 'text-text-muted'}`}>{st.label}</Text>
                      <Text className={`font-caption text-[11px] leading-tight ${active ? 'text-warning-amber' : 'text-text-muted'}`}>
                        {i === 0 ? formatTime(o.created_at, s?.timezone) : active ? 'Active' : done ? '✓' : '--'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>

        {/* Shop card */}
        <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
          <View className="flex-row items-center gap-space-md">
            <View className="w-14 h-14 rounded-full overflow-hidden bg-surface-alt items-center justify-center">
              {s?.logo_url ? <Image source={{ uri: s.logo_url }} className="w-full h-full" /> : <Icon name="storefront" className="text-text-muted text-[24px]" />}
            </View>
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center gap-1">
                <Text numberOfLines={1} className="shrink font-headline-sm text-headline-sm text-on-surface">{s?.name}</Text>
                <Icon name="verified" fill className="text-primary text-[18px]" />
              </View>
              {s?.area ? <Text className="font-caption text-caption text-text-muted">{[s.area, s.city].filter(Boolean).join(', ')}</Text> : null}
              <View className="flex-row items-center gap-1 mt-0.5">
                <Icon name={delivery ? 'motorcycle' : 'store'} className="text-secondary text-[16px]" />
                <Text className="font-caption text-caption text-on-surface-variant font-medium">{delivery ? 'Delivered by the shop' : 'Collect at the counter'}</Text>
              </View>
            </View>
          </View>
          <View className="flex-row gap-space-sm pt-space-xs">
            <Pressable accessibilityRole="button" disabled={!s?.phone} onPress={() => s?.phone && open.call(s.phone)} className={`flex-1 h-12 rounded-lg bg-surface-alt flex-row items-center justify-center gap-2 active:bg-primary-soft ${!s?.phone ? 'opacity-40' : ''}`}>
              <Icon name="phone_in_talk" className="text-primary text-[20px]" />
              <Text className="text-primary font-body-lg text-body-lg">Call Shop</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!s?.whatsapp}
              onPress={() => s?.whatsapp && open.whatsapp(s.whatsapp, `Order ${o.code}`, s.country_code)}
              className={`flex-1 h-12 rounded-lg bg-primary-container flex-row items-center justify-center gap-2 active:bg-primary-pressed ${!s?.whatsapp ? 'opacity-40' : ''}`}
            >
              <Icon name="chat" className="text-on-primary text-[20px]" />
              <Text className="text-on-primary font-body-lg text-body-lg">{t('common.whatsapp')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Summary */}
        <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
          <View className="flex-row items-center justify-between pb-space-xs">
            <Text className="font-headline-sm text-headline-sm text-on-surface">Order Summary</Text>
            <Text className="font-caption text-caption text-text-muted">{n} Items</Text>
          </View>
          <View className="gap-space-md">
            {o.items?.map((it) => (
              <View key={it.id} className="flex-row items-center gap-space-md">
                <View className="w-12 h-12 rounded-lg bg-surface-alt items-center justify-center">
                  <Icon name="inventory_2" className="text-text-muted text-[22px]" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface">
                    {it.name}
                    {it.unit ? ` (${it.unit})` : ''}
                  </Text>
                  <Text className="font-caption text-caption text-text-muted">Qty: {it.quantity}</Text>
                </View>
                <Text className="font-price-display text-price-display text-primary">{formatMoney(it.line_total, o.currency)}</Text>
              </View>
            ))}
          </View>
          <View className="bg-surface-alt rounded-lg p-space-md gap-space-xs mt-space-xs">
            <View className="flex-row justify-between items-center">
              <Text className="text-text-muted font-body-md text-body-md">Items Subtotal</Text>
              <Text className="font-body-md text-body-md text-on-surface">{formatMoney(o.subtotal, o.currency)}</Text>
            </View>
            {delivery ? (
              <View className="flex-row justify-between items-center">
                <Text className="text-text-muted font-body-md text-body-md">Neighbourhood Delivery Fee</Text>
                <Text className="font-body-md text-body-md text-on-surface">Set by shop</Text>
              </View>
            ) : null}
            <View className="pt-space-xs flex-row justify-between items-center">
              <Text className="font-headline-sm text-headline-sm text-on-surface">Total Payable</Text>
              <Text className="font-headline-md text-headline-md text-primary">{formatMoney(o.subtotal, o.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        {!terminalBad ? (
          <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-row items-center gap-space-sm flex-1">
                <View className="w-10 h-10 rounded-full bg-accent-soft items-center justify-center">
                  <Icon name="payments" className="text-secondary text-[22px]" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-lg text-body-lg text-on-surface">Payment & Settlement</Text>
                  <Text className="font-caption text-caption text-text-muted">{['Cash', ...new Set((methods.data ?? []).map((m) => PAYMENT_LABELS[m.type]))].join(' / ')}</Text>
                </View>
              </View>
              <View className="bg-warning-soft px-2.5 py-1 rounded-full">
                <Text className="text-warning-amber font-label-sm text-label-sm tracking-wider uppercase">{delivery ? 'Due At Doorstep' : 'Due At Counter'}</Text>
              </View>
            </View>
            {pay?.account_number ? (
              <View className="bg-surface-alt rounded-lg p-space-md flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-label-sm text-label-sm text-text-muted uppercase">{PAYMENT_LABELS[pay.type]} · {pay.account_title}</Text>
                  <Text className="font-body-lg text-body-lg font-bold text-on-surface tracking-wider">{pay.account_number}</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => copy(pay.account_number!)} className="h-9 px-3 bg-surface-card rounded-lg shadow-sm justify-center">
                  <Text className="text-primary font-label-sm text-label-sm">{copied === pay.account_number ? t('common.copied') : t('common.copy')}</Text>
                </Pressable>
              </View>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => router.push(`/shop/${o.shop_id}/pay`)} className="w-full min-h-[52px] px-3 bg-secondary-container rounded-xl flex-row items-center justify-center gap-2 active:opacity-90">
              <Icon name="qr_code_2" className="text-on-secondary-container text-[20px]" />
              <Text className="text-on-secondary-container font-body-lg text-body-lg font-bold">Pay Now ({formatMoney(o.subtotal, o.currency)})</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Address / note */}
        {delivery || o.customer_note ? (
          <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
            {delivery ? (
              <>
                <View className="flex-row items-center gap-space-sm">
                  <View className="w-10 h-10 rounded-full bg-surface-alt items-center justify-center">
                    <Icon name="location_on" className="text-primary text-[22px]" />
                  </View>
                  <View>
                    <Text className="font-body-lg text-body-lg text-on-surface">{t('cart.address')}</Text>
                    <Text className="font-caption text-caption text-text-muted">Home Destination</Text>
                  </View>
                </View>
                <View className="bg-surface-alt rounded-lg p-space-md">
                  <Text className="font-body-md text-body-md text-on-surface">{o.delivery_address}</Text>
                </View>
              </>
            ) : null}
            {o.customer_note ? (
              <View className="bg-info-soft rounded-lg p-space-md flex-row items-start gap-space-sm">
                <Icon name="sticky_note_2" className="text-info-blue text-[20px] mt-0.5" />
                <View className="flex-1">
                  <Text className="font-label-sm text-label-sm text-info-blue uppercase">Note for the shop</Text>
                  <Text className="font-body-md text-body-md text-on-surface mt-0.5">&quot;{o.customer_note}&quot;</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {o.status === 'placed' ? (
          <Pressable
            accessibilityRole="button"
            disabled={cancel.isPending}
            onPress={() =>
              Alert.alert(t('common.cancel'), 'Cancel this order?', [
                { text: t('common.no'), style: 'cancel' },
                { text: t('common.yes'), style: 'destructive', onPress: () => cancel.mutateAsync(o.id).catch((e) => Alert.alert(toAppError(e).message)) },
              ])
            }
            className="h-12 self-center px-6 rounded-xl bg-danger-soft flex-row items-center justify-center gap-2"
          >
            <Icon name="cancel" className="text-danger-red text-[20px]" />
            <Text className="text-danger-red font-body-lg text-body-lg font-semibold">Cancel Order</Text>
          </Pressable>
        ) : null}

        <View className="bg-surface-alt rounded-xl p-space-md flex-row items-center gap-space-md">
          <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
            <Icon name="verified_user" className="text-primary text-[22px]" />
          </View>
          <View className="flex-1">
            <Text className="font-body-lg text-body-lg text-on-surface">{t('common.appName')} Neighbourhood Trust</Text>
            <Text className="font-caption text-caption text-text-muted">Verified local shop with direct contact and honest prices.</Text>
          </View>
        </View>
      </View>
    </CustomerScreen>
  );
}
