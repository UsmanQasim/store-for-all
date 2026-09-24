import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Icon, Image, Text, type IconName } from '@/components/nw';
import { CustomerScreen } from '@/components/shell';
import { EmptyState, LoadingState } from '@/components/ui';
import { t } from '@/i18n';
import { open } from '@/lib/links';
import { PAYMENT_LABELS } from '@/lib/payments';
import { usePaymentMethods } from '@/services/catalog';
import { useShop } from '@/services/shops';
import type { PaymentMethod, PaymentMethodType } from '@/types/models';

const WALLETS: PaymentMethodType[] = ['jazzcash', 'easypaisa', 'sadapay', 'nayapay'];

function meta(m: PaymentMethod): { icon: IconName; sub: string; badge?: [string, 'success' | 'neutral' | 'primary']; numberLabel: string } {
  if (WALLETS.includes(m.type)) return { icon: 'account_balance_wallet', sub: 'Instant mobile wallet', numberLabel: 'Account / Mobile Number' };
  if (m.type === 'bank_account') return { icon: 'account_balance', sub: [m.bank_name, 'Bank transfer'].filter(Boolean).join(' • '), badge: ['Direct IBFT', 'neutral'], numberLabel: 'Account Number' };
  if (m.type === 'raast') return { icon: 'bolt', sub: 'State Bank of Pakistan zero-fee rail', badge: ['Zero Fee', 'primary'], numberLabel: 'Raast ID / Phone' };
  if (m.type === 'upi') return { icon: 'bolt', sub: 'Instant UPI transfer', numberLabel: 'UPI ID' };
  if (m.type === 'paypal' || m.type === 'wise') return { icon: 'payments', sub: 'International transfer', numberLabel: 'Email / Handle' };
  return { icon: 'payments', sub: 'Direct payment', numberLabel: 'Account' };
}

const BADGE = { success: ['bg-success-soft', 'text-success-green font-semibold'], neutral: ['bg-surface-alt', 'text-on-surface-variant'], primary: ['bg-primary-soft', 'text-primary font-semibold'] } as const;

