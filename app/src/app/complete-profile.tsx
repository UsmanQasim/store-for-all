import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { useAuth } from '@/providers/AuthProvider';
import { profileApi } from '@/services/social';

export default function CompleteProfile() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (name.trim().length < 2) return setError(t('errors.required'));
    setBusy(true);
    try {
      await profileApi.update(user!.id, { full_name: name.trim(), phone: phone.trim() || null });
      refreshProfile();
      router.dismiss(2); // pops complete-profile + sign-in → back to where the user was
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<Button title={t('common.continue')} onPress={save} loading={busy} fullWidth />}>
      <Text variant="h1">{t('auth.completeProfile')}</Text>
      <Input label={t('auth.fullName')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" autoFocus maxLength={80} error={error} />
      <Input label={`${t('auth.phone')} (${t('common.optional')})`} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={20} hint={t('auth.phoneHint')} />
    </Screen>
  );
}
