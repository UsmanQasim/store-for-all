import { router, Stack } from 'expo-router';
import { Alert, RefreshControl, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Avatar, Badge, Button, Card, Divider, EmptyState, ListRow, LoadingState, Screen, SectionHeader, StatTile, Text } from '@/components/ui';
import { useActiveShop } from '@/hooks/useActiveShop';
import { t } from '@/i18n';
import { formatMoney } from '@/lib/format';
import { useShopDashboard } from '@/services/shops';

export default function BusinessHome() {
  const { shops, active, select, isLoading, refetch } = useActiveShop();
  const dash = useShopDashboard(active?.id);

  if (isLoading) return <LoadingState />;

  return (
    <RequireAuth>
      <Stack.Screen options={{ title: t('business.dashboard') }} />
      {!active ? (
        <Screen scroll={false}>
          <EmptyState icon="storefront-outline" title={t('profile.registerShop')} body={t('profile.registerShopBody')} action={t('business.createTitle')} onAction={() => router.push('/business/create')} />
        </Screen>
      ) : (
        <Screen refreshControl={<RefreshControl refreshing={dash.isRefetching} onRefresh={() => { dash.refetch(); refetch(); }} />}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar uri={active.logo_url} name={active.name} size={52} rounded={false} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3" numberOfLines={1}>{active.name}</Text>
              {!active.is_published ? <Badge label={t('business.unpublished')} tone="warning" /> : active.status === 'suspended' ? <Badge label="Suspended" tone="danger" /> : <Text variant="caption" color="textMuted">/{active.slug}</Text>}
            </View>
            {shops.length > 1 ? (
              <Button
                title={t('business.switchShop')}
                size="sm"
                variant="secondary"
                onPress={() => Alert.alert(t('business.switchShop'), undefined, [...shops.map((s) => ({ text: s.name, onPress: () => select(s.id) })), { text: t('common.cancel'), style: 'cancel' as const }])}
              />
            ) : null}
          </Card>

          <SectionHeader title={t('business.today')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {active.accepts_bookings ? <StatTile icon="calendar" label={t('business.bookingsToday')} value={dash.data?.bookings_today ?? '–'} /> : null}
            {active.accepts_bookings ? <StatTile icon="hourglass-outline" tone="accent" label={t('business.pendingBookings')} value={dash.data?.bookings_pending ?? '–'} /> : null}
            {active.accepts_orders ? <StatTile icon="bag-handle" label={t('business.openOrders')} value={dash.data?.orders_open ?? '–'} /> : null}
            {active.accepts_orders ? <StatTile icon="cash-outline" tone="accent" label="Sales today" value={formatMoney(dash.data?.revenue_today ?? 0, active.currency)} /> : null}
            <StatTile icon="heart" label={t('business.followers')} value={dash.data?.followers ?? '–'} />
            <StatTile icon="star" tone="accent" label={t('business.rating')} value={dash.data?.rating_count ? `${Number(dash.data.rating_avg).toFixed(1)} (${dash.data.rating_count})` : '–'} />
          </View>

          {(active.accepts_bookings || active.accepts_orders) ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {active.accepts_bookings ? <Button title={t('business.bookings')} icon="calendar-outline" style={{ flex: 1 }} onPress={() => router.push(`/business/${active.id}/bookings`)} /> : null}
              {active.accepts_orders ? <Button title={t('business.orders')} icon="bag-handle-outline" variant="accent" style={{ flex: 1 }} onPress={() => router.push(`/business/${active.id}/orders`)} /> : null}
            </View>
          ) : null}

          <SectionHeader title={t('business.manage')} />
          <Card padded={false} style={{ paddingHorizontal: 12 }}>
            <ListRow icon="qr-code-outline" title={t('business.qr')} onPress={() => router.push(`/business/${active.id}/qr`)} />
            <Divider />
            <ListRow icon="create-outline" title={t('business.editShop')} onPress={() => router.push(`/business/${active.id}/edit`)} />
            <Divider />
            <ListRow icon="pricetags-outline" title={t('business.catalog')} onPress={() => router.push(`/business/${active.id}/catalog`)} />
            <Divider />
            <ListRow icon="wallet-outline" title={t('business.payments')} onPress={() => router.push(`/business/${active.id}/payments`)} />
            <Divider />
            <ListRow icon="megaphone-outline" title={t('business.posts')} onPress={() => router.push(`/business/${active.id}/posts`)} />
            <Divider />
            <ListRow icon="eye-outline" title={t('business.viewPublic')} onPress={() => router.push(`/shop/${active.id}`)} />
          </Card>

          <Button title={t('profile.registerShop')} variant="ghost" icon="add" onPress={() => router.push('/business/create')} />
        </Screen>
      )}
    </RequireAuth>
  );
}
