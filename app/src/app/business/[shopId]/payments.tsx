import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import { Icon, Text, type IconName } from '@/components/nw';
import { BusinessScreen } from '@/components/shell';
import { EmptyState, LoadingState } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { PAYMENT_LABELS } from '@/lib/payments';
import { useDeletePayment, usePaymentMethods, useSavePayment } from '@/services/catalog';
import { useShop } from '@/services/shops';
import type { PaymentMethod, PaymentMethodType } from '@/types/models';

const WALLETS: PaymentMethodType[] = ['jazzcash', 'easypaisa', 'sadapay', 'nayapay'];

function look(m: PaymentMethod): { icon: IconName; box: string; tint: string; title: string; sub: string; numberLabel: string } {
  if (WALLETS.includes(m.type)) return { icon: 'account_balance_wallet', box: 'bg-surface-container-high', tint: 'text-danger-red', title: `${PAYMENT_LABELS[m.type]} Mobile Wallet`, sub: 'Instant mobile wallet', numberLabel: 'MOBILE / ACCOUNT NO' };
  if (m.type === 'bank_account') return { icon: 'account_balance', box: 'bg-surface-container-high', tint: 'text-primary', title: m.bank_name || PAYMENT_LABELS.bank_account, sub: 'Bank transfer • IBFT', numberLabel: 'ACCOUNT NUMBER' };
  if (m.type === 'raast') return { icon: 'bolt', box: 'bg-warning-soft', tint: 'text-warning-amber', title: 'Raast Instant Pay', sub: 'Instant 0-fee national rail', numberLabel: 'RAAST ID / PHONE NUMBER' };
  if (m.type === 'upi') return { icon: 'bolt', box: 'bg-warning-soft', tint: 'text-warning-amber', title: 'UPI', sub: 'Instant UPI transfer', numberLabel: 'UPI ID' };
  return { icon: 'payments', box: 'bg-surface-container-high', tint: 'text-primary', title: PAYMENT_LABELS[m.type], sub: 'Direct payment', numberLabel: 'ACCOUNT / HANDLE' };
}

