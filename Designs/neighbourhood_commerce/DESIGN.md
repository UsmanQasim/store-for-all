---
name: Neighbourhood Commerce
colors:
  surface: '#fff8f3'
  surface-dim: '#dfd9d4'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ed'
  surface-container: '#f3ede7'
  surface-container-high: '#ede7e2'
  surface-container-highest: '#e7e1dc'
  on-surface: '#1d1b18'
  on-surface-variant: '#3f4943'
  inverse-surface: '#32302d'
  inverse-on-surface: '#f6f0ea'
  outline: '#6f7a73'
  outline-variant: '#bec9c1'
  surface-tint: '#056c4d'
  primary: '#00543b'
  on-primary: '#ffffff'
  primary-container: '#0b6e4f'
  on-primary-container: '#98edc6'
  inverse-primary: '#83d7b1'
  secondary: '#845400'
  on-secondary: '#ffffff'
  secondary-container: '#fda60f'
  on-secondary-container: '#674100'
  tertiary: '#0042a3'
  on-tertiary: '#ffffff'
  tertiary-container: '#0058d3'
  on-tertiary-container: '#d0dbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff4cc'
  primary-fixed-dim: '#83d7b1'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#005139'
  secondary-fixed: '#ffddb6'
  secondary-fixed-dim: '#ffb959'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b1c5ff'
  on-tertiary-fixed: '#001947'
  on-tertiary-fixed-variant: '#00419f'
  background: '#fff8f3'
  on-background: '#1d1b18'
  surface-variant: '#e7e1dc'
  primary-pressed: '#08573F'
  primary-soft: '#E8F5EF'
  accent-soft: '#FFF1D6'
  surface-bg: '#FAF8F5'
  surface-card: '#FFFFFF'
  surface-alt: '#F2EFEA'
  border-hairline: '#E6E1D9'
  text-muted: '#6B645C'
  success-green: '#1E8E4E'
  success-soft: '#DDF4E6'
  warning-amber: '#A86A00'
  warning-soft: '#FFF1D6'
  danger-red: '#D93F3F'
  danger-soft: '#FDE7E7'
  info-blue: '#2F6FEB'
  info-soft: '#E4EDFF'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.5px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.4px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
---

## Brand & Style

This design system expresses the warmth, reliability, and human presence of everyday South Asian street-level commerce. It models the informal trust between a neighbourhood resident and their local shopkeeper (*dukaandar*)—approachable, grounded, and straightforward. It rejects cold corporate fintech motifs, decorative gradients, and over-engineered micro-interactions in favor of tangible utility, fast comprehension under direct sunlight, and intuitive navigation on mid-range Android hardware.

The aesthetic blends **Modern Material 3** sensibilities with localized tactile pragmatism:
- **Warm Canvas:** Rich organic neutrals replace sterile whites and clinical grays, echoing unbleached paper, clay tiles, and sunlit storefronts.
- **Deep Emerald Anchor:** A grounding, verdant green evokes dependability, flourishing trade, and community safety.
- **Saffron Spark:** A high-visibility golden amber serves as an intentional secondary focal point for commerce, transactions, and urgent status cues.
- **Directness Over Metaphor:** No decorative empty-state character illustrations or bloated promotional carousels. Information is conveyed through sharp typographic hierarchy, clean container bounds, and explicit semantic color chips.

## Colors

The palette is tuned specifically for high legibility, accessible contrast (WCAG AA across all body and caption combinations), and intuitive dual-role semantics:

- **Primary (`#0B6E4F`):** Used for authoritative actions, selected navigation items, primary checkout commitments, live price badges, and the center scan trigger.
- **Secondary / Accent (`#F5A000`):** Acts as the transaction highlight ("Pay", "Order Now"), camera viewfinder boundary, and star review color. Paired with soft saffron (`#FFF1D6`) for urgent banners.
- **Surface Hierarchy:** The canvas background (`#FAF8F5`) is warm and low-glare. Interactive and focusable components rest on elevated pure white surfaces (`#FFFFFF`), while grouped utility rows and segmented tracks utilize an earthy stone (`#F2EFEA`).
- **Dividers & Structural Borders:** A single unified hairline token (`#E6E1D9`) enforces structural shape on cards, inputs, and list rows without visual noise.
- **Status Semantic Pairs:**
  - *Pending / Processing:* `#A86A00` text on `#FFF1D6` surface.
  - *Ready / Active:* `#1E8E4E` text on `#DDF4E6` surface.
  - *Packing / In Transit:* `#2F6FEB` text on `#E4EDFF` surface.
  - *Declined / Cancelled:* `#D93F3F` text on `#FDE7E7` surface.

