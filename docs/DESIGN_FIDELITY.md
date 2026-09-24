# Stitch designs → app screens

Each screen was rebuilt from its Stitch export (`designs/<id>/code.html`), using the same Tailwind tokens and class names through NativeWind. Every screen was screenshotted side by side with a render of the design at 412 px.

| Design | Route / file |
|---|---|
| A01 Onboarding | `src/app/onboarding.tsx` |
| C01 Home | `src/app/(tabs)/index.tsx` |
| C02 Explore | `src/app/(tabs)/explore.tsx` |
| C03 Shop detail | `src/app/shop/[id]/index.tsx` |
| C04 Book a seat | `src/app/shop/[id]/book.tsx` |
| C05 Cart & checkout | `src/app/shop/[id]/cart.tsx` |
| C06 Pay the shop | `src/app/shop/[id]/pay.tsx` |
| C08 QR scanner | `src/app/(tabs)/scan.tsx` |
| C09 Scan result | `src/app/s/[slug].tsx` |
| C10 Activity | `src/app/(tabs)/activity.tsx` |
| C11 Booking ticket | `src/app/booking/[id].tsx` |
| C12 Order tracking | `src/app/order/[id].tsx` |
| C14 Profile & settings | `src/app/(tabs)/profile.tsx` |
| B01 Business dashboard | `src/app/business/index.tsx` |
| B02 Register / edit shop | `src/components/business/ShopForm.tsx` (`business/create`, `business/[shopId]/edit`) |
| B05 Payment methods | `src/app/business/[shopId]/payments.tsx` |
| B08 Booking queue | `src/app/business/[shopId]/bookings.tsx` |
| B10 Order detail & packing | `src/app/business/order/[id].tsx` |
| P01 Counter QR poster | `src/app/business/[shopId]/qr.tsx` (preview) + `src/lib/qr.ts` (A4 PDF) |
| Brand logo | `components/shell.tsx` `BrandLogo`, `app/assets/*` icons, `web/src/app/icon.svg` |
| Landing page | `web/src/components/Landing.tsx` (`/` English, `/ur` Urdu) |

Screens that had no design (sign-in, verify, complete profile, notifications, edit profile, delete account, reviews, catalog, item editor, payment editor, offers, owner order list, 404) use the same design language.

## Intentional differences (honesty / Google Play)

The Stitch mockups contain example text. Anything the app can't back with real data was either replaced with something real or removed:

- **Removed or replaced invented claims:** customer testimonials, "120,000+ residents / 14,000+ shops", 4.9★ platform rating, "State Bank compliant", "Verified Merchant/Resident", "Dukaan Score", "Trusted by…", and the "Dukaan Technologies Pvt Ltd" company name.
  - The landing testimonials section became **How it works**.
  - The stats now read "Rs 0 — free for customers".
- **Features that don't exist:**
  - Removed: rider/ETA tracking, delivery fees, chair/staff selection ("Chair 1", "Ustad Rashid"), customer ratings/distance on orders, profile views, physical standee delivery, prescription upload, SMS alerts, and "payment settled/auto-approved" states. The app never sees payments; customers pay the shop directly.
  - Replacements: Followers instead of profile views; the printable A4 poster instead of the acrylic standee; "Regular (N visits)" / "New customer", computed from real completed bookings.
- **Controls that did nothing:**
  - The landing EN/اردو toggle now works: it switches to the Urdu page at `/ur`.
  - The B08 "tune" button was removed (the list is sorted by time).
- **Poster:** the rating chip only appears when the shop has reviews. "Chairs open now" became "Book online / Pre-order online", because a printed poster can't be live.
