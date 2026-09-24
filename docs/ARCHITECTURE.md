# Dukaan — System Design

## 1. Goals & constraints

| Goal | Decision |
|---|---|
| Ship an MVP fast, mostly on free tiers | **Expo (SDK 57) + Supabase** (Postgres, Auth, Storage, Realtime) — no custom server to host |
| Mobile-first, Android first, iOS-ready | Expo Router, one TypeScript codebase, EAS Build |
| Many small shops, each with a public page + QR | One multi-tenant Postgres schema; `shops.slug` is the stable public ID printed on QR posters |
| Correctness under concurrency (last seat, double orders) | Writes that matter go through **SECURITY DEFINER RPCs** with advisory locks and state machines |
| Security with a “thick client” | **Row Level Security** on every table + **column-level GRANTs**; the anon key is public by design |
| Google Play compliance | In-app account deletion, UGC report/block, least-privilege permissions, off-app payments (no Billing), prominent disclosures |

## 2. High-level architecture

```
                 ┌───────────────────────────── Expo app (Android / iOS) ──────────────────────────────┐
                 │ Expo Router screens → React Query hooks (services/*) → supabase-js                   │
                 │ Providers: Auth · Location · Cart · Theme      Realtime channel per user            │
                 └───────────────┬───────────────────────────────┬───────────────────────────────────────┘
                                 │ HTTPS (PostgREST / RPC)       │ WebSocket (Realtime, RLS-filtered)
                                 ▼                               ▼
┌────────────────────────────────────────── Supabase (free tier) ──────────────────────────────────────────┐
│ Auth (email OTP) ──► auth.users ──trigger──► public.profiles                                              │
│ Postgres 15 + PostGIS + pg_trgm                                                                           │
│   tables: shops, catalog_items, shop_payment_methods, bookings, orders, order_items, reviews,            │
│           favorites, shop_posts, notifications, push_tokens, content_reports, user_blocks, categories    │
│   RPCs: nearby_shops · get_available_slots · create_booking · place_order · update_*_status · …          │
│   triggers: rating/favorite aggregates · notification fan-out · slug generation · rate limits            │
│   notifications INSERT ──pg_net──► Expo Push API (exp.host) ──► FCM/APNs ──► device                       │
│ Storage bucket `media/<uid>/…` (public read, owner write)                                                 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ anon REST (read-only by RLS)
┌────────────────── Static site (Cloudflare Pages / Netlify / Vercel — free) ──────────────────┐
│ /            marketing landing            /privacy /terms /delete-account /community-guidelines│
│ /s/<slug>    QR web fallback: shop + payment details + “Open in app” / Play Store             │
│ /.well-known/assetlinks.json  → Android App Links verification                                │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Why no backend server?** Every business rule lives in Postgres (RLS + RPC + triggers), which is testable in SQL, atomic, and free to host. Add Supabase Edge Functions later only for things Postgres can’t do (third-party webhooks, SMS, payments).

## 3. The QR flow (core growth loop)

1. Owner registers → trigger generates an immutable `slug` (`alis-cuts-4eac`).
2. App shows QR for `https://<domain>/s/<slug>` and prints an A4 poster (`expo-print` → PDF).
3. Customer scans with **any camera**:
   - **App installed** → Android App Link (verified by `assetlinks.json`) opens `s/[slug].tsx` → *Pay · Open · Favorite*.
   - **Not installed** → static `/s/index.html` reads the shop + payment methods via anon REST and shows copyable details, plus “Open in app” (`intent://` with Play Store fallback).
4. In-app scanner (`expo-camera`) parses the same URL and **only accepts our domain** (`parseShopSlug`) — a QR pointing elsewhere is rejected, which blocks phishing QR stickers.
5. Favoriting pins the shop to Home and subscribes the user to that shop’s offers (`shop_posts` → push).

## 4. Data model (key tables)

| Table | Purpose | Notes |
|---|---|---|
| `profiles` | 1:1 with `auth.users` | Created by trigger. Visible to self + shops you transacted with |
| `categories` | Reference data (EN/UR names, icon, defaults) | Seeded in migration |
| `shops` | Tenant | `slug` immutable; `location geography(point)` + generated `lat/lng`; server-owned `rating_avg`, `favorites_count`, `status` |
| `shop_payment_methods` | What the Pay page shows | Public read when shop visible; one primary per shop (trigger); max 10 |
| `catalog_items` | Services (duration) & products (unit) | Max 500 per shop |
| `bookings` | Seat reservations | `code` for counter check-in; status machine |
| `orders` + `order_items` | Pre-orders | Prices snapshotted server-side |
| `reviews` | UGC | One per user per shop; author name/avatar snapshotted; auto-hidden after 3 reports |
| `favorites` | Follow a shop | Drives Home and offer notifications |
| `shop_posts` | Offers/announcements | 3/day/shop rate limit |
| `notifications` | In-app inbox | Insert → Expo push via `pg_net` |
| `content_reports`, `user_blocks` | Play UGC compliance | |

