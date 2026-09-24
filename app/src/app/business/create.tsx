import { router } from 'expo-router';
import { Alert } from 'react-native';
import { ShopForm } from '@/components/business/ShopForm';
import { RequireAuth } from '@/components/RequireAuth';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { registerForPush } from '@/lib/notifications';
import { KEYS, kv } from '@/lib/storage';
import { useSaveShop } from '@/services/shops';

/** B02 — Register a shop. */
export default function CreateShop() {
  const save = useSaveShop();
  return (
    <RequireAuth>
      <ShopForm
        busy={save.isPending}
        onSubmit={async (input, coords) => {
          try {
            const shop = await save.mutateAsync({ input, coords });
            kv.set(KEYS.businessShop, shop.id);
            registerForPush().catch(() => undefined); // owners need new-order alerts
            Alert.alert(t('business.created'), 'Next: add how customers can pay you — it goes on your counter QR poster.');
            router.replace(`/business/${shop.id}/payments`);
          } catch (e) {
            Alert.alert(toAppError(e).message);
          }
        }}
      />
    </RequireAuth>
  );
}
