import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { Avatar, Button, Card, Divider, ListRow, Screen, SwitchRow, Text } from '@/components/ui';
import { getLocale, setLocale, t } from '@/i18n';
import { config, legalUrls } from '@/lib/config';
import { open } from '@/lib/links';
import { useAuth } from '@/providers/AuthProvider';
import { useMyShops } from '@/services/shops';
import { profileApi } from '@/services/social';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const myShops = useMyShops(user?.id);

  const switchLanguage = () => {
    const next = getLocale() === 'en' ? 'ur' : 'en';
    const restart = setLocale(next);
    if (user) profileApi.update(user.id, { locale: next }).catch(() => undefined);
    Alert.alert(next === 'ur' ? 'اردو' : 'English', restart ? 'Please close and reopen the app to apply the layout direction.' : undefined);
  };

  return (
    <Screen edges={['top']}>
      <Text variant="h1">{t('profile.title')}</Text>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name ?? user?.email} size={60} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">{profile?.full_name ?? t('profile.guest')}</Text>
          <Text variant="caption" color="textMuted">{user?.email ?? t('profile.guestBody')}</Text>
        </View>
        {user ? (
          <Button title={t('common.edit')} size="sm" variant="secondary" onPress={() => router.push('/settings/edit-profile')} />
        ) : (
          <Button title={t('common.signIn')} size="sm" onPress={() => router.push('/sign-in')} />
        )}
      </Card>

      {/* Merchant entry point — one account can be a customer and a shop owner */}
      <Card>
        {myShops.data?.length ? (
          <ListRow icon="storefront" title={t('profile.myBusiness')} subtitle={myShops.data.map((s) => s.name).join(', ')} onPress={() => router.push('/business')} />
        ) : (
          <View style={{ gap: 10 }}>
            <Text variant="h3">{t('profile.registerShop')}</Text>
            <Text variant="caption" color="textMuted">{t('profile.registerShopBody')}</Text>
            <Button title={t('profile.registerShop')} icon="add-circle-outline" variant="accent" onPress={() => router.push(user ? '/business/create' : '/sign-in')} />
          </View>
        )}
      </Card>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow icon="language-outline" title={t('profile.language')} subtitle={getLocale() === 'ur' ? 'اردو' : 'English'} onPress={switchLanguage} />
        {user && profile ? (
          <>
            <Divider />
            <View style={{ paddingHorizontal: 4 }}>
              <SwitchRow
                title={t('profile.shopUpdates')}
                value={profile.shop_updates_opt_in}
                onValueChange={async (v) => {
                  await profileApi.update(user.id, { shop_updates_opt_in: v });
                  refreshProfile();
                }}
              />
            </View>
          </>
        ) : null}
      </Card>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow icon="shield-checkmark-outline" title={t('profile.privacy')} onPress={() => open.url(legalUrls.privacy)} />
        <Divider />
        <ListRow icon="document-text-outline" title={t('profile.terms')} onPress={() => open.url(legalUrls.terms)} />
        <Divider />
        <ListRow icon="people-outline" title={t('profile.guidelines')} onPress={() => open.url(legalUrls.guidelines)} />
        <Divider />
        <ListRow icon="help-buoy-outline" title={t('profile.help')} subtitle={config.brand.supportEmail} onPress={() => open.url(`mailto:${config.brand.supportEmail}`)} />
      </Card>

      {user ? (
        <Card padded={false} style={{ paddingHorizontal: 12 }}>
          <ListRow icon="log-out-outline" title={t('profile.signOut')} onPress={() => signOut()} />
          <Divider />
          <ListRow icon="trash-outline" title={t('profile.deleteAccount')} danger onPress={() => router.push('/settings/delete-account')} />
        </Card>
      ) : null}

      <Text variant="caption" color="textMuted" align="center">{t('profile.version', { v: Constants.expoConfig?.version ?? '1.0.0' })}</Text>
    </Screen>
  );
}
