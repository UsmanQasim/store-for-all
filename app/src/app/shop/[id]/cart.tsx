import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Button, Card, Divider, EmptyState, Input, LoadingState, Screen, Segmented, Stepper, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatMoney } from '@/lib/format';
import { registerForPush } from '@/lib/notifications';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useOrderMutations } from '@/services/orders';
import { useShop } from '@/services/shops';
import type { Fulfillment } from '@/types/models';

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

  if (shop.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return null;
  const lines = cart.shopId === s.id ? cart.lines : [];
  const belowMin = cart.subtotal < Number(s.min_order_amount);

  const submit = async () => {
    try {
      const o = await place.mutateAsync({
        shopId: s.id,
        items: lines.map((l) => ({ item_id: l.item.id, quantity: l.quantity })),
        fulfillment,
        address,
        phone,
        note,
      });
      cart.reset();
      registerForPush().catch(() => undefined);
      Alert.alert(t('cart.success'), t('cart.successBody', { code: o.code }));
      router.replace(`/order/${o.id}`);
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  return (
    <RequireAuth>
      <Stack.Screen options={{ title: t('cart.title') }} />
      {lines.length === 0 ? (
        <Screen scroll={false}>
          <EmptyState icon="bag-outline" title={t('cart.empty')} action={t('common.close')} onAction={() => router.back()} />
        </Screen>
      ) : (
        <Screen
          footer={
            <View style={{ gap: 8 }}>
              {belowMin ? <Text variant="caption" color="danger" align="center">{t('cart.minimum', { amount: formatMoney(s.min_order_amount, s.currency) })}</Text> : null}
              <Button
                title={`${t('cart.place')} · ${formatMoney(cart.subtotal, s.currency)}`}
                onPress={submit}
                loading={place.isPending}
                disabled={belowMin || (fulfillment === 'delivery' && address.trim().length < 5)}
                fullWidth
              />
            </View>
          }
        >
          <Text variant="h2">{s.name}</Text>
          <Card padded={false}>
            {lines.map((l, i) => (
              <View key={l.item.id}>
                {i > 0 ? <Divider /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{l.item.name}</Text>
                    <Text variant="caption" color="textMuted">{formatMoney(l.item.price, s.currency)}{l.item.unit ? ` / ${l.item.unit}` : ''}</Text>
                  </View>
                  <Stepper value={l.quantity} onChange={(v) => cart.setQuantity(l.item.id, v)} />
                </View>
              </View>
            ))}
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14 }}>
              <Text variant="bodyStrong">{t('cart.subtotal')}</Text>
              <Text variant="price">{formatMoney(cart.subtotal, s.currency)}</Text>
            </View>
          </Card>

          {s.offers_delivery ? (
            <Segmented<Fulfillment> value={fulfillment} onChange={setFulfillment} options={[{ value: 'pickup', label: t('cart.pickup') }, { value: 'delivery', label: t('cart.delivery') }]} />
          ) : null}
          {fulfillment === 'delivery' ? <Input label={t('cart.address')} value={address} onChangeText={setAddress} multiline maxLength={300} autoComplete="street-address" /> : null}
          <Input label={t('cart.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} />
          <Input label={t('cart.note')} value={note} onChangeText={setNote} maxLength={300} />
          <Text variant="caption" color="textMuted">{t('cart.payNote')}</Text>
        </Screen>
      )}
    </RequireAuth>
  );
}
