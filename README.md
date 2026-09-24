# Store For All — **Dukaan**

Digital shop for everyone. A mobile-first, all-in-one app for neighbourhood shops: customers find shops nearby, **book a seat**, **pre-order** products, **review**, **favorite**, and **scan the shop QR to pay**. Shop owners get a free dashboard with a booking queue, order queue, catalog, offers to followers and a printable QR poster.

> The brand name “Dukaan” is a placeholder — rename it in `app/brand.json`, `landing/assets/config.js` and the landing HTML.

| Folder | What |
|---|---|
| `app/` | Expo SDK 57 app (React Native 0.86, Expo Router, TypeScript, React Query, Supabase) |
| `supabase/` | Database migrations (schema, RLS, RPCs, triggers, storage) + local smoke tests |
| `landing/` | Static marketing site, legal pages, QR web fallback (`/s/<slug>`), `assetlinks.json` |
| `DESIGN.md` | Design system + **copy-paste prompts for Google Stitch**, screen IDs mapped to route files |
| `docs/ARCHITECTURE.md` | System design, security model, data model, scaling path |
| `docs/PLAY_COMPLIANCE.md` | Google Play checklist + Data safety answers |

Everything runs on free tiers: Supabase, Expo/EAS, Expo Push, Cloudflare Pages/Netlify.

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

## 3. Landing site

`landing/` is static HTML — `index.html` is the Stitch landing design with CSS precompiled to `assets/landing.css` (no Tailwind CDN at runtime). If you edit classes in `index.html`, rebuild the CSS: `cd landing && npm install && npm run build:css`. Deploy the folder to Cloudflare Pages, Netlify or Vercel (redirect/rewrite for `/s/*` is included for each).
1. Edit `landing/assets/config.js` (Supabase URL + anon key, package name, Play link).
2. Point your domain at it; set `webDomain` in `app/brand.json` to the same domain.
3. After your first Play upload, paste the **App signing SHA-256** into `landing/.well-known/assetlinks.json` so QR links open the app directly.

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
