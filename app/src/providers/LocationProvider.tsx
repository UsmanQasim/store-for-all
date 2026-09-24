import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentCoords, reverseGeocode, type Coords } from '@/lib/location';

type LocationState = {
  coords: Coords | null;
  label: string | null;
  countryCode: string | null;
  loading: boolean;
  /** ask=true shows the OS permission prompt if needed. */
  refresh: (ask?: boolean) => Promise<Coords | null>;
};

const KEY = 'location.v1';
const Ctx = createContext<LocationState | null>(null);

type Stored = { coords: Coords; label: string | null; countryCode: string | null };

function load(): Stored | null {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const initial = load();
  const [coords, setCoords] = useState<Coords | null>(initial?.coords ?? null);
  const [label, setLabel] = useState<string | null>(initial?.label ?? null);
  const [countryCode, setCountry] = useState<string | null>(initial?.countryCode ?? null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (ask = false) => {
    setLoading(true);
    try {
      const c = await getCurrentCoords(ask);
      if (!c) return null;
      const place = await reverseGeocode(c);
      const nextLabel = [place.area, place.city].filter(Boolean).join(', ') || null;
      setCoords(c);
      setLabel(nextLabel);
      setCountry(place.countryCode ?? null);
      try {
        globalThis.localStorage?.setItem(KEY, JSON.stringify({ coords: c, label: nextLabel, countryCode: place.countryCode ?? null }));
      } catch {
        /* ignore */
      }
      return c;
    } finally {
      setLoading(false);
    }
  }, []);

  // Silent refresh on launch if permission was already granted.
  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const value = useMemo(() => ({ coords, label, countryCode, loading, refresh }), [coords, label, countryCode, loading, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserLocation(): LocationState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUserLocation must be used inside LocationProvider');
  return ctx;
}
