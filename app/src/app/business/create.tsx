import { router, Stack } from 'expo-router';
import { Alert } from 'react-native';
import { ShopForm } from '@/components/business/ShopForm';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { registerForPush } from '@/lib/notifications';
import { KEYS, kv } from '@/lib/storage';
import { useSaveShop } from '@/services/shops';

export default function CreateShop() {
  const save = useSaveShop();
  return (
    <RequireAuth>
      <Stack.Screen options={{ title: t('business.createTitle') }} />
      <Screen>
        <ShopForm
          submitLabel={t('business.create')}
          busy={save.isPending}
          onSubmit={async (input, coords) => {
            try {
              const shop = await save.mutateAsync({ input, coords });
              kv.set(KEYS.businessShop, shop.id);
              registerForPush().catch(() => undefined); // owners need new-order alerts
              Alert.alert(t('business.created'));
              // Next: payment details → QR poster is the fastest path to value.
              router.replace(`/business/${shop.id}/payments`);
            } catch (e) {
              Alert.alert(toAppError(e).message);
            }
          }}
        />
      </Screen>
    </RequireAuth>
  );
}
