import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { QrCode } from '@/components/QrCode';
import { Button, Card, LoadingState, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { shareShop, shopPublicUrl } from '@/lib/links';
import { printQrPoster } from '@/lib/qr';
import { usePaymentMethods } from '@/services/catalog';
import { useShop } from '@/services/shops';

export default function ShopQr() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const methods = usePaymentMethods(shopId);
  const [printing, setPrinting] = useState(false);
  if (shop.isLoading || !shop.data) return <LoadingState />;
  const s = shop.data;
  const url = shopPublicUrl(s.slug);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('business.qr') }} />
      <Card style={{ alignItems: 'center', gap: 14, paddingVertical: 24 }}>
        <Text variant="h2" align="center">{s.name}</Text>
        <QrCode value={url} size={260} />
        <Text variant="caption" color="textMuted" selectable>{url}</Text>
      </Card>
      <Text color="textMuted" align="center">{t('business.qrBody')}</Text>
      <View style={{ gap: 10 }}>
        <Button
          title={t('business.printPoster')}
          icon="print-outline"
          loading={printing}
          onPress={async () => {
            setPrinting(true);
            try {
              await printQrPoster(s, methods.data ?? []);
            } catch (e) {
              Alert.alert(toAppError(e).message);
            } finally {
              setPrinting(false);
            }
          }}
          fullWidth
        />
        <Button title={t('business.shareLink')} icon="share-social-outline" variant="secondary" onPress={() => shareShop(s.name, s.slug)} fullWidth />
        <Button title={t('common.copy')} icon="copy-outline" variant="ghost" onPress={() => Clipboard.setStringAsync(url)} fullWidth />
      </View>
    </Screen>
  );
}
