import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { BusinessScreen } from '@/components/shell';
import { Icon, Image, LoadingState, StatusBadge, Text, type IconName } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatMoney, initials, timeAgo } from '@/lib/format';
import { open } from '@/lib/links';
import { kv } from '@/lib/storage';
import { nextOrderStatuses, useOrder, useOrderMutations, useShopOrders } from '@/services/orders';
import type { Order, OrderStatus } from '@/types/models';

const STAGES: OrderStatus[] = ['accepted', 'packing', 'ready', 'completed'];

function actionFor(s: OrderStatus, o: Order): { label: string; icon: IconName } {
  const delivery = o.fulfillment === 'delivery';
  switch (s) {
    case 'accepted':
      return { label: 'Accept Order', icon: 'check_circle' };
    case 'packing':
      return { label: 'Start Packing', icon: 'inventory_2' };
    case 'ready':
      return { label: delivery ? 'Mark Packed' : 'Mark Packed & Ready for Pickup', icon: 'task_alt' };
    case 'out_for_delivery':
      return { label: 'Dispatch Order', icon: 'local_shipping' };
    default:
      return { label: delivery ? 'Mark Delivered' : 'Handed Over • Complete', icon: 'done_all' };
  }
}

/** Where each status sits on the 4-step bar (Accepted → Packing → Ready/On the way → Done). */
const stageIndex = (s: OrderStatus) => (s === 'placed' ? -1 : s === 'out_for_delivery' ? 2 : STAGES.indexOf(s));

