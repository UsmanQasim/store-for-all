import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '@/lib/errors';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { AppNotification, Profile, ReportReason, Review } from '@/types/models';
import { SHOP_COLUMNS } from './shops';
import type { Shop } from '@/types/models';

// ---------- Reviews ----------
export const reviewsApi = {
  list: async (shopId: string) =>
    unwrap(
      await supabase
        .from('reviews')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50),
    ) as Review[],
  mine: async (shopId: string, uid: string) =>
    unwrap(await supabase.from('reviews').select('*').eq('shop_id', shopId).eq('author_id', uid).maybeSingle()) as Review | null,
  save: async (v: { id?: string; shopId: string; rating: number; comment?: string }) =>
    unwrap(
      v.id
        ? await supabase.from('reviews').update({ rating: v.rating, comment: v.comment || null }).eq('id', v.id).select().single()
        : await supabase
            .from('reviews')
            .insert({ shop_id: v.shopId, rating: v.rating, comment: v.comment || null })
            .select()
            .single(),
    ) as Review,
  remove: async (id: string) => {
    unwrap(await supabase.from('reviews').delete().eq('id', id));
  },
  reply: async (v: { reviewId: string; reply: string }) =>
    unwrap(await supabase.rpc('reply_to_review', { p_review: v.reviewId, p_reply: v.reply })) as Review,
};

export function useReviews(shopId: string | undefined) {
  return useQuery({ queryKey: qk.shopReviews(shopId ?? ''), queryFn: () => reviewsApi.list(shopId!), enabled: !!shopId });
}
export function useMyReview(shopId: string | undefined, uid: string | undefined) {
  return useQuery({
    queryKey: qk.myReview(shopId ?? ''),
    queryFn: () => reviewsApi.mine(shopId!, uid!),
    enabled: !!shopId && !!uid,
  });
}
export function useReviewMutations(shopId: string) {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: qk.shopReviews(shopId) });
    qc.invalidateQueries({ queryKey: qk.myReview(shopId) });
    qc.invalidateQueries({ queryKey: ['shop', shopId] });
  };
  return {
    save: useMutation({ mutationFn: reviewsApi.save, onSuccess: refresh }),
    remove: useMutation({ mutationFn: reviewsApi.remove, onSuccess: refresh }),
    reply: useMutation({ mutationFn: reviewsApi.reply, onSuccess: refresh }),
  };
}

// ---------- Moderation (Play UGC policy: report + block) ----------
export const moderationApi = {
  report: async (v: { targetType: 'review' | 'shop' | 'post'; targetId: string; reason: ReportReason; details?: string }) => {
    const res = await supabase
      .from('content_reports')
      .insert({ target_type: v.targetType, target_id: v.targetId, reason: v.reason, details: v.details || null });
    // Reporting twice is fine from the user's perspective.
    if (res.error && res.error.code !== '23505') unwrap(res);
  },
  block: async (userId: string) => {
    const res = await supabase.from('user_blocks').insert({ blocked_id: userId });
    if (res.error && res.error.code !== '23505') unwrap(res);
  },
};

// ---------- Favorites ----------
export const favoritesApi = {
  list: async () =>
    (
      unwrap(
        await supabase.from('favorites').select(`created_at, shop:shops(${SHOP_COLUMNS})`).order('created_at', { ascending: false }),
      ) as unknown as { shop: Shop | null }[]
    )
      .map((r) => r.shop)
      .filter((s): s is Shop => !!s),
  add: async (shopId: string) => {
    const res = await supabase.from('favorites').insert({ shop_id: shopId });
    if (res.error && res.error.code !== '23505') unwrap(res);
  },
  remove: async (shopId: string) => {
    unwrap(await supabase.from('favorites').delete().eq('shop_id', shopId));
  },
};

export function useFavorites(enabled: boolean) {
  return useQuery({ queryKey: qk.favorites, queryFn: favoritesApi.list, enabled });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { shopId: string; favorite: boolean }) =>
      v.favorite ? favoritesApi.add(v.shopId) : favoritesApi.remove(v.shopId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.favorites }),
  });
}

// ---------- Notifications ----------
export const notificationsApi = {
  list: async () =>
    unwrap(
      await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
    ) as AppNotification[],
  markAllRead: async () => {
    unwrap(await supabase.rpc('mark_notifications_read'));
  },
  markRead: async (id: string) => {
    unwrap(await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id));
  },
};

export function useNotifications(enabled: boolean) {
  return useQuery({ queryKey: qk.notifications, queryFn: notificationsApi.list, enabled });
}

// ---------- Profile ----------
export const profileApi = {
  get: async (uid: string) =>
    unwrap(await supabase.from('profiles').select('*').eq('id', uid).single()) as Profile,
  update: async (uid: string, input: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url' | 'locale' | 'shop_updates_opt_in'>>) =>
    unwrap(await supabase.from('profiles').update(input).eq('id', uid).select().single()) as Profile,
};
