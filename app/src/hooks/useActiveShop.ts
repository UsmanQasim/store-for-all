import { useEffect, useState } from 'react';
import { KEYS, kv } from '@/lib/storage';
import { useAuth } from '@/providers/AuthProvider';
import { useMyShops } from '@/services/shops';

/** The shop the merchant is currently managing (persisted between launches). */
export function useActiveShop() {
  const { user } = useAuth();
  const shops = useMyShops(user?.id);
  const [selectedId, setSelectedId] = useState<string | null>(kv.get(KEYS.businessShop));

  const list = shops.data ?? [];
  const active = list.find((s) => s.id === selectedId) ?? list[0] ?? null;

  useEffect(() => {
    if (active && active.id !== selectedId) setSelectedId(active.id);
  }, [active, selectedId]);

  const select = (id: string) => {
    kv.set(KEYS.businessShop, id);
    setSelectedId(id);
  };

  return { shops: list, active, select, isLoading: shops.isLoading, refetch: shops.refetch };
}
