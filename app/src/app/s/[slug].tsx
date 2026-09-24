import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEnsureAuth } from '@/components/RequireAuth';
import { Avatar, Button, EmptyState, IconButton, LoadingState, RatingInline, Text, type IconName } from '@/components/ui';
import { t } from '@/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { useShop } from '@/services/shops';
import { useFavorites, useToggleFavorite } from '@/services/social';
import { useAppTheme } from '@/theme';

/**
 * Landing for a scanned QR / tapped https://<domain>/s/<slug> App Link.
 * Three jobs, one screen: pay the shop, favorite it (pins to Home), open it.
 */
export default function ScanLanding() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, radius } = useAppTheme();
  const { user } = useAuth();
  const ensureAuth = useEnsureAuth();
  const shop = useShop(slug);
  const favorites = useFavorites(!!user);
  const toggle = useToggleFavorite();

  if (shop.isLoading) return <LoadingState />;
  const s = shop.data;
  if (!s) return <EmptyState icon="qr-code-outline" title={t('shop.notFound')} action={t('common.close')} onAction={() => router.back()} />;
  const isFav = !!favorites.data?.some((f) => f.id === s.id);

  const Action = ({ icon, title, subtitle, onPress, primary }: { icon: IconName; title: string; subtitle: string; onPress: () => void; primary?: boolean }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: radius.lg, backgroundColor: primary ? colors.primary : colors.surface, borderWidth: 1, borderColor: primary ? colors.primary : colors.border, opacity: pressed ? 0.9 : 1 })}
    >
      <Ionicons name={icon} size={28} color={primary ? colors.onPrimary : colors.primary} />
      <View style={{ flex: 1 }}>
        <Text variant="h3" style={{ color: primary ? colors.onPrimary : colors.text }}>{title}</Text>
        <Text variant="caption" style={{ color: primary ? colors.onPrimary : colors.textMuted }}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={primary ? colors.onPrimary : colors.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 16 }}>
      <View style={{ alignItems: 'flex-end' }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar uri={s.logo_url} name={s.name} size={96} rounded={false} />
        <Text variant="h1" align="center">{s.name}</Text>
        {s.tagline ? <Text color="textMuted" align="center">{s.tagline}</Text> : null}
        <RatingInline avg={s.rating_avg} count={s.rating_count} />
      </View>
      <View style={{ gap: 12, marginTop: 8 }}>
        <Action primary icon="wallet" title={t('shop.pay')} subtitle={t('pay.subtitle')} onPress={() => router.push(`/shop/${s.id}/pay`)} />
        <Action icon="storefront-outline" title={t('common.open')} subtitle={[s.accepts_bookings && t('shop.book'), s.accepts_orders && t('shop.order'), t('shop.reviews')].filter(Boolean).join(' · ')} onPress={() => router.replace(`/shop/${s.id}`)} />
      </View>
      <View style={{ flex: 1 }} />
      <Button
        title={isFav ? t('shop.following') : t('shop.follow')}
        icon={isFav ? 'heart' : 'heart-outline'}
        variant={isFav ? 'secondary' : 'accent'}
        loading={toggle.isPending}
        onPress={() => ensureAuth() && toggle.mutate({ shopId: s.id, favorite: !isFav })}
        fullWidth
      />
    </SafeAreaView>
  );
}
