import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { ReportSheet } from '@/components/ReportSheet';
import { useEnsureAuth } from '@/components/RequireAuth';
import { Avatar, Button, EmptyState, IconButton, Input, Screen, Stars, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useShop } from '@/services/shops';
import { moderationApi, useMyReview, useReviewMutations, useReviews } from '@/services/social';
import type { Review } from '@/types/models';

export default function Reviews() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const avg = Number(shop.data?.rating_avg ?? 0);
  const count = shop.data?.rating_count ?? 0;

  return (
    <Screen title={t('reviews.title')} subtitle={shop.data?.name}>
      {count ? (
        <View className="bg-surface-card rounded-xl p-space-lg shadow-sm flex-row items-center gap-space-md">
          <Text className="font-display text-display text-on-surface">{avg.toFixed(1)}</Text>
          <View className="gap-1">
            <Stars value={Math.round(avg)} size={20} />
            <Text className="font-caption text-caption text-text-muted">{count} {count === 1 ? 'review' : 'reviews'}</Text>
          </View>
        </View>
      ) : null}

      {!isOwner ? (
        <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
          <Text className="font-headline-sm text-headline-sm text-on-surface">{mine.data ? t('reviews.edit') : t('reviews.write')}</Text>
          <Stars value={rating} size={36} onChange={(v) => ensureAuth() && setRating(v)} />
          <Input placeholder={t('reviews.comment')} value={comment} onChangeText={setComment} multiline maxLength={1000} />
          <Button title={t('reviews.submit')} icon="send" onPress={submit} disabled={rating < 1} loading={m.save.isPending} />
        </View>
      ) : null}

      {reviews.data?.length ? (
        reviews.data.map((r) => (
          <View key={r.id} className="bg-surface-card rounded-xl p-space-md shadow-sm gap-2">
            <View className="flex-row items-center gap-2.5">
              <Avatar uri={r.author_avatar} name={r.author_name} size={32} />
              <View className="flex-1">
                <Text className="font-body-lg text-body-md font-semibold text-on-surface">{r.author_name}</Text>
                <Text className="font-caption text-[11px] text-text-muted">{timeAgo(r.created_at)}</Text>
              </View>
              <Stars value={r.rating} />
              {r.author_id !== user?.id ? <IconButton icon="more_vert" label={t('reviews.report')} onPress={() => moreActions(r)} className="w-9 h-9" iconClassName="text-text-muted text-[20px]" /> : null}
            </View>
            {r.comment ? <Text className="font-body-md text-body-md text-on-surface-variant">{r.comment}</Text> : null}
            {r.owner_reply ? (
              <View className="bg-surface-alt rounded-lg p-3 gap-1 border-l-2 border-primary">
                <Text className="font-label-sm text-label-sm text-primary font-bold uppercase">{t('reviews.ownerReply')}</Text>
                <Text className="font-caption text-caption text-on-surface">{r.owner_reply}</Text>
              </View>
            ) : null}
            {isOwner ? (
              replying?.id === r.id ? (
                <View className="gap-2">
                  <Input value={replying.text} onChangeText={(text) => setReplying({ id: r.id, text })} multiline maxLength={1000} autoFocus />
                  <Button
                    title={t('reviews.reply')}
                    size="sm"
                    icon="reply"
                    loading={m.reply.isPending}
                    onPress={async () => {
                      try {
                        await m.reply.mutateAsync({ reviewId: r.id, reply: replying.text });
                        setReplying(null);
                      } catch (e) {
                        Alert.alert(toAppError(e).message);
                      }
                    }}
                  />
                </View>
              ) : (
                <Button title={t('reviews.reply')} variant="ghost" size="sm" icon="chat_bubble" onPress={() => setReplying({ id: r.id, text: r.owner_reply ?? '' })} />
              )
            ) : null}
          </View>
        ))
      ) : reviews.isLoading ? null : (
        <EmptyState icon="star" title={t('reviews.empty')} />
      )}

      {reportTarget ? <ReportSheet visible onClose={() => setReportTarget(null)} targetType="review" targetId={reportTarget} /> : null}
    </Screen>
  );
}