/** B05 — Payment methods & QR. */
export default function Payments() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const q = usePaymentMethods(shopId);
  const save = useSavePayment(shopId);
  const del = useDeletePayment(shopId);
  const add = () => router.push({ pathname: '/business/[shopId]/payment', params: { shopId } });
  const active = (q.data ?? []).filter((m) => m.is_active).length;

  if (shop.isLoading || q.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return null;

  const patch = (m: PaymentMethod, p: Partial<PaymentMethod>) => {
    const { id, ...rest } = m;
    save.mutateAsync({ id, ...rest, ...p }).catch((e) => Alert.alert(toAppError(e).message));
  };
  const more = (m: PaymentMethod) =>
    Alert.alert(look(m).title, undefined, [
      ...(m.is_primary ? [] : [{ text: 'Make primary', onPress: () => patch(m, { is_primary: true }) }]),
      { text: t('common.edit'), onPress: () => router.push({ pathname: '/business/[shopId]/payment', params: { shopId, paymentId: m.id } }) },
      { text: t('common.delete'), style: 'destructive' as const, onPress: () => del.mutateAsync(m.id).catch((e) => Alert.alert(toAppError(e).message)) },
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);

  return (
    <BusinessScreen
      active="manage"
      shopId={s.id}
      shopName={s.name}
      section={t('business.payments')}
      footer={
        <View className="gap-space-xs">
          <Pressable accessibilityRole="button" onPress={add} className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-md active:bg-primary-pressed">
            <Icon name="add" className="text-on-primary text-[22px]" />
            <Text className="text-on-primary font-body-lg text-body-lg">{t('business.addPayment')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/business/${s.id}/qr`)} className="w-full h-[48px] bg-surface-card rounded-xl flex-row items-center justify-center gap-2 shadow-sm active:bg-surface-alt">
            <Icon name="print" className="text-[20px] text-secondary" />
            <Text className="text-on-surface font-body-lg text-body-lg">Generate Counter QR Poster</Text>
          </Pressable>
        </View>
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-space-sm flex-1">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/business'))} className="w-10 h-10 -ml-2 rounded-full items-center justify-center">
            <Icon name="arrow_back" className="text-on-surface text-[24px]" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Payment Methods & QR</Text>
            <Text numberOfLines={1} className="font-caption text-caption text-text-muted">{s.name} • P2P Settlement</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Help" onPress={() => Alert.alert('Payment methods', 'These details appear on your shop page and counter QR poster. Customers pay you directly in their wallet or bank app.')} className="w-9 h-9 rounded-full items-center justify-center bg-primary-soft">
          <Icon name="help_outline" className="text-primary text-[20px]" />
        </Pressable>
      </View>

      {/* Notice */}
      <View className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
        <View className="flex-row items-start gap-space-sm">
          <View className="w-8 h-8 rounded-full bg-primary-soft items-center justify-center mt-0.5">
            <Icon name="verified_user" fill className="text-primary text-[20px]" />
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <Text className="font-body-lg text-body-lg text-on-surface font-bold">Direct Peer-to-Peer Payments</Text>
              <View className="bg-success-soft px-1.5 py-0.5 rounded-full">
                <Text className="text-success-green font-label-sm text-[11px] font-bold uppercase tracking-wider">0% Fee</Text>
              </View>
            </View>
            <Text className="font-caption text-caption text-text-muted leading-relaxed">
              Customers scan or copy these details to pay directly into your wallet or bank account. {t('common.appName')} never touches your revenue and takes 0% commission.
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-caption text-caption text-text-muted uppercase tracking-wider font-semibold">Active Receiving Channels ({active})</Text>
        {active ? (
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-success-green" />
            <Text className="font-caption text-caption text-primary font-semibold">Online for Customers</Text>
          </View>
        ) : null}
      </View>

      <View className="gap-space-md">
        {q.data?.length ? (
          q.data.map((m) => <MethodCard key={m.id} m={m} onToggle={(v) => patch(m, { is_active: v })} onEdit={() => router.push({ pathname: '/business/[shopId]/payment', params: { shopId, paymentId: m.id } })} onMore={() => more(m)} />)
        ) : (
          <EmptyState icon="account_balance_wallet" title={t('pay.none')} body="Add JazzCash, Easypaisa, Raast or bank details so customers can pay you." />
        )}

        <Pressable accessibilityRole="button" onPress={add} className="w-full bg-surface-container-low rounded-xl p-space-lg flex-row items-center justify-between gap-space-sm shadow-sm active:opacity-80">
          <View className="flex-row items-center gap-space-md flex-1">
            <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
              <Icon name="add_circle" className="text-primary text-[24px]" />
            </View>
            <View className="flex-1">
              <Text numberOfLines={1} className="font-body-lg text-body-lg text-on-surface font-bold">Add Another Method</Text>
              <Text numberOfLines={1} className="font-caption text-caption text-text-muted">Easypaisa, SadaPay, NayaPay, or Bank IBAN</Text>
            </View>
          </View>
          <Icon name="chevron_right" className="text-text-muted text-[20px]" />
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => router.push(`/business/${s.id}/qr`)} className="bg-accent-soft rounded-xl p-space-md flex-row items-center gap-space-md">
          <View className="w-12 h-12 rounded-lg bg-surface-card items-center justify-center shadow-sm">
            <Icon name="qr_code_scanner" className="text-warning-amber text-[28px]" />
          </View>
          <View className="flex-1">
            <Text className="font-body-lg text-body-lg text-on-surface font-bold">Printable Counter Standee</Text>
            <Text className="font-caption text-caption text-text-muted">Generate a ready-to-print A4 poster with your shop QR and payment details.</Text>
          </View>
        </Pressable>
      </View>
    </BusinessScreen>
  );
}

function MethodCard({ m, onToggle, onEdit, onMore }: { m: PaymentMethod; onToggle: (v: boolean) => void; onEdit: () => void; onMore: () => void }) {
  const l = look(m);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (v: string) => {
    await Clipboard.setStringAsync(v);
    setCopied(v);
    setTimeout(() => setCopied(null), 1400);
  };
  const rows: [string, string, 'title' | 'num' | 'iban'][] = [
    ['ACCOUNT TITLE', m.account_title, 'title'],
    ...(m.account_number ? ([[l.numberLabel, m.account_number, 'num']] as [string, string, 'num'][]) : []),
    ...(m.iban ? ([['IBAN', m.iban.replace(/(.{4})/g, '$1 ').trim(), 'iban']] as [string, string, 'iban'][]) : []),
  ];
  return (
    <View className={`bg-surface-card rounded-xl p-space-md shadow-sm overflow-hidden ${m.is_active ? '' : 'opacity-60'}`}>
      {m.is_primary ? <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" /> : null}
      <View className="flex-row items-center justify-between gap-space-sm mb-space-md pl-1">
        <View className="flex-row items-center gap-space-sm flex-1 min-w-0">
          <View className={`w-11 h-11 rounded-lg items-center justify-center ${l.box}`}>
            <Icon name={l.icon} fill={m.type === 'raast'} className={`text-[26px] ${l.tint}`} />
          </View>
          <View className="flex-1 min-w-0">
            <Text numberOfLines={1} className="font-headline-sm text-headline-sm text-on-surface">{l.title}</Text>
            {m.is_primary ? (
              <View className="self-start bg-success-soft px-2 py-0.5 rounded-full mt-0.5">
                <Text className="text-success-green font-label-sm text-[11px] font-bold">PRIMARY / DEFAULT</Text>
              </View>
            ) : (
              <Text className="font-caption text-caption text-text-muted">{l.sub}</Text>
            )}
          </View>
        </View>
        <Switch value={m.is_active} onValueChange={onToggle} trackColor={{ true: '#00543b', false: '#bec9c1' }} thumbColor="#FFFFFF" accessibilityLabel={`Show ${l.title} to customers`} />
      </View>
      <View className="bg-surface-alt rounded-lg p-space-md gap-space-sm mb-space-sm">
        {rows.map(([label, value, kind], i) => (
          <View key={label}>
            {i > 0 ? <View className="h-px bg-surface-container mb-space-sm" /> : null}
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1 min-w-0">
                <Text className="font-label-sm text-label-sm text-text-muted">{label}</Text>
                <Text numberOfLines={1} className={kind === 'title' ? 'font-body-lg text-body-lg text-on-surface font-semibold' : kind === 'iban' ? 'font-caption text-caption text-on-surface tracking-wide font-semibold' : `font-price-display text-price-display tracking-wider font-bold ${m.type === 'raast' ? 'text-primary' : 'text-on-surface'}`}>
                  {value}
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`${t('common.copy')} ${label}`} onPress={() => copy(value)} className="h-9 px-3 rounded-md bg-surface-card flex-row items-center gap-1 shadow-sm">
                <Icon name={copied === value ? 'check' : 'content_copy'} className="text-primary text-[16px]" />
                <Text className="text-primary text-label-sm font-label-sm">{copied === value ? t('common.copied') : t('common.copy')}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-between pt-1 gap-2">
        {m.qr_image_url ? (
          <View className="flex-row items-center gap-1 bg-success-soft px-2 py-0.5 rounded-full">
            <Icon name="qr_code_2" className="text-success-green text-[14px]" />
            <Text className="text-success-green text-caption font-caption font-semibold">QR Attached ✓</Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5 flex-1 min-w-0">
            <Icon name="storefront" fill className="text-[16px] text-success-green" />
            <Text numberOfLines={1} className="text-text-muted text-caption font-caption shrink">{m.note || 'Counter checkout & shop profile'}</Text>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <Pressable accessibilityRole="button" onPress={onEdit} className="px-2 py-1 rounded min-h-[36px] justify-center">
            <Text className="text-primary font-caption text-caption font-bold">{t('common.edit')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={onMore} className="w-8 h-8 rounded-full items-center justify-center">
            <Icon name="more_vert" className="text-text-muted text-[18px]" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
