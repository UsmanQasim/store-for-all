import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Icon, SafeAreaView, Text, type IconName } from '@/components/nw';
import { t } from '@/i18n';
import { KEYS, kv } from '@/lib/storage';
import { useUserLocation } from '@/providers/LocationProvider';

/** A01 — Welcome, then A02 — location disclosure (shown before the OS prompt). */
export default function Onboarding() {
  const { refresh } = useUserLocation();
  const [next, setNext] = useState<null | 'customer' | 'merchant'>(null);

  const finish = (merchant: boolean) => {
    kv.set(KEYS.onboarded, '1');
    router.replace('/(tabs)');
    if (merchant) router.push('/business/create');
  };

  if (next) {
    return (
      <SafeAreaView className="flex-1 bg-surface px-margin justify-center gap-space-lg">
        <View className="self-center w-40 h-40 rounded-full bg-primary-soft items-center justify-center">
          <View className="w-20 h-20 rounded-2xl bg-surface-card shadow-sm items-center justify-center">
            <Icon name="location_on" fill className="text-primary text-[42px]" />
          </View>
        </View>
        <Text className="text-center font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('onboarding.locationTitle')}</Text>
        <Text className="text-center font-body-md text-body-md text-text-muted">{t('onboarding.locationBody')}</Text>
        <View className="gap-space-sm mt-space-md">
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              await refresh(true);
              finish(next === 'merchant');
            }}
            className="w-full h-[52px] rounded-xl bg-primary flex-row items-center justify-center gap-space-xs shadow-md active:bg-primary-pressed"
          >
            <Icon name="my_location" className="text-on-primary text-[20px]" />
            <Text className="text-on-primary font-body-lg text-body-lg">{t('onboarding.allowLocation')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => finish(next === 'merchant')} className="w-full h-[52px] rounded-xl items-center justify-center active:bg-surface-container">
            <Text className="text-primary font-body-lg text-body-lg">{t('onboarding.notNow')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-margin pb-space-xl">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-space-md pb-space-sm">
          <View className="flex-row items-center gap-space-sm flex-1">
            <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center shadow-sm">
              <Icon name="storefront" fill className="text-on-primary text-[22px]" />
            </View>
            <View className="min-w-0">
              <Text className="font-headline-sm text-headline-sm text-primary tracking-tight font-extrabold">{t('common.appName')}</Text>
              <Text className="font-caption text-caption text-text-muted">آپ کی اپنی دکان • Your Market</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setNext('customer')} className="h-10 px-space-md rounded-full bg-surface-container items-center justify-center active:bg-surface-variant">
            <Text className="font-label-sm text-label-sm text-text-muted">{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View className="items-center mt-space-md mb-space-lg">
          <View className="w-40 h-40 rounded-full bg-primary-soft items-center justify-center shadow-sm mb-space-lg">
            <View className="w-20 h-20 rounded-2xl bg-surface-card shadow-sm items-center justify-center">
              <Icon name="storefront" fill className="text-primary text-[42px]" />
              <View className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary-container items-center justify-center shadow-sm">
                <Icon name="shopping_bag" fill className="text-on-secondary-container text-[18px]" />
              </View>
              <View className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-primary-container items-center justify-center shadow-sm">
                <Icon name="schedule" className="text-on-primary text-[18px]" />
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-center gap-1.5 mb-space-md">
            <View className="w-6 h-2 rounded-full bg-primary" />
            <View className="w-2 h-2 rounded-full bg-surface-variant" />
            <View className="w-2 h-2 rounded-full bg-surface-variant" />
          </View>
          <Text className="text-center font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">Every shop around you, in one app.</Text>
          <Text className="text-center font-body-md text-body-md text-text-muted max-w-sm px-space-xs">
            Book appointments at your local barber, pre-order groceries from your kiryana dukaandar, and scan counter QR codes with 0% fees.
          </Text>
        </View>

        {/* Value props */}
        <View className="gap-space-sm mb-space-xl">
          <Prop icon="content_cut" boxBg="bg-primary-soft" tint="text-primary" title="Skip the Wait" pill="Instant" pillCls={['bg-success-soft', 'text-success-green']} body="Reserve chairs at nearby salons, barbers, and clinics without standing in chaotic lines." />
          <Prop icon="local_grocery_store" boxBg="bg-accent-soft" tint="text-secondary" title="Pre-order Ration" pill="Ready" pillCls={['bg-warning-soft', 'text-warning-amber']} body="Have your daily atta, ghee, and sabzi packed beforehand for speedy pickup or doorstep delivery." />
          <Prop icon="qr_code_scanner" boxBg="bg-info-soft" tint="text-tertiary" title="Direct 0% QR Pay" pill="0% Fee" pillCls={['bg-info-soft', 'text-tertiary']} body="Pay shopkeepers directly via Raast, JazzCash, or bank transfer with zero middleman deductions." />
        </View>

        {/* Trust */}
        <View className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex-row items-center gap-space-md mb-space-xl">
          <View className="w-10 h-10 rounded-full bg-surface-card items-center justify-center shadow-sm">
            <Icon name="verified" className="text-primary text-[22px]" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Free for shops & customers</Text>
            <Text className="font-caption text-caption text-text-muted">From Saddar to Gulberg, bring your neighbourhood online.</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-space-sm pt-space-xs">
          <Pressable accessibilityRole="button" onPress={() => setNext('customer')} className="w-full h-[52px] rounded-xl bg-primary flex-row items-center justify-center gap-space-xs shadow-md active:bg-primary-pressed">
            <Text className="text-on-primary font-body-lg text-body-lg">Get Started / Continue</Text>
            <Icon name="arrow_forward" className="text-on-primary text-[20px]" />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setNext('merchant')} className="w-full h-[52px] rounded-xl bg-accent-soft flex-row items-center justify-center gap-space-xs shadow-sm active:bg-warning-soft">
            <Icon name="store" className="text-[20px] text-secondary" />
            <Text className="text-on-secondary-fixed font-body-lg text-body-lg">I am a Shopkeeper (Register My Shop)</Text>
          </Pressable>
          <View className="flex-row items-center justify-center gap-space-xs mt-space-xs">
            <Icon name="language" className="text-text-muted text-[16px]" />
            <Text className="text-center font-caption text-caption text-text-muted">Available in English & اردو • Zero platform commission</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Prop({ icon, boxBg, tint, title, pill, pillCls, body }: { icon: IconName; boxBg: string; tint: string; title: string; pill: string; pillCls: [string, string]; body: string }) {
  return (
    <View className="flex-row items-start gap-space-md p-space-md rounded-xl bg-surface-card shadow-sm">
      <View className={`w-12 h-12 rounded-xl items-center justify-center ${boxBg}`}>
        <Icon name={icon} className={`${tint} text-[26px]`} />
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-space-xs mb-0.5 flex-wrap">
          <Text className="font-headline-sm text-headline-sm text-on-surface">{title}</Text>
          <View className={`${pillCls[0]} px-2 py-0.5 rounded-full`}>
            <Text className={`${pillCls[1]} font-label-sm text-label-sm`}>{pill}</Text>
          </View>
        </View>
        <Text className="font-caption text-caption text-text-muted">{body}</Text>
      </View>
    </View>
  );
}
