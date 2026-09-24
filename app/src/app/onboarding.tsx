import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, type IconName } from '@/components/ui';
import { t, type TKey } from '@/i18n';
import { KEYS, kv } from '@/lib/storage';
import { useUserLocation } from '@/providers/LocationProvider';
import { useAppTheme } from '@/theme';

const SLIDES: { icon: IconName; title: TKey; body: TKey }[] = [
  { icon: 'storefront-outline', title: 'onboarding.slide1Title', body: 'onboarding.slide1Body' },
  { icon: 'calendar-outline', title: 'onboarding.slide2Title', body: 'onboarding.slide2Body' },
  { icon: 'qr-code-outline', title: 'onboarding.slide3Title', body: 'onboarding.slide3Body' },
];

export default function Onboarding() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const { refresh } = useUserLocation();
  const [index, setIndex] = useState(0);
  const [askLocation, setAskLocation] = useState(false);
  const list = useRef<FlatList>(null);
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const finish = () => {
    kv.set(KEYS.onboarded, '1');
    router.replace('/(tabs)');
  };

  // Prominent disclosure before the OS location prompt (Play user-data policy).
  if (askLocation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center', gap: 20 }}>
        <View style={{ alignSelf: 'center', width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="location" size={52} color={colors.primary} />
        </View>
        <Text variant="h1" align="center">{t('onboarding.locationTitle')}</Text>
        <Text color="textMuted" align="center">{t('onboarding.locationBody')}</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          <Button title={t('onboarding.allowLocation')} icon="navigate" onPress={async () => { await refresh(true); finish(); }} fullWidth />
          <Button title={t('onboarding.notNow')} variant="ghost" onPress={finish} fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  const last = index === SLIDES.length - 1;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 16 }}>
        <Button title={t('onboarding.skip')} variant="ghost" size="sm" onPress={() => setAskLocation(true)} />
      </View>
      <FlatList
        ref={list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={{ width, padding: 32, justifyContent: 'center', gap: 20 }}>
            <View style={{ alignSelf: 'center', width: 200, height: 200, borderRadius: 48, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={item.icon} size={96} color={colors.primary} />
            </View>
            <Text variant="display" align="center">{t(item.title)}</Text>
            <Text color="textMuted" align="center">{t(item.body)}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        {SLIDES.map((s, i) => (
          <View key={s.title} style={{ height: 8, width: i === index ? 24 : 8, borderRadius: 4, backgroundColor: i === index ? colors.primary : colors.border }} />
        ))}
      </View>
      <View style={{ padding: 16 }}>
        <Button
          title={last ? t('onboarding.getStarted') : t('common.continue')}
          onPress={() => (last ? setAskLocation(true) : list.current?.scrollToIndex({ index: index + 1 }))}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
