import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Avatar, Badge, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { PAYMENT_LABELS } from '@/lib/payments';
import { useShop } from '@/services/shops';
import { usePaymentMethods } from '@/services/catalog';
import { useAppTheme } from '@/theme';

/**
 * The "scan to pay" page. Dukaan only DISPLAYS the shop's own account details;
 * money moves in the customer's wallet/bank app. No in-app payment processing
 * → no Google Play Billing requirement (physical goods/services, paid off-app).
 */
export default function Pay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const shop = useShop(id);
  const methods = usePaymentMethods(shop.data?.id);

  if (shop.isLoading || methods.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return null;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('shop.pay') }} />
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar uri={s.logo_url} name={s.name} size={72} rounded={false} />
        <Text variant="h2" align="center">{t('pay.title', { shop: s.name })}</Text>
        <Text variant="caption" color="textMuted" align="center">{t('pay.subtitle')}</Text>
      </View>

      {methods.data?.length ? (
        methods.data.map((m) => (
          <Card key={m.id} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="h3" style={{ flex: 1 }}>{PAYMENT_LABELS[m.type]}{m.bank_name ? ` · ${m.bank_name}` : ''}</Text>
              {m.is_primary ? <Badge label={t('business.primary')} tone="primary" /> : null}
            </View>
            <CopyField label={t('pay.accountTitle')} value={m.account_title} />
            {m.account_number ? <CopyField label={t('pay.accountNumber')} value={m.account_number} mono /> : null}
            {m.iban ? <CopyField label={t('pay.iban')} value={m.iban} mono /> : null}
            {m.note ? <Text variant="caption" color="textMuted">{m.note}</Text> : null}
            {m.qr_image_url ? <Image source={{ uri: m.qr_image_url }} style={{ width: 220, height: 220, alignSelf: 'center', borderRadius: 12 }} contentFit="contain" accessibilityLabel={`${PAYMENT_LABELS[m.type]} QR`} /> : null}
          </Card>
        ))
      ) : (
        <EmptyState icon="wallet-outline" title={t('pay.none')} />
      )}

      <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.warningSoft, padding: 12, borderRadius: 12 }}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.warning} />
        <Text variant="caption" style={{ flex: 1 }}>{t('pay.disclaimer')}</Text>
      </View>
    </Screen>
  );
}

function CopyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const { colors, radius } = useAppTheme();
  const [copied, setCopied] = useState(false);
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(value);
        Haptics.selectionAsync();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${t('common.copy')} ${label}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 56, borderRadius: radius.md, backgroundColor: colors.surfaceAlt }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="label" color="textMuted">{label.toUpperCase()}</Text>
        <Text variant="bodyStrong" selectable style={mono ? { letterSpacing: 1 } : undefined}>{value}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={colors.primary} />
        <Text variant="caption" color="primary">{copied ? t('common.copied') : t('common.copy')}</Text>
      </View>
    </Pressable>
  );
}