### State machines (enforced in SQL)

```
Booking:  pending ──► confirmed ──► completed
             │  │         ├──────► no_show
             │  └► rejected └─────► cancelled (owner)
             └───► cancelled (customer, only before start)

Order:    placed ──► accepted ──► packing ──► ready ──► completed
            │  └► rejected   └──────┴──► cancelled     └► out_for_delivery ──► completed (delivery only)
            └──► cancelled (customer, only while placed)
```

### Booking capacity algorithm

`get_available_slots(shop, date, service)` expands the shop’s `opening_hours` for that weekday **in the shop’s timezone** (handles ranges past midnight), steps by `slot_minutes`, and for each slot counts overlapping `pending|confirmed` bookings against `booking_capacity` (number of chairs). `create_booking` takes `pg_advisory_xact_lock(shop)`, re-validates the slot through the same function, enforces max 2 active bookings per customer per shop, then inserts. Two customers can never take the last chair.

## 5. Security model

- **RLS everywhere.** `revoke all` from `anon`/`authenticated`, then grant exactly what’s needed.
- **Column GRANTs** prevent writing server-owned fields (e.g. a user cannot `update shops set rating_avg = 5`, or set `owner_id`, `slug`, `status`).
- **No direct writes** to `bookings`/`orders`/`order_items`; only RPCs that validate and price server-side.
- **Helper functions** (`is_shop_owner`, `shop_is_visible`, `is_blocked_by_me`) are `SECURITY DEFINER` with fixed `search_path` to avoid RLS recursion and search-path attacks.
- **Storage**: users can only write under `media/<their uid>/`; 3 MB limit; JPEG/PNG/WebP only. Images are resized client-side before upload.
- **Public data by design**: shop listings and payment methods (that’s the product). Customer phone numbers are only visible to shops the customer transacted with.
- **Abuse limits**: shops/owner (5), catalog (500), payment methods (10), posts (3/day), active bookings (2/shop), open orders (5/shop), reviews (1/shop).
- **Account deletion** (`delete_my_account`) cascades through every table; client deletes storage objects first.

Verified locally: `supabase/tests/smoke.sql` style checks (see README) confirm capacity limits, protected columns, blocked transitions, self-review prevention, anon isolation and cascading deletion.

## 6. App structure

```
app/
  app.config.ts          native config (permissions, App Links, plugins) — reads brand.json
  brand.json             rename the product in one place
  eas.json               dev / preview (APK) / production (AAB) build profiles
  src/
    app/                 Expo Router routes (one file = one screen, IDs in DESIGN.md)
      (tabs)/            Home · Explore · Scan · Activity · Profile
      shop/[id]/         detail · book · cart · pay · reviews
      s/[slug].tsx       QR / App Link landing
      business/          owner dashboard + [shopId]/{edit,catalog,item,payments,payment,qr,posts,bookings,orders}
    components/ui/       design-system primitives (Button, Input, Card, Chip, Badge, …)
    services/            data access + React Query hooks per domain
    providers/           Auth, Location, Cart
    lib/                 supabase client, config, errors, format, links, qr, upload, notifications
    theme/               tokens (mirror of DESIGN.md) + light/dark
    i18n/                en + ur (typed keys, RTL-aware)
    types/models.ts      row types
```

**Data flow:** screens never call Supabase directly — they use hooks from `services/*`, which own query keys (`lib/queryClient.ts`) and invalidation. Realtime (`hooks/useRealtime.ts`) only invalidates queries, so there’s a single source of truth.

## 7. Free-tier budget & scaling path

| Service | Free tier (check current limits) | When you outgrow it |
|---|---|---|
| Supabase | 2 projects, 500 MB DB, 1 GB storage, 50k MAU, pauses after 7 days idle | Pro plan; add read replicas; move images to Cloudflare R2 |
| Auth emails | Built-in SMTP is heavily rate-limited — **configure a free SMTP** (Resend / Brevo) before launch | Paid SMTP; add phone OTP (Twilio) later |
| Expo Push | Free | — |
| EAS Build | Free monthly build quota (low priority queue) | Local builds (`npx expo run:android --variant release`) or paid plan |
| Static hosting | Cloudflare Pages / Netlify free | — |
| Maps | Deep links to Google Maps (no API key) | Add `react-native-maps` + key if you need an in-app map |

Indexes already in place: GiST on `shops.location`, trigram on `shops.name`, composite indexes for queues and feeds.

## 8. Roadmap (post-MVP)

- Phone OTP & Google sign-in; WhatsApp notifications for owners.
- Play Install Referrer → auto-favorite the scanned shop after install.
- Android home-screen pinned shortcut for favorite shops.
- Staff accounts per shop; walk-in queue tokens; recurring appointments.
- Admin moderation dashboard (Supabase Studio works for now: filter `content_reports` where `status = 'open'`).
- Analytics (PostHog free tier) with consent; Sentry for crash reporting.
- Generated DB types (`supabase gen types`) replacing `types/models.ts`.
