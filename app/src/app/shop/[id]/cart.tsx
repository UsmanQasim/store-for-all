import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Icon, Image, Text, TextInput, type IconName } from '@/components/nw';
import { RequireAuth } from '@/components/RequireAuth';
import { CustomerScreen } from '@/components/shell';
import { EmptyState, LoadingState, Stepper } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatMoney } from '@/lib/format';
import { getCurrentCoords, reverseGeocode } from '@/lib/location';
import { registerForPush } from '@/lib/notifications';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useOrderMutations } from '@/services/orders';
import { useShop } from '@/services/shops';
import type { Fulfillment } from '@/types/models';

/** C05 — Cart / checkout. */
export default function Cart() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const shop = useShop(id);
  const cart = useCart();
  const { place } = useOrderMutations();
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (profile?.phone && !phone) setPhone(profile.phone);
  }, [profile?.phone, phone]);
  useEffect(() => {
    if (shop.data?.offers_delivery) setFulfillment('delivery');
  }, [shop.data?.offers_delivery]);

  if (shop.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return null;
  const lines = cart.shopId === s.id ? cart.lines : [];
  const belowMin = cart.subtotal < Number(s.min_order_amount);
  const delivery = fulfillment === 'delivery';
  const canSubmit = !belowMin && (!delivery || address.trim().length >= 5);

  const autofill = async () => {
    const c = await getCurrentCoords(true);
    if (!c) return;
    const p = await reverseGeocode(c);
    setAddress([p.area, p.city].filter(Boolean).join(', '));
  };

  const submit = async () => {
    try {
      const o = await place.mutateAsync({ shopId: s.id, items: lines.map((l) => ({ item_id: l.item.id, quantity: l.quantity })), fulfillment, address, phone, note });
      cart.reset();
      registerForPush().catch(() => undefined);
      Alert.alert(t('cart.success'), t('cart.successBody', { code: o.code }));
      router.replace(`/order/${o.id}`);
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  if (!lines.length)
    return (
      <CustomerScreen subtitle={t('cart.title')}>
        <EmptyState icon="shopping_bag" title={t('cart.empty')} action={t('shop.products')} onAction={() => router.back()} />
      </CustomerScreen>
    );

  const footer = (
    <View className="gap-1.5">
      {belowMin ? <Text className="font-caption text-caption text-danger-red text-center">{t('cart.minimum', { amount: formatMoney(s.min_order_amount, s.currency) })}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit, busy: place.isPending }}
        disabled={!canSubmit || place.isPending}
        onPress={submit}
        className={`w-full h-[52px] bg-primary-container active:bg-primary-pressed rounded-xl flex-row items-center justify-center gap-2 shadow-md ${!canSubmit ? 'opacity-50' : ''}`}
      >
        <Icon name="shopping_bag" fill className="text-on-primary text-[20px]" />
        <Text className="text-on-primary font-headline-sm text-headline-sm">
          {t('cart.place')} • {formatMoney(cart.subtotal, s.currency)}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <RequireAuth>
      <CustomerScreen subtitle={t('cart.title')} footer={footer} contentClassName="pb-8">
        {/* Title row */}
        <View className="px-margin pt-space-md pb-space-sm flex-row items-center justify-between">
          <View className="flex-row items-center gap-space-sm flex-1">
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} className="w-12 h-12 -ml-2 rounded-full items-center justify-center active:bg-surface-container-high">
              <Icon name="arrow_back" className="text-on-surface text-[24px]" />
            </Pressable>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-headline-md text-headline-md text-on-surface tracking-tight">{t('cart.title')}</Text>
                <View className="px-2 py-0.5 rounded-full bg-success-soft">
                  <Text className="text-success-green font-label-sm text-label-sm">{cart.count} items</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Icon name="storefront" className="text-[15px] text-primary" />
                <Text numberOfLines={1} className="font-caption text-caption text-text-muted shrink">{[s.name, s.area].filter(Boolean).join(' • ')}</Text>
              </View>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
            <Icon name="local_mall" fill className="text-primary text-[20px]" />
          </View>
        </View>

        {/* Trust banner */}
        <View className="px-margin mb-space-md">
          <View className="bg-accent-soft px-space-md py-space-sm rounded-xl flex-row items-center gap-space-sm">
            <Icon name="verified" className="text-warning-amber text-[20px]" />
            <Text className="font-caption text-caption text-secondary flex-1">Pre-ordering directly with {s.name}</Text>
          </View>
        </View>

        <View className="px-margin gap-space-lg">
          {/* Items */}
          <View className="bg-surface-card rounded-xl p-space-md shadow-sm">
            <View className="flex-row items-center justify-between pb-space-sm">
              <Text className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">{t('shop.products')}</Text>
              <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
                <Text className="font-caption text-caption text-primary font-semibold">+ Add more</Text>
              </Pressable>
            </View>
            {lines.map((l, i) => (
              <View key={l.item.id}>
                {i > 0 ? <View className="h-px bg-surface-alt my-1" /> : null}
                <View className="py-space-md flex-row items-center justify-between gap-space-sm">
                  <View className="flex-row items-center gap-space-sm flex-1 min-w-0">
                    <View className="w-12 h-12 rounded-lg bg-surface-alt items-center justify-center overflow-hidden">
                      {l.item.image_url ? <Image source={{ uri: l.item.image_url }} className="w-full h-full" /> : <Icon name="inventory_2" className="text-text-muted text-[22px]" />}
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface">{l.item.name}</Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="font-caption text-caption text-text-muted">
                          {formatMoney(l.item.price, s.currency)}
                          {l.item.unit ? ` / ${l.item.unit}` : ''}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-border-hairline" />
                        <Text className="font-price-display text-price-display text-primary">{formatMoney(Number(l.item.price) * l.quantity, s.currency)}</Text>
                      </View>
                    </View>
                  </View>
                  <Stepper value={l.quantity} onChange={(v) => cart.setQuantity(l.item.id, v)} />
                </View>
              </View>
            ))}
            <View className="h-px bg-surface-alt mt-2 mb-space-md" />
            <View className="gap-2 pt-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-body-md text-body-md text-text-muted">{t('cart.subtotal')}</Text>
                <Text className="font-body-md text-body-md text-on-surface">{formatMoney(cart.subtotal, s.currency)}</Text>
              </View>
              {delivery ? (
                <View className="flex-row items-center justify-between">
                  <Text className="font-body-md text-body-md text-text-muted">Delivery fee</Text>
                  <Text className="font-body-md text-body-md text-on-surface">Set by shop</Text>
                </View>
              ) : null}
              <View className="h-px bg-surface-alt my-1" />
              <View className="flex-row items-center justify-between pt-1">
                <Text className="font-headline-sm text-headline-sm text-on-surface">Total payable</Text>
                <Text className="font-headline-md text-headline-md text-primary">{formatMoney(cart.subtotal, s.currency)}</Text>
              </View>
            </View>
          </View>

          {/* Fulfilment */}
          {s.offers_delivery ? (
            <View className="gap-1.5">
              <Text className="px-1 font-caption text-caption text-text-muted">Fulfillment method</Text>
              <View className="h-12 bg-surface-alt p-1 rounded-xl flex-row items-center">
                <Mode icon="store" label="Pickup at shop" on={!delivery} onPress={() => setFulfillment('pickup')} />
                <Mode icon="two_wheeler" label="Direct Delivery" on={delivery} onPress={() => setFulfillment('delivery')} />
              </View>
            </View>
          ) : null}

          {/* Details */}
          <View className="gap-space-md">
            {delivery ? (
              <Field
                label={t('cart.address')}
                icon="location_on"
                action={
                  <Pressable accessibilityRole="button" onPress={autofill} className="flex-row items-center gap-0.5" hitSlop={8}>
                    <Icon name="my_location" className="text-primary text-[14px]" />
                    <Text className="font-caption text-caption text-primary font-semibold">Auto-fill</Text>
                  </Pressable>
                }
              >
                <TextInput value={address} onChangeText={setAddress} multiline maxLength={300} autoComplete="street-address" accessibilityLabel={t('cart.address')} placeholder="House, street, area" className="flex-1 font-body-md text-body-md text-on-surface py-2" />
              </Field>
            ) : null}
            <Field label={`${t('cart.phone')} (for updates)`} icon="call">
              {s.country_code === 'PK' ? <Text className="font-body-md text-body-md text-text-muted pr-1">+92</Text> : null}
              <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} accessibilityLabel={t('cart.phone')} className="flex-1 font-body-md text-body-md text-on-surface py-3" />
            </Field>
            <Field label={`${t('cart.note')} (${t('common.optional').toLowerCase()})`} icon="chat_bubble_outline">
              <TextInput value={note} onChangeText={setNote} maxLength={300} accessibilityLabel={t('cart.note')} placeholder="e.g. fresh milk packs with long expiry" className="flex-1 font-body-md text-body-md text-on-surface py-3" />
            </Field>
          </View>

          {/* Payment note */}
          <View className="bg-surface-card rounded-xl p-space-md shadow-sm flex-row gap-space-sm">
            <View className="w-9 h-9 rounded-full bg-info-soft items-center justify-center mt-0.5">
              <Icon name="handshake" className="text-info-blue text-[20px]" />
            </View>
            <View className="flex-1">
              <Text className="font-headline-sm text-headline-sm text-on-surface">Direct Cash or QR Payment</Text>
              <Text className="font-body-md text-body-md text-text-muted mt-1 leading-snug">
                Pay at the {delivery ? 'doorstep' : 'counter'} or use the shop&apos;s wallet / Raast details. {t('common.appName')} never takes commission or handles your money.
              </Text>
            </View>
          </View>
        </View>
      </CustomerScreen>
    </RequireAuth>
  );
}

function Mode({ icon, label, on, onPress }: { icon: IconName; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={onPress} className={`flex-1 h-full rounded-lg flex-row items-center justify-center gap-2 ${on ? 'bg-surface-card shadow-sm' : ''}`}>
      <Icon name={icon} className={`${on ? 'text-primary' : 'text-text-muted'} text-[18px]`} />
      <Text className={`font-headline-sm text-[15px] ${on ? 'text-primary' : 'text-text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

function Field({ label, icon, action, children }: { label: string; icon: IconName; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View>
      <View className="mb-1.5 px-1 flex-row items-center justify-between">
        <Text className="font-caption text-caption text-text-muted">{label}</Text>
        {action}
      </View>
      <View className="min-h-[52px] bg-surface-card rounded-xl px-space-md shadow-sm flex-row items-center gap-space-sm">
        <Icon name={icon} className="text-text-muted text-[20px]" />
        {children}
      </View>
    </View>
  );
}
