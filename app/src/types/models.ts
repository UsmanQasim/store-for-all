/**
 * Row shapes mirroring supabase/migrations. For full type-safety later run:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */
export type UUID = string;

export type ShopStatus = 'active' | 'suspended';
export type ItemKind = 'service' | 'product';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show';
export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'packing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'rejected';
export type Fulfillment = 'pickup' | 'delivery';
export type PaymentMethodType =
  | 'jazzcash'
  | 'easypaisa'
  | 'sadapay'
  | 'nayapay'
  | 'raast'
  | 'bank_account'
  | 'upi'
  | 'paypal'
  | 'wise'
  | 'other';
export type ReportReason = 'spam' | 'offensive' | 'harassment' | 'fake' | 'scam' | 'other';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type TimeRange = { open: string; close: string }; // "09:00"
export type OpeningHours = Partial<Record<DayKey, TimeRange[]>>;

export interface Profile {
  id: UUID;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  locale: 'en' | 'ur';
  shop_updates_opt_in: boolean;
  created_at: string;
}

export interface Category {
  slug: string;
  name_en: string;
  name_ur: string;
  icon: string;
  supports_booking: boolean;
  supports_ordering: boolean;
  sort: number;
}

export interface Shop {
  id: UUID;
  owner_id: UUID;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
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
  opening_hours: OpeningHours;
  accepts_bookings: boolean;
  accepts_orders: boolean;
  offers_delivery: boolean;
  booking_capacity: number;
  slot_minutes: number;
  booking_days_ahead: number;
  min_order_amount: number;
  is_published: boolean;
  status: ShopStatus;
  rating_avg: number;
  rating_count: number;
  favorites_count: number;
  created_at: string;
}

/** Editable by owners (matches column GRANTs in the migration). */
export type ShopInput = Partial<
  Pick<
    Shop,
    | 'name'
    | 'tagline'
    | 'description'
    | 'category_slug'
    | 'phone'
    | 'whatsapp'
    | 'email'
    | 'address'
    | 'area'
    | 'city'
    | 'country_code'
    | 'logo_url'
    | 'cover_url'
    | 'timezone'
    | 'currency'
    | 'opening_hours'
    | 'accepts_bookings'
    | 'accepts_orders'
    | 'offers_delivery'
    | 'booking_capacity'
    | 'slot_minutes'
    | 'booking_days_ahead'
    | 'min_order_amount'
    | 'is_published'
  >
>;

export interface NearbyShop {
  id: UUID;
  slug: string;
  name: string;
  tagline: string | null;
  category_slug: string;
  area: string | null;
  city: string | null;
  logo_url: string | null;
  cover_url: string | null;
  rating_avg: number;
  rating_count: number;
  accepts_bookings: boolean;
  accepts_orders: boolean;
  offers_delivery: boolean;
  lat: number | null;
  lng: number | null;
  distance_m: number | null;
  address: string | null;
  opening_hours: OpeningHours;
  timezone: string;
}

export interface PaymentMethod {
  id: UUID;
  shop_id: UUID;
  type: PaymentMethodType;
  account_title: string;
  account_number: string | null;
  iban: string | null;
  bank_name: string | null;
  qr_image_url: string | null;
  note: string | null;
  is_primary: boolean;
  is_active: boolean;
  sort: number;
}

export interface CatalogItem {
  id: UUID;
  shop_id: UUID;
  kind: ItemKind;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  duration_minutes: number | null;
  image_url: string | null;
  is_available: boolean;
  sort: number;
}

export interface Slot {
  slot_start: string;
  slot_end: string;
  remaining: number;
}

export type ShopEmbed = Pick<Shop, 'id' | 'name' | 'logo_url' | 'slug' | 'phone' | 'whatsapp' | 'currency' | 'timezone' | 'address' | 'area' | 'city' | 'lat' | 'lng' | 'category_slug' | 'country_code'>;

export interface Booking {
  id: UUID;
  code: string;
  shop_id: UUID;
  customer_id: UUID;
  service_id: UUID | null;
  service_name: string | null;
  price: number | null;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  customer_note: string | null;
  owner_note: string | null;
  created_at: string;
  shop?: ShopEmbed;
  customer?: Pick<Profile, 'id' | 'full_name' | 'phone' | 'avatar_url'> | null;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  item_id: UUID | null;
  name: string;
  unit: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  item?: { image_url: string | null } | null;
}

export interface Order {
  id: UUID;
  code: string;
  shop_id: UUID;
  customer_id: UUID;
  status: OrderStatus;
  fulfillment: Fulfillment;
  delivery_address: string | null;
  customer_phone: string | null;
  customer_note: string | null;
  subtotal: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shop?: ShopEmbed;
  customer?: Pick<Profile, 'id' | 'full_name' | 'phone' | 'avatar_url'> | null;
}

export interface Review {
  id: UUID;
  shop_id: UUID;
  author_id: UUID;
  rating: number;
  comment: string | null;
  author_name: string | null;
  author_avatar: string | null;
  owner_reply: string | null;
  replied_at: string | null;
  is_hidden: boolean;
  created_at: string;
}

export interface ShopPost {
  id: UUID;
  shop_id: UUID;
  title: string;
  body: string | null;
  image_url: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: UUID;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, string>;
  read_at: string | null;
  created_at: string;
}

export interface ShopDashboard {
  bookings_today: number;
  bookings_pending: number;
  orders_open: number;
  orders_new: number;
  revenue_today: number;
  bookings_done_today: number;
  bookings_upcoming_today: number;
  followers: number;
  rating_avg: number;
  rating_count: number;
}
