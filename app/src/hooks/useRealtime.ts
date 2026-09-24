import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

/**
 * One realtime channel per signed-in user. RLS scopes the stream, so users
 * only receive their own notifications and bookings/orders they can see.
 * We just invalidate queries — React Query refetches what's on screen.
 */
export function useRealtimeSync(uid: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`user:${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () =>
        qc.invalidateQueries({ queryKey: qk.notifications }),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (p) => {
        const row = (p.new ?? p.old) as { shop_id?: string; id?: string };
        qc.invalidateQueries({ queryKey: qk.myBookings });
        if (row.id) qc.invalidateQueries({ queryKey: qk.booking(row.id) });
        if (row.shop_id) {
          qc.invalidateQueries({ queryKey: qk.shopBookings(row.shop_id) });
          qc.invalidateQueries({ queryKey: qk.dashboard(row.shop_id) });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        const row = (p.new ?? p.old) as { shop_id?: string; id?: string };
        qc.invalidateQueries({ queryKey: qk.myOrders });
        if (row.id) qc.invalidateQueries({ queryKey: qk.order(row.id) });
        if (row.shop_id) {
          qc.invalidateQueries({ queryKey: qk.shopOrders(row.shop_id) });
          qc.invalidateQueries({ queryKey: qk.dashboard(row.shop_id) });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, qc]);
}
