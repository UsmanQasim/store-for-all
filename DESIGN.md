# Dukaan — Design Brief for Google Stitch

> **How to use this file**
> 1. Open [Google Stitch](https://stitch.withgoogle.com), choose **Mobile** (Android, 412×915).
> 2. Paste **Prompt 0 — Design System** first. Keep that project open so every later screen inherits the style.
> 3. Paste each numbered **screen prompt** one at a time (one screen per generation works best). Use “Edit” follow-ups for tweaks rather than re-generating.
> 4. Export each screen (PNG screenshot + the HTML/Tailwind code, or connect Stitch MCP) and name the export with the **Screen ID** below (e.g. `C03-shop-detail.png`). The ID maps 1:1 to a route file in `app/src/app/`, so each design can be wired straight into the working screen.
>
> The app already works end-to-end with a neutral placeholder UI built on the same tokens. Stitch output only replaces the visuals; data, navigation and logic stay the same.

---

## 1. Product in one paragraph

**Dukaan** (Urdu/Hindi for *shop*) is a mobile-first, all-in-one app for neighbourhood shops. Customers discover shops near them, **book a seat** (barber, salon, tailor, clinic), **pre-order** products (kiryana/grocery, bakery, pharmacy) for pickup or delivery, read and write **reviews**, **favorite** shops so they pin to their home screen, and **scan a shop’s QR** to see its **payment details** (JazzCash, Easypaisa, Raast, bank/IBAN, UPI…) and pay from their own wallet app. Shop owners use the same app in **Business mode** to register their shop, list services/products, manage a live booking and order queue, post offers to followers, and print a QR poster for the counter.

**Primary users:** everyday customers in Pakistan/South Asia on mid-range Android phones (often 5–6″ screens, bright outdoor light, patchy data), and small shop owners with limited tech experience. The design must be **simple, high-contrast, thumb-friendly and trustworthy**.

---

## 2. Brand & visual direction

| | |
|---|---|
| **Personality** | Warm, local, trustworthy, quick. Like a friendly neighbourhood shopkeeper — not a slick fintech. |
| **Mood words** | Fresh, grounded, generous white space, confident colour accents, rounded & soft. |
| **Avoid** | Neon gradients, glassmorphism, dark-pattern upsells, tiny grey text, stock-photo heavy layouts, crypto/fintech aesthetics. |
| **Imagery** | Real shop photos supplied by owners (covers/logos). Empty states use simple line icons in a soft green circle — no illustrations with people. |
| **Iconography** | Ionicons, outline style by default, filled when active/selected. 20–24 px. |

### Colour tokens (light theme)

| Token | Hex | Use |
|---|---|---|
| `primary` | **#0B6E4F** (deep emerald) | Primary buttons, active tab, links, selected chips, prices |
| `primaryPressed` | #08573F | Pressed state |
| `primarySoft` | #E8F5EF | Icon circles, selected rows, highlights, empty-state halos |
| `accent` | **#F5A000** (saffron) | Secondary CTA (Pre-order, Register shop), offers, “Pay” highlight, stars |
| `accentSoft` | #FFF1D6 | Offer cards, pay banner background |
| `background` | #FAF8F5 (warm off-white) | Screen background |
| `surface` | #FFFFFF | Cards, sheets, inputs, tab bar |
| `surfaceAlt` | #F2EFEA | Segmented control track, copy fields |
| `border` | #E6E1D9 | 1 px card/input borders, dividers |
| `text` | #1C1A17 | Headings & body |
| `textMuted` | #6B645C | Secondary text (must stay ≥ 4.5:1 on background) |
| `success` / `successSoft` | #1E8E4E / #DDF4E6 | “Open now”, completed |
| `warning` / `warningSoft` | #A86A00 / #FFF1D6 | Pending |
| `danger` / `dangerSoft` | #D93F3F / #FDE7E7 | Declined, delete, report |
| `info` / `infoSoft` | #2F6FEB / #E4EDFF | Packing, out for delivery, “New” badge |

**Dark theme** (auto with system): background #12110F, surface #1B1916, surfaceAlt #25221E, border #34302B, text #F4F1EC, textMuted #A8A097, primary #2FB385, primarySoft #10362A, accent #FFB938.

### Typography — Plus Jakarta Sans (Google Font)

| Style | Size / line-height | Weight |
|---|---|---|
| Display | 30 / 36, −0.5 tracking | ExtraBold 800 |
| H1 | 24 / 30 | Bold 700 |
| H2 | 20 / 26 | Bold 700 |
| H3 | 17 / 22 | SemiBold 600 |
| Body | 15 / 22 | Regular 400 |
| Body strong | 15 / 22 | SemiBold 600 |
| Caption | 13 / 18 | Medium 500 |
| Label (badges, overlines) | 12 / 16, +0.4 tracking, often UPPERCASE | SemiBold 600 |
| Price | 16 / 20 | Bold 700, primary colour |

Urdu text (optional language) uses **Noto Naskh Arabic**, right-to-left; layouts must mirror cleanly.

### Shape, spacing, elevation

- 4-pt grid; screen padding **16**; gap between sections **20**; inside cards **12–16**.
- Radius: small 8 · medium **12** (buttons, inputs) · large **16** (cards) · xl 24 (bottom sheets, hero) · pill 999 (chips, badges).
- Cards: white, 1 px `border`, very soft shadow (y 4, blur 12, 6 % black). Floating elements (cart bar, scan FAB): y 8, blur 20, 14 %.
- **Touch targets ≥ 48 dp.** Buttons 52 dp tall (small 40). Inputs 52 dp.

### Core components (Stitch should reuse these everywhere)

1. **Primary button** — full-width, 52 dp, radius 12, emerald fill, white SemiBold label, optional leading icon. Variants: *accent* (saffron fill, near-black text), *secondary* (white + border), *ghost* (text only, emerald), *danger* (soft red fill, red text).
2. **Input** — label above (caption, muted), white field, 1 px border, radius 12, optional leading icon, helper/error text below.
3. **Chip** — pill, 40 dp, white with border; selected = emerald fill + white text; optional leading icon.
4. **Badge** — small pill with soft tinted background + matching text (e.g. “Open now” green, “Pending” amber).
5. **Shop card** — cover image (120 dp, rounded top), overlapping square logo (56 dp, radius 14, white 3 px ring), name (H3), tagline (caption), row with ★ rating + distance, row of feature badges (“Book a seat”, “Pre-order”).
6. **Shop tile** — 96 dp wide square card with logo + 2-line name (favorites row).
7. **List row** — 56 dp, leading 36 dp icon in soft-green rounded square, title + subtitle, trailing chevron.
8. **Segmented control** — surfaceAlt track, white selected pill.
9. **Stat tile** — half-width card: small icon square, big number (H2), caption label.
10. **Status badge** colours: pending/placed = amber · confirmed/accepted = emerald · packing/out for delivery = blue · ready/completed = green · cancelled = grey · declined/no-show = red.
11. **Bottom tab bar** — white, 64 dp, 5 items: Home, Explore, **Scan (raised 52 dp emerald circle with white QR icon, 4 px white ring, floats 18 dp above bar)**, Activity, Profile.
12. **Sticky footer CTA bar** — white bar with top border holding the primary action on forms/checkout.
13. **Copy field** — surfaceAlt block: tiny uppercase label, large value (monospace-ish tracking for numbers), trailing “Copy” with icon; turns to “Copied ✓”.

---

## 3. Screen inventory

`C` = customer, `A` = auth/onboarding, `B` = business (shop owner). Route file in brackets.

| ID | Screen | Route file |
|---|---|---|
| A01 | Onboarding carousel (3 slides) | `onboarding.tsx` |
| A02 | Location permission explainer | `onboarding.tsx` (2nd state) |
| A03 | Sign in (email) | `sign-in.tsx` |
| A04 | Verify 6-digit code | `verify.tsx` |
| A05 | Complete profile | `complete-profile.tsx` |
| C01 | Home | `(tabs)/index.tsx` |
| C02 | Explore / search | `(tabs)/explore.tsx` |
| C03 | Shop detail | `shop/[id]/index.tsx` |
| C04 | Book a seat | `shop/[id]/book.tsx` |
| C05 | Cart / checkout | `shop/[id]/cart.tsx` |
| C06 | Pay the shop | `shop/[id]/pay.tsx` |
| C07 | Reviews | `shop/[id]/reviews.tsx` |
| C08 | QR scanner | `(tabs)/scan.tsx` |
| C09 | Scan result (pay / open / favorite) | `s/[slug].tsx` |
| C10 | Activity (bookings & orders) | `(tabs)/activity.tsx` |
| C11 | Booking detail | `booking/[id].tsx` |
| C12 | Order tracking | `order/[id].tsx` |
| C13 | Notifications | `notifications.tsx` |
| C14 | Profile & settings | `(tabs)/profile.tsx` |
| C15 | Edit profile | `settings/edit-profile.tsx` |
| C16 | Delete account | `settings/delete-account.tsx` |
| C17 | Report sheet (bottom sheet) | `components/ReportSheet.tsx` |
| B01 | Business dashboard | `business/index.tsx` |
| B02 | Register / edit shop form | `business/create.tsx`, `business/[shopId]/edit.tsx` |
| B03 | Services & products list | `business/[shopId]/catalog.tsx` |
| B04 | Add / edit item | `business/[shopId]/item.tsx` |
| B05 | Payment methods list | `business/[shopId]/payments.tsx` |
| B06 | Add payment method | `business/[shopId]/payment.tsx` |
| B07 | Shop QR code | `business/[shopId]/qr.tsx` |
| B08 | Booking queue | `business/[shopId]/bookings.tsx` |
| B09 | Order queue | `business/[shopId]/orders.tsx` |
| B10 | Order detail (owner) | `business/order/[id].tsx` |
| B11 | Offers & announcements | `business/[shopId]/posts.tsx` |
| P01 | QR print poster (A4) | `lib/qr.ts` (HTML → PDF) |

---

## 4. Stitch prompts

### Prompt 0 — Design system (paste first)

```
Design a mobile app design system for "Dukaan", an all-in-one app for neighbourhood shops in Pakistan and South Asia (barbers, kiryana/grocery stores, bakeries, salons, tailors). Customers find nearby shops, book a seat, pre-order groceries, leave reviews, and scan a shop's QR code to see its payment details. Shop owners manage bookings and orders in a "Business" mode.

Style: warm, trustworthy, local and simple — like a friendly neighbourhood shopkeeper, not a fintech. Clean, generous white space, rounded shapes, high contrast for use outdoors on mid-range Android phones. Android Material 3 sensibilities, 412x915 frame.

Colours: primary deep emerald #0B6E4F (pressed #08573F, soft tint #E8F5EF). Accent saffron #F5A000 (soft tint #FFF1D6) for secondary calls to action, offers and the Pay action. Background warm off-white #FAF8F5, cards pure white #FFFFFF with 1px border #E6E1D9 and a very soft shadow. Text #1C1A17, secondary text #6B645C. Success #1E8E4E, warning #A86A00, danger #D93F3F, info #2F6FEB.

Typography: Plus Jakarta Sans. Display 30 ExtraBold, H1 24 Bold, H2 20 Bold, H3 17 SemiBold, body 15 Regular, caption 13 Medium, labels 12 SemiBold uppercase with slight tracking. Prices in bold emerald.

Shapes: buttons and inputs 52dp tall with 12px radius; cards 16px radius; chips and badges fully rounded pills; bottom sheets 24px top radius. 16px screen padding, 4pt spacing grid, all touch targets at least 48dp.

Icons: Ionicons outline style, filled when active.

Show a component sheet with: primary / accent / secondary / ghost / danger buttons (with and without leading icons, plus loading and disabled states); text input with label, leading icon, helper and error states; selectable chips; status badges (Pending amber, Confirmed emerald, Packing blue, Ready green, Cancelled grey, Declined red); a shop card (cover photo, overlapping square logo, name, tagline, star rating with count, distance, "Book a seat" and "Pre-order" badges); a small square shop tile; a settings list row with a soft-green icon square and chevron; a segmented control; a stat tile; a quantity stepper pill; and a bottom tab bar with Home, Explore, a raised emerald circular Scan button with a QR icon in the centre, Activity and Profile.
```

---

### Onboarding & Auth

**A01 — Onboarding carousel**
```
Onboarding screen for Dukaan, 1 of 3 slides. Top-right "Skip" ghost button. Centre: a large 200dp rounded-square (48px radius) soft-emerald #E8F5EF tile containing a big emerald outline storefront icon. Below: display headline "Every shop around you, in one app", then muted body "Find barbers, kiryana stores, bakeries and more in your area." Page indicator: three dots, the active one stretched into a 24px emerald pill. Bottom: full-width emerald "Continue" button. Also show slide 2 (calendar icon, "Book a seat. Pre-order. Skip the wait.") and slide 3 (QR icon, "Scan the shop QR to pay") as variants. Warm off-white background, lots of breathing room.
```

**A02 — Location permission explainer**
```
Pre-permission screen shown before the Android location dialog. Centred 112dp soft-emerald circle with a filled emerald location pin. H1 "Find shops near you". Muted body: "We use your location only while the app is open, to sort shops by distance. You can change this anytime." Bottom: primary button with navigate icon "Allow location", and a ghost button "Not now". Calm, honest, no dark patterns.
```

**A03 — Sign in**
```
Sign-in screen presented as a modal with a close/back arrow top-left. A 64dp emerald rounded square with a white storefront icon. H1 "Welcome to Dukaan", muted body "Sign in with your email — we'll send you a 6-digit code. No password needed." One input labelled "Email address" with a mail icon and placeholder "you@example.com". Sticky bottom bar: full-width emerald "Send code" button, and below it a small centred caption "By continuing you agree to our Terms and Privacy Policy" with Terms and Privacy as emerald links.
```

**A04 — Verify code**
```
OTP verification screen. H1 "Enter the code", muted "We sent a 6-digit code to ali@example.com". A large code input showing six separate rounded boxes (52dp) with big digits, the active box outlined in emerald. Below it a ghost button "Resend in 42s" (disabled style). Sticky bottom emerald button "Verify & continue".
```

**A05 — Complete profile**
```
Short form screen. H1 "What should shops call you?". Inputs: "Full name", and "Phone number (optional)" with helper text "Shared only with shops you book or order from." Sticky bottom emerald "Continue" button.
```

---

### Customer

**C01 — Home**
```
Home screen of Dukaan (customer). Top area: H2 greeting "Hi, Sara 👋" and beneath it a tappable location line with a small emerald pin "Gulgasht Colony, Multan ▾". Top-right a round white bell button with a small red unread dot.
Below: a large search field (white, border, radius 12) with a search icon and placeholder "Search shops, services, areas".
Section "Categories": horizontal scroll of category items — each a 60dp soft-emerald rounded square with an emerald outline icon and a caption underneath: Barber, Beauty Salon, Grocery & Kiryana, Pharmacy, Bakery & Sweets, Restaurant, Tailor, Mobile & Repair.
Section "Your shops": horizontal row of small square shop tiles (logo + 2-line name) — these are the customer's favourited shops.
Section "Offers from your shops": horizontal cards with saffron-tint #FFF1D6 background: small shop logo + name, bold offer title "20% off beard trims this Friday", muted 2-line description.
Section "Near you" with a "See all" ghost link: vertical list of full-width shop cards (cover photo, overlapping logo, name "Ali's Cuts", tagline "Fresh fades since 1998", ★ 4.6 (128), "450 m", badges "Book a seat" and "Pre-order").
Bottom tab bar with Home active, raised emerald Scan button in the centre.
```

**C02 — Explore / search**
```
Explore screen. H1 "Explore". Search input with search icon. Below, a horizontally scrolling row of category chips starting with "All" (selected, emerald) then "Barber", "Grocery & Kiryana", "Bakery & Sweets" each with a small icon. A second row of distance chips: "Within 2 km", "Within 5 km", "Within 15 km" (selected), "Within 50 km". Caption "24 shops". Then a vertical list of shop cards (same as Home). Explore tab active in bottom bar. Also show an empty state variant: soft-green circle with a search icon and "No shops match your search".
```

**C03 — Shop detail**
```
Shop detail screen for "Ali's Cuts & Kiryana". Full-bleed 200dp cover photo at top with a transparent header: back arrow on the left, round white share and flag (report) buttons on the right. An 84dp square logo overlaps the bottom of the cover with a 4px off-white ring; to its right a "♡ Favorite" emerald small button.
Below: H1 shop name, muted tagline, a row with ★ 4.6 (128), a green "Open now" badge and "Gulgasht, Multan".
Quick actions row of 4 equal tiles (64dp, white, bordered, icon above label): Call, WhatsApp, Directions, and a highlighted saffron-tint "Pay" tile with a wallet icon.
Big full-width emerald button "Book a seat" with calendar icon.
Section "Offers": saffron-tint card "Eid special — free head massage with any haircut".
Section "Services": white card list — rows with name "Haircut", description, price "Rs 500 · 30 min" in emerald, trailing small secondary "Book" button.
Section "Products": rows with a 56dp thumbnail, "Atta 10kg", "Rs 1,800 / bag", trailing small emerald "+ Add" button; one row shows a quantity stepper pill (− 2 +) instead.
Section "Reviews" with "See all": two review cards (avatar, name, stars, text) and a secondary "Write a review" button.
Section "About": card with description, address row with pin icon, and opening hours table Mon–Sun.
Floating bottom cart bar (emerald, 56dp, radius 16, strong shadow): "View cart · 3 items" left, "Rs 5,400" right.
```

**C04 — Book a seat**
```
Booking screen with header "Book a seat". H2 shop name. Section "Choose a service": wrap of chips "Haircut · Rs 500" (selected), "Beard trim · Rs 300", "Hair + Beard · Rs 700". Section "Choose a day": horizontal chips "Today", "Tomorrow" (selected), "Fri 26", "Sat 27"... Section "Choose a time": 3-column grid of 56dp time tiles "10:00 AM", "10:30 AM"… each with a tiny "2 left" caption; one tile selected in solid emerald with white text; unavailable times simply not shown. Input "Note for the shop" with placeholder "e.g. beard trim too". Caption "Haircut · Rs 500 · Pay at the shop or using the shop's payment details." Sticky footer button "Request booking · 10:30 AM".
```

**C05 — Cart / checkout**
```
Checkout screen "Your order". H2 shop name. White card listing items: name, unit price muted, trailing emerald quantity stepper; a divider; "Subtotal  Rs 5,400" in bold. Segmented control Pickup | Delivery (Delivery selected). Inputs: "Delivery address" (multiline), "Contact phone", "Note for the shop". Muted caption "Pay at the shop or using the shop's payment details." Sticky footer emerald button "Place order · Rs 5,400"; above it, when below minimum, a small red caption "Minimum order Rs 1,000".
```

**C06 — Pay the shop**
```
Payment details screen titled "Pay". Centred 72dp square shop logo, H2 "Pay Ali's Cuts", muted caption "Send money directly to the shop using any of these. Dukaan never handles your money."
Stack of cards, one per method. Card 1: title "JazzCash" with an emerald "Primary" badge; copy fields — "ACCOUNT TITLE  Muhammad Ali" and "ACCOUNT / MOBILE NUMBER  0300 1234567" each with a trailing "Copy" action (one shows "Copied ✓"). Card 2: "Bank transfer · Meezan Bank" with account title, account number and "IBAN  PK36 MEZN 0000 0012 3456 7890" copy fields and a square bank QR image below. Card 3: "Raast". 
Bottom: a soft saffron warning strip with a shield icon: "Always confirm the account title matches the shop before sending money."
```

**C07 — Reviews**
```
Reviews screen. Top card "Write a review": 5 large tappable outline stars (4 filled saffron), multiline input "Share your experience (optional)", emerald "Post review" button. Then a list of review cards: 36dp avatar, name, "3d ago", star row, three-dot overflow button; review text; one card shows a nested light panel "REPLY FROM THE SHOP" with the owner's reply. Also show the overflow action sheet with "Report", "Block user" (red) and "Cancel".
```

**C08 — QR scanner**
```
Full-screen camera QR scanner (dark live camera background). Title at top in white "Scan shop QR". Centre: a 260dp rounded-square viewfinder outlined with a 4px saffron border. Bottom white text "Point your camera at a Dukaan QR code". Bottom tab bar visible with the raised Scan button active. Also show the permission state: off-white screen, soft-green circle with camera icon, "Camera access needed", body "Allow camera access to scan shop QR codes. We never record or store images.", emerald "Allow camera" button.
```

**C09 — Scan result**
```
Screen shown right after scanning a shop's QR. Close (X) button top-right. Centred 96dp square logo, H1 "Ali's Cuts", tagline, ★ 4.6 (128). Two large action cards stacked: first is solid emerald with a wallet icon, white title "Pay" and subtitle "Send money directly to the shop…", chevron; second is white bordered with storefront icon, title "Open", subtitle "Book a seat · Pre-order · Reviews". Bottom full-width saffron button "♡ Favorite" (turns to secondary "♥ Favorited" once tapped) — favouriting pins the shop to the Home screen.
```

**C10 — Activity**
```
Activity tab. H1 "Activity". Segmented control Bookings | Orders. List of pressable cards: square shop logo, shop name bold, caption "Haircut · Fri 26 Sep · 10:30 AM", trailing status badge (Pending amber / Confirmed emerald / Completed green / Cancelled grey). Orders variant: "O-7F3A2C · Rs 5,400 · 2h ago" with badges Packing (blue), Ready (green). Empty state: soft-green circle, calendar icon, "No bookings yet".
```

**C11 — Booking detail / ticket**
```
Booking ticket screen titled "B-F10546". Hero panel with soft-emerald background, radius 24: "Confirmed" badge, huge emerald display time "10:30 AM", H3 "Fri 26 Sep", and a white pill with the letter-spaced booking code "B-F10546" for showing at the counter. Below, a card with shop logo + name + "Open" button, divider, "Haircut · Rs 500", the customer's note in quotes, and a row of small secondary buttons "Call" and "Pay". Sticky footer soft-red "Cancel booking" button.
```

**C12 — Order tracking**
```
Order tracking screen titled "O-7F3A2C". Card: shop logo, name, date, "Packing" badge; below a 5-step horizontal progress tracker with circles and labels: Placed ✓, Accepted ✓, Packing ✓ (emerald filled), Ready, Completed (grey). Card with line items "2× Atta 10kg (bag)  Rs 3,600", divider, "Subtotal Rs 5,400". Card "Delivery" with the address. Two buttons side-by-side: secondary "Call", saffron "Pay".
```

**C13 — Notifications**
```
Notifications list with header "Notifications" and ghost "Mark all read" on the right. Full-width rows separated by dividers; unread rows have a soft-emerald background. Each row: leading emerald outline icon (calendar for bookings, bag for orders, megaphone for offers, star for reviews), bold title "Ali's Cuts: booking confirmed", muted body "Haircut · Fri 26 Sep, 10:30 AM", tiny "5m ago".
```

**C14 — Profile & settings**
```
Profile tab. H1 "Profile". Card with 60dp avatar, name "Sara Khan", email muted, small secondary "Edit" button. A promotional card: H3 "Register your shop", muted "Get bookings, orders and a QR code for your shop — free.", saffron button "Register your shop" with plus icon (for an existing owner this card becomes a list row "My business" with storefront icon). Card of list rows: Language (English), a switch row "Offers from shops I favorite". Card of list rows: Privacy policy, Terms of service, Community guidelines, Help & support. Card: "Sign out", and "Delete account" in red with a red icon square. Small centred caption "Version 1.0.0".
```

**C15 — Edit profile**
```
Edit profile form. Centred 96dp circular avatar with "Edit" link below. Inputs Full name, Phone number (helper "Shared only with shops you book or order from."), Email (read-only, greyed). Sticky footer "Save".
```

**C16 — Delete account**
```
Account deletion screen. 64dp soft-red circle with a red warning icon. H1 "Delete your account?". Muted body explaining it permanently deletes profile, bookings, orders, reviews, favorites and owned shops and cannot be undone. Input "Type DELETE to confirm". Sticky footer danger button "Delete account" (disabled until DELETE is typed).
```

**C17 — Report bottom sheet**
```
Bottom sheet over a dimmed background, 24px top corners. H2 "Report". Radio list rows: Spam, Offensive or hateful, Harassment, Fake review, Scam or fraud, Something else (selected, shows a multiline "Tell us more" input). Full-width soft-red "Report" button.
```

---

### Business mode (shop owner)

**B01 — Business dashboard**
```
Business dashboard screen titled "Business". Top card: 52dp shop logo, shop name bold, muted "/alis-cuts-4eac", and a small secondary "Switch shop" button. Section "Today": 2-column grid of stat tiles — "Bookings today 12" (emerald icon), "Pending requests 3" (saffron icon), "Open orders 5", "Sales today Rs 18,400", "Followers 248", "Rating 4.6 (128)". Two big buttons side-by-side: emerald "Booking queue" (calendar icon) and saffron "Orders" (bag icon). Section "Manage": card of list rows with soft-green icon squares — Shop QR code, Shop details, Services & products, Payment details, Offers & announcements, View as customer. Ghost "+ Register your shop" at the bottom. Practical, glanceable, big numbers.
```

**B02 — Register / edit shop**
```
Long single-page form "Register your shop". Top: 150dp soft-emerald cover placeholder "+ Cover photo" with an overlapping 80dp square logo placeholder. Card: inputs Shop name, Tagline (placeholder "e.g. Fresh fades since 1998"), label "Category" with a wrap of icon chips (Barber selected), multiline "About your shop". Section "Contact": Phone, WhatsApp number, an emerald button "Use my current location" (after tapping it shows "Location pinned ✓" as a secondary button), Street address, and Area + City side-by-side. Section "What can customers do?": switch rows "Book seats / appointments" (on) revealing "Seats / chairs available at once  − 2 +", slot-length chips 15/20/30/45/60 min, "Bookable days ahead − 7 +"; "Pre-order products" (on) revealing "I also deliver" switch and "Minimum order amount". Section "Opening hours": seven rows Mon–Sun each with a switch and two time pills "10:00 – 22:00" (Sun shows "Closed"). Card with currency chips PKR/INR/AED/… and switch "Visible to customers". Bottom emerald "Create shop".
```

**B03 — Services & products**
```
Catalog management screen titled "Services & products" with a ghost "+ Add" in the header. Segmented control Services | Products. List of white rounded rows: 44dp thumbnail, item name bold, muted "Rs 500 · 30 min", one row with a grey "Hidden" badge. Empty state with pricetag icon and "Add item" button.
```

**B04 — Add / edit item**
```
Item editor. Segmented Service | Product. A 140dp square photo placeholder "+ Photo". Inputs: Name, Price (PKR), Duration (minutes) for services or Unit (kg, pack…) for products, Description (optional). Switch row "Available". Sticky footer "Save"; soft-red "Delete" button for existing items.
```

**B05 — Payment methods**
```
Payment details list for a shop. Muted intro text. Cards: "JazzCash" with "Primary" badge, account title, number; "Bank transfer" with IBAN. Sticky footer with emerald "+ Add payment method" and secondary "Shop QR code".
```

**B06 — Add payment method**
```
Form "Add payment method". Label "Method" then wrap of chips: JazzCash (selected), Easypaisa, Raast, Bank transfer, SadaPay, NayaPay, UPI, PayPal, Wise, Other. Inputs: Account title, Mobile wallet number (label changes to Account number / UPI ID / Email by method), Bank name and IBAN (only for bank/Raast), Note (optional, "e.g. Send screenshot on WhatsApp"). Secondary button with QR icon "Upload your bank / Raast QR (optional)". Switch "Primary". Sticky "Save".
```

**B07 — Shop QR**
```
Shop QR screen. Big white card: H2 shop name, a 260dp crisp black-on-white QR code with rounded corners, the URL "dukaan.app/s/alis-cuts-4eac" in muted caption. Muted text "Customers scan this to open your shop, favorite it and see your payment details." Buttons: emerald "Print poster (PDF)" with printer icon, secondary "Share link", ghost "Copy".
```

**B08 — Booking queue**
```
Owner booking queue titled "Booking queue". Segmented control "Pending (3)" | "Confirmed" | "Past". Cards: left column with big emerald time "10:30 AM" and small date, 36dp customer avatar, name "Bilal Ahmed", caption "Haircut · B-CD943D", status badge; customer's note in quotes; action row — for pending: emerald "✓ Confirm" and soft-red "Decline"; for confirmed: "Complete" and secondary "No-show"; ghost "Call". Designed for fast one-thumb triage at a busy counter.
```

**B09 — Order queue**
```
Owner order queue titled "Orders". Segmented "Open orders" | "Past". Pressable cards: 40dp customer avatar, "Sara Khan · O-7F3A2C", caption "4 items · Rs 5,400 · Delivery · 5m ago", trailing status badge (Placed amber, Packing blue, Ready green).
```

**B10 — Order detail (owner)**
```
Owner order detail titled "O-7F3A2C" — a packing list. Card with customer avatar, name, time, "Placed" badge. Card listing items with large quantity "2×" in H3, item name, line total; subtotal row. Card "Delivery" with address, customer note, and small secondary buttons "Call" and "WhatsApp". Sticky footer with two side-by-side buttons: emerald "Accept" and soft-red "Decline" (later states show "Packing" / "Ready" / "Out for delivery" / "Complete").
```

**B11 — Offers & announcements**
```
Owner marketing screen titled "Offers & announcements". Top card "New offer": inputs Title (placeholder "e.g. 20% off beard trims this Friday") and Details (multiline), emerald button with megaphone icon "Publish & notify followers". Below, list of past offers as cards with title, text, "2d ago" and a trash icon button.
```

**P01 — Counter QR poster (A4, print)**
```
Printable A4 portrait poster for a shop counter. Top centred emerald pill "Dukaan". Big bold shop name "Ali's Cuts & Kiryana", muted tagline. Centre: a very large QR code inside a thick emerald rounded border. Below: bold "Scan to book · order · pay", then "Open your camera → scan → tap the link". A row of small bordered boxes showing payment methods: "JazzCash · Muhammad Ali · 0300 1234567", "Easypaisa · …", "Raast · …". Footer URL "dukaan.app/s/alis-cuts-4eac". High contrast, prints well in black & white.
```

---

## 5. Landing page (marketing website)

Already built in `web/src/components/Landing.tsx` with the same tokens. To explore a Stitch variant, use:

```
Responsive marketing landing page (desktop 1440 + mobile) for "Dukaan — your neighbourhood, in your pocket", a free app for small shops and their customers in Pakistan/South Asia. Same design system as the app (emerald #0B6E4F, saffron #F5A000, warm off-white #FAF8F5, Plus Jakarta Sans). Sections: sticky nav with logo + "Get the app" button; hero with headline "Every shop around you. One app.", sub-copy, Google Play badge and "Register your shop" secondary button, and a phone mockup of the Home screen; a 3-up "For customers" feature row (Book a seat, Pre-order ration, Scan to pay); a "For shop owners" split section with a dashboard phone mockup and a checklist (free listing, booking queue, orders, QR poster, offers to followers); a "How the QR works" 3-step strip; category icon strip; FAQ accordion; final CTA band in emerald; footer with Privacy, Terms, Delete account, Contact.
```

---

## 6. Accessibility & Play-policy guardrails for every screen

- Contrast ≥ 4.5:1 for text, 3:1 for icons/borders that convey meaning. Never grey-on-grey.
- 48 dp minimum touch targets; nothing important hides behind long-press only.
- Supports font scaling to 140 % without clipping (avoid fixed-height text containers).
- Every permission (location, camera, notifications) is requested **in context** after an explanation screen or user action — never on first launch.
- No fake urgency, hidden costs, pre-ticked marketing consent or disguised ads.
- Payment screens state clearly that Dukaan does not process money (off-app payment for physical goods/services).
- Report & block are always reachable from user-generated content (reviews, shops).
- Account deletion is reachable in ≤ 3 taps from Profile.
- Layouts must mirror correctly in RTL (Urdu).
