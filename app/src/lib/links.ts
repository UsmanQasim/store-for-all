import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import { config } from './config';

/** The one URL printed on every QR poster. Opens the app (App Links) or the web fallback. */
export function shopPublicUrl(slug: string): string {
  return `${config.webUrl}/s/${slug}`;
}

/**
 * Extracts a shop slug from anything a QR might contain:
 *   https://dukaan.app/s/ali-cuts-4eac   dukaan://s/ali-cuts-4eac   ali-cuts-4eac
 */
export function parseShopSlug(raw: string): string | null {
  const value = raw.trim();
  const m = value.match(/(?:^|\/)s\/([a-z0-9-]{3,64})(?:[/?#]|$)/i);
  if (m) {
    const host = safeHost(value);
    const allowed = [config.brand.webDomain, `www.${config.brand.webDomain}`, safeHost(config.webUrl)];
    if (host === null || allowed.includes(host)) return m[1]!.toLowerCase();
    return null; // someone else's URL that happens to contain /s/
  }
  if (/^[a-z0-9-]{3,64}$/.test(value)) return value;
  return null;
}

function safeHost(url: string): string | null {
  const m = url.match(/^https?:\/\/([^/?#]+)/i);
  return m ? m[1]!.toLowerCase() : null;
}

function digits(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/** Normalises local PK numbers (03xx…) to international for wa.me. */
export function toInternational(phone: string, countryCode = 'PK'): string {
  const d = digits(phone).replace(/^\+/, '');
  if (countryCode === 'PK' && d.startsWith('0')) return `92${d.slice(1)}`;
  if (countryCode === 'IN' && d.length === 10) return `91${d}`;
  return d;
}

export const open = {
  call: (phone: string) => Linking.openURL(`tel:${digits(phone)}`),
  whatsapp: (phone: string, text = '', countryCode?: string) =>
    Linking.openURL(`https://wa.me/${toInternational(phone, countryCode)}${text ? `?text=${encodeURIComponent(text)}` : ''}`),
  maps: (lat: number, lng: number) => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`),
  url: (url: string) => Linking.openURL(url),
};

export async function shareShop(name: string, slug: string) {
  const url = shopPublicUrl(slug);
  await Share.share({ message: `${name} on ${config.brand.name}: ${url}`, url, title: name });
}
