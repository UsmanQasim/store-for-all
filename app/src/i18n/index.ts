import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import en, { type Dictionary } from './en';
import ur from './ur';

export type Locale = 'en' | 'ur';

type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TKey = Paths<Dictionary>;

const dictionaries: Record<Locale, unknown> = { en, ur };
const STORAGE_KEY = 'app.locale';

function readStored(): Locale | null {
  try {
    const v = globalThis.localStorage?.getItem(STORAGE_KEY);
    return v === 'en' || v === 'ur' ? v : null;
  } catch {
    return null;
  }
}

let current: Locale = readStored() ?? (getLocales()[0]?.languageCode === 'ur' ? 'ur' : 'en');

export function getLocale(): Locale {
  return current;
}

/**
 * Switches language. Urdu is right-to-left; React Native applies direction
 * changes on the next app start, so callers should tell the user to restart.
 * Returns true when a restart is needed.
 */
export function setLocale(locale: Locale): boolean {
  current = locale;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, locale);
  } catch {
    /* non-fatal */
  }
  const rtl = locale === 'ur';
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}

function lookup(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

export function t(key: TKey | (string & {}), params?: Record<string, string | number>): string {
  let s = lookup(dictionaries[current], key) ?? lookup(en, key) ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
