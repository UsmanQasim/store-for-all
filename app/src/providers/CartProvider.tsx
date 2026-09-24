import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CatalogItem } from '@/types/models';

/** One cart at a time, tied to a single shop (like most local-commerce apps). */
export type CartLine = { item: Pick<CatalogItem, 'id' | 'name' | 'price' | 'unit' | 'image_url'>; quantity: number };
type Cart = { shopId: string | null; lines: CartLine[] };

type CartState = Cart & {
  count: number;
  subtotal: number;
  quantityOf: (itemId: string) => number;
  /** Returns false if the item belongs to another shop (caller asks to reset). */
  add: (shopId: string, item: CartLine['item']) => boolean;
  setQuantity: (itemId: string, quantity: number) => void;
  reset: (shopId?: string | null) => void;
};

const KEY = 'cart.v1';
const CartContext = createContext<CartState | null>(null);

function load(): Cart {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) return JSON.parse(raw) as Cart;
  } catch {
    /* ignore */
  }
  return { shopId: null, lines: [] };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(load);

  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const add = useCallback(
    (shopId: string, item: CartLine['item']) => {
      if (cart.shopId && cart.shopId !== shopId && cart.lines.length > 0) return false;
      setCart((c) => {
        const existing = c.lines.find((l) => l.item.id === item.id);
        const lines = existing
          ? c.lines.map((l) => (l.item.id === item.id ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l))
          : [...c.lines, { item, quantity: 1 }];
        return { shopId, lines };
      });
      return true;
    },
    [cart.shopId, cart.lines.length],
  );

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((c) => {
      const lines =
        quantity <= 0
          ? c.lines.filter((l) => l.item.id !== itemId)
          : c.lines.map((l) => (l.item.id === itemId ? { ...l, quantity: Math.min(99, quantity) } : l));
      return { shopId: lines.length ? c.shopId : null, lines };
    });
  }, []);

  const reset = useCallback((shopId: string | null = null) => setCart({ shopId, lines: [] }), []);

  const value = useMemo<CartState>(() => {
    const count = cart.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = cart.lines.reduce((n, l) => n + l.quantity * Number(l.item.price), 0);
    return {
      ...cart,
      count,
      subtotal,
      quantityOf: (id) => cart.lines.find((l) => l.item.id === id)?.quantity ?? 0,
      add,
      setQuantity,
      reset,
    };
  }, [cart, add, setQuantity, reset]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
