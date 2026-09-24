import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '@/lib/errors';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { CatalogItem, PaymentMethod, ShopPost } from '@/types/models';

export type CatalogInput = Omit<CatalogItem, 'id'> & { id?: string };
export type PaymentInput = Omit<PaymentMethod, 'id'> & { id?: string };
export type PostInput = Pick<ShopPost, 'shop_id' | 'title' | 'body' | 'image_url' | 'expires_at'>;

export const catalogApi = {
  items: async (shopId: string) =>
    unwrap(
      await supabase.from('catalog_items').select('*').eq('shop_id', shopId).order('kind').order('sort').order('name'),
    ) as CatalogItem[],
  saveItem: async ({ id, ...input }: CatalogInput) =>
    unwrap(
      id
        ? await supabase.from('catalog_items').update(input).eq('id', id).select().single()
        : await supabase.from('catalog_items').insert(input).select().single(),
    ) as CatalogItem,
  deleteItem: async (id: string) => {
    unwrap(await supabase.from('catalog_items').delete().eq('id', id));
  },

  payments: async (shopId: string) =>
    unwrap(
      await supabase
        .from('shop_payment_methods')
        .select('*')
        .eq('shop_id', shopId)
        .order('is_primary', { ascending: false })
        .order('sort'),
    ) as PaymentMethod[],
  savePayment: async ({ id, ...input }: PaymentInput) =>
    unwrap(
      id
        ? await supabase.from('shop_payment_methods').update(input).eq('id', id).select().single()
        : await supabase.from('shop_payment_methods').insert(input).select().single(),
    ) as PaymentMethod,
  deletePayment: async (id: string) => {
    unwrap(await supabase.from('shop_payment_methods').delete().eq('id', id));
  },

  posts: async (shopId: string) =>
    unwrap(
      await supabase.from('shop_posts').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(20),
    ) as ShopPost[],
  createPost: async (input: PostInput) =>
    unwrap(await supabase.from('shop_posts').insert(input).select().single()) as ShopPost,
  deletePost: async (id: string) => {
    unwrap(await supabase.from('shop_posts').delete().eq('id', id));
  },
  /** Active offers from shops the user favorited (home feed). */
  feed: async (shopIds: string[]) =>
    shopIds.length === 0
      ? []
      : (unwrap(
          await supabase
            .from('shop_posts')
            .select('*, shop:shops(id, name, logo_url)')
            .in('shop_id', shopIds)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .order('created_at', { ascending: false })
            .limit(10),
        ) as (ShopPost & { shop: { id: string; name: string; logo_url: string | null } })[]),
};

export function useCatalog(shopId: string | undefined) {
  return useQuery({ queryKey: qk.shopItems(shopId ?? ''), queryFn: () => catalogApi.items(shopId!), enabled: !!shopId });
}
export function usePaymentMethods(shopId: string | undefined) {
  return useQuery({
    queryKey: qk.shopPayments(shopId ?? ''),
    queryFn: () => catalogApi.payments(shopId!),
    enabled: !!shopId,
  });
}
export function useShopPosts(shopId: string | undefined) {
  return useQuery({ queryKey: qk.shopPosts(shopId ?? ''), queryFn: () => catalogApi.posts(shopId!), enabled: !!shopId });
}
export function usePostsFeed(shopIds: string[]) {
  return useQuery({ queryKey: ['feed', shopIds], queryFn: () => catalogApi.feed(shopIds), enabled: shopIds.length > 0 });
}

function useShopMutation<TVars extends { shop_id: string } | string, TRes>(
  fn: (v: TVars) => Promise<TRes>,
  key: (shopId: string) => readonly unknown[],
  shopId: string,
) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: key(shopId) }) });
}

export const useSaveItem = (shopId: string) => useShopMutation(catalogApi.saveItem, qk.shopItems, shopId);
export const useDeleteItem = (shopId: string) => useShopMutation(catalogApi.deleteItem, qk.shopItems, shopId);
export const useSavePayment = (shopId: string) => useShopMutation(catalogApi.savePayment, qk.shopPayments, shopId);
export const useDeletePayment = (shopId: string) => useShopMutation(catalogApi.deletePayment, qk.shopPayments, shopId);
export const useCreatePost = (shopId: string) => useShopMutation(catalogApi.createPost, qk.shopPosts, shopId);
export const useDeletePost = (shopId: string) => useShopMutation(catalogApi.deletePost, qk.shopPosts, shopId);
