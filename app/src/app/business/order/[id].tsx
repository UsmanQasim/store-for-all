import { Stack, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { Avatar, Button, Card, Divider, LoadingState, Screen, StatusBadge, Text } from '@/components/ui';
import { t, type TKey } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { open } from '@/lib/links';
import { nextOrderStatuses, useOrder, useOrderMutations } from '@/services/orders';
import type { OrderStatus } from '@/types/models';

const ACTION_LABEL: Partial<Record<OrderStatus, TKey>> = {
  accepted: 'business.accept',
  rejected: 'business.reject',
  packing: 'business.packing',
  ready: 'business.ready',
  out_for_delivery: 'business.outForDelivery',
  completed: 'business.complete',
  cancelled: 'common.cancel',
};

/** Owner's order view: pick list + one-tap status progression. */
export default function OwnerOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useOrder(id);
  const { setStatus } = useOrderMutations();
  if (q.isLoading || !q.data) return <LoadingState />;
  const o = q.data;
  const next = nextOrderStatuses(o);

  return (
    <Screen
      footer={
        next.length ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {next.map((s) => (
              <Button
                key={s}
                title={t(ACTION_LABEL[s] ?? 'common.continue')}
                variant={s === 'rejected' || s === 'cancelled' ? 'danger' : 'primary'}
                style={{ flex: 1 }}
                loading={setStatus.isPending && setStatus.variables?.status === s}
                onPress={() => setStatus.mutateAsync({ id: o.id, status: s }).catch((e) => Alert.alert(toAppError(e).message))}
              />
            ))}
          </View>
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: o.code }} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar uri={o.customer?.avatar_url} name={o.customer?.full_name} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">{o.customer?.full_name ?? 'Customer'}</Text>
          <Text variant="caption" color="textMuted">{formatDateTime(o.created_at)}</Text>
        </View>
        <StatusBadge status={o.status} />
      </Card>
      <Card padded={false}>
        {o.items?.map((it, i) => (
          <View key={it.id}>
            {i > 0 ? <Divider /> : null}
            <View style={{ flexDirection: 'row', padding: 14, gap: 12 }}>
              <Text variant="h3">{it.quantity}×</Text>
              <Text style={{ flex: 1 }}>{it.name}{it.unit ? ` (${it.unit})` : ''}</Text>
              <Text>{formatMoney(it.line_total, o.currency)}</Text>
            </View>
          </View>
        ))}
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14 }}>
          <Text variant="bodyStrong">{t('cart.subtotal')}</Text>
          <Text variant="price">{formatMoney(o.subtotal, o.currency)}</Text>
        </View>
      </Card>
      <Card style={{ gap: 6 }}>
        <Text variant="bodyStrong">{o.fulfillment === 'delivery' ? t('cart.delivery') : t('cart.pickup')}</Text>
        {o.delivery_address ? <Text>{o.delivery_address}</Text> : null}
        {o.customer_note ? <Text variant="caption" color="textMuted">“{o.customer_note}”</Text> : null}
        {o.customer_phone || o.customer?.phone ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <Button title={t('common.call')} size="sm" variant="secondary" icon="call-outline" onPress={() => open.call((o.customer_phone ?? o.customer?.phone)!)} />
            <Button title={t('common.whatsapp')} size="sm" variant="secondary" icon="logo-whatsapp" onPress={() => open.whatsapp((o.customer_phone ?? o.customer?.phone)!, `Order ${o.code}`)} />
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}
