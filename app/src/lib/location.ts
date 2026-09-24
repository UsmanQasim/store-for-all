import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number };
export type PlaceInfo = { area?: string; city?: string; countryCode?: string };

/** Foreground-only. Returns null (never throws) when denied or unavailable. */
export async function getCurrentCoords(ask = true): Promise<Coords | null> {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted' && ask) ({ status } = await Location.requestForegroundPermissionsAsync());
    if (status !== 'granted') return null;
    const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 });
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

export async function reverseGeocode(c: Coords): Promise<PlaceInfo> {
  try {
    const [p] = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
    if (!p) return {};
    return {
      area: p.district ?? p.subregion ?? p.street ?? undefined,
      city: p.city ?? p.region ?? undefined,
      countryCode: p.isoCountryCode ?? undefined,
    };
  } catch {
    return {};
  }
}