## Typography

The type system prioritizes immediate legibility on handheld screens under variable outdoor lighting. `Plus Jakarta Sans` provides an open aperture, generous x-height, and soft geometric terminals that maintain warmth without feeling overly playful.

- **Numerics & Prices:** Product prices, order values, and account tallies must always use `price-display` or `headline-md` rendered in bold weights and styled in `primary` (`#0B6E4F`) to stand out from descriptions.
- **Labels & Overlines:** `label-sm` is uppercase with `+0.4px` letter tracking, applied to status tags, category flags, and bank title prefixes (`ACCOUNT TITLE`, `RAAST ID`).
- **Urdu Localization (RTL):** When the application language switches to Urdu, `Noto Naskh Arabic` substitutes across all roles with an automatic line-height multiplier of `1.25x` to accommodate calligraphic descenders. Horizontal padding, icon alignments, and badge orientations mirror across the vertical axis.

## Layout & Spacing

The layout is built on a standard 412 × 915 dp canvas (Android standard viewport) governed by a 4pt baseline grid.

- **Outer Margins:** Fixed at `16px` (`margin`) on both left and right screen borders. Content cards span edge-to-edge within these margins.
- **Section Stack Rhythm:** Vertical sections (e.g., "Recent Orders", "Nearby Kiryana", "Quick Bookings") maintain a standard `20px` (`space-xl`) gap.
- **Card Interior Padding:** Standard component cards use `12px` (`space-md`) on condensed listing items and `16px` (`space-lg`) on primary checkout or shop hero containers.
- **Touch Bounds:** All touch surfaces—including back arrows, dismiss pills, and filter chips—strictly enforce an absolute minimum touch boundary of `48 × 48dp`, regardless of the visual footprint of the element inside.
- **Fixed Component Heights:**
  - Standard action buttons and text input fields: `52dp`.
  - Secondary chips and small action controls: `40dp`.
  - Standard listing rows: `56dp`.
  - Bottom navigation dock: `64dp` baseline, accommodating an elevated `52dp` circular FAB floating `18dp` above the bar midline.

## Elevation & Depth

This system avoids diffuse multi-layer skeuomorphic lighting, heavy dropped shadows, and frosted translucent blurs. Visual structure relies on crisp borders and intentional functional elevation tiers:

- **Base Level (Canvas):** Flat `#FAF8F5` surface. No elevation.
- **Tier 1 (Surface Cards & Inputs):** `#FFFFFF` fill bounded by a crisp 1px hairline border (`#E6E1D9`) and an ultra-subtle ambient shadow:
  `box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.06);`
  This delivers tactile separation from the warm canvas without introducing visual clutter.
- **Tier 2 (Floating Action Docks & Sheets):** Used for the floating scan button, sticky order summaries, bottom sheets, and sticky cart panels:
  `box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.14);`
  This level clearly communicates that the floating element operates on an interactive plane detached from the scrolling viewport content.
- **Scrim Tier:** Dimmed overlay (`rgba(28, 26, 23, 0.45)`) applied behind modal sheets to preserve visual focus on task resolution.

## Shapes

The design uses balanced, rounded geometry (`roundedness: 2`) that feels soft and welcoming while maintaining structural alignment across dense lists and forms:

- **Default Controls (`12px` / `0.75rem`):** Primary buttons, secondary buttons, text input fields, and search bars.
- **Thumbnails & Nested Icons (`8px` / `0.5rem`):** Leading square avatars, catalog thumbnail containers, and small quick-action buttons.
- **Component Cards (`16px` / `1rem`):** Product cards, merchant review boxes, and floating summary drawers.
- **Bottom Drawers & Hero Panels (`24px` / `1.5rem`):** Top corners of modal action sheets and high-profile booking confirmation cards.
- **Pill / Fully Rounded (`999px`):** Status badges, count tags, quantity incrementers, and filter pills.
- **Specialized Overlap Rings:** Shop logo badges overlapping photographic banners take a `3px` solid `#FFFFFF` protective border. The raised center QR scan button features a structural `4px` solid `#FFFFFF` isolation ring.

