import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, SafeAreaView, Text } from '@/components/nw';
import { CustomerScreen } from '@/components/shell';
import { t } from '@/i18n';
import { parseShopSlug } from '@/lib/links';

const BOX = 260;

/** C08 — QR scanner. */
export default function Scan() {
  const focused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [help, setHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [line]);

  const handle = (data: string) => {
    if (handled.current) return;
    const slug = parseShopSlug(data);
    if (!slug) return setError(t('scan.invalid'));
    handled.current = true;
    setError(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.push(`/s/${slug}`);
    setTimeout(() => (handled.current = false), 1500);
  };

  const fromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    try {
      const found = await scanFromURLAsync(res.assets[0].uri, ['qr']);
      if (found[0]) handle(found[0].data);
      else setError(t('scan.invalid'));
    } catch {
      setError(t('scan.invalid'));
    }
  };

  const granted = !!permission?.granted;

  return (
    <CustomerScreen active="scan" subtitle={t('tabs.scan')} scroll={false}>
      <View className="flex-1 bg-inverse-surface overflow-hidden">
        {granted && focused ? (
          <CameraView style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => handle(data)} />
        ) : null}
        {/* Darken everything except the viewfinder */}
        <View className="absolute inset-0 bg-black/45" pointerEvents="none" />

        <View className="flex-1 justify-between items-center">
          {/* Top controls */}
          <View className="w-full px-margin pt-space-md flex-row items-center justify-between">
            <Pressable accessibilityRole="button" accessibilityLabel="How scanning works" onPress={() => setHelp(true)} className="w-12 h-12 rounded-full bg-white/10 items-center justify-center active:bg-white/20">
              <Icon name="info" className="text-white text-[22px]" />
            </Pressable>
            <View className="flex-row items-center gap-space-xs bg-white/15 px-space-md py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-primary-fixed" />
              <Text className="font-headline-sm text-headline-sm text-white tracking-wide">{t('scan.title')}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Flashlight"
              accessibilityState={{ selected: torch }}
              disabled={!granted}
              onPress={() => setTorch((v) => !v)}
              className={`w-12 h-12 rounded-full items-center justify-center ${torch ? 'bg-secondary-container' : 'bg-white/10'}`}
            >
              <Icon name={torch ? 'flash_on' : 'flash_off'} className={`${torch ? 'text-on-surface' : 'text-white'} text-[24px]`} />
            </Pressable>
          </View>

          {/* Viewfinder */}
          <View className="items-center w-full px-margin">
            {granted ? (
              <View style={{ width: BOX, height: BOX }} className="items-center justify-center">
                <View className="absolute inset-0 rounded-xl border-[4px] border-secondary-container" />
                <View className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-[5px] border-l-[5px] border-white rounded-tl-lg" />
                <View className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-[5px] border-r-[5px] border-white rounded-tr-lg" />
                <View className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-[5px] border-l-[5px] border-white rounded-bl-lg" />
                <View className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-[5px] border-r-[5px] border-white rounded-br-lg" />
                <Animated.View
                  style={{ position: 'absolute', left: 12, right: 12, top: 12, transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [0, BOX - 30] }) }] }}
                  className="h-1.5 rounded-full bg-primary-fixed/80"
                />
                <View className="opacity-30">
                  <Icon name="qr_code_2" className="text-white text-[72px]" />
                </View>
              </View>
            ) : (
              <View style={{ width: BOX }} className="items-center gap-3 bg-black/40 rounded-xl p-space-lg">
                <Icon name="photo_camera" className="text-white text-[36px]" />
                <Text className="text-center font-headline-sm text-headline-sm text-white">{t('scan.permissionTitle')}</Text>
                <Text className="text-center font-caption text-caption text-white/80">{t('scan.permissionBody')}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => (permission?.canAskAgain === false ? Linking.openSettings() : requestPermission())}
                  className="h-11 px-5 rounded-full bg-primary-container items-center justify-center mt-1"
                >
                  <Text className="text-on-primary font-body-lg text-body-lg">{permission?.canAskAgain === false ? t('scan.openSettings') : t('scan.grant')}</Text>
                </Pressable>
              </View>
            )}
            <View className="mt-space-lg max-w-[320px] items-center">
              <Text className="text-center font-headline-sm text-headline-sm text-white">{error ?? `Point camera at a ${t('common.appName')} shop QR`}</Text>
              <Text className="text-center font-caption text-caption text-surface-container-high/85 mt-1 leading-snug">Instantly view shop services, pre-order, or get direct payment details</Text>
            </View>
            <View className="mt-space-md flex-row items-center gap-space-xs bg-black/60 px-space-md py-2 rounded-full max-w-[340px]">
              <Icon name="lightbulb" fill className="text-secondary-container text-[18px]" />
              <Text className="font-label-sm text-label-sm text-white/90 shrink">Looking for JazzCash / Raast? Scan the shop poster on counter</Text>
            </View>
          </View>

          {/* Bottom */}
          <View className="w-full px-margin pb-space-xl items-center gap-space-md">
            <Pressable accessibilityRole="button" onPress={fromGallery} className="w-full max-w-[280px] h-[52px] bg-surface-card rounded-full shadow-lg flex-row items-center justify-center gap-space-sm active:opacity-90">
              <Icon name="photo_library" className="text-primary text-[22px]" />
              <Text className="text-on-surface font-body-lg text-body-lg">Upload QR from gallery</Text>
            </Pressable>
            <View className="flex-row items-center gap-space-sm">
              <Icon name="verified" className="text-[16px] text-primary-fixed" />
              <Text className="text-white/70 font-label-sm text-label-sm tracking-wider uppercase shrink">Supports all verified {t('common.appName')} merchant codes</Text>
            </View>
          </View>
        </View>
      </View>

      {/* How it works sheet */}
      <Modal visible={help} transparent animationType="slide" onRequestClose={() => setHelp(false)}>
        <Pressable className="flex-1 bg-black/60" onPress={() => setHelp(false)} accessibilityLabel={t('common.close')} />
        <SafeAreaView edges={['bottom']} className="bg-surface-card rounded-t-3xl p-space-lg gap-space-md">
          <View className="w-12 h-1.5 bg-surface-container-high rounded-full self-center" />
          <View className="flex-row items-center justify-between">
            <Text className="font-headline-sm text-headline-sm text-on-surface">How {t('common.appName')} Scan Works</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => setHelp(false)} className="w-8 h-8 rounded-full bg-surface-container items-center justify-center">
              <Icon name="close" className="text-on-surface text-[20px]" />
            </Pressable>
          </View>
          <View className="gap-space-sm">
            <View className="flex-row items-start gap-space-sm">
              <Icon name="storefront" className="text-primary text-[20px] mt-0.5" />
              <Text className="flex-1 font-body-md text-body-md text-on-surface">
                <Text className="font-body-lg">Kiryana & Services: </Text>Instantly load the shop&apos;s catalogue and prices without waiting in the queue.
              </Text>
            </View>
            <View className="flex-row items-start gap-space-sm">
              <Icon name="account_balance_wallet" className="text-secondary text-[20px] mt-0.5" />
              <Text className="flex-1 font-body-md text-body-md text-on-surface">
                <Text className="font-body-lg">Raast / Wallets: </Text>Shows the shopkeeper&apos;s account title and number for an error-free transfer.
              </Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setHelp(false)} className="h-[52px] w-full rounded-xl bg-primary items-center justify-center mt-space-xs">
            <Text className="text-on-primary font-body-lg text-body-lg">Got it</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </CustomerScreen>
  );
}