/** C06 — Pay the shop (off-app, P2P). */
export default function Pay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shop = useShop(id);
  const methods = usePaymentMethods(shop.data?.id);

  if (shop.isLoading || methods.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return null;

  const tellShop = () => {
    const msg = `Assalam-o-Alaikum ${s.name}, I have sent you a payment. Sharing the screenshot here.`;
    if (s.whatsapp) open.whatsapp(s.whatsapp, msg, s.country_code);
    else if (s.phone) open.call(s.phone);
    else Alert.alert(t('pay.disclaimer'));
  };

  return (
    <CustomerScreen subtitle={t('shop.pay')} contentClassName="px-margin pb-6">
      {/* Top bar */}
      <View className="flex-row items-center justify-between py-space-sm mb-space-sm">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} className="w-12 h-12 -ml-2 rounded-full items-center justify-center active:bg-surface-container-high">
          <Icon name="arrow_back" className="text-on-surface text-[24px]" />
        </Pressable>
        <Text className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Direct Settlement</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Help" onPress={() => Alert.alert(t('shop.pay'), t('pay.subtitle'))} className="w-12 h-12 -mr-2 rounded-full items-center justify-center">
          <Icon name="help_outline" className="text-on-surface-variant text-[22px]" />
        </Pressable>
      </View>

      {/* Header */}
      <View className="items-center mb-space-xl">
        <View className="relative mb-space-md">
          <View className="w-[72px] h-[72px] rounded-full overflow-hidden bg-primary-soft shadow-md items-center justify-center">
            {s.logo_url ? <Image source={{ uri: s.logo_url }} className="w-full h-full" /> : <Text className="font-headline-lg text-primary">{s.name[0]}</Text>}
          </View>
          <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success-green items-center justify-center shadow-sm">
            <Icon name="verified" fill className="text-on-primary text-[14px]" />
          </View>
        </View>
        <Text className="text-center font-headline-lg text-headline-lg text-on-surface">{t('pay.title', { shop: s.name })}</Text>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Icon name="lock" className="text-primary text-[16px]" />
          <Text className="text-primary font-label-sm text-label-sm">Peer-to-Peer Direct Transfer</Text>
        </View>
        <Text className="text-center font-caption text-caption text-text-muted mt-2 max-w-[320px]">{t('pay.subtitle')}</Text>
      </View>

      {/* Methods */}
      <View className="gap-space-lg mb-space-xl">
        {methods.data?.length ? (
          methods.data.map((m) => {
            const x = meta(m);
            const badge = m.is_primary ? (['Primary', 'success'] as const) : x.badge;
            return (
              <View key={m.id} className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
                <View className="flex-row items-center justify-between pb-space-xs">
                  <View className="flex-row items-center gap-space-sm flex-1">
                    <View className="w-9 h-9 rounded-lg bg-surface-container items-center justify-center">
                      <Icon name={x.icon} className="text-primary text-[22px]" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline-sm text-headline-sm text-on-surface leading-none">{PAYMENT_LABELS[m.type]}</Text>
                      <Text numberOfLines={1} className="font-label-sm text-label-sm text-text-muted">{x.sub}</Text>
                    </View>
                  </View>
                  {badge ? (
                    <View className={`${BADGE[badge[1]][0]} px-2.5 py-1 rounded-full`}>
                      <Text className={`${BADGE[badge[1]][1]} font-label-sm text-label-sm uppercase tracking-wider`}>{badge[0]}</Text>
                    </View>
                  ) : null}
                </View>
                <View className="gap-2.5">
                  <CopyField label={t('pay.accountTitle')} value={m.account_title} />
                  {m.account_number ? <CopyField label={x.numberLabel} value={m.account_number} mono /> : null}
                  {m.iban ? <CopyField label={t('pay.iban')} value={m.iban.replace(/(.{4})/g, '$1 ').trim()} copyValue={m.iban} mono small /> : null}
                </View>
                {m.note ? <Text className="font-caption text-caption text-text-muted">{m.note}</Text> : null}
                {m.qr_image_url ? (
                  <View className="flex-row items-center gap-space-md bg-surface-container-low p-space-md rounded-lg">
                    <View className="w-16 h-16 rounded-md bg-surface-card p-1 shadow-sm">
                      <Image source={{ uri: m.qr_image_url }} className="w-full h-full" contentFit="contain" accessibilityLabel={`${PAYMENT_LABELS[m.type]} QR`} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline-sm text-headline-sm text-on-surface">{[m.bank_name, PAYMENT_LABELS[m.type]].filter(Boolean).join(' ')} QR</Text>
                      <Text className="font-caption text-caption text-text-muted">Scan it inside any bank or wallet app to pay without typing details.</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <EmptyState icon="account_balance_wallet" title={t('pay.none')} />
        )}
      </View>

      {/* Safety */}
      <View className="bg-warning-soft rounded-xl p-space-md flex-row items-start gap-space-sm mb-space-xl shadow-sm">
        <Icon name="shield" fill className="text-warning-amber text-[24px] mt-0.5" />
        <View className="flex-1">
          <Text className="font-headline-sm text-headline-sm text-on-secondary-container">Safety Check</Text>
          <Text className="font-caption text-caption text-on-secondary-container mt-0.5">{t('pay.disclaimer')} Show the screenshot at the counter.</Text>
        </View>
      </View>

      {methods.data?.length ? (
        <Pressable accessibilityRole="button" onPress={tellShop} className="w-full h-[52px] rounded-xl bg-surface-card flex-row items-center justify-center gap-space-sm shadow-md active:bg-surface-alt">
          <Icon name="receipt_long" fill className="text-primary text-[22px]" />
          <Text className="text-on-surface font-body-lg text-body-lg font-semibold">I have paid • Tell the shop</Text>
        </Pressable>
      ) : null}
    </CustomerScreen>
  );
}

function CopyField({ label, value, copyValue, mono, small }: { label: string; value: string; copyValue?: string; mono?: boolean; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await Clipboard.setStringAsync(copyValue ?? value);
    Haptics.selectionAsync().catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <View className="bg-surface-alt rounded-lg p-space-md flex-row items-center justify-between gap-space-sm">
      <View className="flex-1 min-w-0">
        <Text className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">{label}</Text>
        <Text selectable numberOfLines={1} className={`${small ? 'font-caption text-caption' : 'font-body-lg text-body-lg'} text-on-surface font-semibold ${mono ? 'tracking-wider' : ''}`} style={mono ? { fontVariant: ['tabular-nums'] } : undefined}>
          {value}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('common.copy')} ${label}`}
        onPress={copy}
        className={`min-h-[40px] px-3.5 rounded-lg flex-row items-center gap-1 shadow-sm ${copied ? 'bg-success-green' : 'bg-surface-card active:opacity-80'}`}
      >
        <Icon name={copied ? 'check' : 'content_copy'} className={`${copied ? 'text-on-primary' : 'text-primary'} text-[16px]`} />
        <Text className={`${copied ? 'text-on-primary' : 'text-primary'} font-label-sm text-label-sm font-semibold`}>{copied ? `${t('common.copied')} ✓` : t('common.copy')}</Text>
      </Pressable>
    </View>
  );
}