## Components

### 1. Buttons
- **Primary:** `52dp` height, `#0B6E4F` solid background, `#FFFFFF` text, `15px SemiBold`. On press, state shifts to `#08573F`. Corner radius is `12px`.
- **Accent (Pay / Action):** `52dp` height, `#F5A000` background, `#1C1A17` text. Used for payment confirmations and high-conversion actions.
- **Secondary (Outlined):** `52dp` height, `#FFFFFF` background, `1px solid #E6E1D9`, `#1C1A17` text.
- **Ghost:** `48dp` minimum target, transparent background, `#0B6E4F` text.
- **Destructive:** `52dp` height, `#FDE7E7` background, `#D93F3F` text, `12px` radius.

### 2. Input Fields
- **Container:** `52dp` height, `#FFFFFF` background, `1px solid #E6E1D9`, `12px` radius.
- **Label Placement:** Always external, positioned `6px` above the field container in `13px Medium` (`#6B645C`).
- **Focus State:** 2px stroke using `primary` (`#0B6E4F`). No outer glow.
- **Helper / Error Text:** Anchored `4px` below the field. Error text uses `#D93F3F`.

### 3. Filter Chips & Segmented Controls
- **Filter Chips:** `40dp` height, pill radius (`999px`), `12px` horizontal padding. Unselected state uses `#FFFFFF` fill with `1px solid #E6E1D9`. Selected state uses `#0B6E4F` background with `#FFFFFF` text and an optional leading check icon.
- **Segmented Control:** `48dp` track height, `#F2EFEA` background, `12px` radius, `4px` internal padding. Active segment renders as an elevated `#FFFFFF` card with `8px` radius and subtle shadow.

### 4. Status Badges
- Compact pill-shaped containers (`999px` radius) with `4px` vertical and `10px` horizontal padding.
- Text rendered in `12px SemiBold`, uppercase with tracking.
- Color pairings adhere strictly to the semantic soft-surface tokens (e.g., `#1E8E4E` text on `#DDF4E6` for "OPEN NOW" or "READY").

### 5. Shop & Product Cards
- **Shop Card:** `#FFFFFF` background, `1px solid #E6E1D9` border, `16px` radius. Layout includes a `120dp` cover crop, an overlapping `56dp` shop avatar with a white isolation ring, a bold store title, verified badge, distance indicator, and operating status badge.
- **Product Row Tile:** `56dp` height row with an `8px` radius thumbnail, product name, weight/unit metadata, price highlighted in bold emerald, and an inline stepper control.

### 6. Stepper & Quantity Selector
- Pill-shaped container (`999px` radius) with `#E8F5EF` fill.
- Left and right touch zones (`32 × 32dp`) contain minus and plus icons in `#0B6E4F`.
- Center count uses `14px Bold` emerald text.

### 7. Copy-to-Clipboard Tile (Financial Routing)
- Designed for off-app payments (Raast, JazzCash, Easypaisa, IBAN).
- `#F2EFEA` fill, `12px` radius, `12px` interior padding.
- Displays overline bank label (`12px SemiBold` uppercase), account number in monospaced tabular numerals, and a dedicated right-aligned button that shifts from "Copy" to "Copied ✓" upon tap.

### 8. Elevated Scan Navigation Bar
- **Base Dock:** `64dp` height, `#FFFFFF` background, `1px` top border in `#E6E1D9`. Accommodates 4 standard navigation destinations (Home, Orders, Bookings, Profile) with `24px` outline icons (filled when active).
- **Floating Scan Trigger:** Center-mounted `52dp` circular button in `#0B6E4F` with a white QR icon, floating `18dp` above the dock baseline. Surrounded by a `4px solid #FFFFFF` protective perimeter ring and elevated with Tier 2 floating shadow.