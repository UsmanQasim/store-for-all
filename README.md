# Store For All — **Dukaan**

Digital shop for everyone. A mobile-first, all-in-one app for neighbourhood shops: customers find shops nearby, **book a seat**, **pre-order** products, **review**, **favorite**, and **scan the shop QR to pay**. Shop owners get a free dashboard with a booking queue, order queue, catalog, offers to followers and a printable QR poster.

> The brand name “Dukaan” is a placeholder — rename it in `app/brand.json`, `web/src/lib/site.ts` and the landing copy in `web/src/components/Landing.tsx`.

| Folder | What |
|---|---|
| `app/` | Expo SDK 57 app (React Native 0.86, Expo Router, TypeScript, React Query, Supabase) |
| `supabase/` | Database migrations (schema, RLS, RPCs, triggers, storage) + local smoke tests |
| `web/` | Website (Next.js + TypeScript): marketing landing (English + Urdu), SEO shop pages (`/s/<slug>`, also the QR fallback), shop directory, legal pages, sitemap, `assetlinks.json` |
| `DESIGN.md` | Design system + **copy-paste prompts for Google Stitch**, screen IDs mapped to route files |
| `docs/ARCHITECTURE.md` | System design, security model, data model, scaling path |
| `docs/PLAY_COMPLIANCE.md` | Google Play checklist + Data safety answers |

Everything runs on free tiers: Supabase, Expo/EAS, Expo Push, Vercel (Hobby).

---

## 1. Backend — Supabase (≈10 min)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run `supabase/migrations/20260924000001_init.sql`, then `…000002_storage_realtime.sql`.
   *Or with the CLI:* `npx supabase init` (keep existing files) → `npx supabase link --project-ref <ref>` → `npx supabase db push`.
3. **Authentication → Providers → Email**: enable, turn on “Email OTP”. In **Email Templates → Magic Link**, include `{{ .Token }}` so users receive a 6-digit code.
4. **Authentication → SMTP**: add a free SMTP provider (Resend / Brevo). The built-in sender is rate-limited and not for production.
5. **Project Settings → API**: copy the Project URL and the anon/publishable key.

Test the SQL locally (optional, needs Postgres + PostGIS):
```bash
createdb dukaan_test
psql -d dukaan_test -f supabase/tests/local_stub.sql -f supabase/migrations/20260924000001_init.sql -f supabase/tests/smoke.sql
```

## 2. App — Expo

```bash
cd app
cp .env.example .env          # fill EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY / _WEB_URL
npm install
npx expo start                # press "a" for Android
```

The app uses native modules (camera, notifications, SQLite), so for full testing build a **development client** once:
```bash
npx eas-cli@latest login
npx eas-cli@latest init       # writes the EAS project id; copy it into .env as EAS_PROJECT_ID
npm run build:dev             # installable APK with dev client
```
Most screens also work in Expo Go.

Checks: `npm run typecheck` · `npx expo-doctor` · `npx expo export --platform android` (full bundle).

**UI stack:** screens are built with **NativeWind** (Tailwind classes) using the exact Stitch tokens in `app/tailwind.config.js` — the classes in each screen mirror the Stitch export (`designs/<id>/code.html`). Shared pieces: `src/components/ui` (buttons, inputs, chips…), `src/components/shell.tsx` (headers, customer/business nav bars).

**Icons:** Material Symbols, bundled as SVG paths (no icon font download). To use a new icon, add its name to `app/scripts/icon-names.txt` and run `node scripts/gen-icons.cjs`; TypeScript will reject unknown icon names.

**App icon / splash** are generated from the brand logo (`designs/dukaan_brand_logo`) into `app/assets/`.

**Release:** `npm run build:prod` (AAB) → `npm run submit` (uploads to the internal track). See `docs/PLAY_COMPLIANCE.md` before going public.

## 3. Website — Next.js (`web/`)

Next.js 16 (App Router, TypeScript, Tailwind with the Stitch tokens). Every page is server-rendered HTML, so Google sees the full content.

| Route | What | Rendering |
|---|---|---|
| `/` and `/ur` | Stitch landing page in English and Urdu (RTL, Nastaliq), linked with `hreflang` | Static |
| `/s/<slug>` | One page per published shop: name, area, services & prices, reviews, hours, map link, payment details with copy buttons, “Book in the app”. `LocalBusiness` + breadcrumb structured data. This is also the page a QR opens when the app isn't installed. | Static + refreshed every 5 min (ISR) |
| `/shops` | Directory of all shops by city (helps Google find every shop page) | Static, hourly |
| `/privacy` `/terms` `/community-guidelines` `/delete-account` | Legal pages (old `.html` URLs redirect here) | Static |
| `/sitemap.xml` `/robots.txt` `/.well-known/assetlinks.json` | SEO + Android App Links | Generated |

```bash
cd web
cp .env.example .env.local     # same Supabase URL + anon key as the app, and your domain
npm install
npm run dev                    # http://localhost:3000
npm run build                  # production build (also type-checks)
```

**Deploy (free):** import the repo into Vercel, set **Root Directory = `web`**, add the variables from `.env.example`, deploy, then point your domain at it. Set `webDomain` in `app/brand.json` to the same domain.

**After the first Play upload:** paste the **App signing SHA-256** into `web/public/.well-known/assetlinks.json` so QR links open the app directly.

**Search Console:** add the domain in Google Search Console and submit `https://<domain>/sitemap.xml`.

Notes:
- Payment numbers are shown on shop pages for customers at the counter, but marked `data-nosnippet` so Google doesn't put them in search results.
- Icons are inline SVGs generated from the icons the code uses (`scripts/gen-icons.mjs`, runs automatically). Fonts are self-hosted. English pages only download an ~80 KB Urdu font subset for their few Urdu words (`scripts/subset-urdu.py`); the full Urdu font loads only on `/ur`.

## 4. Designing with Google Stitch

Open `DESIGN.md`, paste **Prompt 0** (design system) into Stitch, then each screen prompt. Export screens named by their ID (e.g. `C03-shop-detail.png`) or connect the Stitch MCP, and share them back — each ID maps to one route file, so the new visuals can be dropped into the working screens without touching data or logic. Tokens live in `app/tailwind.config.js` (copied verbatim from the Stitch export).

## 5. How the pieces fit

```
Customer scans QR ──► https://<domain>/s/<slug>
      ├─ app installed ─► App Link ─► app: Pay · Open shop · Favorite
      └─ not installed ─► web page: payment details + Get the app
Customer books/orders ─► RPC (validates, locks, prices) ─► row + notification ─► Expo push to owner
Owner confirms/updates ─► RPC state machine ─► notification ─► push + realtime refresh for customer
```

Details: `docs/ARCHITECTURE.md`.
