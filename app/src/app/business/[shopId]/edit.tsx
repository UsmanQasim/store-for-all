import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { ShopForm } from '@/components/business/ShopForm';
import { Icon, Text } from '@/components/nw';
import { LoadingState } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { useDeleteShop, useSaveShop, useShop } from '@/services/shops';

/** B02 (edit mode) — Shop details. */
export default function EditShop() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const save = useSaveShop();
  const del = useDeleteShop();
  if (shop.isLoading || !shop.data) return <LoadingState />;

  return (
    <ShopForm
      initial={shop.data}
      busy={save.isPending}
      onSubmit={async (input, coords) => {
        try {
          await save.mutateAsync({ id: shopId, input, coords });
          router.back();
        } catch (e) {
          Alert.alert(toAppError(e).message);
        }
      }}
    >
      <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-sm">
        <Text className="font-headline-sm text-headline-sm text-on-surface">{t('business.deleteShop')}</Text>
        <Text className="font-caption text-caption text-text-muted">{t('business.deleteShopBody')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(t('business.deleteShop'), t('business.deleteShopBody'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await del.mutateAsync(shopId);
                    router.replace('/business');
                  } catch (e) {
                    Alert.alert(toAppError(e).message);
                  }
                },
              },
            ])
          }
          className="h-12 rounded-xl bg-danger-soft flex-row items-center justify-center gap-2"
        >
          <Icon name="delete_forever" className="text-danger-red text-[20px]" />
          <Text className="text-danger-red font-body-lg text-body-lg font-semibold">{t('business.deleteShop')}</Text>
        </Pressable>
      </View>
    </ShopForm>
  );
}
