import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '@/lib/errors';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { Fulfillment, Order, OrderStatus } from '@/types/models';

const ORDER_SELECT =
  '*, items:order_items(*), shop:shops(id, name, logo_url, slug, phone, currency), customer:profiles(id, full_name, phone, avatar_url)';

export const ordersApi = {
  place: async (v: {
    shopId: string;
    items: { item_id: string; quantity: number }[];
    fulfillment: Fulfillment;
    address?: string;
    phone?: string;
    note?: string;
  }) =>
    unwrap(
      await supabase.rpc('place_order', {
        p_shop: v.shopId,
        p_items: v.items,
        p_fulfillment: v.fulfillment,
        p_address: v.address?.trim() || null,
        p_phone: v.phone?.trim() || null,
        p_note: v.note?.trim() || null,
      }),
    ) as Order,

  cancel: async (id: string) => unwrap(await supabase.rpc('cancel_order', { p_order: id })) as Order,

  setStatus: async (v: { id: string; status: OrderStatus }) =>
    unwrap(await supabase.rpc('update_order_status', { p_order: v.id, p_status: v.status })) as Order,

  mine: async (uid: string) =>
    unwrap(
      await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .eq('customer_id', uid)
        .order('created_at', { ascending: false })
        .limit(100),
    ) as Order[],

  forShop: async (shopId: string) =>
    unwrap(
      await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(200),
    ) as Order[],

  get: async (id: string) => unwrap(await supabase.from('orders').select(ORDER_SELECT).eq('id', id).single()) as Order,
};

export function useMyOrders(uid: string | undefined) {
  return useQuery({ queryKey: qk.myOrders, queryFn: () => ordersApi.mine(uid!), enabled: !!uid });
}
export function useShopOrders(shopId: string | undefined) {
  return useQuery({ queryKey: qk.shopOrders(shopId ?? ''), queryFn: () => ordersApi.forShop(shopId!), enabled: !!shopId });
}
export function useOrder(id: string | undefined) {
  return useQuery({ queryKey: qk.order(id ?? ''), queryFn: () => ordersApi.get(id!), enabled: !!id });
}

export function useOrderMutations() {
  const qc = useQueryClient();
  const refresh = (o: Order) => {
    qc.invalidateQueries({ queryKey: qk.myOrders });
    qc.invalidateQueries({ queryKey: qk.order(o.id) });
    qc.invalidateQueries({ queryKey: qk.shopOrders(o.shop_id) });
    qc.invalidateQueries({ queryKey: qk.dashboard(o.shop_id) });
  };
  return {
    place: useMutation({ mutationFn: ordersApi.place, onSuccess: refresh }),
    cancel: useMutation({ mutationFn: ordersApi.cancel, onSuccess: refresh }),
    setStatus: useMutation({ mutationFn: ordersApi.setStatus, onSuccess: refresh }),
  };
}

/** Next allowed statuses for the owner — mirrors update_order_status() in SQL. */
export function nextOrderStatuses(o: Pick<Order, 'status' | 'fulfillment'>): OrderStatus[] {
  switch (o.status) {
    case 'placed':
      return ['accepted', 'rejected'];
    case 'accepted':
      return ['packing', 'ready', 'cancelled'];
    case 'packing':
      return ['ready', 'cancelled'];
    case 'ready':
      return o.fulfillment === 'delivery' ? ['out_for_delivery', 'completed'] : ['completed'];
    case 'out_for_delivery':
      return ['completed'];
    default:
      return [];
  }
}
