import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { Avatar, Button, Card, Divider, LoadingState, Screen, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { open } from '@/lib/links';
import { useOrder, useOrderMutations } from '@/services/orders';
import { useAppTheme } from '@/theme';
import type { OrderStatus } from '@/types/models';

const STEPS: OrderStatus[] = ['placed', 'accepted', 'packing', 'ready', 'completed'];

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const q = useOrder(id);
  const { cancel } = useOrderMutations();
  if (q.isLoading || !q.data) return <LoadingState />;
  const o = q.data;
  const stepIdx = STEPS.indexOf(o.status === 'out_for_delivery' ? 'ready' : o.status);
  const terminal = o.status === 'cancelled' || o.status === 'rejected';

  return (
    <Screen
      footer={
        o.status === 'placed' ? (
          <Button
            title={t('common.cancel')}
            variant="danger"
            loading={cancel.isPending}
            onPress={() => cancel.mutateAsync(o.id).catch((e) => Alert.alert(toAppError(e).message))}
            fullWidth
          />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: o.code }} />
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar uri={o.shop?.logo_url} name={o.shop?.name} rounded={false} />
          <View style={{ flex: 1 }}>
            <Text variant="h3">{o.shop?.name}</Text>
            <Text variant="caption" color="textMuted">{formatDateTime(o.created_at)}</Text>
          </View>
          <StatusBadge status={o.status} />
        </View>
        {!terminal ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {STEPS.map((s, i) => (
              <View key={s} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: i <= stepIdx ? colors.primary : colors.border }}>
                  {i <= stepIdx ? <Ionicons name="checkmark" size={14} color={colors.onPrimary} /> : null}
                </View>
                <Text variant="label" color={i <= stepIdx ? 'text' : 'textMuted'} align="center">{t(`status.${s}`)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <Card padded={false}>
        {o.items?.map((it, i) => (
          <View key={it.id}>
            {i > 0 ? <Divider /> : null}
            <View style={{ flexDirection: 'row', padding: 14, gap: 12 }}>
              <Text variant="bodyStrong">{it.quantity}×</Text>
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
        {o.delivery_address ? <Text color="textMuted">{o.delivery_address}</Text> : null}
        {o.customer_note ? <Text variant="caption" color="textMuted">“{o.customer_note}”</Text> : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {o.shop?.phone ? <Button title={t('common.call')} icon="call-outline" variant="secondary" style={{ flex: 1 }} onPress={() => open.call(o.shop!.phone!)} /> : null}
        <Button title={t('shop.pay')} icon="wallet-outline" variant="accent" style={{ flex: 1 }} onPress={() => router.push(`/shop/${o.shop_id}/pay`)} />
      </View>
    </Screen>
  );
}
