import { site } from './site';

/** Read-only PostgREST call with the public anon key (RLS decides what's visible). Cached for ISR. */
export async function rest<T>(path: string, revalidate = 300): Promise<T> {
  if (!site.supabaseUrl || !site.supabaseKey) throw new Error('Supabase env not configured');
  const res = await fetch(`${site.supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: site.supabaseKey, Authorization: `Bearer ${site.supabaseKey}` },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Hours = Partial<Record<DayKey, { open: string; close: string }[]>>;

export interface Shop {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_slug: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  area: string | null;
  city: string | null;
  country_code: string;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  cover_url: string | null;
  timezone: string;
  currency: string;
  opening_hours: Hours | null;
  accepts_bookings: boolean;
  accepts_orders: boolean;
  offers_delivery: boolean;
  rating_avg: number;
  rating_count: number;
  updated_at: string;
  category?: { name_en: string; name_ur: string } | null;
}

export interface Item {
  id: string;
  kind: 'service' | 'product';
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  duration_minutes: number | null;
  image_url: string | null;
}

export interface PayMethod {
  id: string;
  type: string;
  account_title: string;
  account_number: string | null;
  iban: string | null;
  bank_name: string | null;
  qr_image_url: string | null;
  note: string | null;
  is_primary: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string | null;
  owner_reply: string | null;
  created_at: string;
}

const SHOP_COLS =
  'id,slug,name,tagline,description,category_slug,phone,whatsapp,address,area,city,country_code,lat,lng,logo_url,cover_url,timezone,currency,opening_hours,accepts_bookings,accepts_orders,offers_delivery,rating_avg,rating_count,updated_at,category:categories(name_en,name_ur)';

/** RLS only returns published, active shops to anon — unpublished slugs 404. */
export async function getShop(slug: string) {
  const [shop] = await rest<Shop[]>(`shops?slug=eq.${encodeURIComponent(slug)}&select=${SHOP_COLS}&limit=1`);
  if (!shop) return null;
  const [items, methods, reviews] = await Promise.all([
    rest<Item[]>(`catalog_items?shop_id=eq.${shop.id}&is_available=eq.true&select=id,kind,name,description,price,unit,duration_minutes,image_url&order=sort.asc,name.asc&limit=200`),
    rest<PayMethod[]>(`shop_payment_methods?shop_id=eq.${shop.id}&select=id,type,account_title,account_number,iban,bank_name,qr_image_url,note,is_primary&order=is_primary.desc,sort.asc`),
    rest<Review[]>(`reviews?shop_id=eq.${shop.id}&is_hidden=eq.false&select=id,rating,comment,author_name,owner_reply,created_at&order=created_at.desc&limit=6`),
  ]);
  return { shop, items, methods, reviews };
}

export async function listShops() {
  return rest<Pick<Shop, 'slug' | 'name' | 'tagline' | 'area' | 'city' | 'category_slug' | 'rating_avg' | 'rating_count' | 'logo_url' | 'updated_at'>[]>(
    'shops?select=slug,name,tagline,area,city,category_slug,rating_avg,rating_count,logo_url,updated_at&order=city.asc,name.asc&limit=5000',
    3600,
  );
}
