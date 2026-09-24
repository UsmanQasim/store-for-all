import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { QrCode } from '@/components/QrCode';
import { Button, Icon, LoadingState, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { config } from '@/lib/config';
import { toAppError } from '@/lib/errors';
import { shareShop, shopPublicUrl } from '@/lib/links';
import { formatAccount, PAYMENT_LABELS, PAYMENT_TONE, posterSteps } from '@/lib/payments';
import { printQrPoster } from '@/lib/qr';
import { usePaymentMethods } from '@/services/catalog';
import { useShop } from '@/services/shops';

/** P01 — Counter QR poster: live preview of the print + download/share. */
export default function ShopQr() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const methods = usePaymentMethods(shopId);
  const [printing, setPrinting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  if (shop.isLoading || !shop.data) return <LoadingState />;
  const s = shop.data;
  const url = shopPublicUrl(s.slug);
  const active = (methods.data ?? []).filter((m) => m.is_active).sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const steps = posterSteps(s, [...new Set(active.map((m) => PAYMENT_LABELS[m.type]))]);
  const place = [s.tagline, s.area && s.city ? `${s.area}, ${s.city}` : s.area ?? s.city].filter(Boolean).join(' • ');

  const copy = async (id: string, value: string) => {
    await Clipboard.setStringAsync(value.replace(/\s/g, ''));
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
  };

  const download = async () => {
    setPrinting(true);
    try {
      await printQrPoster(s, methods.data ?? []);
    } catch (e) {
      Alert.alert(toAppError(e).message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Screen title={t('business.qr')} subtitle={s.name} contentClassName="px-margin pt-space-md pb-space-xl gap-space-lg">
      {/* Poster preview */}
      <View className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
        <View className="bg-primary pt-space-lg pb-space-xl px-space-lg items-center overflow-hidden">
          <View className="absolute -top-12 -right-12 w-36 h-36 bg-primary-container rounded-full opacity-40" />
          <View className="absolute -bottom-10 -left-10 w-28 h-28 bg-secondary-container rounded-full opacity-20" />
          <View className="flex-row items-center gap-space-xs bg-white/15 px-space-md py-1 rounded-full mb-space-sm">
            <Icon name="storefront" fill className="text-secondary-fixed text-[18px]" />
            <Text className="font-headline-sm text-[13px] text-on-primary tracking-wide uppercase">{config.brand.name}</Text>
            <View className="w-1 h-1 rounded-full bg-secondary-fixed" />
            <Text className="font-label-sm text-label-sm text-secondary-fixed font-bold">Scan • Book • Pay</Text>
          </View>
          <Text className="font-display text-[28px] leading-[32px] font-extrabold text-on-primary tracking-tight text-center mt-space-xs">{s.name}</Text>
          {place ? <Text className="font-caption text-caption text-primary-fixed text-center max-w-[320px] mt-space-xs">{place}</Text> : null}
          <View className="mt-space-md flex-row items-center justify-center gap-space-sm">
            {s.rating_count > 0 ? (
              <View className="flex-row items-center gap-1 bg-on-primary-fixed/30 px-space-sm py-0.5 rounded-full">
                <Icon name="star" fill className="text-on-primary text-[14px]" />
                <Text className="text-on-primary font-label-sm text-label-sm">
                  {Number(s.rating_avg).toFixed(1)} ({s.rating_count} reviews)
                </Text>
              </View>
            ) : null}
            <View className="flex-row items-center gap-1 bg-success-soft px-space-sm py-0.5 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-success-green" />
              <Text className="text-primary font-label-sm text-label-sm font-bold">{s.accepts_bookings ? 'BOOK ONLINE' : 'PRE-ORDER ONLINE'}</Text>
            </View>
          </View>
        </View>

        <View className="p-space-lg items-center bg-surface-container-lowest">
          <View className="w-full max-w-[280px] bg-surface-container-lowest p-space-lg rounded-xl shadow-md items-center">
            <View className="absolute top-2 left-2 w-4 h-4 rounded-tl-sm bg-primary/20" />
            <View className="absolute top-2 right-2 w-4 h-4 rounded-tr-sm bg-primary/20" />
            <View className="absolute bottom-2 left-2 w-4 h-4 rounded-bl-sm bg-primary/20" />
            <View className="absolute bottom-2 right-2 w-4 h-4 rounded-br-sm bg-primary/20" />
            <View className="p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
              <QrCode value={url} size={192} color="#00543B" />
              <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                <View className="w-9 h-9 rounded-md bg-surface items-center justify-center">
                  <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                    <Icon name="check" className="text-on-primary text-[16px]" />
                  </View>
                </View>
              </View>
            </View>
            <Text selectable numberOfLines={1} className={`text-primary mt-space-sm font-bold text-center ${url.length > 32 ? 'font-body-md text-body-md' : 'font-headline-sm text-headline-sm tracking-wide'}`}>
              {url.replace(/^https?:\/\//, '')}
            </Text>
            <View className="mt-space-xs bg-primary-soft px-space-md py-1.5 rounded-full flex-row items-center gap-1.5">
              <Icon name="center_focus_strong" className="text-primary text-[16px]" />
              <Text className="font-caption text-caption text-primary font-bold">Point Camera • Tap Link</Text>
            </View>
          </View>

          <View className="w-full mt-space-lg gap-space-xs">
            <Text className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider text-center mb-1">Instant Mobile Self-Service</Text>
            {steps.map((st, i) => (
              <View key={st.title} className="flex-row items-center gap-space-sm bg-surface-container-low p-space-sm rounded-lg">
                <View className="w-8 h-8 rounded-full bg-primary-soft items-center justify-center">
                  <Text className="font-price-display text-price-display text-primary">{i + 1}</Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-body-lg text-body-lg text-on-surface">{st.title}</Text>
                  <Text className="font-caption text-caption text-text-muted">{st.body}</Text>
                </View>
              </View>
            ))}
          </View>

          {active.length ? (
            <View className="w-full mt-space-lg bg-surface-alt p-space-md rounded-xl gap-space-xs">
              <View className="flex-row items-center justify-between pb-space-xs gap-2">
                <View className="flex-row items-center gap-1.5 flex-1">
                  <Icon name="account_balance" fill className="text-primary text-[18px]" />
                  <Text className="flex-1 font-headline-sm text-headline-sm text-on-surface">Direct Bank & Mobile Wallets</Text>
                </View>
                <View className="bg-success-soft px-2 py-0.5 rounded-full">
                  <Text className="font-label-sm text-label-sm text-success-green font-bold">Zero Charges</Text>
                </View>
              </View>
              {active.slice(0, 3).map((m) => {
                const value = formatAccount(m.iban ?? m.account_number);
                return (
                  <View key={m.id} className="bg-surface-container-lowest p-space-sm rounded-lg flex-row items-center justify-between gap-2">
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="font-label-sm text-label-sm font-bold uppercase" style={{ color: PAYMENT_TONE[m.type] }}>
                          {m.bank_name ?? PAYMENT_LABELS[m.type]}
                        </Text>
                        <Text numberOfLines={1} className="flex-1 text-text-muted font-caption text-caption">• {m.account_title}</Text>
                      </View>
                      <Text numberOfLines={1} className={`text-on-surface mt-0.5 font-bold ${value.length > 16 ? 'font-caption text-caption' : 'font-headline-sm text-headline-sm'}`} style={{ fontVariant: ['tabular-nums'] }}>
                        {value}
                      </Text>
                    </View>
                    {value ? (
                      <Pressable onPress={() => copy(m.id, value)} accessibilityRole="button" accessibilityLabel={`Copy ${PAYMENT_LABELS[m.type]}`} className="h-10 px-space-md bg-surface-alt rounded-lg items-center justify-center">
                        <Text className="text-primary font-label-sm text-label-sm font-bold">{copied === m.id ? 'COPIED ✓' : 'COPY'}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <View className="w-full bg-primary-soft py-space-sm px-space-md flex-row items-center justify-center gap-2">
          <Icon name="verified_user" fill className="text-primary text-[18px]" />
          <Text className="flex-1 font-caption text-caption text-primary font-semibold text-center">
            100% direct payment to the shop • {config.brand.name} charges zero shop commission
          </Text>
        </View>
      </View>

      {!active.length ? (
        <View className="bg-warning-soft rounded-xl p-space-md flex-row items-start gap-space-sm">
          <Icon name="info" className="text-warning-amber text-[20px]" />
          <Text className="flex-1 font-caption text-caption text-on-surface">Add a payment method so customers can pay you straight from the poster.</Text>
        </View>
      ) : null}

      {/* Print & distribution */}
      <View className="gap-space-sm">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-headline-sm text-headline-sm text-on-surface">Print & Share</Text>
          <Text className="font-caption text-caption text-text-muted">A4 PDF</Text>
        </View>
        <Button title={printing ? 'Preparing PDF…' : 'Download A4 Print PDF'} icon="print" loading={printing} onPress={download} fullWidth />
        <View className="flex-row gap-space-sm">
          <Button title={t('business.shareLink')} icon="share" variant="secondary" onPress={() => shareShop(s.name, s.slug)} className="flex-1" />
          <Button title={copied === 'url' ? 'Copied ✓' : t('common.copy')} icon="content_copy" variant="secondary" onPress={() => copy('url', url)} className="flex-1" />
        </View>
      </View>

      <View className="bg-accent-soft rounded-xl p-space-md flex-row items-start gap-space-sm">
        <Icon name="lightbulb" fill className="text-secondary text-[22px]" />
        <View className="flex-1">
          <Text className="font-body-lg text-body-lg text-on-secondary-container font-semibold">Counter Placement Tip</Text>
          <Text className="font-caption text-caption text-on-surface-variant">{t('business.qrBody')}</Text>
        </View>
      </View>
    </Screen>
  );
}
