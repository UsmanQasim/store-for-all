import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopCard } from '@/components/ShopCard';
import { Chip, EmptyState, Input, LoadingState, Text } from '@/components/ui';
import { useDebounced } from '@/hooks/useDebounced';
import { getLocale, t } from '@/i18n';
import { useUserLocation } from '@/providers/LocationProvider';
import { useCategories, useNearbyShops } from '@/services/shops';
import { useAppTheme } from '@/theme';

const RADII = [2, 5, 15, 50];

export default function Explore() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const loc = useUserLocation();
  const categories = useCategories();
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(15);
  const debounced = useDebounced(query, 300);

  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  const shops = useNearbyShops({ lat: loc.coords?.lat, lng: loc.coords?.lng, radiusM: radiusKm * 1000, category, query: debounced, limit: 50 });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text variant="h1">{t('explore.title')}</Text>
        <Input value={query} onChangeText={setQuery} placeholder={t('home.searchPlaceholder')} leftIcon="search" returnKeyType="search" autoCorrect={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('explore.all')} selected={!category} onPress={() => setCategory(null)} />
          {(categories.data ?? []).map((c) => (
            <Chip key={c.slug} label={getLocale() === 'ur' ? c.name_ur : c.name_en} icon={c.icon as never} selected={category === c.slug} onPress={() => setCategory(category === c.slug ? null : c.slug)} />
          ))}
        </ScrollView>
        {loc.coords ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {RADII.map((r) => <Chip key={r} label={t('explore.radius', { km: r })} selected={radiusKm === r} onPress={() => setRadiusKm(r)} />)}
          </ScrollView>
        ) : null}
      </View>
      {shops.isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={shops.data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 14, paddingBottom: 40 }}
          renderItem={({ item }) => <ShopCard shop={item} />}
          ListHeaderComponent={shops.data?.length ? <Text variant="caption" color="textMuted">{t('explore.results', { n: shops.data.length })}</Text> : null}
          ListEmptyComponent={<EmptyState icon="search-outline" title={t('explore.empty')} />}
        />
      )}
    </SafeAreaView>
  );
}
