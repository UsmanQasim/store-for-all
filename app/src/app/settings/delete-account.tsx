import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme';

/** Google Play Data deletion policy: in-app account deletion, no email/call needed. */
export default function DeleteAccount() {
  const { colors } = useAppTheme();
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
      <Stack.Screen options={{ title: t('profile.deleteAccount') }} />
      <Screen footer={<Button title={t('profile.deleteAccount')} variant="danger" disabled={confirm.trim().toUpperCase() !== 'DELETE'} loading={busy} onPress={run} fullWidth />}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="warning-outline" size={32} color={colors.danger} />
        </View>
        <Text variant="h1">{t('profile.deleteTitle')}</Text>
        <Text color="textMuted">{t('profile.deleteBody')}</Text>
        <Input label={t('profile.deleteType')} value={confirm} onChangeText={setConfirm} autoCapitalize="characters" autoCorrect={false} />
      </Screen>
    </RequireAuth>
  );
}
