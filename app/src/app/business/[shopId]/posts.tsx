import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, EmptyState, Icon, IconButton, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { timeAgo } from '@/lib/format';
import { useCreatePost, useDeletePost, useShopPosts } from '@/services/catalog';
import { useShop } from '@/services/shops';

/** Marketing: short offers pushed to everyone who favorited the shop (opt-out in their profile). */
export default function Posts() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop = useShop(shopId);
  const posts = useShopPosts(shopId);
  const create = useCreatePost(shopId);
  const del = useDeletePost(shopId);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const publish = async () => {
    if (title.trim().length < 2) return;
    try {
      await create.mutateAsync({ shop_id: shopId, title: title.trim(), body: body.trim() || null, image_url: null, expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString() });
      setTitle('');
      setBody('');
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  return (
    <Screen title={t('business.posts')} subtitle={shop.data?.name}>
      <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-full bg-accent-soft items-center justify-center">
            <Icon name="campaign" className="text-secondary text-[20px]" />
          </View>
          <View className="flex-1">
            <Text className="font-headline-sm text-headline-sm text-on-surface">{t('business.newPost')}</Text>
            <Text className="font-caption text-caption text-text-muted">Sent to customers who favourited your shop • lasts 7 days</Text>
          </View>
        </View>
        <Input label={t('business.postTitle')} value={title} onChangeText={setTitle} maxLength={80} placeholder="e.g. 20% off beard trims this Friday" />
        <Input label={t('business.postBody')} value={body} onChangeText={setBody} multiline maxLength={600} />
        <Button title={t('business.postPublish')} icon="send" onPress={publish} loading={create.isPending} disabled={title.trim().length < 2} />
      </View>
      {posts.data?.length ? (
        posts.data.map((p) => {
          const expired = !!p.expires_at && new Date(p.expires_at) < new Date();
          return (
            <View key={p.id} className={`bg-surface-card rounded-xl p-space-md shadow-sm flex-row gap-2 ${expired ? 'opacity-60' : ''}`}>
              <View className="w-1 rounded-full bg-secondary-container" />
              <View className="flex-1 gap-1">
                <Text className="font-body-lg text-body-lg text-on-surface font-semibold">{p.title}</Text>
                {p.body ? <Text className="font-body-md text-body-md text-on-surface-variant">{p.body}</Text> : null}
                <Text className="font-caption text-caption text-text-muted">
                  {timeAgo(p.created_at)}
                  {expired ? ' • Expired' : ''}
                </Text>
              </View>
              <IconButton
                icon="delete"
                label={t('common.delete')}
                iconClassName="text-danger-red text-[20px]"
                onPress={() =>
                  Alert.alert(t('common.delete'), p.title, [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.delete'), style: 'destructive', onPress: () => del.mutate(p.id) },
                  ])
                }
              />
            </View>
          );
        })
      ) : posts.isLoading ? null : (
        <EmptyState icon="campaign" title={t('business.noPosts')} />
      )}
    </Screen>
  );
}
