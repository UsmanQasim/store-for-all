import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Card, EmptyState, IconButton, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { timeAgo } from '@/lib/format';
import { useCreatePost, useDeletePost, useShopPosts } from '@/services/catalog';

/** Marketing: short offers pushed to everyone who favorited the shop (opt-out in their profile). */
export default function Posts() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
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
    <Screen>
      <Stack.Screen options={{ title: t('business.posts') }} />
      <Card style={{ gap: 12 }}>
        <Text variant="h3">{t('business.newPost')}</Text>
        <Input label={t('business.postTitle')} value={title} onChangeText={setTitle} maxLength={80} placeholder="e.g. 20% off beard trims this Friday" />
        <Input label={t('business.postBody')} value={body} onChangeText={setBody} multiline maxLength={600} />
        <Button title={t('business.postPublish')} icon="megaphone-outline" onPress={publish} loading={create.isPending} disabled={title.trim().length < 2} />
      </Card>
      {posts.data?.length ? (
        posts.data.map((p) => (
          <Card key={p.id} style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="bodyStrong">{p.title}</Text>
              {p.body ? <Text variant="caption" color="textMuted">{p.body}</Text> : null}
              <Text variant="label" color="textMuted">{timeAgo(p.created_at)}</Text>
            </View>
            <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => del.mutate(p.id)} />
          </Card>
        ))
      ) : posts.isLoading ? null : (
        <EmptyState icon="megaphone-outline" title={t('business.noPosts')} />
      )}
    </Screen>
  );
}