/** B10 — Order detail & packing triage (owner). */
export default function OwnerOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useOrder(id);
  const shopOrders = useShopOrders(q.data?.shop_id);
  const { setStatus } = useOrderMutations();
  const packKey = `pack.${id}`;
  const [packed, setPacked] = useState<string[]>(() => {
    try {
      return JSON.parse(kv.get(packKey) ?? '[]');
    } catch {
      return [];
    }
  });
  const savePacked = (v: string[]) => {
    setPacked(v);
    kv.set(packKey, JSON.stringify(v));
  };

  if (q.isLoading || !q.data) return <LoadingState />;
  const o = q.data;
  const items = o.items ?? [];
  const next = nextOrderStatuses(o);
  const primary = next.find((s) => s !== 'rejected' && s !== 'cancelled');
  const stop = next.find((s) => s === 'rejected' || s === 'cancelled');
  const phone = o.customer_phone ?? o.customer?.phone ?? null;
  const delivery = o.fulfillment === 'delivery';
  const idx = stageIndex(o.status);
  const closed = ['completed', 'rejected', 'cancelled'].includes(o.status);
  const pastOrders = (shopOrders.data ?? []).filter((x) => x.customer_id === o.customer_id && x.id !== o.id).length;
  const allPacked = items.length > 0 && items.every((it) => packed.includes(it.id));

  const run = (s: OrderStatus) => {
    const go = () => setStatus.mutateAsync({ id: o.id, status: s }).catch((e) => Alert.alert(toAppError(e).message));
    if (s === 'rejected' || s === 'cancelled') {
      Alert.alert(s === 'rejected' ? 'Decline this order?' : 'Cancel this order?', 'The customer will be notified.', [
        { text: t('common.back'), style: 'cancel' },
        { text: s === 'rejected' ? 'Decline' : t('common.cancel'), style: 'destructive', onPress: go },
      ]);
    } else go();
  };

  const banner =
    o.status === 'placed'
      ? { tag: 'New Order', sub: 'Action Required', line: `Received ${timeAgo(o.created_at)} • Accept to start packing` }
      : closed
        ? null
        : { tag: t(`status.${o.status}` as never) as string, sub: 'In progress', line: `Placed ${timeAgo(o.created_at)} • Updated ${timeAgo(o.updated_at)}` };

  return (
    <BusinessScreen shopId={o.shop_id} shopName={o.shop?.name ?? ''} section={t('activity.orders')}>
      {/* Header */}
      <View className="gap-space-sm">
        <View className="flex-row items-center justify-between gap-space-sm">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/business/${o.shop_id}/orders`))}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="w-12 h-12 items-center justify-center rounded-xl bg-surface-container"
          >
            <Icon name="arrow_back" className="text-on-surface text-[24px]" />
          </Pressable>
          <View className="items-center flex-1 min-w-0">
            <Text numberOfLines={1} className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Order #{o.code}</Text>
            <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{o.shop?.name}</Text>
          </View>
          <View className="w-12 h-12 items-center justify-center">{closed ? <StatusBadge status={o.status} /> : null}</View>
        </View>

        {banner ? (
          <View className="bg-accent-soft rounded-xl p-space-md shadow-sm flex-row items-center justify-between gap-space-sm">
            <View className="flex-row items-center gap-space-sm min-w-0 flex-1">
              <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
                <Icon name="timer" className="text-on-secondary-container text-[20px]" />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">{banner.tag}</Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <Text className="font-caption text-caption text-secondary font-bold">{banner.sub}</Text>
                </View>
                <Text numberOfLines={1} className="font-caption text-caption text-on-surface font-semibold">{banner.line}</Text>
              </View>
            </View>
            <View className="bg-surface-card px-2.5 py-1 rounded-full shadow-sm">
              <Text className="font-caption text-caption text-secondary font-extrabold tracking-tight uppercase">{delivery ? t('cart.delivery') : t('cart.pickup')}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Fulfilment stepper */}
      {!['rejected', 'cancelled'].includes(o.status) ? (
        <View className="bg-surface-card rounded-xl p-space-md shadow-sm gap-space-sm">
          <View className="flex-row items-center justify-between">
            <Text className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Fulfillment Stage</Text>
            <Text className="font-caption text-caption text-primary font-bold">{idx < 0 ? 'Awaiting acceptance' : `Step ${idx + 1} of 4`}</Text>
          </View>
          <View className="flex-row gap-1.5">
            {(
              [
                ['Accepted', 'check'],
                ['Packing', 'inventory_2'],
                [delivery ? 'On the way' : 'Ready', delivery ? 'two_wheeler' : 'storefront'],
                ['Done', 'done_all'],
              ] as [string, IconName][]
            ).map(([label, icon], i) => {
              const done = i < idx || (i === idx && o.status === 'completed');
              const current = i === idx && !done;
              return (
                <View key={label} className="flex-1 items-center gap-1">
                  <View className={`w-full h-2 rounded-full ${done ? 'bg-primary' : current ? 'bg-secondary-container' : 'bg-surface-container-high'}`} />
                  <View className="flex-row items-center gap-0.5">
                    <Icon name={done ? 'check' : icon} className={`text-[14px] ${done ? 'text-primary' : current ? 'text-on-secondary-container' : 'text-text-muted'}`} />
                    <Text numberOfLines={1} className={`font-label-sm text-[11px] ${done ? 'text-primary font-bold' : current ? 'text-on-secondary-container font-bold' : 'text-text-muted'}`}>
                      {label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Customer */}
      <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
        <View className="flex-row items-center gap-space-md">
          {o.customer?.avatar_url ? (
            <Image source={{ uri: o.customer.avatar_url }} className="w-12 h-12 rounded-full" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-primary-soft items-center justify-center">
              <Text className="text-primary font-headline-sm text-headline-sm">{initials(o.customer?.full_name)}</Text>
            </View>
          )}
          <View className="flex-1 min-w-0">
            <Text numberOfLines={1} className="font-headline-sm text-headline-sm text-on-surface">{o.customer?.full_name ?? 'Customer'}</Text>
            <Text className="font-caption text-caption text-text-muted">
              {pastOrders > 0 ? `${pastOrders} past ${pastOrders === 1 ? 'order' : 'orders'} here` : 'First order at your shop'}
            </Text>
          </View>
        </View>

        <View className="bg-surface-alt rounded-lg p-space-md flex-row items-start gap-space-sm">
          <Icon name={delivery ? 'location_on' : 'storefront'} className="text-primary text-[20px] mt-0.5" />
          <View className="flex-1 min-w-0">
            <Text className="font-label-sm text-label-sm text-text-muted uppercase">{delivery ? 'Delivery Address' : 'Pickup'}</Text>
            <Text className="font-body-md text-body-md text-on-surface font-semibold">
              {delivery ? o.delivery_address ?? '—' : 'Customer will collect from your counter'}
            </Text>
          </View>
        </View>

        {o.customer_note ? (
          <View className="bg-accent-soft rounded-lg p-space-md flex-row items-start gap-space-sm">
            <Icon name="note_alt" className="text-secondary text-[20px] mt-0.5" />
            <View className="flex-1 min-w-0">
              <Text className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wide">Customer Instruction</Text>
              <Text className="font-caption text-caption text-on-surface font-medium italic mt-0.5">“{o.customer_note}”</Text>
            </View>
          </View>
        ) : null}

        {phone ? (
          <View className="flex-row gap-space-sm pt-space-xs">
            <Pressable onPress={() => open.call(phone)} accessibilityRole="button" className="flex-1 h-12 px-space-md rounded-xl bg-surface-container flex-row items-center justify-center gap-2">
              <Icon name="call" className="text-[20px] text-primary" />
              <Text className="font-body-lg text-body-lg text-primary">{t('common.call')}</Text>
            </Pressable>
            <Pressable
              onPress={() => open.whatsapp(phone, `Assalam o Alaikum! About your order ${o.code}`)}
              accessibilityRole="button"
              className="flex-1 h-12 px-space-md rounded-xl bg-success-soft flex-row items-center justify-center gap-2"
            >
              <Icon name="chat" className="text-success-green text-[20px]" />
              <Text className="font-body-lg text-body-lg text-success-green">{t('common.whatsapp')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* Packing checklist */}
      <View className="gap-space-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="font-headline-sm text-headline-sm text-on-surface">Packing Checklist</Text>
            <View className="bg-primary-soft px-2 py-0.5 rounded-full">
              <Text className="text-primary font-label-sm text-label-sm font-bold">
                {items.filter((it) => packed.includes(it.id)).length} of {items.length} Packed
              </Text>
            </View>
          </View>
          <Pressable onPress={() => savePacked(allPacked ? [] : items.map((it) => it.id))} accessibilityRole="button" hitSlop={8}>
            <Text className="font-caption text-caption text-primary font-bold">{allPacked ? 'Clear' : 'Pack All'}</Text>
          </Pressable>
        </View>
        {items.map((it) => {
          const on = packed.includes(it.id);
          return (
            <Pressable
              key={it.id}
              onPress={() => savePacked(on ? packed.filter((x) => x !== it.id) : [...packed, it.id])}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              className="bg-surface-card rounded-xl p-space-md shadow-sm flex-row items-center gap-space-md active:opacity-90"
            >
              <View className={`w-8 h-8 rounded-lg items-center justify-center ${on ? 'bg-primary' : 'bg-surface-container'}`}>
                <Icon name="check" className={`text-[22px] ${on ? 'text-on-primary' : 'text-transparent'}`} />
              </View>
              <View className="w-14 h-14 rounded-lg bg-surface-container-low overflow-hidden items-center justify-center">
                {it.item?.image_url ? (
                  <Image source={{ uri: it.item.image_url }} className="w-full h-full" contentFit="cover" />
                ) : (
                  <Icon name="shopping_basket" className="text-text-muted text-[24px]" />
                )}
              </View>
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center justify-between gap-1">
                  <Text numberOfLines={1} className={`flex-1 font-body-lg text-body-lg ${on ? 'line-through text-text-muted' : 'text-on-surface'}`}>{it.name}</Text>
                  <Text className="font-price-display text-price-display text-primary">{formatMoney(it.line_total, o.currency)}</Text>
                </View>
                <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{formatMoney(it.unit_price, o.currency)} each</Text>
                <View className="flex-row mt-1">
                  <View className="bg-secondary-container px-2 py-0.5 rounded">
                    <Text className="text-on-secondary-container font-label-sm text-[11px] font-bold">
                      {it.quantity}x{it.unit ? ` ${it.unit}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Payment summary */}
      <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
        <View className="flex-row items-center justify-between">
          <Text className="font-headline-sm text-headline-sm text-on-surface">Payment Summary</Text>
          <View className="bg-primary-soft px-2 py-0.5 rounded-full">
            <Text className="text-primary font-label-sm text-[11px] font-bold">0% Commission</Text>
          </View>
        </View>
        <View className="gap-space-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-muted font-body-md text-body-md">
              Items Subtotal ({items.length} {items.length === 1 ? 'type' : 'types'})
            </Text>
            <Text className="font-body-lg text-body-lg text-on-surface">{formatMoney(o.subtotal, o.currency)}</Text>
          </View>
          <View className="h-px bg-surface-container w-full my-0.5" />
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-headline-md text-headline-md text-on-surface">Total to Collect</Text>
              <Text className="font-caption text-caption text-text-muted">Paid directly to you</Text>
            </View>
            <Text className="font-display text-display text-primary">{formatMoney(o.subtotal, o.currency)}</Text>
          </View>
        </View>
        <View className="bg-surface-alt rounded-lg p-space-md flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-space-sm min-w-0 flex-1">
            <Icon name="payments" className="text-secondary text-[24px]" />
            <View className="min-w-0 flex-1">
              <Text className="font-label-sm text-label-sm text-text-muted uppercase">Payment Mode</Text>
              <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface font-bold">Cash or direct transfer</Text>
            </View>
          </View>
          <View className="bg-accent-soft px-2 py-1 rounded">
            <Text className="text-secondary font-label-sm text-label-sm font-bold">{delivery ? 'Collect at Door' : 'Collect at Counter'}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {primary || stop ? (
        <View className="gap-space-sm pt-space-xs pb-space-md">
          {primary ? (
            <Pressable
              onPress={() => run(primary)}
              disabled={setStatus.isPending}
              accessibilityRole="button"
              className={`w-full h-[52px] bg-primary rounded-xl shadow-md flex-row items-center justify-center gap-2 active:opacity-90 ${setStatus.isPending ? 'opacity-60' : ''}`}
            >
              <Icon name={actionFor(primary, o).icon} className="text-on-primary text-[24px]" />
              <Text className="font-body-lg text-body-lg text-on-primary font-bold">{actionFor(primary, o).label}</Text>
            </Pressable>
          ) : null}
          {stop ? (
            <Pressable
              onPress={() => run(stop)}
              disabled={setStatus.isPending}
              accessibilityRole="button"
              className="w-full h-[52px] bg-danger-soft rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
            >
              <Icon name="cancel" className="text-danger-red text-[20px]" />
              <Text className="font-body-lg text-body-lg text-danger-red font-bold">{stop === 'rejected' ? 'Decline Order' : 'Cancel Order'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </BusinessScreen>
  );
}
