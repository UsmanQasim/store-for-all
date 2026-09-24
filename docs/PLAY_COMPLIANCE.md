# Google Play compliance checklist — Dukaan

Status legend: ✅ built into the code · 📝 you fill in Play Console · ⚠️ action needed before launch.
Policies change; re-check the [Policy Center](https://play.google.com/about/developer-content-policy/) before submitting.

## 1. Technical requirements

| Requirement | Status | Where |
|---|---|---|
| **Target API level** — new apps and updates must target Android 16 (API 36) from 31 Aug 2026 | ✅ Expo SDK 57 / RN 0.86 targets the current API level. Verify in the built AAB (`aapt dump badging`) | `eas.json` production profile |
| Android App Bundle (AAB) upload | ✅ `buildType: app-bundle` | `eas.json` |
| 64-bit + 16 KB memory page support | ✅ React Native 0.86 native libs are 16 KB-aligned | — |
| Edge-to-edge (Android 15+) | ✅ Safe-area aware layouts everywhere | `components/ui/layout.tsx` |
| Play App Signing + App Links | ⚠️ After first upload copy the **App signing key SHA-256** into `landing/.well-known/assetlinks.json` | Play Console → Test and release → App integrity |
| Predictive back | ✅ Disabled explicitly until tested | `app.config.ts` |

## 2. Permissions (least privilege)

| Permission | Why | Prompted when |
|---|---|---|
| `CAMERA` | Scan shop QR codes (on-device only) | User opens the Scan tab and taps **Allow camera** after an explainer |
| `ACCESS_COARSE/FINE_LOCATION` (foreground only) | Sort shops by distance; owners pin their shop | After the location explainer screen (onboarding) or when tapping the location line / “Use my current location” |
| `POST_NOTIFICATIONS` | Booking/order status and offers | Only **after** the user books, orders, registers a shop or signs in — never on first launch |

Explicitly **blocked** in `app.config.ts`: background location, microphone, legacy storage, `READ_MEDIA_IMAGES/VIDEO` (photos use the **system photo picker**, so no Photo & Video Permissions declaration is needed), system alert window. No SMS/Call Log/Contacts/Accessibility APIs.

## 3. User data & privacy

| Item | Status |
|---|---|
| Privacy policy URL, reachable in-app and in store listing | ✅ `landing/privacy.html`, linked from Sign-in and Profile · ⚠️ fill placeholders & legal review |
| **In-app account deletion** | ✅ Profile → Delete account → type DELETE (`settings/delete-account.tsx`, RPC `delete_my_account`, cascades all data + storage) |
| **Web account deletion URL** (required in Data safety form) | ✅ `https://<domain>/delete-account.html` |
| Prominent disclosure before sensitive permissions | ✅ Location & camera explainers with honest copy |
| Encryption in transit | ✅ HTTPS only (Supabase) |
| No selling/sharing for ads, no ad SDKs | ✅ |

### 📝 Data safety form — suggested answers

*Does your app collect or share any of the required user data types?* **Yes.** *Is all data encrypted in transit?* **Yes.** *Do you provide a way for users to request deletion?* **Yes** (in-app + web URL).

| Data type | Collected | Shared* | Optional? | Purposes |
|---|---|---|---|---|
| Personal info → Name | Yes | No | Required | App functionality, Account management |
| Personal info → Email address | Yes | No | Required | App functionality, Account management |
| Personal info → Phone number | Yes | No | Optional | App functionality |
| Location → Approximate location | Yes | No | Optional | App functionality |
| Location → Precise location | Yes | No | Optional | App functionality (shop owners’ pinned shop location is stored) |
| Photos and videos → Photos | Yes | No | Optional | App functionality (logos, product & profile photos) |
| Messages → Other in-app messages | Yes (booking/order notes, reviews) | No | Optional | App functionality |
| App activity → Other user-generated content | Yes (reviews) | No | Optional | App functionality |
| App activity → App interactions | Yes (bookings, orders, favorites) | No | Required for those features | App functionality |
| Device or other IDs | Yes (Expo push token) | No | Optional | App functionality |
| Financial info | **No** — the app displays the *shop’s* published payment details; it never collects the user’s payment info | — | — | — |

\*Transfers to service providers (Supabase, Expo) acting on your behalf are **not** “sharing” under Play’s definition. Showing a customer’s name/phone to the shop they booked with is user-initiated and disclosed in the privacy policy.

Camera frames are processed on-device and never leave it → **not collected**.

## 4. Payments policy

- Dukaan sells **no digital goods**; customers pay shops for **physical goods and in-person services**, off-app, through their own wallet/bank app. These are exempt from Google Play Billing.
- The app never collects card/wallet credentials and doesn’t initiate transfers → answer **“No financial features”** in the Financial features declaration. If you later add in-app payments via a PSP (JazzCash/Easypaisa APIs, Stripe), revisit this declaration.
- Anti-scam UX: payment pages show a warning to verify the account title; owners can only publish on their own shop; users can report shops (reason “Scam or fraud”).

## 5. User-generated content (reviews, shop listings, offers)

| Requirement | Status |
|---|---|
| Terms/community guidelines users accept | ✅ Sign-in shows Terms & Privacy; guidelines page linked in Profile |
| In-app **reporting** of objectionable content & users | ✅ Review ⋮ → Report; shop flag → Report (`ReportSheet`, `content_reports`) |
| In-app **blocking** | ✅ Review ⋮ → Block user (`user_blocks`, RLS hides their reviews) |
| Timely moderation | ✅ Auto-hide after 3 reports · ⚠️ someone must review `content_reports` (Supabase Studio) within 48 h |
| Rate limits / anti-spam | ✅ 1 review per shop, 3 posts/day, booking/order caps |

## 6. Store listing & declarations 📝

- **App category:** Shopping (or Lifestyle). **Tags:** local shopping, booking.
- **Content rating (IARC):** no violence/sexual content/gambling; answer **Yes** to “users can interact / share user-generated content” → typically *Everyone* / *PEGI 3* with “Users Interact”.
- **Target audience:** 18+ (or 13+). Do **not** select under-13 age groups (avoids Families policy requirements).
- **Ads:** No ads.
- **App access:** logins require an emailed code → create a review account in Supabase (**Authentication → Add user**, with a password), set `EXPO_PUBLIC_REVIEW_EMAIL` to its email, and give reviewers that email + password in *App access*. Seed it with a demo shop so reviewers can see Business mode.
- **Government apps / news / health / VPN declarations:** Not applicable.
- **Store listing:** no misleading claims, no competitor names or trademarks, screenshots must show the real app; avoid “#1 / best” superlatives; don’t use the Google Play badge in screenshots.

## 7. Account & release process

- New **personal** developer accounts must run a **closed test with at least 12 testers opted in for 14 continuous days** before applying for production access. Organisation accounts (D-U-N-S) are exempt — consider registering as an organisation.
- Suggested track flow: `internal` (EAS submit default in `eas.json`) → `closed` (12+ testers, 14 days) → `production` staged rollout 10 % → 100 %.
- Keep the upload keystore safe (EAS manages it); enable Play App Signing.

## 8. Pre-launch checklist ⚠️

- [ ] Supabase: run migrations, configure **custom SMTP** (Resend/Brevo) and the email OTP template (6-digit code), set Site URL.
- [ ] Replace placeholders in `landing/*.html`, `landing/assets/config.js`, `brand.json` (domain, email, package).
- [ ] Deploy `landing/` and confirm `https://<domain>/.well-known/assetlinks.json` returns JSON with the Play signing SHA-256.
- [ ] Create review account + demo shop; fill *App access*.
- [ ] Fill Data safety, Content rating, Target audience, Ads, Financial features declarations as above.
- [ ] Run Play **pre-launch report** and fix any accessibility/crash findings.
- [ ] Moderation owner assigned for `content_reports`.
