import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Icon, Input, Screen, Text } from '@/components/ui';
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
    <Screen title="" footer={<Button title={t('common.continue')} icon="arrow_forward" onPress={save} loading={busy} fullWidth />}>
      <View className="gap-space-sm pt-space-md">
        <View className="w-14 h-14 rounded-2xl bg-primary-soft items-center justify-center">
          <Icon name="person" className="text-primary text-[28px]" />
        </View>
        <Text className="font-headline-lg text-headline-lg text-on-surface">{t('auth.completeProfile')}</Text>
      </View>
      <Input label={t('auth.fullName')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" leftIcon="badge" autoFocus maxLength={80} error={error} />
      <Input label={`${t('auth.phone')} (${t('common.optional')})`} value={phone} onChangeText={setPhone} leftIcon="call" keyboardType="phone-pad" autoComplete="tel" maxLength={20} hint={t('auth.phoneHint')} />
    </Screen>
  );
}
