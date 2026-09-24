import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Button, Icon, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { useAuth } from '@/providers/AuthProvider';

/** Google Play Data deletion policy: in-app account deletion, no email/call needed. */
export default function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await deleteAccount();
      Alert.alert(t('profile.deleted'));
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <RequireAuth>
      <Screen
        title={t('profile.deleteAccount')}
        footer={<Button title={t('profile.deleteAccount')} icon="delete_forever" variant="danger" disabled={confirm.trim().toUpperCase() !== 'DELETE'} loading={busy} onPress={run} fullWidth />}
      >
        <View className="w-16 h-16 rounded-full bg-danger-soft items-center justify-center">
          <Icon name="warning" className="text-danger-red text-[32px]" />
        </View>
        <Text className="font-headline-lg text-headline-lg text-on-surface">{t('profile.deleteTitle')}</Text>
        <Text className="font-body-md text-body-md text-text-muted">{t('profile.deleteBody')}</Text>
        <Input label={t('profile.deleteType')} value={confirm} onChangeText={setConfirm} autoCapitalize="characters" autoCorrect={false} />
      </Screen>
    </RequireAuth>
  );
}
