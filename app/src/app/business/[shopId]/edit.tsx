import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { ShopForm } from '@/components/business/ShopForm';
import { Button, LoadingState, Screen } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { useDeleteShop, useSaveShop, useShop } from '@/services/shops';

export default function EditShop() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const save = useSaveShop();
  const del = useDeleteShop();
  if (shop.isLoading || !shop.data) return <LoadingState />;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('business.editShop') }} />
      <ShopForm
        initial={shop.data}
        submitLabel={t('common.save')}
        busy={save.isPending}
        onSubmit={async (input, coords) => {
          try {
            await save.mutateAsync({ id: shopId, input, coords });
            router.back();
          } catch (e) {
            Alert.alert(toAppError(e).message);
          }
        }}
      />
      <Button
        title={t('business.deleteShop')}
        variant="danger"
        icon="trash-outline"
        onPress={() =>
          Alert.alert(t('business.deleteShop'), t('business.deleteShopBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                await del.mutateAsync(shopId);
                router.replace('/business');
              },
            },
          ])
        }
      />
    </Screen>
  );
}
