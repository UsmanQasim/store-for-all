import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Avatar, Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { pickAndUpload } from '@/lib/upload';
import { useAuth } from '@/providers/AuthProvider';
import { profileApi } from '@/services/social';

export default function EditProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await profileApi.update(user.id, { full_name: name.trim() || null, phone: phone.trim() || null, avatar_url: avatar });
      refreshProfile();
      router.back();
    } catch (e) {
      Alert.alert(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <RequireAuth>
      <Stack.Screen options={{ title: t('profile.editProfile') }} />
      <Screen footer={<Button title={t('common.save')} onPress={save} loading={busy} fullWidth />}>
        <Pressable
          style={{ alignSelf: 'center', alignItems: 'center', gap: 8 }}
          accessibilityRole="button"
          onPress={async () => {
            try {
              const url = await pickAndUpload('avatar');
              if (url) setAvatar(url);
            } catch (e) {
              Alert.alert(toAppError(e).message);
            }
          }}
        >
          <Avatar uri={avatar} name={name} size={96} />
          <Text variant="caption" color="primary">{t('common.edit')}</Text>
        </Pressable>
        <View style={{ gap: 14 }}>
          <Input label={t('auth.fullName')} value={name} onChangeText={setName} maxLength={80} autoComplete="name" />
          <Input label={t('auth.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} hint={t('auth.phoneHint')} />
          <Input label={t('auth.email')} value={user?.email ?? ''} editable={false} />
        </View>
      </Screen>
    </RequireAuth>
  );
}
