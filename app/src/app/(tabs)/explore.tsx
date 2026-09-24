import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Icon, Text, TextInput, type IconName } from '@/components/nw';
import { CustomerScreen } from '@/components/shell';
import { ExploreShopCard } from '@/components/ShopCard';
import { EmptyState } from '@/components/ui';
import { useDebounced } from '@/hooks/useDebounced';
import { t } from '@/i18n';
import { categoryIcon, categoryName } from '@/lib/categories';
import { useUserLocation } from '@/providers/LocationProvider';
import { useCategories, useNearbyShops } from '@/services/shops';

const RADII = [2, 5, 15, 50];

/** C02 — Explore / search. */
export default function Explore() {
  const params = useLocalSearchParams<{ category?: string }>();
  const loc = useUserLocation();
  const categories = useCategories();
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(15);
  const debounced = useDebounced(query, 300);
  const area = loc.label?.split(',')[0];

  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  const shops = useNearbyShops({ lat: loc.coords?.lat, lng: loc.coords?.lng, radiusM: radiusKm * 1000, category, query: debounced, limit: 50 });
  const catBySlug = new Map((categories.data ?? []).map((c) => [c.slug, c]));
  const n = shops.data?.length ?? 0;

  return (
    <CustomerScreen active="explore" subtitle={t('tabs.explore')} contentClassName="px-margin pb-6 gap-space-xl">
      {/* Heading & search */}
      <View className="gap-space-md pt-2">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-display text-display text-on-surface tracking-tight">{t('explore.title')}</Text>
          {area ? (
            <Pressable onPress={() => loc.refresh(true)} className="flex-row items-center gap-1" accessibilityRole="button">
              <Icon name="location_on" className="text-primary text-[16px]" />
              <Text className="font-caption text-caption text-primary">{area}</Text>
            </Pressable>
          ) : null}
        </View>
        <View className="w-full h-[52px] bg-surface-card rounded-xl shadow-sm flex-row items-center px-space-md gap-space-sm">
          <Icon name="search" className="text-text-muted text-[22px]" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('home.searchPlaceholder')}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel={t('home.searchPlaceholder')}
            className="flex-1 h-full font-body-md text-body-md text-on-surface p-0"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel={t('common.close')} className="w-8 h-8 rounded-full items-center justify-center">
              <Icon name="close" className="text-text-muted text-[20px]" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View className="gap-space-md -mx-margin">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-space-sm px-margin py-0.5">
          <FilterChip label={t('explore.all')} icon="apps" selected={!category} onPress={() => setCategory(null)} />
          {(categories.data ?? []).map((c) => (
            <FilterChip key={c.slug} label={categoryName(c)} icon={categoryIcon(c.slug)} selected={category === c.slug} onPress={() => setCategory(category === c.slug ? null : c.slug)} />
          ))}
        </ScrollView>
        {loc.coords ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-space-sm px-margin py-0.5">
            {RADII.map((r) => {
              const on = radiusKm === r;
              return (
                <Pressable
                  key={r}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setRadiusKm(r)}
                  className={`h-[36px] px-space-md rounded-full shadow-sm flex-row items-center gap-1 ${on ? 'bg-primary-soft' : 'bg-surface-card'}`}
                >
                  {on ? <Icon name="check" className="text-primary text-[16px]" /> : null}
                  <Text className={`font-label-sm text-label-sm ${on ? 'text-primary' : 'text-text-muted'}`}>{t('explore.radius', { km: r })}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {/* Results count */}
      <View className="flex-row items-center justify-between pt-1">
        <View className="flex-row items-center gap-1.5 flex-1">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="font-caption text-caption text-text-muted shrink">
            <Text className="font-headline-sm text-on-surface font-semibold text-[13px]">{t('explore.results', { n })}</Text>
            {area ? ` found near ${area}` : ' found'}
          </Text>
        </View>
        {shops.isFetching ? <ActivityIndicator size="small" color="#0B6E4F" /> : null}
      </View>

      {/* Results */}
      <View className="gap-space-xl">
        {n ? shops.data!.map((s) => <ExploreShopCard key={s.id} shop={s} category={catBySlug.get(s.category_slug)} />) : shops.isLoading ? null : <EmptyState icon="search_off" title={t('explore.empty')} />}
      </View>

      {/* Community message */}
      <Pressable accessibilityRole="button" onPress={() => router.push('/business/create')} className="p-space-lg rounded-xl bg-surface-alt flex-row items-center gap-space-md mt-2">
        <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
          <Icon name="store" className="text-primary text-[20px]" />
        </View>
        <View className="flex-1">
          <Text className="font-headline-sm text-on-surface text-[15px]">Know a missing local shop?</Text>
          <Text className="font-caption text-caption text-text-muted">Help your neighbourhood dukaandar get online and grow.</Text>
        </View>
      </Pressable>
    </CustomerScreen>
  );
}

function FilterChip({ label, icon, selected, onPress }: { label: string; icon: IconName; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-[40px] px-space-md rounded-full flex-row items-center gap-1.5 shadow-sm ${selected ? 'bg-primary-container' : 'bg-surface-card'}`}
    >
      <Icon name={icon} className={`text-[18px] ${selected ? 'text-on-primary' : 'text-text-muted'}`} />
      <Text className={`font-label-sm text-label-sm ${selected ? 'text-on-primary' : 'text-on-surface-variant'}`}>{label}</Text>
    </Pressable>
  );
}
