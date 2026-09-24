import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '@/lib/errors';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { Booking, BookingStatus, Slot } from '@/types/models';

const BOOKING_SELECT =
  '*, shop:shops(id, name, logo_url, slug, phone, whatsapp, currency, timezone, address, area, city, lat, lng, category_slug, country_code), customer:profiles(id, full_name, phone, avatar_url)';

export const bookingsApi = {
  slots: async (shopId: string, date: string, serviceId?: string | null) =>
    unwrap(
      await supabase.rpc('get_available_slots', { p_shop: shopId, p_date: date, p_service: serviceId ?? null }),
    ) as Slot[],

  create: async (v: { shopId: string; serviceId: string | null; startsAt: string; note?: string }) =>
    unwrap(
      await supabase.rpc('create_booking', {
        p_shop: v.shopId,
        p_service: v.serviceId,
        p_starts_at: v.startsAt,
        p_note: v.note?.trim() || null,
      }),
    ) as Booking,

  cancel: async (id: string) => unwrap(await supabase.rpc('cancel_booking', { p_booking: id })) as Booking,

  setStatus: async (v: { id: string; status: BookingStatus; note?: string }) =>
    unwrap(
      await supabase.rpc('update_booking_status', { p_booking: v.id, p_status: v.status, p_note: v.note ?? null }),
    ) as Booking,

  mine: async (uid: string) =>
    unwrap(
      await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('customer_id', uid)
        .order('starts_at', { ascending: false })
        .limit(100),
    ) as Booking[],

  forShop: async (shopId: string) =>
    unwrap(
      await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('shop_id', shopId)
        .gte('starts_at', new Date(Date.now() - 24 * 3600_000).toISOString())
        .order('starts_at')
        .limit(200),
    ) as Booking[],

  get: async (id: string) =>
    unwrap(await supabase.from('bookings').select(BOOKING_SELECT).eq('id', id).single()) as Booking,

  /** Completed visits per customer at a shop (owner view: "Regular (4 visits)" / "New customer"). */
  // ponytail: counts client-side from the last 5000 completed bookings; move to a grouped RPC if a shop outgrows that.
  visits: async (shopId: string) => {
    const rows = unwrap(await supabase.from('bookings').select('customer_id').eq('shop_id', shopId).eq('status', 'completed').limit(5000)) as { customer_id: string }[];
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.customer_id, (m.get(r.customer_id) ?? 0) + 1);
    return m;
  },
};

export function useSlots(shopId: string | undefined, date: string, serviceId?: string | null) {
  return useQuery({
    queryKey: qk.slots(shopId ?? '', date, serviceId),
    queryFn: () => bookingsApi.slots(shopId!, date, serviceId),
    enabled: !!shopId,
    staleTime: 15_000,
  });
}

export function useMyBookings(uid: string | undefined) {
  return useQuery({ queryKey: qk.myBookings, queryFn: () => bookingsApi.mine(uid!), enabled: !!uid });
}

export function useShopBookings(shopId: string | undefined) {
  return useQuery({
    queryKey: qk.shopBookings(shopId ?? ''),
    queryFn: () => bookingsApi.forShop(shopId!),
    enabled: !!shopId,
  });
}

export function useCustomerVisits(shopId: string | undefined) {
  return useQuery({ queryKey: [...qk.shopBookings(shopId ?? ''), 'visits'], queryFn: () => bookingsApi.visits(shopId!), enabled: !!shopId, staleTime: 5 * 60_000 });
}

export function useBooking(id: string | undefined) {
  return useQuery({ queryKey: qk.booking(id ?? ''), queryFn: () => bookingsApi.get(id!), enabled: !!id });
}

export function useBookingMutations() {
  const qc = useQueryClient();
  const refresh = (b: Booking) => {
    qc.invalidateQueries({ queryKey: qk.myBookings });
    qc.invalidateQueries({ queryKey: qk.booking(b.id) });
    qc.invalidateQueries({ queryKey: qk.shopBookings(b.shop_id) });
    qc.invalidateQueries({ queryKey: qk.dashboard(b.shop_id) });
    qc.invalidateQueries({ queryKey: ['slots', b.shop_id] });
  };
  return {
    create: useMutation({ mutationFn: bookingsApi.create, onSuccess: refresh }),
    cancel: useMutation({ mutationFn: bookingsApi.cancel, onSuccess: refresh }),
    setStatus: useMutation({ mutationFn: bookingsApi.setStatus, onSuccess: refresh }),
  };
}
