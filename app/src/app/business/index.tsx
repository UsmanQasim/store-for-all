import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, RefreshControl, Switch, View } from 'react-native';
import { Icon, Image, Text, type IconName } from '@/components/nw';
import { RequireAuth } from '@/components/RequireAuth';
import { BusinessScreen } from '@/components/shell';
import { EmptyState, LoadingState } from '@/components/ui';
import { useActiveShop } from '@/hooks/useActiveShop';
import { t } from '@/i18n';
import { categoryIcon } from '@/lib/categories';
import { formatMoney, formatTime, initials, isOpenNow, timeAgo } from '@/lib/format';
import { open, shopPublicUrl } from '@/lib/links';
import { PAYMENT_LABELS } from '@/lib/payments';
import { useBookingMutations, useShopBookings } from '@/services/bookings';
import { useCatalog, usePaymentMethods } from '@/services/catalog';
import { useSaveShop, useShopDashboard } from '@/services/shops';

/** B01 — Business dashboard. */
export default function BusinessHome() {
  const { shops, active, select, isLoading, refetch } = useActiveShop();
  const dash = useShopDashboard(active?.id);
  const bookings = useShopBookings(active?.accepts_bookings ? active.id : undefined);
  const items = useCatalog(active?.id);
  const methods = usePaymentMethods(active?.id);
  const save = useSaveShop();
  const { setStatus } = useBookingMutations();

  if (isLoading) return <LoadingState />;
  if (!active)
    return (
      <RequireAuth>
        <BusinessScreen shopName="—" section="Dashboard" active="dashboard">
          <EmptyState icon="add_business" title={t('profile.registerShop')} body={t('profile.registerShopBody')} action={t('business.createTitle')} onAction={() => router.push('/business/create')} />
        </BusinessScreen>
      </RequireAuth>
    );

  const s = active;
  const d = dash.data;
  const url = shopPublicUrl(s.slug);
  const live = s.is_published && s.status === 'active';
  const openNow = isOpenNow(s.opening_hours, s.timezone);
  const queue = (bookings.data ?? []).filter((b) => ['pending', 'confirmed'].includes(b.status) && new Date(b.ends_at) > new Date());
  const next = queue[0];
  const nextMins = next ? Math.round((new Date(next.starts_at).getTime() - Date.now()) / 60000) : 0;
  const serviceCount = (items.data ?? []).filter((i) => i.kind === 'service').length;
  const productCount = (items.data ?? []).filter((i) => i.kind === 'product').length;
  const switchShop = shops.length > 1 ? () => Alert.alert(t('business.switchShop'), undefined, [...shops.map((x) => ({ text: x.name, onPress: () => select(x.id) })), { text: t('common.cancel'), style: 'cancel' as const }]) : undefined;

  return (
    <RequireAuth>
      <BusinessScreen
        active="dashboard"
        shopId={s.id}
        shopName={s.name}
        section="Dashboard"
        onSwitch={switchShop}
        refreshControl={
          <RefreshControl
            refreshing={dash.isRefetching}
            onRefresh={() => {
              dash.refetch();
              refetch();
              bookings.refetch();
            }}
            tintColor="#0B6E4F"
          />
        }
      >
        {/* Identity card */}
        <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
          <View className="flex-row items-start justify-between gap-space-sm">
            <View className="flex-row items-center gap-space-md min-w-0 flex-1">
              <View className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container items-center justify-center">
                {s.logo_url ? <Image source={{ uri: s.logo_url }} className="w-full h-full" /> : <Icon name={categoryIcon(s.category_slug)} className="text-primary text-[24px]" />}
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text numberOfLines={1} className="shrink font-headline-sm text-headline-sm text-on-surface">{s.name}</Text>
                  <Icon name="verified" fill className="text-primary text-[18px]" />
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={t('common.copy')} onPress={() => Clipboard.setStringAsync(url)} className="flex-row items-center gap-1">
                  <Text numberOfLines={1} className="font-caption text-caption text-text-muted max-w-[170px]">{url.replace(/^https?:\/\//, '')}</Text>
                  <Icon name="content_copy" className="text-[15px] text-text-muted" />
                </Pressable>
              </View>
            </View>
            {switchShop ? (
              <Pressable accessibilityRole="button" onPress={switchShop} className="h-8 px-2.5 rounded-full bg-surface-alt flex-row items-center gap-1">
                <Text className="font-label-sm text-label-sm text-on-surface">Switch</Text>
                <Icon name="expand_more" className="text-[16px] text-text-muted" />
              </Pressable>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg">
            <View className="flex-row items-center gap-2">
              <View className={`w-2.5 h-2.5 rounded-full ${live ? (openNow ? 'bg-success-green' : 'bg-warning-amber') : 'bg-text-muted'}`} />
              <Text className={`font-label-sm text-label-sm font-bold tracking-wide ${live ? (openNow ? 'text-success-green' : 'text-warning-amber') : 'text-text-muted'}`}>
                {!live ? 'HIDDEN FROM CUSTOMERS' : openNow ? 'LIVE & OPEN NOW' : 'LIVE · CLOSED NOW'}
              </Text>
            </View>
            <Switch
              value={s.is_published}
              onValueChange={(v) => save.mutate({ id: s.id, input: { is_published: v } })}
              trackColor={{ true: '#00543b', false: '#e7e1dc' }}
              thumbColor="#FFFFFF"
              accessibilityLabel={t('business.published')}
            />
          </View>
        </View>

        {/* Hero actions */}
        <View className="flex-row gap-space-sm">
          {s.accepts_bookings || !s.accepts_orders ? (
            <Hero icon="calendar_month" title={t('activity.bookings')} sub={`${d?.bookings_pending ?? 0} pending queue`} primary onPress={() => router.push(`/business/${s.id}/bookings`)} />
          ) : (
            <Hero icon="shopping_bag" title={t('activity.orders')} sub={`${d?.orders_new ?? 0} new orders`} primary onPress={() => router.push(`/business/${s.id}/orders`)} />
          )}
          <Hero icon="qr_code_2" title="Counter QR" sub="Print table standee" onPress={() => router.push(`/business/${s.id}/qr`)} />
        </View>

        {/* Pulse */}
        <View className="gap-space-sm">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline-sm text-headline-sm text-on-surface">Today&apos;s Pulse</Text>
            <Text className="font-caption text-caption text-text-muted">{dash.dataUpdatedAt ? `Updated ${timeAgo(new Date(dash.dataUpdatedAt).toISOString())}` : ''}</Text>
          </View>
          <View className="flex-row gap-space-sm">
            {s.accepts_bookings ? (
              <Metric label="Bookings Today" icon="calendar_today" tone="primary" value={String(d?.bookings_today ?? '–')} sub={`${d?.bookings_done_today ?? 0} done · ${d?.bookings_upcoming_today ?? 0} upcoming`} />
            ) : (
              <Metric label="Open Orders" icon="shopping_bag" tone="primary" value={String(d?.orders_open ?? '–')} sub={`${d?.orders_new ?? 0} new`} />
            )}
            <Metric
              label={s.accepts_bookings ? 'Pending Requests' : 'New Orders'}
              icon="pending_actions"
              tone="warning"
              value={String((s.accepts_bookings ? d?.bookings_pending : d?.orders_new) ?? '–')}
              badge={(s.accepts_bookings ? d?.bookings_pending : d?.orders_new) ? 'Action' : undefined}
            />
          </View>
          <View className="flex-row gap-space-sm">
            <Metric label="Earnings Today" icon="account_balance_wallet" tone="success" value={formatMoney(d?.revenue_today ?? 0, s.currency)} valueClass="font-headline-md text-headline-md text-primary tracking-tight" sub="Completed, paid direct" />
            <Metric label="Followers" icon="favorite" tone="info" value={String(d?.followers ?? '–')} sub={d?.rating_count ? `★ ${Number(d.rating_avg).toFixed(1)} from ${d.rating_count} reviews` : 'Neighbourhood fans'} />
          </View>
        </View>

        {/* Next in queue */}
        {s.accepts_bookings ? (
          <View className="gap-space-xs">
            <View className="flex-row items-center justify-between px-1">
              <Text className="font-headline-sm text-headline-sm text-on-surface">Next in Queue</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push(`/business/${s.id}/bookings`)} className="min-h-[40px] justify-center">
                <Text className="font-caption text-caption text-primary font-bold">View all ({queue.length})</Text>
              </Pressable>
            </View>
            {next ? (
              <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5 bg-warning-soft px-2.5 py-1 rounded-full">
                    <Icon name="schedule" className="text-warning-amber text-[14px]" />
                    <Text className="text-warning-amber font-label-sm text-label-sm font-bold tracking-wide uppercase">
                      {next.status === 'pending' ? 'Needs confirmation' : nextMins <= 0 ? 'Now' : nextMins < 90 ? `Upcoming in ${nextMins} mins` : 'Upcoming'}
                    </Text>
                  </View>
                  <Text className="font-caption text-caption text-text-muted font-semibold">{formatTime(next.starts_at, s.timezone)}</Text>
                </View>
                <View className="flex-row items-start gap-space-md">
                  <View className="w-9 h-9 rounded-full bg-surface-container overflow-hidden items-center justify-center">
                    {next.customer?.avatar_url ? <Image source={{ uri: next.customer.avatar_url }} className="w-full h-full" /> : <Text className="font-label-sm text-on-surface">{initials(next.customer?.full_name)}</Text>}
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center justify-between gap-2">
                      <Text numberOfLines={1} className="shrink font-body-lg text-body-lg text-on-surface">{next.customer?.full_name ?? 'Customer'}</Text>
                      {next.price != null ? <Text className="font-headline-sm text-headline-sm text-primary">{formatMoney(next.price, s.currency)}</Text> : null}
                    </View>
                    <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{next.service_name ?? t('booking.anyService')} · {next.code}</Text>
                    {next.customer_note ? (
                      <View className="mt-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg flex-row items-center gap-1.5">
                        <Icon name="format_quote" className="text-[14px] text-text-muted" />
                        <Text numberOfLines={1} className="shrink text-on-surface-variant font-caption text-caption italic">&quot;{next.customer_note}&quot;</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View className="flex-row gap-space-sm pt-1">
                  <Pressable
                    accessibilityRole="button"
                    disabled={setStatus.isPending}
                    onPress={() => setStatus.mutate({ id: next.id, status: next.status === 'pending' ? 'confirmed' : 'completed' })}
                    className="flex-1 h-10 bg-primary active:bg-primary-pressed rounded-lg flex-row items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Icon name={next.status === 'pending' ? 'check' : 'how_to_reg'} className="text-on-primary text-[16px]" />
                    <Text className="text-on-primary font-body-lg text-caption">{next.status === 'pending' ? t('business.confirm') : 'Mark Done'}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!next.customer?.phone}
                    onPress={() => next.customer?.phone && open.call(next.customer.phone)}
                    className={`flex-1 h-10 bg-surface-alt rounded-lg flex-row items-center justify-center gap-1.5 ${!next.customer?.phone ? 'opacity-40' : ''}`}
                  >
                    <Icon name="call" className="text-[16px] text-text-muted" />
                    <Text className="text-on-surface font-body-lg text-caption">Call Customer</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="bg-surface-card rounded-xl p-space-lg shadow-sm items-center gap-1">
                <Icon name="event_seat" className="text-text-muted text-[26px]" />
                <Text className="font-caption text-caption text-text-muted">{t('business.queueEmpty')}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Tools */}
        <View className="gap-space-xs">
          <Text className="px-1 font-headline-sm text-headline-sm text-on-surface">Shop Management & Tools</Text>
          <View className="bg-surface-card rounded-xl p-space-sm shadow-sm gap-1">
            <Tool icon={categoryIcon(s.category_slug)} title={s.accepts_bookings && !productCount ? 'Services & Rates' : 'Services & Products'} sub={`${serviceCount} services · ${productCount} products`} onPress={() => router.push(`/business/${s.id}/catalog`)} />
            <Tool
              icon="payments"
              title="Payment Methods & QR"
              sub={methods.data?.length ? `${[...new Set(methods.data.map((m) => PAYMENT_LABELS[m.type]))].join(', ')} active` : 'Add JazzCash, Raast or bank details'}
              onPress={() => router.push(`/business/${s.id}/payments`)}
            />
            <Tool icon="print" title="Counter QR Standee & Poster" sub="Print A4 PDF or share your shop link" onPress={() => router.push(`/business/${s.id}/qr`)} />
            <Tool icon="campaign" title="Post Offer to Followers" sub={`${d?.followers ?? 0} neighbourhood followers`} onPress={() => router.push(`/business/${s.id}/posts`)} />
            {s.accepts_orders ? <Tool icon="shopping_bag" title={t('business.orders')} sub={`${d?.orders_open ?? 0} open · ${d?.orders_new ?? 0} new`} onPress={() => router.push(`/business/${s.id}/orders`)} /> : null}
            <Tool icon="edit_note" title={t('business.editShop')} sub="Hours, contact, location & features" onPress={() => router.push(`/business/${s.id}/edit`)} />
            <Tool icon="preview" title="Preview Customer View" sub={`See how ${s.name} appears to customers`} trailing="open_in_new" onPress={() => router.push(`/shop/${s.id}`)} />
          </View>
        </View>

        <View className="bg-primary-soft rounded-xl p-space-md flex-row items-center gap-space-md">
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm">
            <Icon name="handshake" className="text-on-primary text-[20px]" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-body-lg text-caption text-primary font-bold">{t('common.appName')} Business Promise</Text>
            <Text className="font-caption text-[12px] text-on-surface-variant leading-snug">Direct customer access, your own payment details & 0% platform commission.</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/business/create')} className="h-12 flex-row items-center justify-center gap-1.5">
          <Icon name="add" className="text-primary text-[20px]" />
          <Text className="text-primary font-body-lg text-body-lg">{t('profile.registerShop')}</Text>
        </Pressable>
      </BusinessScreen>
    </RequireAuth>
  );
}

function Hero({ icon, title, sub, primary, onPress }: { icon: IconName; title: string; sub: string; primary?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className={`flex-1 h-[52px] rounded-xl px-3 flex-row items-center justify-center gap-2 shadow-sm ${primary ? 'bg-primary active:bg-primary-pressed' : 'bg-secondary-container active:opacity-90'}`}>
      <Icon name={icon} className={`${primary ? 'text-on-primary' : 'text-on-secondary-container'} text-[20px]`} />
      <View className="min-w-0 shrink">
        <Text numberOfLines={1} className={`${primary ? 'text-on-primary' : 'text-on-secondary-container'} font-body-lg text-body-lg leading-tight`}>{title}</Text>
        <Text numberOfLines={1} className={`font-label-sm text-[11px] font-medium ${primary ? 'text-on-primary-container' : 'text-on-secondary-container/80'}`}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const MT = { primary: ['bg-primary-soft', 'text-primary'], warning: ['bg-warning-soft', 'text-warning-amber'], success: ['bg-success-soft', 'text-success-green'], info: ['bg-info-soft', 'text-info-blue'] } as const;

function Metric({ label, icon, tone, value, sub, badge, valueClass }: { label: string; icon: IconName; tone: keyof typeof MT; value: string; sub?: string; badge?: string; valueClass?: string }) {
  return (
    <View className="flex-1 bg-surface-card rounded-xl p-space-md shadow-sm justify-between h-[104px]">
      <View className="flex-row items-center justify-between">
        <Text numberOfLines={1} className="shrink font-caption text-caption text-text-muted">{label}</Text>
        <View className={`w-7 h-7 rounded-lg items-center justify-center ${MT[tone][0]}`}>
          <Icon name={icon} className={`${MT[tone][1]} text-[16px]`} />
        </View>
      </View>
      <View className="flex-row items-end justify-between gap-1">
        <View className="shrink">
          <Text numberOfLines={1} className={valueClass ?? 'font-headline-lg text-headline-lg text-on-surface'}>{value}</Text>
          {sub ? <Text numberOfLines={1} className="font-label-sm text-[11px] text-text-muted mt-0.5">{sub}</Text> : null}
        </View>
        {badge ? (
          <View className="bg-warning-soft px-1.5 py-0.5 rounded-full">
            <Text className="text-warning-amber font-label-sm text-[10px] font-bold uppercase tracking-wider">{badge}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Tool({ icon, title, sub, onPress, trailing = 'chevron_right' }: { icon: IconName; title: string; sub: string; onPress: () => void; trailing?: IconName }): ReactNode {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="flex-row items-center justify-between p-space-sm rounded-lg active:bg-surface-alt gap-2">
      <View className="flex-row items-center gap-space-md min-w-0 flex-1">
        <View className="w-9 h-9 rounded-lg bg-primary-soft items-center justify-center">
          <Icon name={icon} className="text-primary text-[20px]" />
        </View>
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface">{title}</Text>
          <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{sub}</Text>
        </View>
      </View>
      <Icon name={trailing} className="text-text-muted text-[20px]" />
    </Pressable>
  );
}
