import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '@/lib/errors';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { Category, NearbyShop, Shop, ShopDashboard, ShopInput } from '@/types/models';

/** Never select `location` (raw EWKB) — lat/lng are generated columns. */
export const SHOP_COLUMNS =
  'id, owner_id, slug, name, tagline, description, category_slug, phone, whatsapp, email, address, area, city, country_code, lat, lng, logo_url, cover_url, timezone, currency, opening_hours, accepts_bookings, accepts_orders, offers_delivery, booking_capacity, slot_minutes, booking_days_ahead, min_order_amount, is_published, status, rating_avg, rating_count, favorites_count, created_at';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------- API ----------
export const shopsApi = {
  categories: async () =>
    unwrap(await supabase.from('categories').select('*').order('sort')) as Category[],

  nearby: async (p: {
    lat?: number | null;
    lng?: number | null;
    radiusM?: number;
    category?: string | null;
    query?: string | null;
    limit?: number;
    offset?: number;
  }) =>
    unwrap(
      await supabase.rpc('nearby_shops', {
        p_lat: p.lat ?? null,
        p_lng: p.lng ?? null,
        p_radius_m: p.radiusM ?? 15000,
        p_category: p.category ?? null,
        p_query: p.query?.trim() || null,
        p_limit: p.limit ?? 30,
        p_offset: p.offset ?? 0,
      }),
    ) as NearbyShop[],

  /** Accepts a UUID or a public slug (from QR). */
  get: async (idOrSlug: string) => {
    const col = UUID_RE.test(idOrSlug) ? 'id' : 'slug';
    return unwrap(await supabase.from('shops').select(SHOP_COLUMNS).eq(col, idOrSlug).maybeSingle()) as Shop | null;
  },

  mine: async (uid: string) =>
    unwrap(
      await supabase.from('shops').select(SHOP_COLUMNS).eq('owner_id', uid).order('created_at'),
    ) as Shop[],

  create: async (input: ShopInput & { name: string; category_slug: string }) =>
    unwrap(await supabase.from('shops').insert(input).select(SHOP_COLUMNS).single()) as Shop,

  update: async (id: string, input: ShopInput) =>
    unwrap(await supabase.from('shops').update(input).eq('id', id).select(SHOP_COLUMNS).single()) as Shop,

  remove: async (id: string) => {
    unwrap(await supabase.from('shops').delete().eq('id', id));
  },

  setLocation: async (id: string, lat: number, lng: number) => {
    unwrap(await supabase.rpc('set_shop_location', { p_shop: id, p_lat: lat, p_lng: lng }));
  },

  dashboard: async (id: string) =>
    unwrap(await supabase.rpc('shop_dashboard', { p_shop: id })) as ShopDashboard,
};

// ---------- Hooks ----------
export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: shopsApi.categories, staleTime: 24 * 3600_000 });
}

export function useNearbyShops(p: Parameters<typeof shopsApi.nearby>[0], enabled = true) {
  return useQuery({
    queryKey: qk.nearby(p),
    queryFn: () => shopsApi.nearby(p),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useShop(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: qk.shop(idOrSlug ?? ''),
    queryFn: () => shopsApi.get(idOrSlug!),
    enabled: !!idOrSlug,
  });
}

export function useMyShops(uid: string | undefined) {
  return useQuery({ queryKey: qk.myShops, queryFn: () => shopsApi.mine(uid!), enabled: !!uid });
}

export function useShopDashboard(id: string | undefined) {
  return useQuery({
    queryKey: qk.dashboard(id ?? ''),
    queryFn: () => shopsApi.dashboard(id!),
    enabled: !!id,
    refetchInterval: 60_000,
  });
}

export function useSaveShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: string; input: ShopInput; coords?: { lat: number; lng: number } | null }) => {
      const shop = v.id
        ? await shopsApi.update(v.id, v.input)
        : await shopsApi.create(v.input as ShopInput & { name: string; category_slug: string });
      if (v.coords) await shopsApi.setLocation(shop.id, v.coords.lat, v.coords.lng);
      return shop;
    },
    onSuccess: (shop) => {
      qc.invalidateQueries({ queryKey: qk.myShops });
      qc.invalidateQueries({ queryKey: ['shop', shop.id] });
      qc.invalidateQueries({ queryKey: ['shop', shop.slug] });
      qc.invalidateQueries({ queryKey: ['nearby'] });
    },
  });
}

export function useDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shopsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myShops });
      qc.invalidateQueries({ queryKey: ['nearby'] });
    },
  });
}
