import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Badge, Button, EmptyState, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { PAYMENT_LABELS } from '@/lib/payments';
import { usePaymentMethods } from '@/services/catalog';
import { useAppTheme } from '@/theme';

export default function Payments() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors, radius } = useAppTheme();
  const q = usePaymentMethods(shopId);
  const add = () => router.push({ pathname: '/business/[shopId]/payment', params: { shopId } });

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Button title={t('business.addPayment')} icon="add" onPress={add} fullWidth />
          {q.data?.length ? <Button title={t('business.qr')} icon="qr-code-outline" variant="secondary" onPress={() => router.push(`/business/${shopId}/qr`)} fullWidth /> : null}
        </View>
      }
    >
      <Stack.Screen options={{ title: t('business.payments') }} />
      <Text color="textMuted">{t('pay.subtitle')}</Text>
      {q.data?.length ? (
        q.data.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => router.push({ pathname: '/business/[shopId]/payment', params: { shopId, paymentId: m.id } })}
            accessibilityRole="button"
            style={{ padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="h3" style={{ flex: 1 }}>{PAYMENT_LABELS[m.type]}</Text>
              {m.is_primary ? <Badge label={t('business.primary')} tone="primary" /> : null}
            </View>
            <Text>{m.account_title}</Text>
            <Text variant="caption" color="textMuted">{m.account_number ?? m.iban}</Text>
          </Pressable>
        ))
      ) : q.isLoading ? null : (
        <EmptyState icon="wallet-outline" title={t('pay.none')} />
      )}
    </Screen>
  );
}
