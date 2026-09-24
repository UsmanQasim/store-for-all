import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { ReportSheet } from '@/components/ReportSheet';
import { useEnsureAuth } from '@/components/RequireAuth';
import { Avatar, Button, Card, EmptyState, IconButton, Input, Screen, Stars, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useShop } from '@/services/shops';
import { moderationApi, useMyReview, useReviewMutations, useReviews } from '@/services/social';
import { useAppTheme } from '@/theme';
import type { Review } from '@/types/models';

export default function Reviews() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius } = useAppTheme();
  const { user } = useAuth();
  const ensureAuth = useEnsureAuth();
  const shop = useShop(id);
  const shopId = shop.data?.id;
  const reviews = useReviews(shopId);
  const mine = useMyReview(shopId, user?.id);
  const m = useReviewMutations(shopId ?? '');
  const isOwner = !!user && user.id === shop.data?.owner_id;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [replying, setReplying] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    if (mine.data) {
      setRating(mine.data.rating);
      setComment(mine.data.comment ?? '');
    }
  }, [mine.data]);

  const submit = async () => {
    if (!ensureAuth() || !shopId || rating < 1) return;
    try {
      await m.save.mutateAsync({ id: mine.data?.id, shopId, rating, comment: comment.trim() });
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  const block = (r: Review) =>
    Alert.alert(t('reviews.block'), t('reviews.blockConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('reviews.block'),
        style: 'destructive',
        onPress: async () => {
          await moderationApi.block(r.author_id);
          reviews.refetch();
        },
      },
    ]);

  const moreActions = (r: Review) =>
    Alert.alert(r.author_name ?? '', undefined, [
      { text: t('reviews.report'), onPress: () => ensureAuth() && setReportTarget(r.id) },
      { text: t('reviews.block'), style: 'destructive', onPress: () => ensureAuth() && block(r) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('reviews.title') }} />

      {!isOwner ? (
        <Card style={{ gap: 12 }}>
          <Text variant="h3">{mine.data ? t('reviews.edit') : t('reviews.write')}</Text>
          <Stars value={rating} size={32} onChange={(v) => ensureAuth() && setRating(v)} />
          <Input placeholder={t('reviews.comment')} value={comment} onChangeText={setComment} multiline maxLength={1000} />
          <Button title={t('reviews.submit')} onPress={submit} disabled={rating < 1} loading={m.save.isPending} />
        </Card>
      ) : null}

      {reviews.data?.length ? (
        reviews.data.map((r) => (
          <Card key={r.id} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar uri={r.author_avatar} name={r.author_name} size={36} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{r.author_name}</Text>
                <Text variant="caption" color="textMuted">{timeAgo(r.created_at)}</Text>
              </View>
              <Stars value={r.rating} />
              {r.author_id !== user?.id ? <IconButton icon="ellipsis-vertical" label={t('reviews.report')} onPress={() => moreActions(r)} size={18} /> : null}
            </View>
            {r.comment ? <Text>{r.comment}</Text> : null}
            {r.owner_reply ? (
              <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, gap: 4 }}>
                <Text variant="label" color="primary">{t('reviews.ownerReply').toUpperCase()}</Text>
                <Text variant="caption">{r.owner_reply}</Text>
              </View>
            ) : null}
            {isOwner ? (
              replying?.id === r.id ? (
                <View style={{ gap: 8 }}>
                  <Input value={replying.text} onChangeText={(text) => setReplying({ id: r.id, text })} multiline maxLength={1000} autoFocus />
                  <Button
                    title={t('reviews.reply')}
                    size="sm"
                    loading={m.reply.isPending}
                    onPress={async () => {
                      await m.reply.mutateAsync({ reviewId: r.id, reply: replying.text });
                      setReplying(null);
                    }}
                  />
                </View>
              ) : (
                <Button title={t('reviews.reply')} variant="ghost" size="sm" icon="chatbubble-outline" onPress={() => setReplying({ id: r.id, text: r.owner_reply ?? '' })} />
              )
            ) : null}
          </Card>
        ))
      ) : reviews.isLoading ? null : (
        <EmptyState icon="star-outline" title={t('reviews.empty')} />
      )}

      {reportTarget ? <ReportSheet visible onClose={() => setReportTarget(null)} targetType="review" targetId={reportTarget} /> : null}
    </Screen>
  );
}
