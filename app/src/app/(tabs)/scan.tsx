import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useIsFocused } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState, LoadingState, Text } from '@/components/ui';
import { t } from '@/i18n';
import { parseShopSlug } from '@/lib/links';
import { useAppTheme } from '@/theme';

export default function Scan() {
  const { colors, radius } = useAppTheme();
  const focused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  if (!permission) return <LoadingState />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <EmptyState
          icon="camera-outline"
          title={t('scan.permissionTitle')}
          body={t('scan.permissionBody')}
          action={permission.canAskAgain ? t('scan.grant') : t('scan.openSettings')}
          onAction={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {focused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (handled.current) return;
            const slug = parseShopSlug(data);
            if (!slug) {
              setError(t('scan.invalid'));
              return;
            }
            handled.current = true;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push(`/s/${slug}`);
            setTimeout(() => (handled.current = false), 1500);
          }}
        />
      ) : null}
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', padding: 24 }} pointerEvents="box-none">
        <Text variant="h2" align="center" style={{ color: '#fff' }}>{t('scan.title')}</Text>
        <View style={{ alignSelf: 'center', width: 260, height: 260, borderRadius: radius.xl, borderWidth: 4, borderColor: colors.accent }} />
        <View style={{ gap: 12 }}>
          <Text align="center" style={{ color: '#fff' }}>{error ?? t('scan.hint')}</Text>
          {error ? <Button title={t('common.retry')} variant="secondary" onPress={() => setError(null)} /> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
