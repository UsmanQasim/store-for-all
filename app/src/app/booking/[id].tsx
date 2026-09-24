import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { Avatar, Button, Card, Divider, LoadingState, Screen, StatusBadge, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { formatDate, formatMoney, formatTime } from '@/lib/format';
import { open } from '@/lib/links';
import { useBooking, useBookingMutations } from '@/services/bookings';
import { useAppTheme } from '@/theme';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius } = useAppTheme();
  const q = useBooking(id);
  const { cancel } = useBookingMutations();
  if (q.isLoading || !q.data) return <LoadingState />;
  const b = q.data;
  const tz = b.shop?.timezone;
  const canCancel = (b.status === 'pending' || b.status === 'confirmed') && new Date(b.starts_at) > new Date();

  return (
    <Screen
      footer={
        canCancel ? (
          <Button
            title={t('booking.cancel')}
            variant="danger"
            loading={cancel.isPending}
            onPress={() =>
              Alert.alert(t('booking.cancelConfirm'), undefined, [
                { text: t('common.no'), style: 'cancel' },
                { text: t('common.yes'), style: 'destructive', onPress: () => cancel.mutateAsync(b.id).catch((e) => Alert.alert(toAppError(e).message)) },
              ])
            }
            fullWidth
          />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: b.code }} />
      <View style={{ alignItems: 'center', gap: 10, padding: 20, borderRadius: radius.xl, backgroundColor: colors.primarySoft }}>
        <StatusBadge status={b.status} />
        <Text variant="display" color="primary">{formatTime(b.starts_at, tz)}</Text>
        <Text variant="h3">{formatDate(b.starts_at, tz)}</Text>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface }}>
          <Text variant="bodyStrong" style={{ letterSpacing: 2 }}>{b.code}</Text>
        </View>
      </View>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar uri={b.shop?.logo_url} name={b.shop?.name} rounded={false} />
          <Text variant="h3" style={{ flex: 1 }}>{b.shop?.name}</Text>
          <Button title={t('common.open')} size="sm" variant="secondary" onPress={() => router.push(`/shop/${b.shop_id}`)} />
        </View>
        <Divider />
        <Text>{b.service_name ?? t('booking.anyService')}{b.price != null ? ` · ${formatMoney(b.price, b.shop?.currency)}` : ''}</Text>
        {b.customer_note ? <Text variant="caption" color="textMuted">“{b.customer_note}”</Text> : null}
        {b.owner_note ? <Text variant="caption" color="primary">{b.owner_note}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {b.shop?.phone ? <Button title={t('common.call')} icon="call-outline" size="sm" variant="secondary" onPress={() => open.call(b.shop!.phone!)} /> : null}
          <Button title={t('shop.pay')} icon="wallet-outline" size="sm" variant="secondary" onPress={() => router.push(`/shop/${b.shop_id}/pay`)} />
        </View>
      </Card>
    </Screen>
  );
}
