% Product Design & Development Specification


\newpage


# 0. How To Use This Specification

This is the single source of truth for the platform: a creator subscription and live-streaming product combining OnlyFans/Fansly/Fanvue/Passes-style paywalled content with Tango/BIGO/Chaturbate/Stripchat-style live gifting economics, built on Snapchat/Instagram/TikTok-style discovery mechanics, with Telegram/Discord-influenced messaging and Twitch/YouTube-influenced live tooling.

It is delivered as a linked set of documents ("Parts") rather than one file, because a single 500+ page file is unusable in practice — nobody opens it end to end, and no version-control or review workflow works well against it. This Master Index is the spine: it holds the full product flow, the global standards every Part inherits, and the table of contents. Each Part is independently readable by the specific role that needs it (a QA engineer opens Part C for monetization test cases without reading Part H's admin tooling), but no Part duplicates a rule defined here — they reference this document instead, so a rule only ever needs to change in one place.

**Role-based reading paths:**

- **Designer** — Parts A–E, J (every user-facing screen), plus Appendix K3 (Design System).
- **Frontend engineer** — same as designer, plus Appendix K4 (API Standards), each Part's Backend Integration sections, and each module's Tech Stack section (§21).
- **Backend engineer** — every Part's Backend Integration, Database Dependencies, Security, and Tech Stack sections, plus Appendix K2 (Database Entity Reference) and K4.
- **QA engineer** — every Part's State Management, Error Handling, and Testing sections, plus Appendix K5 (QA Master Checklist) and K8 (End-to-End System Wiring, for full-journey test planning).
- **Product manager / reporting lead** — every Part's Overview, Feature Description, Business Rules, and Priority classification, plus this Master Index's product flow, priority legend (§2.7), and success metrics rollup — this is the fastest path to a build-sequencing conversation with leadership.
- **New team member with no prior context** — read this Master Index fully first, then proceed Part A → K in order; the product flow below is designed to be read top-to-bottom as the actual sequence a real user experiences, and Appendix K8 traces the same flow again end-to-end once every module is known.

# 1. Complete Product Flow

The platform has two user roles — **Fan** and **Creator** — that share most infrastructure but diverge sharply in what they can do. A single account can hold both roles simultaneously (a creator can also be a fan of other creators), so "role" is a permission set attached to a user, not a separate account type.

The flow below is written as a sequential chain — every stage names the Part that documents it, and an arrow (→) means "leads into," including where the chain branches by role and later re-converges.

**Stage 1 — Entry.** Authentication (Part A1) → Age Verification & Compliance (Part A2), mandatory for every account regardless of eventual role.

**Stage 2 — Role branch.** From Age Verification, the account splits into one of two profile-creation paths: Fan Profile Creation, or Creator Profile Creation + Identity/Payout Verification (Part A3). Both paths converge on the same next stage.

**Stage 3 — Wallet.** Wallet Creation & Currency (Part A4) — every account, fan or creator, gets a wallet at creation; this is the single convergence point after Stage 2.

**Stage 4 — Daily surfaces.** From the wallet, the two roles diverge again into the surfaces each role actually lives in day-to-day: Fans land in Discovery Feed, Search, Stories, and the Short-form Feed (Part B); Creators land in Creator Studio, their own dashboard and analytics (Part F). These two surfaces interact directly — fans visit Creator Studio's public output, and Creator Studio publishes content that appears back in Discovery — and both feed into Creator Profile (Part B5), the shared page a creator's published content and a fan's visit both resolve to.

**Stage 5 — Monetization entry points.** From a Creator Profile, a fan can enter monetization through four parallel paths, all of which converge on the same ledger: Subscription (Part C1), PPV Unlock (Part C3), Tips / Gifts / Creator Goals (Part C4, C6), and Direct Messaging (Part D1).

**Stage 6 — Ledger.** All four Stage 5 paths write through the Wallet Deduction Engine / Ledger (Part C2) — the single shared, append-only ledger every monetized action in the platform passes through, with no exceptions. The ledger then credits the Creator Ledger (net of platform fee).

**Stage 7 — Real-time and broadcast monetization.** From the Creator Ledger, three further monetized surfaces feed back into the same ledger from Stage 6: Live Streaming + Live Gifting (Part E), Paid Calls (Part D3), and Mass Messaging / Broadcast (Part D2).

**Stage 8 — Payout.** All monetized activity ultimately rolls up into Creator Earnings & the Payout Dashboard (Part F1) → Payout Processing via external banking/provider rails (Part F3).

**Stage 9 — Oversight.** The Admin Dashboard (Part H) sits above every stage of this flow rather than after it: it approves payouts (Stage 8), reviews content (Stages 4–5), and manages disputes (Stage 6) across Financial Ops, the Moderation Queue, and User Management.

**Cross-cutting systems** (Part I) do not sit in this linear flow because every box above depends on them: Notifications fire from nearly every box; Search/Recommendation feeds Discovery; the Analytics Platform records an event from every box; RBAC/Permissions gates every box; the Audit Log records every state-changing action for every box. Trust & Safety (Part G) similarly cuts across: any piece of user-generated content or any transaction can be reported, flagged by the fraud engine, or actioned by moderation, regardless of which box produced it.

# 2. Global Standards (inherited by every Part — not repeated per-module)

## 2.1 API Conventions

- **Base URL structure:** `https://api.<platform-domain>/v1/...` — versioned from day one (`/v1/`) so breaking changes ship as `/v2/` without forcing every client to upgrade simultaneously.
- **Auth header:** `Authorization: Bearer <JWT>` on every authenticated request. Unauthenticated endpoints are the explicit exception, not the default.
- **Pagination:** cursor-based on every list endpoint (`?cursor=<opaque>&limit=<n>`), never offset-based — offset pagination breaks under concurrent writes (a feed that's actively receiving new posts will skip or duplicate items across pages with offset pagination).
- **Standard error envelope:**
  ```json
  { "error": { "code": "WALLET_INSUFFICIENT_BALANCE", "message": "Human-readable message", "requestId": "uuid", "details": {} } }
  ```
  Every Part's Error Handling section maps its scenarios to a specific `code` from this shared registry (Appendix K4 holds the full code list) — frontend error handling switches on `code`, never on parsing `message` text.
- **Rate limiting:** every mutating endpoint (`POST`/`PATCH`/`DELETE`) is rate-limited per-user via a token-bucket at the API gateway layer; limits are defined per-endpoint in each Part's Backend Integration section, with a shared default of 60 requests/minute where a Part doesn't override it. A rate-limited response is `429` with a `Retry-After` header, never a silent drop.
- **Idempotency:** every financial mutation (`POST /wallet/purchase`, `POST /gifts/send`, `POST /subscriptions`) requires an `Idempotency-Key` header; the backend deduplicates on that key for 24 hours so a retried request from a flaky mobile connection never double-charges.

## 2.2 Authentication & Session Model

- Access tokens: short-lived JWT (15 minutes), containing `userId`, `role` (`fan`/`creator`/`admin`, an account can hold both `fan` and `creator`), `verificationStatus`, and `sessionId`.
- Refresh tokens: long-lived (30 days), opaque, stored server-side (allows revocation), rotated on every use (refresh-token rotation — reusing an old refresh token after rotation invalidates the entire token family, which is the standard defense against refresh-token theft).
- Session revocation: a "log out of all devices" action invalidates every refresh token for a `userId` immediately; used automatically on password change and on suspected-fraud lock.

## 2.3 Role-Based Access Control (RBAC)

Full detail lives in Part I4. In summary, four roles exist: **Fan**, **Creator**, **Support Agent** (admin, limited), **Platform Admin** (admin, full). Every API endpoint in every Part declares its required role(s) in its Backend Integration section as `requiredRole:`. A request from an insufficient role returns `403 FORBIDDEN_ROLE`, distinct from `401 UNAUTHENTICATED`.

## 2.4 Soft Delete & Audit Fields

Every database entity (full catalog in Appendix K2) carries: `id (uuid)`, `createdAt`, `updatedAt`, `deletedAt (nullable — soft delete, never hard-delete user content)`, `createdBy`, `updatedBy`. A "deleted" post/message/account is never actually removed from the database — it is marked `deletedAt` and excluded from normal queries — both for dispute resolution and because §2257 record-keeping and financial audit requirements make hard deletion of certain records (identity verification records, transaction records) legally prohibited regardless of user deletion requests. Part J2 covers exactly which data categories a user's own deletion request does and does not remove.

## 2.5 Money Handling

All monetary amounts are stored as integers in the smallest currency unit (cents for USD) — never floating point — to avoid rounding-error class bugs. The platform's internal virtual currency (Coins, see Part A4) is a separate integer ledger from real-money cents; the conversion rate between them is a config value, not a hardcoded constant, so it can change without a code deploy.

## 2.6 Success Metrics Rollup (platform-level North Star)

- **Primary:** Gross Payment Volume (GPV) — total real-money value flowing through the wallet (purchases) per period.
- **Secondary:** Creator retention (% of creators still earning >$0 at day 90), Fan payer conversion rate (% of registered fans who complete at least one purchase), Live session watch-time, Chargeback rate (must stay under payment-processor thresholds or the platform risks losing processor access entirely — this is a hard operating constraint, not just a KPI).
- Each Part's own Success Metrics (§1 of that Part) rolls up into one of these four.

## 2.7 Module Priority Classification

Every module in Parts A–J carries a **Priority** rating in its header block, immediately below **Global Context**. This is a build-planning signal for engineering leadership and the reporting chain, not a user-facing concept — it never appears in-product. Priority is a blended judgment of two independent factors, and the header line states which factor is driving the color so the rating is never a black box:

1. **Build order/urgency** — is this module required for a launchable v1 (**launch-blocking**), needed shortly after launch (**phase 2**), or safely deferrable (**phase 3+**)?
2. **Engineering complexity/risk** — how much build time, how many moving parts (real-time infra, third-party vendors, financial-integrity guarantees), and how much can go wrong if it's rushed?

The two factors are combined, not averaged blindly: a module that is launch-blocking is always [🔴 HIGH PRIORITY]{custom-style="Priority High"} regardless of how simple it is to build, and a module that is deferrable but genuinely high-complexity is deliberately pulled up a level (from Low to Medium, or Medium to High) because high-complexity work needs a longer lead time even when the business doesn't need it on day one. The three levels:

- [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking (the product cannot ship without it), and/or high engineering complexity or financial/legal risk that demands early start regardless of launch timing.
- [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — targeted for the first post-launch phase, or a later-phase feature whose complexity is high enough to need earlier-than-usual planning.
- [🟢 LOW PRIORITY]{custom-style="Priority Low"} — genuinely deferrable well past launch, and low-to-moderate complexity — the safest category to cut or delay if timeline pressure hits.

This classification is a planning input for engineering and product leadership, not a contractual roadmap — Part H's Admin/Backoffice modules and Part K's appendices are supporting infrastructure and reference material rather than user-facing product surfaces, so they are not individually prioritized the same way; their build timing follows the modules they support.

## 2.8 Reference Technology Stack

Every module's dedicated **Tech Stack** section (§21, added after Future Enhancements) cites specific pieces of this same canonical stack rather than inventing per-module technology choices — this keeps the eventual engineering build internally consistent and gives engineering leadership one place to review and challenge the stack as a whole before any module-level build starts.

- **Frontend (mobile-first):** React Native (Expo, bare workflow for native module access — camera capture, WebRTC, biometric liveness SDKs) with TypeScript throughout. Navigation: React Navigation. Server state/caching/pagination: TanStack Query (React Query), matched to this spec's cursor-based pagination standard (§2.1). Local/global client state: Zustand (`sessionStore`, wallet balance, and other shared state referenced in each module's header block). Forms: React Hook Form. Styling/UI primitives: a shared internal component library (Appendix K3, Design System) built on a utility-first styling layer (NativeWind) for cross-platform visual consistency.
- **Backend:** Node.js with NestJS (TypeScript end-to-end with the frontend; NestJS's module system maps directly onto this specification's own module boundaries, which keeps the codebase's structure legible against this document). REST for the documented `/v1/...` surface (§2.1); a colocated WebSocket gateway (Socket.IO) per service for every real-time surface this spec calls out (live rooms, chat, typing indicators, gift events).
- **Primary data store:** PostgreSQL — the system of record for the ledger (Part C2), users, content metadata, and every entity in Appendix K2, chosen specifically for the row-level locking and transactional guarantees Part C2's financial-integrity rules depend on.
- **Cache / real-time fan-out:** Redis — session and rate-limit token buckets (§2.1), and Redis Pub/Sub to fan real-time events (gifts, chat, live-room state) out across multiple backend instances to the correct WebSocket connections.
- **Search:** Elasticsearch/OpenSearch — powers Search & Explore (Part B4) and the Search & Recommendation Engine (Part I2).
- **Object storage / CDN:** S3-compatible object storage (AWS S3 or Cloudflare R2) behind a CDN (CloudFront or Cloudflare), with time-limited signed URLs for any paywalled media (never a permanently public URL for gated content).
- **Media processing:** An FFmpeg-based transcoding pipeline (managed, e.g. AWS MediaConvert, or a self-hosted worker fleet) for VOD transcoding, thumbnail generation, and creator-content watermarking.
- **Live streaming / WebRTC:** A managed WebRTC SFU (LiveKit as the primary reference choice; Agora or Mux Real-Time as alternates) — already specified in Part E for low-latency broadcast, multi-guest rooms, and Part D3's paid calls, which deliberately share this same infrastructure choice rather than adopting a second one.
- **Payments (fan-side, purchases):** An internal `PaymentProcessor` abstraction interface sitting in front of a high-risk-vertical payment processor (a CCBill/Segpay/Epoch-class provider) — mainstream processors (Stripe, standard PayPal) broadly prohibit adult-content billing, so this platform's category requires a processor built for it from day one, not a later migration.
- **Payouts (creator-side):** A payout-rail integration (e.g. Payoneer, Tipalti, or direct ACH/wire, per creator geography) sitting behind Part F3's abstraction, distinct from the fan-side payment processor above.
- **Identity/age verification vendor:** A third-party document + liveness + facial-match verification vendor (e.g. Persona, Veriff, or Yoti-class), referenced throughout Part A2.
- **Notifications:** Push via FCM (Android) and APNs (iOS), transactional email via a provider such as SendGrid or Postmark, SMS/voice OTP via a Twilio-class provider (Part A1, Part I1).
- **Infrastructure:** Containerized services (Docker) orchestrated on Kubernetes (or a managed equivalent, e.g. ECS), behind an API gateway that enforces the rate-limiting and auth rules in §2.1–2.2.
- **Observability:** Centralized logging and metrics (a Datadog/Grafana-class stack), feeding the Analytics Platform (Part I3) and the Platform Reporting module (Part H5).

# 3. Table of Contents

- **Part A — Foundations:** A1 Authentication · A2 Age Verification & Identity Compliance · A3 Profile Creation (Fan + Creator) · A4 Wallet Creation & Currency Architecture
- **Part B — Discovery & Creator Profile:** B1 Discovery Feed · B2 Stories · B3 Short-Form Feed · B4 Search & Explore · B5 Creator Profile
- **Part C — Monetization Core:** C1 Subscriptions · C2 Wallet Deduction Engine (Ledger) · C3 PPV Unlock · C4 Tips & Gifts · C5 Creator Goals · C6 Referral Rewards & Promotional Credits · C7 Bonuses
- **Part D — Messaging:** D1 Direct Messaging · D2 Mass Messaging/Broadcast · D3 Paid Calls
- **Part E — Live Streaming:** E1 Live Viewer · E2 Live Gifting Overlay · E3 Live Chat Overlay · E4 PK Battles · E5 Party Rooms · E6 Creator Broadcast Tools
- **Part F — Creator Economy Backend:** F1 Earnings & Payout Dashboard · F2 Creator Analytics · F3 Payout Processing
- **Part G — Trust & Safety:** G1 Content Moderation & Reporting · G2 Fraud & Risk Engine · G3 Account Suspension & Appeals
- **Part H — Admin/Backoffice:** H1 Admin Dashboard Overview · H2 User & Creator Management · H3 Content Review Queue · H4 Financial Operations · H5 Platform Reporting · H6 Support Tooling
- **Part I — Cross-Cutting Systems:** I1 Notifications · I2 Search & Recommendation · I3 Analytics Platform · I4 RBAC & Permissions · I5 Audit Logging
- **Part J — Account Settings & Lifecycle:** J1 Settings/Privacy/Safety · J2 Account Deletion & Data Retention
- **Part K — Appendices:** K1 Competitor Research Matrix · K2 Database Entity Reference (ERD) · K3 Design System · K4 API Standards & Error Code Registry · K5 QA Master Checklist · K6 Analytics Event Dictionary · K7 Glossary · K8 End-to-End System Wiring

*This is the complete, combined specification — all twelve parts assembled into one document. Every module in Parts A–J carries 21 sections (the original 20 plus a dedicated Tech Stack section, §2.8) and a color-coded Priority classification (§2.7) in its header block.*



\newpage


# Part A — Foundations

This Part covers the four modules every single account passes through before touching any other part of the product: Authentication, Age Verification & Identity Compliance, Profile Creation, and Wallet Creation. Nothing else in the product is reachable until all four have completed for a given account — they are hard gates, not optional onboarding polish.

---

## Module A1 — Authentication

**Previous Module:** None (entry point) · **Next Module:** A2 Age Verification & Identity Compliance
**Dependencies:** None · **Consumed Services:** SMS/Email OTP provider, Password hashing service
**Produced Events:** `user.registered`, `user.logged_in`, `user.logged_out`, `user.password_reset`
**Shared Components:** `OTPInput`, `AuthForm`, `PasswordStrengthMeter` (Appendix K3)
**Shared State:** `sessionStore` (global — every module reads `sessionStore.user` and `sessionStore.verificationStatus`)
**Global Context:** Provides the `userId` and JWT that every other module's API calls are authenticated with.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: this is the product's entry point, so nothing downstream is reachable until it exists.

### 1. Overview

**Purpose:** Establish a verified, unique identity for every account before any other action is possible, and issue the session credentials every subsequent request relies on.

**Business Goal:** Minimize signup drop-off (every extra field or step at this stage measurably reduces the number of people who ever reach the monetizable part of the product) while still capturing a contactable identifier (phone or email) usable for fraud investigation, payment disputes, and legal compliance requests.

**User Goal:** Get into the app in under 30 seconds, on the first try, without needing to remember a new password if they'd rather not.

**Platform Goal:** A unique-humans guarantee strong enough to support the fraud/risk engine (Part G2) and the referral-rewards system (Part C6) — both of which depend on "one real person, one account" holding reasonably true.

**Revenue Impact:** Indirect but foundational — every dollar of GPV traces back through an account created here. A 5% improvement in signup completion rate is a 5% increase in the top of every downstream funnel.

**Success Metrics:** Signup completion rate (started signup → verified session), OTP delivery success rate by country/carrier, time-to-first-successful-login, account-takeover incident rate (should trend toward zero).

### 2. Feature Description

From the user's perspective, this is the least interesting five seconds of using the app — friction here is pure cost with no user-facing payoff, so every design decision optimizes for speed and forgiveness (easy to retry, easy to recover, no dead ends).

From the business perspective, this module is the fraud/compliance foundation for everything downstream: every chargeback investigation, every §2257 record request, every referral-fraud investigation starts by looking at what was captured here.

**Competitor analysis:**

- **OnlyFans** requires email + password at signup, with identity verification deferred entirely to the point a user tries to become a creator. This keeps fan-side signup fast but means a large fraction of accounts are never contactable beyond an email address, which weakens fraud investigation later. *Weakness:* password-only auth for fans means credential-stuffing account takeover is a real, documented issue on the platform. *Our improvement:* we default to phone-based OTP (passwordless) for fans, which both speeds up signup (no password to invent and remember) and gives a stronger, harder-to-credential-stuff identifier from day one.
- **Instagram/Snapchat** use phone-first signup with a strong social-graph-based fraud model behind it. *What works:* OTP auto-fill on both iOS and Android makes phone verification feel almost instant. *Our improvement:* we adopt the same auto-fill pattern (see Functional Behaviour below).
- **Discord** allows email-only signup with no phone requirement, prioritizing frictionless growth over identity strength, then leans entirely on behavioral fraud signals post-signup. *Why it doesn't fit us:* Discord doesn't move real money at the account level the way this platform does from the first purchase; a payments-heavy platform cannot defer identity strength as far as Discord does.

**Our implementation:** phone-first OTP as the default and recommended path, email as a fallback for regions/users where SMS delivery is unreliable, no password required for fans (passwordless throughout), password available but optional as a secondary recovery method.

### 3. User Journey

1. User opens the app for the first time → sees a single full-screen entry screen: phone number field (country code auto-detected from device locale), a "Continue with email instead" link below it, and "Continue with Google/Apple" buttons above the phone field.
2. User enters phone number → taps Continue → screen transitions (slide-up) to a 6-digit OTP entry screen; SMS is dispatched server-side at this moment, not before.
3. OTP arrives via SMS; on iOS/Android the OS-level SMS autofill suggestion appears above the keyboard — tapping it fills all 6 digits and auto-submits without the user tapping a separate "Verify" button.
4. If the user types manually, the "Verify" button activates only once all 6 digits are entered, and auto-submits on the 6th digit (no separate tap required either way).
5. Correct code → brief success checkmark animation (200ms) → transitions directly to A2 Age Verification (fan) or continues the creator branch (see A3).
6. Incorrect code → the 6 digit boxes shake (150ms) and clear → focus returns to the first box → error text appears below: "That code didn't match. Check your messages or request a new one." → a "Resend code" link becomes tappable after a 30-second cooldown (shown as a countdown, not a dead link).
7. No code received after 60 seconds → an inline "Didn't get a code?" prompt appears automatically (not user-triggered) offering "Send via voice call instead" and "Try email instead" — this is the single highest-leverage recovery moment in the whole flow, since SMS deliverability genuinely fails for a meaningful minority of numbers.
8. Returning user opening the app → if a valid refresh token exists in local storage, they skip directly to the app shell with zero screens shown; no "welcome back, tap to continue" interstitial.
9. Explicit logout → confirmation sheet ("Log out of this device?" with a secondary "Log out of all devices" option) → clears local tokens → returns to step 1's entry screen.

### 4. UX Flow

- **Entry Points:** Cold app launch with no valid session; explicit "Log out" from Settings (J1); forced re-auth after a security event (password change elsewhere, suspected token theft).
- **Exit Points:** Successful verification → A2 (new account) or app shell (returning account). Back button/gesture on any screen in this flow returns to the phone/email entry screen, never closes the app outright on the first back-press (prevents accidental app exit mid-signup).
- **Modal Flow:** "Send via voice call" and "Try email instead" render as a bottom sheet over the OTP screen, not a navigation away from it — so the phone number entered is preserved.
- **Deep Linking:** A magic-link email (for the email fallback path) deep-links directly into the OTP-equivalent verification step with the token pre-filled, bypassing manual code entry entirely where the user opens the link on the same device.
- **Stack Navigation:** This entire flow is a modal-style stack with no tab bar visible — it is intentionally not part of the main app's navigation stack, so there is nothing to navigate "back" into except this flow's own prior screen.

### 5. UI Layout

Full-bleed, single-column, no header/footer chrome, dark-on-light form fields against the platform's neutral-50 background (Appendix K3 token). Entry screen: logo mark centered top third, phone input (full-width, large 24px numerals once digits are entered, country-code selector as a tappable flag+code prefix), primary CTA button spans full width at a fixed distance from the bottom safe area (thumb-reachable without scrolling on any supported device size), secondary email-fallback link is plain text, not a button, positioned below the primary CTA to visually subordinate it. OTP screen: six individual boxed digit inputs, evenly spaced, auto-advancing focus; countdown/resend row directly below; error state renders as red-bordered boxes plus red text, using the platform's semantic Error token, never a generic toast for this specific error since the error is tied to visible fields.

### 6. Component Breakdown

- **PhoneInput** — Props: `value, onChange, defaultCountry`. States: empty, valid, invalid-format. Variant: also renders as EmailInput when the fallback link is tapped (same component, different validation mode). Accessibility: numeric keyboard forced via `inputmode="tel"`, label always visible above the field.
- **OTPInput** — Props: `length (default 6), onComplete, error`. States: empty, partially-filled, complete, error-shake. Reusable anywhere else in the product that needs a numeric code (e.g. a future 2FA feature). Accessibility: supports paste of a full 6-digit string from the SMS autofill suggestion or clipboard.
- **CountdownResendLink** — Props: `cooldownSeconds, onResend`. States: counting-down (disabled, shows seconds remaining), ready (tappable). Accessibility: countdown updates are not individually announced to screen readers (would be unusably noisy) — only the state transition to "ready" is announced.
- **SocialAuthButton** — Props: `provider ('google'|'apple'), onPress`. Variant: platform-specific icon/label per Apple's and Google's respective branding guidelines (a hard external constraint, not a design choice).

### 7. Functional Behaviour

- Tapping Continue with a phone number that fails basic format validation (wrong digit count for the selected country) does not fire a network request — it shows an inline validation message immediately, client-side.
- A valid-format phone number triggers `POST /v1/auth/otp/request` — the button shows a spinner replacing its label text (not a separate overlay) for the duration of that call.
- On the OTP screen, the 6th digit being entered (by typing or paste) automatically fires `POST /v1/auth/otp/verify` without requiring a separate button tap — this shaves a full interaction step off the flow.
- "Resend code" re-fires `POST /v1/auth/otp/request` with the same phone number and resets the 30-second cooldown; it does not clear digits already entered in the (now-stale) code boxes until the new code's first digit is entered.
- Social auth (Google/Apple) buttons open the platform's native OAuth sheet; on success the returned token is exchanged server-side (`POST /v1/auth/oauth/exchange`) for the platform's own JWT — the frontend never handles or stores the raw Google/Apple token beyond that single exchange call.

### 8. State Management

- **Loading:** button-embedded spinner (see above), never a full-screen blocking loader for this flow — the screen must stay visibly responsive.
- **Empty:** N/A (fields start empty by definition; no separate "empty state" beyond the unfilled form itself).
- **Success:** brief checkmark micro-animation before the screen transition.
- **Failure:** inline field-level error (invalid code), or a non-blocking toast for network-layer failures (request timed out) with a "Try again" action.
- **Offline:** the Continue/Verify buttons detect a lack of connectivity before firing the request and show "You're offline — check your connection" inline rather than letting the request hang and time out.
- **Retry:** OTP request retries are user-initiated only (the Resend link) — never automatic silent retries, which would risk sending duplicate SMS and incurring duplicate provider cost.
- **Real-time:** N/A — this module has no real-time/websocket surface.

### 9. Business Rules

- One phone number maps to exactly one account; a phone number already registered attempting to "sign up" again is silently routed into the login path for that existing account instead of erroring (prevents leaking "this number is already registered" as a distinct error state, which is itself a minor account-enumeration protection).
- A given phone number may request at most 5 OTPs per hour and 10 per day (rate limit enforced server-side, independent of the client-visible 30-second cooldown) — this caps SMS cost from abuse.
- Email-fallback accounts (no phone ever verified) are flagged internally as `identityStrength: weak` and are subject to lower default wallet-purchase limits until a phone number or full identity verification (A2, for creators) is added — a fraud-mitigation business rule, not a UI restriction the user directly sees as a limit screen.
- Social-auth (Google/Apple) accounts still require a phone number before any wallet purchase or content publish — social login alone is treated as insufficient identity strength for a payments platform in this content category.

### 10. Data Requirements

- **User entity (partial — full entity in Appendix K2):** `id (uuid)`, `phone (E.164 format, nullable)`, `email (nullable)`, `phoneVerifiedAt (nullable timestamp)`, `emailVerifiedAt (nullable timestamp)`, `authProvider (enum: phone | email | google | apple)`, `passwordHash (nullable — only set if user opts into password-based recovery)`, `identityStrength (enum: weak | standard | verified)`, `createdAt`, `lastLoginAt`.
- **OTP entity (short-lived, TTL 10 minutes):** `id`, `phoneOrEmail`, `codeHash (never store the raw code)`, `attempts (int, max 5 before invalidation)`, `expiresAt`, `channel (enum: sms | voice | email)`.
- **Session entity:** `id`, `userId`, `refreshTokenHash`, `deviceInfo (user agent, approximate device type)`, `ipAddressAtCreation`, `createdAt`, `revokedAt (nullable)`.

### 11. Backend Integration

| Endpoint | Method | Auth | Rate Limit | Request | Response |
|---|---|---|---|---|---|
| `/v1/auth/otp/request` | POST | None | 5/hr, 10/day per number | `{ phoneOrEmail, channel }` | `202 { requestId }` |
| `/v1/auth/otp/verify` | POST | None | 5 attempts per requestId | `{ requestId, code }` | `200 { accessToken, refreshToken, user, isNewAccount }` |
| `/v1/auth/oauth/exchange` | POST | None | 20/hr per IP | `{ provider, providerToken }` | `200 { accessToken, refreshToken, user, isNewAccount }` |
| `/v1/auth/refresh` | POST | Refresh token | 60/hr per session | `{ refreshToken }` | `200 { accessToken, refreshToken }` (rotated) |
| `/v1/auth/logout` | POST | Access token | — | `{ allDevices: boolean }` | `204` |

No websocket surface. No pagination/filtering/sorting applicable. `requiredRole`: none (pre-authentication endpoints) except `/logout` which requires any authenticated role.

### 12. Database Dependencies

**Entities:** `users`, `otp_codes`, `sessions` (schemas above). **Relationships:** `sessions.userId → users.id` (many sessions per user, supports multi-device). `otp_codes` has no foreign key to `users` until verification succeeds (a phone number can have a pending OTP before an account exists for it). **Indexes:** `users.phone` (unique, partial index where not null), `users.email` (unique, partial index where not null), `sessions.refreshTokenHash` (unique, for fast revocation lookups), `otp_codes.expiresAt` (for a cleanup job that purges expired codes). **Soft Delete:** `users.deletedAt` — see Part J2 for the full account-deletion data-retention policy; `sessions` are hard-deleted on revocation (session records carry no long-term compliance value once revoked). **Ownership:** every `sessions` row is owned by exactly one `users` row.

### 13. Cross-Module Dependencies

**Receives from:** nothing upstream — true entry point; no other module's output feeds this one.
**Hands off to:** A2 (the JWT and `userId` issued here are the session this module immediately checks next), and indirectly every other module in the product, since the JWT claims (`userId`, `role`, `verificationStatus`, `sessionId`) are what every subsequent authenticated request across every Part relies on.
**Breaks if changed:** changing the JWT claim shape (e.g. renaming `role` or `verificationStatus`) requires a coordinated update across every backend service that authorizes requests — this is the single highest-blast-radius module in the product to modify.

### 14. Error Handling

| Scenario | Behavior |
|---|---|
| SMS provider outage | Automatic fallback to voice-call OTP offered after 60s; incident also pages the on-call backend team via the platform's monitoring (outside this doc's scope, noted for completeness). |
| Wrong OTP entered 5 times | The `requestId` is invalidated entirely; user must request a fresh code (prevents brute-force guessing a 6-digit code, which is only ~1M possibilities). |
| Expired OTP (>10 min) | `410 CODE_EXPIRED` — inline message: "That code expired. Request a new one." with a Resend action pre-focused. |
| Network timeout on verify | Client retries the read (idempotent check of verification status) once automatically before surfacing a manual retry option — avoids a false "failed" state when the server actually succeeded but the response was lost. |
| OAuth token exchange fails (revoked/expired provider token) | `401 OAUTH_TOKEN_INVALID` — user is returned to the entry screen with "That sign-in didn't work — please try again." |
| Account is suspended (Part G3) attempting login | Login succeeds at the auth layer (credentials are valid) but the returned JWT carries `accountStatus: suspended`; the app shell intercepts this and routes to the Account Suspended screen (G3) instead of the normal app — auth and account-standing are deliberately separate checks. |

### 15. Security

- OTP codes are hashed (not stored in plaintext) server-side, exactly like passwords, even though they're short-lived.
- Refresh tokens are rotated on every use; reuse of a rotated-out token revokes the entire token family (theft detection).
- Rate limiting is enforced both per-phone-number and per-IP to blunt both targeted-account and broad credential-stuffing attack patterns.
- No password is required by default, which structurally eliminates password-reuse and credential-stuffing risk for the majority of accounts; optional password-based recovery, where set, is hashed with a modern algorithm (Argon2id) with per-user salt.
- Session device metadata is retained specifically to support the "log out of all devices" flow and to power a future "new device login" notification (Part I1).

### 16. Accessibility

- Full keyboard operability for the web client: tab order flows logically through phone/country-code/continue, then digit-by-digit through OTP boxes.
- Screen reader: form fields have explicit labels (not placeholder-only); the OTP box group is announced as "Verification code, 6 digits" with the current fill state; success/error states are announced via `aria-live`.
- Contrast: error red and success green both meet WCAG AA against the background at the sizes used.
- Touch targets: all tappable elements (including each individual OTP digit box) are at least 44×44px.
- Reduced motion: the checkmark success animation and shake-on-error animation both have a static-state fallback (a solid checkmark / a red border with no shake) when the OS reduced-motion setting is on.

### 17. Performance

- The entry screen is the very first thing rendered on cold launch — it must be interactive in under 1 second on a mid-range device, which constrains this screen to zero non-critical asset loading (no images beyond a small logo mark, no third-party scripts beyond the OAuth SDKs, loaded lazily only when their button is tapped, not on initial screen load).
- OTP auto-submit avoids an extra round-trip of user-perceived latency (tap Verify → network) since the request fires the instant the 6th digit lands.

### 18. Analytics

**Events:** `auth_entry_viewed`, `otp_requested {channel}`, `otp_verified {success: bool, attemptNumber}`, `oauth_attempted {provider}`, `oauth_completed {provider, success}`, `signup_completed {isNewAccount}`, `login_completed`, `logout {allDevices: bool}`.
**Funnel:** entry viewed → OTP requested → OTP verified → (new accounts continue into A2's funnel). **KPIs:** completion rate at each funnel step, median time-to-complete, OTP delivery success rate segmented by country/carrier (this segmentation is what actually drives fixing SMS deliverability issues, so it must be captured at the country/carrier level, not just an aggregate). **Retention link:** day-1/day-7 retention is measured from `signup_completed`, giving this module's completion quality a direct, measurable line to platform retention. **Revenue link:** none directly — this module precedes all monetization — but its completion rate multiplies every downstream revenue funnel.

### 19. Testing

**Unit tests:** phone-number format validation per supported country; OTP code generation produces cryptographically random, non-sequential codes; rate-limit counters increment/reset correctly.
**Integration tests:** full request→verify round-trip against a test SMS provider sandbox; OAuth exchange against provider sandbox credentials; refresh-token rotation invalidates the prior token.
**E2E tests:** cold-launch → phone entry → OTP autofill (simulated) → lands on A2 for a new account; cold-launch with valid existing session → skips directly to app shell; logout → relaunch → lands back on entry screen.
**Edge cases:** OTP requested, then app is force-closed before verification, then reopened — the pending `requestId` should still be resolvable (not silently lost) if attempted within the 10-minute TTL; user enters a phone number, then changes country code, then submits (must revalidate against the new country's format, not the old); user pastes a 7-digit string into the 6-digit OTP field (must gracefully truncate or reject, not crash); simultaneous login attempts on two devices with the same account (both should succeed and create independent sessions, since multi-device is supported).
**QA checklist:** verify OTP SMS actually arrives on at least one real device per major carrier in each launch country before any release; verify voice-call OTP fallback audio is intelligible; verify social auth buttons match each provider's current branding guideline (these change periodically and out-of-date branding can cause app-store review rejections).
**Acceptance criteria:** a new user can go from cold launch to a verified session in under 30 seconds on a median 4G connection, with zero manual typing if SMS autofill is available on their device.

### 20. Future Enhancements

- Passkey/WebAuthn support as a third auth method alongside OTP and OAuth, for users who want the strongest available account-takeover resistance.
- Risk-based step-up authentication (require re-verification only when a login is flagged as anomalous by the fraud engine, Part G2, rather than uniformly for everyone).
- WhatsApp OTP delivery as an additional channel in regions where WhatsApp has higher effective deliverability than SMS.

### 21. Tech Stack

- **Frontend:** React Native (Expo) screens built from `AuthForm`, `OTPInput`, `PasswordStrengthMeter`, `SocialAuthButton` (Appendix K3); Zustand `sessionStore` holds the resulting `user`/`verificationStatus`/tokens client-side the instant verification succeeds. No TanStack Query caching here — auth calls are one-shot mutations, not cached reads.
- **Backend:** NestJS auth module issuing/verifying short-lived JWTs and rotating opaque refresh tokens per §2.2; Redis-backed token buckets enforce the OTP rate limits in §9, and Redis also holds hashed OTP codes with their 10-minute TTL.
- **Third-party services:** SMS/voice OTP provider (Twilio-class, §2.8), Google/Apple OAuth SDKs, Argon2id for the optional password-recovery hash.
- **Data layer:** PostgreSQL `users`, `otp_codes`, `sessions` tables (§10).

---

## Module A2 — Age Verification & Identity Compliance

**Previous Module:** A1 Authentication · **Next Module:** A3 Profile Creation
**Dependencies:** A1 · **Consumed Services:** Third-party identity verification vendor (document + liveness + facial match), Sanctions/PEP screening service (for creator payout eligibility)
**Produced Events:** `age_gate_passed`, `creator_verification_submitted`, `creator_verification_approved`, `creator_verification_rejected`
**Shared Components:** `AgeGateInterstitial`, `IDCaptureCamera`, `VerificationStepper` (Appendix K3)
**Shared State:** `sessionStore.verificationStatus` (read by every module that gates on it — the entire Discovery/Content surface for fans, and the entire Creator Studio for creators)
**Global Context:** This module is the platform's primary legal compliance control. Every downstream module that shows or accepts adult content checks `verificationStatus` before rendering.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking (no content can legally be shown or published without it) and independently high-complexity/high-risk (third-party vendor integration, liveness, §2257 recordkeeping) — both factors alone would put this at High.

### 1. Overview

**Purpose:** Establish, to a legally defensible standard, that (a) every fan viewing content is old enough to lawfully do so in their jurisdiction, and (b) every creator publishing content is a real, consenting adult, with records kept per 18 U.S.C. §2257 and equivalent regimes.

**Business Goal:** Operate lawfully in every launch jurisdiction without the false-positive-driven signup abandonment that a badly-designed verification flow causes; avoid the platform-ending risk of a §2257 audit finding incomplete creator records.

**User Goal (fan):** Prove age with minimum friction and without handing over more personal data than the situation actually requires. **User Goal (creator):** Get through mandatory identity verification quickly and understand exactly what's happening with their submitted documents while waiting.

**Platform Goal:** Meet the "highly effective age assurance" bar regulators are increasingly setting (UK Online Safety Act's <0.1% false-positive standard, EU DSA, and the 25+ US states with their own age-verification statutes) without over-collecting data the platform doesn't need and would rather not be liable for storing.

**Revenue Impact:** A creator who abandons verification never earns and never generates GPV; every point of verification-funnel drop-off is a direct loss of supply-side content. A fan who bounces off a clumsy age-gate never sees a single post.

**Success Metrics:** Fan age-gate completion rate (should be near 100% — friction here should be near-zero), creator verification completion rate, median creator verification turnaround time, false-rejection rate (a real human incorrectly rejected — a support and trust cost), verification-fraud catch rate (fake/stolen documents correctly rejected).

### 2. Feature Description

For fans, this is a binary, low-stakes gate: confirm you're over the age threshold, get a session token, move on. For creators, this is a materially heavier, multi-step identity proof that most competitors also require, and abandoning it entirely is not legally an option for this content category.

**Competitor analysis:**

- **OnlyFans:** government-issued photo ID, live selfie with liveness detection, and a photo holding the ID with a handwritten note/date — a pattern proven at scale, and one regulators reference as a baseline. *Weakness:* the handwritten-note-holding-ID step is widely reported by users as the most friction-heavy and confusing part of the flow. *Our improvement:* replace the handwritten-note step with an automated liveness check (a short recorded head-turn) that achieves the same anti-fraud goal (proving a live person is present, not a photo of a photo) without a step users find confusing or are unsure how to satisfy.
- **Patreon / Substack:** government ID plus selfie match, applied to all creators regardless of content category, showing that this pattern generalizes even for platforms that also carry SFW creators. *What works:* Substack's rollout communicated clearly why verification was being required, reducing the perception of an arbitrary new hurdle. *Our improvement:* the same plain-language "why we're asking" pattern is applied here (see UI Layout).
- **Crypto/Web3 KYC flows (broader industry pattern):** heavy use of automated document-authenticity checks (hologram detection, font-consistency checks) before any human review, which is what makes same-day turnaround possible at scale. *Our implementation adopts this same automated-first, human-review-as-fallback structure* (see Functional Behaviour).

**Our implementation:** binary token-based age-gate for fans (no document capture at all); full document + liveness + facial-match verification for creators, automated-first with human review only for cases the automated system can't confidently resolve.

### 3. User Journey — Fan Path

1. Immediately after A1 completes for a fan-track account, a single full-screen interstitial appears: plain-language age question ("Confirm you are 18 or older") with a date-of-birth input (not a simple yes/no button — a stated DOB is a stronger, auditable assertion than a tap).
2. User enters DOB → taps Confirm → if the calculated age is below the platform's threshold (18, or higher where local law requires), the account is immediately and permanently blocked from proceeding, shown a plain notice, and no further onboarding screens are reachable — there is no retry-with-a-different-birthdate path from this same screen (see Business Rules).
3. If age qualifies, a signed, time-limited age-token is issued and stored; the interstitial dismisses and the user proceeds to A3 Profile Creation.
4. On every subsequent app open, the stored token is checked before any content renders; if it's still valid (see Business Rules for expiry), no interstitial is shown again — this is a one-time event per token lifetime, not a recurring nag.

### 3. User Journey — Creator Path

1. Immediately after A1 completes for a creator-track account (selected in A1's role-select step), the flow moves directly into this module rather than to A3 — identity must be proven before a creator profile can even be created.
2. Step 1 of 3, "Verify your ID": camera opens directly (no separate "get ready" screen) with a live document-outline guide overlay; user photographs the front of a government ID, then is prompted to flip it and photograph the back.
3. Each captured image is checked client-side for basic quality (blur, glare, all four corners visible) before upload — a bad capture is rejected and re-prompted immediately, not discovered minutes later after a failed backend review.
4. Step 2 of 3, "Confirm it's really you": a liveness check — the screen shows a circular guide and asks the user to slowly turn their head as instructed on screen; a progress ring fills based on the verification SDK's real-time confidence signal.
5. Step 3 of 3, "Review & Submit": shows thumbnails of what was captured (front ID, back ID, liveness confirmation) with a plain-language summary of what happens next and an estimated wait time, then a single Submit button.
6. Immediately after submission, the dashboard is replaced by a Pending Review card ("We're verifying your ID — this usually takes under 30 minutes, sometimes up to 24 hours") rather than a blank or generic loading screen.
7. Approval → push notification + in-app notification ("You're verified! Set up your profile.") → routes into A3. Rejection → push notification + in-app notification with a specific, actionable reason and a "Try again" entry point that returns to Step 1 with the reason displayed at the top so the user doesn't repeat the same mistake.

### 4. UX Flow

- **Entry Points:** Automatic, immediately following A1 — this module has no other entry point and cannot be navigated to independently.
- **Exit Points:** Fan: age confirmed → A3. Fan: age denied → account permanently blocked, only exit is app uninstall/close (no further in-app navigation is offered from the block screen, deliberately, since offering navigation elsewhere would imply there's a way around the block). Creator: approved → A3. Creator: rejected → returns to Step 1 of this same module.
- **Modal Flow:** None of this flow uses modals/sheets — every step is a dedicated full screen, since interrupting an identity-capture flow with an overlay risks context loss (e.g., losing camera state).
- **Back Navigation:** Disabled between Steps 1–3 of the creator capture wizard once a step is complete (prevents a confusing state where a previously-captured image is silently discarded); allowed before any capture has started (can return to A1's role selection to switch tracks).
- **Deep Linking:** The approval/rejection push notification deep-links directly to A3 (on approval) or Step 1 with the rejection reason pre-loaded (on rejection) — never just to a generic app-open.

### 5. UI Layout

Fan interstitial: centered card on a neutral background, no navigation chrome, a single DOB input (three separate month/day/year fields rather than a single free-text field, to avoid ambiguous date-format entry errors), one primary button. Creator wizard: full-screen camera viewport for capture steps with a translucent dark scrim outside the document-guide rectangle (draws the eye to exactly where the ID needs to sit); a persistent step-indicator (1 of 3 / 2 of 3 / 3 of 3) pinned to the top; Review screen uses a plain vertical list of the three captured items with small thumbnail previews, not a dense grid — this is a moment for the user to feel confident everything was captured correctly, not to scan quickly.

### 6. Component Breakdown

- **AgeGateInterstitial** — Props: `minAge (config-driven per jurisdiction), onResult`. States: unanswered, underage-blocked, confirmed. No variants. Accessibility: DOB fields are properly labeled (Month/Day/Year, not just three unlabeled boxes) and screen-reader announces the blocked state clearly and calmly.
- **IDCaptureCamera** — Props: `side ('front'|'back'), onCapture, guideOverlay`. States: awaiting-capture, capturing, quality-check-failed, captured. Not reused elsewhere in the product (highly specific to this compliance flow). Accessibility: voice-guided instructions available as an alternative to the on-screen visual guide.
- **LivenessPromptOverlay** — Props: `onProgress, onComplete`. States: instructing, in-progress (with live confidence ring), complete, failed-retry. Accessibility: instructions are read aloud as well as displayed as text.
- **VerificationStepper** — Props: `currentStep, totalSteps`. Reused conceptually (not literally the same component instance) in A3's later multi-step forms and in F3's payout-setup flow — same visual pattern for "you're partway through a multi-step process."
- **PendingReviewCard / RejectionReasonCard** — Props: `estimatedWaitTime` / `reasonCode, reasonText`. States are mutually exclusive terminal states of the submission.

### 7. Functional Behaviour

- DOB entry on the fan interstitial computes age client-side the instant all three fields are filled, before the Confirm button is even tapped — but the actual gate decision and token issuance happens server-side (`POST /v1/verification/age-token`), since a client-only age check is trivially bypassed and carries zero legal weight.
- The creator ID-capture screen runs a lightweight on-device quality heuristic (blur detection, corner-presence detection via the camera SDK) before allowing "use this photo" — this is a UX optimization to catch obviously-bad captures instantly, not a substitute for the backend vendor's actual document-authenticity check.
- Liveness check: the on-screen ring fill is driven by the verification SDK's real, live confidence score returned frame-by-frame — never a fake fixed-duration timer — so a user who moves too fast or in poor lighting sees the ring stall and understands to adjust, rather than being told "success" prematurely and failing at the backend stage instead.
- Submission (`POST /v1/verification/creator/submit`) uploads directly to the verification vendor's endpoint via a short-lived signed upload URL obtained from the platform backend — raw ID images do not pass through and are not stored on the platform's own application servers, only the vendor's verification result (approved/rejected/reason) is stored.

### 8. State Management

- **Loading:** capture-quality-check runs synchronously and fast (<300ms) so it never needs its own loading state; submission does show a determinate-feeling progress state during upload.
- **Empty:** N/A.
- **Success:** approval push notification + Pending→Approved card transition with a brief celebratory checkmark (calmer than the monetization-success animations elsewhere in the product — this is a compliance gate, not a purchase).
- **Failure:** RejectionReasonCard, detailed above.
- **Offline:** capture screens function fully offline (camera doesn't need network); submission is blocked with a clear "You're offline — we'll submit as soon as you're back online" message, and the app retries submission automatically once connectivity returns rather than silently discarding the captured images.
- **Syncing/Retry:** verification status is polled every 30 seconds while a submission is pending (in addition to being pushed via notification on completion), so the Pending card updates even if the push notification is missed/delayed.

### 9. Business Rules

- A fan who fails the age gate is blocked permanently for that account — there is no "try a different birthdate" retry on the same device/account, since offering an immediate retry would trivially defeat the gate's purpose. (A support-initiated manual review exists for the rare legitimate case of an honest data-entry mistake, handled entirely outside the app by Part H6 support tooling, never as a self-service in-app retry.)
- The fan age-token is valid for 12 months from issuance, after which it silently re-prompts on next app open — this balances minimizing repeat friction against the reality that "18 or older" continues to be true forever once confirmed, so the re-prompt exists primarily to refresh the token's cryptographic freshness for audit purposes, not because the underlying fact needs re-checking.
- A creator cannot re-attempt verification more than 3 times in a rolling 30-day period without the case being escalated to manual human review regardless of what the automated system says — repeated failed attempts are itself a fraud signal.
- No creator content can be published, and no payout can be requested, while `verificationStatus != approved` — enforced server-side on every relevant write endpoint, not just hidden client-side, since a client-side-only restriction is not a real restriction.
- Verification records (the vendor's approved/rejected determination, submission timestamps, and the specific document type used) are retained for the legally required minimum period even if the creator later deletes their account (see Part J2) — this is a §2257 requirement, not a platform preference, and overrides the user's general right to deletion for this specific record category.

### 10. Data Requirements

- **AgeToken entity:** `id`, `userId`, `issuedAt`, `expiresAt`, `jurisdiction (inferred from IP/locale at issuance, stored for audit)`.
- **CreatorVerification entity:** `id`, `userId`, `status (enum: pending | approved | rejected | expired)`, `vendorReferenceId (opaque ID from the verification vendor — the platform does not store raw document images itself)`, `submittedAt`, `resolvedAt`, `rejectionReasonCode (nullable enum)`, `documentType (enum: passport | drivers_license | national_id)`, `reverificationDueAt (annual or risk-triggered)`.
- **VerificationAttempt entity (audit trail):** `id`, `userId`, `attemptNumber`, `outcome`, `createdAt` — retained independent of the current `CreatorVerification` row specifically to support the "3 attempts in 30 days" business rule and general fraud pattern analysis.

### 11. Backend Integration

| Endpoint | Method | Auth | Rate Limit | Request | Response |
|---|---|---|---|---|---|
| `/v1/verification/age-token` | POST | Access token (post-A1) | 5/day per user | `{ dateOfBirth }` | `200 { ageToken, expiresAt }` or `403 UNDERAGE` |
| `/v1/verification/creator/upload-url` | POST | Access token, `requiredRole: creator-pending` | 20/day | `{ side: 'front'|'back'|'liveness' }` | `200 { uploadUrl, expiresIn }` (short-lived, direct-to-vendor) |
| `/v1/verification/creator/submit` | POST | Access token | 3 per 30 days (soft; 4th+ requires manual flag) | `{ documentType, uploadReferenceIds[] }` | `202 { verificationId, status: 'pending' }` |
| `/v1/verification/creator/status` | GET | Access token | 120/hr (supports 30s polling) | — | `200 { status, rejectionReasonCode? }` |
| Webhook: `verification.resolved` | Vendor→Platform | Vendor signature | — | `{ verificationId, status, reasonCode? }` | `200 ack` — this is what actually flips `status` in most cases, with the polling endpoint above as a client-side freshness backstop, not the primary mechanism. |

`requiredRole` for the creator submission endpoints is a special interim state, `creator-pending` — assigned the moment a user selects the Creator track in A1, and upgraded to full `creator` only on verification approval.

### 12. Database Dependencies

**Entities:** `age_tokens`, `creator_verifications`, `verification_attempts`. **Relationships:** all three reference `users.id`. `creator_verifications` is 1:1-current (one active row per user) but historical rows are retained (soft-superseded, not deleted) to preserve the full audit trail across re-verification cycles. **Indexes:** `creator_verifications.userId + status` (for the admin review queue in Part H3 to efficiently list pending cases), `verification_attempts.userId + createdAt` (for the 30-day rolling window rule). **Audit fields:** every row here is append-mostly; `creator_verifications.rejectionReasonCode` and timestamps are never edited after the fact, only superseded by a new row on re-attempt. **Ownership:** exclusively owned by the `users` row; no sharing/multi-tenancy concern.

### 13. Cross-Module Dependencies

**Receives from:** A1 (an authenticated session — this module cannot be reached without one).
**Hands off to:** A3 (cannot create a creator profile without `approved` status), B5/C1/C3/C5 (no content can be published or monetized without it), F3 (no payout without it), G1/G2 (moderation and fraud systems reference verification status when assessing an account), H2/H3 (admin tooling to review and manage verification cases).
**Breaks if changed:** changing the `status` enum values or the webhook payload shape requires coordinated updates across every module listed above that gates on `verificationStatus` — this is the second-highest blast-radius module after Authentication itself.

### 14. Error Handling

| Scenario | Behavior |
|---|---|
| Verification vendor API outage | Submission is queued client-side and retried with backoff; Pending card copy adapts to "This is taking longer than usual" past the normal estimated window rather than leaving a stale time estimate on screen. |
| Document photo rejected for quality (blur/glare) at client-side check | Immediate re-prompt on the same step, no submission attempt consumed, no penalty toward the 3-attempts limit. |
| Document authenticity check fails at the vendor (suspected fake/tampered ID) | Full submission counted as a failed attempt (`REJECTED_DOCUMENT_AUTHENTICITY`); repeated occurrences escalate to fraud review (Part G2) rather than simply allowing indefinite retries. |
| Liveness/face-match fails (face doesn't match ID photo) | `REJECTED_FACE_MISMATCH` — user is shown this specific reason (not a vague "verification failed") and can retry, since lighting/angle issues are a common legitimate cause. |
| Age-gate DOB entry indicates underage | `403 UNDERAGE` — permanent block per Business Rules; no further error-recovery path is offered by design. |
| Webhook delivery fails/is delayed from the vendor | The 30-second client polling endpoint is the backstop that eventually surfaces the true status even if the webhook is lost, so no user should be permanently stuck on Pending due to a missed webhook alone. |

### 15. Security

- Raw identity documents and biometric liveness captures are never persisted on platform-owned infrastructure — only the vendor's opaque reference ID and final determination are stored, minimizing the platform's own breach exposure for the most sensitive data category it touches.
- Upload URLs are short-lived (single-use, expiring in minutes) and scoped to exactly one file, preventing a leaked URL from being reused.
- Webhook payloads from the verification vendor are signature-verified (HMAC) before being trusted to change a `status` field.
- Age-tokens are signed and include a jurisdiction claim, so a user who changes their apparent locale after passing the gate does not automatically inherit a different jurisdiction's threshold without re-evaluation.

### 16. Accessibility

- Voice-guided alternative instructions for both document capture and liveness steps, for users who cannot easily follow on-screen visual guidance.
- All step-indicator and status text is available to screen readers, not conveyed only via a visual progress ring/stepper graphic.
- Underage-block screen uses plain, non-alarming, non-judgmental language and meets the same contrast/legibility standards as the rest of the product — this is not a moment to be visually harsh even though the outcome is a hard stop.

### 17. Performance

- Client-side capture-quality checks run in well under 300ms so they never feel like a separate "processing" step.
- Liveness SDK integration is chosen specifically for real-time (frame-by-frame) confidence scoring rather than a record-then-batch-process model, so the user gets live feedback instead of submitting blind and waiting.

### 18. Analytics

**Events:** `age_gate_shown`, `age_gate_result {passed: bool}`, `creator_verification_step_reached {step}`, `creator_verification_capture_quality_failed {side, reason}`, `creator_verification_submitted`, `creator_verification_resolved {status, reasonCode?, durationSeconds}`.
**Funnel:** step-reached events for all 3 creator steps give a precise drop-off funnel — this is the funnel product/ops watches most closely, since a spike in drop-off at, say, the liveness step usually indicates an SDK regression or a specific-device compatibility issue worth investigating immediately, not just a KPI to note. **KPIs:** completion rate per step, `durationSeconds` distribution (feeds the "estimated wait time" copy shown to users, which should be a real percentile of actual historical durations, not a guessed static number). **Revenue link:** creator verification completion is a direct precondition for any creator ever generating revenue, making this funnel's health a leading indicator of future GPV.

### 19. Testing

**Unit tests:** age calculation from DOB across leap years and timezone edge cases (a user near midnight on their exact 18th birthday, in a jurisdiction using UTC vs. local-time evaluation, must be handled consistently and documented); jurisdiction-threshold config lookup (some jurisdictions may require 21, not 18 — this must be data-driven, not hardcoded).
**Integration tests:** full submit→webhook→status-flip round trip against the vendor's sandbox environment for both approval and each rejection reason code; polling endpoint correctly reflects a webhook-driven status change within one polling interval.
**E2E tests:** fan happy path (DOB entry → token issued → proceeds to A3); fan underage path (block screen shown, no further onboarding reachable); creator happy path (3 steps → submit → approved → proceeds to A3); creator rejection path (submit → rejected with a specific reason → retry → approved).
**Edge cases:** user backgrounds the app mid-liveness-check (must resume cleanly or restart that step, never leave a corrupted partial capture); user's device has no functioning camera (must be detected and routed to a "verification requires a device with a camera" message rather than a silent hang); two verification submissions somehow race for the same user (must be serialized/rejected, not both processed).
**QA checklist:** test document capture against ID types from every launch-country's most common formats (a national ID card is shaped very differently from a passport and the capture-guide overlay must accommodate both); verify the vendor sandbox's simulated rejection reasons all map to a real, user-visible, correctly-worded RejectionReasonCard.
**Acceptance criteria:** a creator with a genuine, valid ID and good lighting completes verification in under 3 minutes end-to-end with zero manual retries required.

### 20. Future Enhancements

- Support for additional document types (e.g. national eID schemes with an NFC chip read, which is both faster and more fraud-resistant than a photo capture).
- Periodic risk-based re-verification (trigger a lightweight re-check only for accounts showing other fraud signals, rather than a uniform annual re-check for everyone).
- A privacy-preserving reusable-verification credential (prove "verified elsewhere" via a portable credential standard) to reduce repeat friction for users who are verified on other compliant platforms already, as this class of standard matures.

### 21. Tech Stack

- **Frontend:** React Native camera capture via a native module (Expo Camera plus the verification vendor's native liveness SDK); `IDCaptureCamera`, `LivenessPromptOverlay`, `VerificationStepper` (Appendix K3); Zustand `sessionStore.verificationStatus`; TanStack Query drives the 30-second `GET /v1/verification/creator/status` poll described in §8.
- **Backend:** NestJS verification module that brokers short-lived signed upload URLs and validates the vendor's webhook signature (HMAC) before trusting a `status` change; Redis-backed counters enforce the 3-submissions-per-30-days rule (§9).
- **Third-party services:** identity verification vendor — document + liveness + facial match (Persona/Veriff/Yoti-class, §2.8) — and a sanctions/PEP screening service for creator payout eligibility.
- **Data layer:** PostgreSQL `age_tokens`, `creator_verifications`, `verification_attempts` (§10); no raw document images ever touch platform-owned storage (§15).

---

## Module A3 — Profile Creation (Fan + Creator)

**Previous Module:** A2 Age Verification & Identity Compliance · **Next Module:** A4 Wallet Creation & Currency Architecture
**Dependencies:** A1, A2 (creator branch requires `verificationStatus: approved`) · **Consumed Services:** Image moderation service (for avatar/banner uploads), Username-availability/profanity filter
**Produced Events:** `profile_created`, `creator_profile_published`
**Shared Components:** `AvatarPicker`, `UsernameInput`, `BioEditor` (Appendix K3)
**Shared State:** `sessionStore.profile`
**Global Context:** Produces the `Creator` or `Fan` profile record that Part B (Discovery/Creator Profile) and every monetization module in Part C read and display.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: no usable fan account and no publishable creator profile exist without it; moderate complexity.

### 1. Overview

**Purpose:** Capture the minimum profile information needed to make an account usable and, for creators, publicly presentable, without turning onboarding into a long form.

**Business Goal:** Get fans into the Discovery feed (Part B1) as fast as possible, since time-to-first-feed-view correlates directly with day-1 retention; get creators to a publishable profile fast, since an unpublished creator earns nothing.

**User Goal (fan):** Pick a display name/handle and move on — profile completeness for fans is optional polish, not a gate. **User Goal (creator):** Set up a profile that actually converts visitors into subscribers, which needs more than a name — a banner, a bio, and at least a first piece of content.

**Platform Goal:** A healthy creator supply funnel — creators who complete profile setup and publish at least one post within their first session are dramatically more likely to remain active than those who don't.

**Revenue Impact:** Every creator profile field that improves conversion (a well-written bio, a good avatar) compounds across that creator's entire lifetime GPV; this module's quality is a multiplier on Part C's entire revenue surface.

**Success Metrics:** Time-to-profile-complete, fan handle-selection completion rate, creator first-post-published rate within first session, creator profile-completeness score distribution.

### 2. Feature Description

Fans get the lightest possible profile: display name (or an auto-generated one they can keep), handle, optional avatar. Creators get a genuinely guided setup, because an empty or sparse creator profile converts poorly and the platform has a direct financial interest in helping new creators avoid that mistake.

**Competitor analysis:**

- **Instagram/TikTok fan onboarding:** near-zero-friction profile setup (a handle and nothing else is enough to start browsing), with profile richness built up organically over time rather than front-loaded. *Our implementation mirrors this for the fan track.*
- **OnlyFans creator onboarding:** minimal guidance — a creator is dropped into a mostly-blank profile editor with no structured walkthrough. *Weakness:* new creators frequently publish a sparse, low-converting profile in their first session simply because nobody told them what a good one looks like, and never return to fix it. *Our improvement:* a short, skippable guided setup (bio prompt with example, suggested banner dimensions with a live preview, a nudge to publish a first post before finishing setup) measurably improves first-session profile quality without becoming a mandatory long form.
- **LinkedIn's "profile strength" meter (cross-industry pattern):** a visible completeness indicator that gamifies filling out an otherwise optional-feeling profile. *Our implementation adopts a lightweight version of this for creators* (see UI Layout) without extending it to fans, where profile completeness isn't a meaningful lever.

### 3. User Journey — Fan Path

1. Lands here directly from A2 → single screen: auto-suggested handle (derived from phone/email, editable) with real-time availability checking, display-name field pre-filled to match, optional avatar picker (camera/gallery/skip).
2. Taps Continue (available immediately even with only the auto-suggested handle accepted and nothing else touched — true zero-friction floor) → profile created → lands directly in the Discovery feed (B1).
3. Avatar/bio can be added or edited any time later from Settings (J1) — nothing here is a one-time-only opportunity.

### 3. User Journey — Creator Path

1. Lands here directly from an approved A2 → multi-step guided setup (skippable at every step except the handle, which is mandatory since it's the creator's public identity/URL): Step 1 handle + display name; Step 2 avatar + banner (with live preview of exactly how the profile hero will look, per Module B5's layout); Step 3 bio (with a placeholder example shown in gray, illustrating length/tone, that clears the instant the user starts typing); Step 4 "Set your first tier" (a lightweight single-tier price picker — full multi-tier management lives in Part C1, this is just enough to have something to sell from minute one); Step 5 "Publish your first post" (opens directly into Module 9.0-equivalent capture flow, returns here on completion).
2. A persistent, dismissible "Profile strength" indicator (Weak/Good/Great, driven by which of the above is completed) appears on the creator's own view of their profile going forward, encouraging completion of anything skipped, without blocking access to the rest of the app.
3. "Publish" on the profile (available once handle + at least an avatar are set, even if other steps were skipped) makes the creator profile publicly visible in Discovery/Search; before Publish, the profile exists but is not visible to fans (a private-draft state, useful for creators who want to prepare a profile before going live).

### 4. UX Flow

- **Entry Points:** Automatic from A2 for new accounts; also reachable anytime afterward via Settings → Edit Profile (J1) for edits.
- **Exit Points:** Fan: Continue → Discovery Feed (B1). Creator: complete or skip through all steps → Creator Studio home (F1/F2) with the "publish your profile" reminder still visible if not yet published.
- **Modal Flow:** avatar/banner picker opens as a bottom sheet (camera / gallery / remove options) over the current step, not a full navigation away.
- **Back Navigation:** each step in the creator wizard can be revisited via a back arrow without losing already-entered data in later steps (form state persists across step navigation within the session).
- **Deep Linking:** none specific to first-time setup; the *edit* version of this flow (from Settings) deep-links directly to a specific field (e.g. tapping "Edit bio" from the profile screen opens straight to the bio editor, not the full wizard).

### 5. UI Layout

Fan: single centered card, avatar circle with a camera-badge overlay affordance, handle field with a real-time green-check/red-x availability indicator directly in the field. Creator wizard: full-screen per step with the VerificationStepper pattern (reused from A2) at the top, a large live preview pane on step 2 that updates in real time as the avatar/banner are adjusted (crop/reposition controls directly on the preview image, not a separate edit screen), bio step shows a live character-count and the example placeholder text described above.

### 6. Component Breakdown

- **UsernameInput** — Props: `value, onChange, onAvailabilityChecked`. States: checking (debounced spinner inline in the field), available, taken, invalid-characters/profanity-filtered. Reused in J1's profile-edit screen.
- **AvatarPicker** — Props: `currentImage, onChange, shape ('circle'|'banner')`. States: empty, selected, uploading, upload-failed. Includes basic crop/reposition, not a full photo editor.
- **ProfileStrengthMeter** — Props: `completedSteps[], totalSteps`. Creator-only; not shown anywhere in the fan experience.
- **TierPricePicker (lightweight, single-tier variant)** — Props: `price, onChange`. This is a simplified entry point into the full tier-management UI that lives in Part C1 — the same underlying data model, a narrower first-run UI.

### 7. Functional Behaviour

- Handle availability is checked via a debounced (400ms after last keystroke) call to `GET /v1/profiles/handle-available?handle=`, with the profanity/reserved-word filter applied server-side (never client-side only, since a client-only filter is trivially bypassed and this is public-facing identity text).
- Avatar/banner upload runs through the image moderation service before being accepted as the *public* image — a clearly inappropriate upload (caught by automated moderation) is rejected at upload time with a specific message, not silently accepted and only actioned later by a human reviewer (which would mean the image was briefly live).
- "Publish" is a single explicit action, not an automatic side-effect of finishing the wizard — a creator can complete every step and still choose not to go public yet.

### 8. State Management

- **Loading:** handle-availability check shows an inline spinner within the field itself; avatar upload shows a progress ring directly on the avatar circle, not a separate progress bar.
- **Empty:** the bio step's placeholder example (described above) is this module's main "empty state" pattern — showing an example rather than a blank box with just a label.
- **Failure:** image moderation rejection shows inline, specific, non-punitive copy ("This image doesn't meet our profile picture guidelines — try another"), never a bare "upload failed."
- **Offline:** the wizard's text-entry steps work fully offline (queued for submission); image upload steps require connectivity and show that requirement clearly rather than allowing a queued-but-silently-stuck upload.

### 9. Business Rules

- Handles are globally unique, 3–30 characters, alphanumeric plus underscore, checked against a reserved-word list (platform names, obvious impersonation strings, slurs) — this list is data-driven/config, not hardcoded, so it can be updated without a deploy.
- A creator profile cannot be published (made publicly visible) without both a handle and at least one image (avatar or banner) — enforced server-side on the publish endpoint.
- A creator's first tier price (Step 4) must fall within the platform's configured min/max subscription price bounds (Part C1 owns the authoritative bounds; this step reads and validates against the same config, never a separately hardcoded range).
- Changing a handle after publication is allowed but rate-limited (once per 14 days) — frequent handle changes break external links (a creator's shared profile URL) and are a minor impersonation-risk vector.

### 10. Data Requirements

- **Profile entity:** `id`, `userId`, `handle (unique)`, `displayName`, `avatarUrl (nullable)`, `bannerUrl (creator only, nullable)`, `bio (nullable, max 500 chars)`, `role (fan | creator)`, `publishedAt (nullable — null means draft/unpublished, creator only)`, `profileStrength (computed, not stored — derived at read time from which fields are populated)`.
- **Relationships:** `profiles.userId → users.id` (1:1). A creator profile additionally relates to `subscription_tiers` (Part C1) created during Step 4.

### 11. Backend Integration

| Endpoint | Method | Auth | Request | Response |
|---|---|---|---|---|
| `GET /v1/profiles/handle-available` | GET | Access token | `?handle=` | `200 { available: bool, reason?: 'taken'|'invalid'|'reserved' }` |
| `POST /v1/profiles` | POST | Access token | `{ handle, displayName, bio?, avatarUploadId?, bannerUploadId? }` | `201 { profile }` |
| `PATCH /v1/profiles/me` | PATCH | Access token | any subset of the above fields | `200 { profile }` |
| `POST /v1/profiles/me/publish` | POST | Access token, `requiredRole: creator` | — | `200 { profile }` or `422 PUBLISH_REQUIREMENTS_NOT_MET` |
| `POST /v1/media/avatar-upload` | POST | Access token | multipart image | `201 { uploadId, url }` (passes through moderation before `url` is usable publicly) |

### 12. Database Dependencies

**Entities:** `profiles`, plus a reference created in `subscription_tiers` (owned by Part C1's schema) during creator Step 4. **Indexes:** `profiles.handle` (unique). **Soft Delete:** `profiles.deletedAt`, cascades logically from `users.deletedAt` per Part J2's account-deletion policy rather than being independently deletable. **Ownership:** 1:1 with `users`.

### 13. Cross-Module Dependencies

**Receives from:** A1 (authenticated session), A2 (creator branch requires `verificationStatus: approved` before this module allows the creator path).
**Hands off to:** B1 (Discovery surfaces the profile), B5 (Creator Profile display), C1 (subscription tiers originate in Step 4 here), D1 (messaging shows profile handle/avatar), Part E (live stream shows creator identity), F1/F2 (Creator Studio header).
**Breaks if changed:** renaming/restructuring the `handle` field's uniqueness or format rules affects every module that renders a creator's public URL/mention.

### 14. Error Handling

| Scenario | Behavior |
|---|---|
| Handle taken between availability-check and submit (race condition) | `409 HANDLE_TAKEN` on submit despite an earlier "available" check — inline message re-focuses the handle field with a specific note that it was just taken, rather than a generic error. |
| Avatar upload fails moderation | Specific rejection message (see Functional Behaviour); the wizard step remains on-screen with the image cleared, not silently advanced. |
| Publish attempted before requirements met | `422 PUBLISH_REQUIREMENTS_NOT_MET { missing: ['avatar'] }` — the UI highlights exactly which requirement(s) are unmet rather than a generic failure. |

### 15. Security

- Handle and display name are sanitized against script-injection (this text renders in many contexts across the app, including inside chat messages and notifications — it must be treated as untrusted user input everywhere it's displayed).
- Avatar/banner uploads are scanned for both content-policy violations (moderation service) and malware/malformed-file exploits before being stored or served.

### 16. Accessibility

- Live preview panes (banner/avatar crop) have an accessible text-equivalent summary of the current crop state for screen-reader users, since the crop interaction itself is inherently visual/gestural.
- Character-count indicators on the bio field are announced at meaningful thresholds (e.g. approaching the limit), not on every keystroke.

### 17. Performance

- Avatar/banner images are resized/compressed client-side before upload where feasible, to keep upload times reasonable on slower mobile connections.
- The creator wizard's live preview reuses the same rendering component Module B5 uses for the real public profile — guaranteeing what's previewed here is pixel-accurate to what fans will actually see, and avoiding a second implementation to keep in sync.

### 18. Analytics

**Events:** `profile_setup_started {role}`, `handle_check_performed {available: bool}`, `profile_step_completed {step}` (creator), `first_post_published_during_onboarding {bool}`, `profile_published`.
**Funnel:** creator step-completion funnel is watched closely for the same reason as A2's — a drop at "Step 4 tier pricing" specifically would suggest the pricing UI itself is a problem, distinct from general onboarding fatigue. **KPIs:** creator first-session publish rate (a strong leading indicator of 90-day creator retention). **Revenue link:** creators who set a tier price and publish a first post during onboarding (vs. skipping and never returning to do it) show materially higher lifetime GPV in comparable platforms' published growth commentary, which is the direct business rationale for guiding rather than leaving this step minimal.

### 19. Testing

**Unit tests:** handle validation regex and reserved-word filtering; profile-strength computation logic across every combination of populated/empty fields.
**Integration tests:** avatar upload → moderation service → publish gate correctly blocks/allows based on the moderation result.
**E2E tests:** fan zero-friction path (accept suggested handle, skip everything else, land in feed); creator full guided path (all 5 steps, ends published with a first post live); creator skip-and-return path (skip banner/bio/tier, publish with just handle+avatar, later complete the rest from Settings).
**Edge cases:** two devices attempt to claim the same handle within milliseconds of each other (must be serialized at the database unique-constraint level, with a clean error to the loser rather than a corrupted state); creator completes onboarding but their A2 verification is later revoked/expired (profile must be automatically unpublished, not left visible).
**QA checklist:** verify the live avatar/banner preview truly matches the rendered public profile pixel-for-pixel across at least the three most common device screen sizes.
**Acceptance criteria:** a new creator with a ready avatar image, banner image, and bio text can complete Steps 1–4 and publish in under 3 minutes.

### 20. Future Enhancements

- Profile-strength-driven personalized tips ("Creators with a banner image convert 2x better — add one") surfaced contextually rather than just a static meter.
- Import-from-existing-platform profile assist (pre-fill bio/avatar from a connected Instagram/Twitter account, with the creator's explicit consent) to reduce setup friction for creators migrating from elsewhere.

### 21. Tech Stack

- **Frontend:** `UsernameInput`, `AvatarPicker`, `BioEditor`, `ProfileStrengthMeter`, `TierPricePicker` (Appendix K3); TanStack Query drives the debounced handle-availability check; client-side image resize/compression before upload (an Expo-compatible image-manipulation library) keeps upload times reasonable on slower connections (§17).
- **Backend:** NestJS profiles module; synchronously calls the image moderation service before an uploaded avatar/banner's `url` becomes publicly usable.
- **Third-party services:** image moderation service (automated content-policy scanning on avatar/banner uploads), profanity/reserved-word filter (data-driven list, §9).
- **Data layer:** PostgreSQL `profiles` table; writes a first row into `subscription_tiers` (owned by Part C1's schema) during creator Step 4.

---

## Module A4 — Wallet Creation & Currency Architecture

**Previous Module:** A3 Profile Creation · **Next Module:** B1 Discovery Feed (fan) / F1 Creator Studio (creator)
**Dependencies:** A1, A2 · **Consumed Services:** Payment processor (CCBill/Segpay/Epoch/Verotel — see Part C for transaction-level detail), Ledger/accounting service
**Produced Events:** `wallet_created`
**Shared Components:** None user-facing at creation time (the wallet UI itself is Part C2's territory) — this module is primarily a backend provisioning step.
**Shared State:** `sessionStore.wallet.balance` (cache, reconciled against server truth per Part C2's rules)
**Global Context:** Establishes the dual-ledger architecture (fan-side Coins, creator-side Earnings) that every monetization module in Part C, D, E, and F transacts against.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking and the highest financial-integrity risk in the entire foundations Part: no monetized action anywhere in the product is possible without a correctly provisioned wallet.

### 1. Overview

**Purpose:** Provision the internal ledger accounts every user needs before any monetized action is possible — every account, fan or creator, gets exactly one Coins balance (spend-side) and creators additionally get exactly one Earnings balance (receive-side).

**Business Goal:** A correct, auditable, double-entry-consistent ledger foundation — this is the single piece of infrastructure a payments business can least afford to get wrong, since every other feature's revenue integrity depends on it.

**User Goal:** Invisible — a user should never have to think about "wallet creation" as its own step; it happens silently as part of onboarding, and the first time they're consciously aware of the wallet is when they go to buy Coins (Part C2).

**Platform Goal:** A currency architecture that can support a platform-side margin on both the purchase side (fans buying Coins) and the payout side (creators cashing out Earnings) — the standard dual-denomination structure used by Tango (Coins→Diamonds) and BIGO (Diamonds→Beans), adapted to this platform's own two units: **Coins** (fan-purchased, fan-spent) and **Credits** (creator-earned, creator-cashed-out).

**Revenue Impact:** The conversion rate between real money → Coins, and Coins spent → Credits earned, is where the platform's take-rate structurally lives; this module's data model is what makes that rate configurable and auditable rather than scattered across every feature that touches money.

**Success Metrics:** Wallet provisioning success rate (should be 100% — a failed wallet creation blocks a user from ever transacting), ledger reconciliation discrepancy rate (should be zero; any non-zero value is a P0 incident), average time from account creation to first Coins purchase.

### 2. Feature Description

This module is almost entirely invisible to the user and almost entirely about backend correctness. There is no meaningful "competitor UI" to study here because no competitor exposes wallet *creation* as a user-facing moment — it's the underlying plumbing every gifting/subscription/PPV competitor studied (Tango, BIGO, Chaturbate, OnlyFans) has some equivalent of, whether or not they call it a "wallet."

**Competitor analysis (architecture, not UI):**

- **Tango's Coins→Diamonds split** and **BIGO's Diamonds→Beans split** both use a *two-currency* model specifically so the purchase-side exchange rate and the payout-side exchange rate can be set independently, with the platform's margin living in the gap between them. *We adopt the identical structural pattern.*
- **Chaturbate's single-token model** (fans buy Tokens, models earn a percentage of Tokens received, converted to cash at payout) is architecturally simpler (one currency, not two) but makes the platform's margin less transparent to model internally and harder to vary independently on the purchase vs. payout side. *Our improvement:* the two-currency model gives finance/product the ability to run purchase-side promotions (bonus Coins on a bundle) without ever touching the creator payout rate, and vice versa — these are business-relevant levers Chaturbate's single-token model can't pull independently.

**Our implementation:** every account gets a `CoinWallet` at creation (balance starts at 0). Every *creator* account additionally gets a `CreditLedger` at creation (balance starts at 0, only populated once they receive their first monetized action from a fan).

### 3. User Journey

This module has no dedicated user-facing screens or steps — it is a synchronous backend side-effect of A3's profile-creation call succeeding. The only user-visible artifact is that the wallet balance chip (Module 1.0-equivalent shell component) reads "0" rather than erroring or being absent from the very first app-shell render after onboarding completes.

### 4. UX Flow

Not applicable — no navigable screens. The "flow" is entirely a backend provisioning step triggered synchronously within the A3 profile-creation transaction (see Backend Integration) so that no window exists where a fully-onboarded user has no wallet record.

### 5. UI Layout

Not applicable to this module directly; the wallet balance display itself (chip in the app shell, full Wallet screen) is specified in Part C2, which owns all wallet *usage* UI. This module owns only the backend account-provisioning contract those screens read from.

### 6. Component Breakdown

Not applicable — no new UI components originate in this module.

### 7. Functional Behaviour

- On successful `POST /v1/profiles` (A3), the backend synchronously (same database transaction) creates a `CoinWallet` row for the `userId`, and additionally a `CreditLedger` row if `role == creator`. This is a hard transactional guarantee, not an eventually-consistent background job — a user must never reach the app shell with a missing wallet record, since every subsequent balance read/write assumes exactly one row exists.
- If a fan later becomes a creator (role upgrade, handled by re-running the creator branch of A2/A3), the missing `CreditLedger` is provisioned at that upgrade moment via the same synchronous-transaction pattern.

### 8. State Management

Not user-facing; from a systems perspective the wallet record's only states are `provisioned` (normal) and, transiently during a failure, `provisioning-failed` (see Error Handling) — there is no user-visible loading/empty/success state for creation itself.

### 9. Business Rules

- Exactly one `CoinWallet` per user, ever — never recreated, never duplicated, enforced by a unique constraint on `userId` in the `coin_wallets` table.
- Exactly one `CreditLedger` per creator, provisioned once and never duplicated even if the creator's role is toggled off and back on.
- Both ledgers start at a hard-coded zero balance — there is no "signup bonus" Coins grant by default (a promotional bonus-Coins grant, if the business chooses to run one, is modeled as an explicit `PromotionalCredit` transaction against the wallet post-creation, per Part C7, never baked into this provisioning step itself — keeping "account creation" and "promotional grants" as cleanly separable concerns).
- Currency conversion rates (real money → Coins, Coins spent → Credits earned) are platform-wide config values with an effective-date, versioned so historical transactions can always be re-priced/audited against the rate that was actually in effect at the time, even after the rate changes going forward.

### 10. Data Requirements

- **CoinWallet entity:** `id`, `userId (unique)`, `balance (integer, Coins — never floating point)`, `createdAt`, `updatedAt`.
- **CreditLedger entity (creator only):** `id`, `userId (unique)`, `availableBalance (integer, Credits — withdrawable now)`, `pendingBalance (integer, Credits — in a holding period, see Part F1)`, `lifetimeEarned (integer, Credits — never decreases, for reporting)`, `createdAt`, `updatedAt`.
- **CurrencyConversionRate entity (platform config, not per-user):** `id`, `type (enum: usd_to_coins | coins_to_credits)`, `rate (decimal, stored precisely)`, `effectiveFrom (timestamp)`, `effectiveTo (nullable — null means currently active)`.

### 11. Backend Integration

This module exposes no dedicated public API of its own — provisioning happens as a side-effect inside `POST /v1/profiles` (A3) and the role-upgrade endpoint. The only directly relevant read endpoint (used by the app shell's balance chip from the very first render onward) is:

| Endpoint | Method | Auth | Response |
|---|---|---|---|
| `GET /v1/wallet/summary` | GET | Access token | `200 { coinBalance, creditAvailable?, creditPending? }` (credit fields present only for creator-role accounts) |

Full purchase/spend/payout endpoints belong to Part C2 (deduction engine) and Part F1/F3 (earnings/payout) respectively — this module only owns the account-existence contract those build on.

### 12. Database Dependencies

**Entities:** `coin_wallets`, `credit_ledgers`, `currency_conversion_rates`. **Relationships:** both wallet tables are 1:1 with `users`. **Indexes:** unique index on `coin_wallets.userId` and `credit_ledgers.userId` (enforces the "exactly one" business rule at the database level, not just in application code — a defense-in-depth choice specifically because a duplicate wallet row for one user would be a serious financial-integrity bug). **Audit fields:** every balance-changing operation against these tables is additionally required (by Part C2's design, not this module's) to write an immutable ledger-entry row — the `balance` columns here are a denormalized running total for fast reads, never the sole source of truth; the append-only ledger-entries table is the actual source of truth and the balance is reconciled against it (see Part C2 §12 for the full reconciliation model).

### 13. Cross-Module Dependencies

**Receives from:** A1 (authenticated session), A3 (successful profile creation is the synchronous trigger that provisions the wallet, §7).
**Hands off to:** every monetization module — C1 (subscription payment debits CoinWallet), C2 (owns the deduction/credit mechanics against both ledgers), C3 (PPV unlock debits CoinWallet), C4 (tips/gifts debit CoinWallet and credit CreditLedger), F1 (reads CreditLedger for the earnings dashboard), F3 (payout processing debits CreditLedger's availableBalance).
**Breaks if changed:** any change to the balance-field data types (e.g. introducing floating point) or the "exactly one wallet per user" invariant would corrupt every downstream financial calculation in the product — this is the highest financial-integrity-risk module to modify.

### 14. Error Handling

| Scenario | Behavior |
|---|---|
| Wallet provisioning fails mid-transaction (database error) | The entire A3 profile-creation transaction rolls back — the user is shown A3's generic "something went wrong, please try again" state rather than being left with a profile but no wallet, since the two are provisioned atomically. |
| `GET /v1/wallet/summary` called for a user somehow missing a wallet row (should be structurally impossible, but defended against) | Returns `500 WALLET_NOT_PROVISIONED` and triggers an automatic backend alert (this is treated as a data-integrity incident requiring investigation, never silently auto-healed by lazily creating a wallet on read, which would mask how the inconsistency occurred). |
| Currency conversion rate lookup finds no currently-effective rate (config error) | Purchase/payout flows in Part C/F fail closed (block the transaction) rather than falling back to a guessed or last-known rate — a missing rate is a configuration incident to fix, not a scenario to silently paper over with stale data. |

### 15. Security

- Balance fields are never writable directly via any client-facing API — every balance change happens exclusively through server-side transaction-processing logic (Part C2) that also writes the corresponding immutable ledger entry; there is no `PATCH /wallet` endpoint anywhere in the system, by design.
- Currency conversion rate changes require platform-admin role (Part H) and are themselves audit-logged (Part I5), since a manipulated conversion rate is a direct financial-fraud vector.

### 16. Accessibility

Not directly applicable (no user-facing UI originates in this module); the balance-chip UI that reads this module's data is covered under Part C2's accessibility requirements.

### 17. Performance

- Wallet provisioning adds negligible latency to A3's profile-creation call (a single additional same-transaction insert); it is not implemented as an asynchronous follow-up job specifically to preserve the "never a wallet-less onboarded user" guarantee, even at the cost of a few milliseconds of added synchronous latency.

### 18. Analytics

**Events:** `wallet_provisioned {role}`. **KPIs:** provisioning failure rate (target: zero, monitored as a reliability metric rather than a product-funnel metric). **Revenue link:** indirect — this module has no revenue of its own but is the precondition for every revenue-bearing event captured elsewhere in the spec.

### 19. Testing

**Unit tests:** unique-constraint enforcement (attempting to create a second wallet for the same `userId` must fail at the database layer, not just be caught in application code); conversion-rate effective-dating lookup logic across boundary timestamps.
**Integration tests:** full A3 profile-creation call correctly provisions both a `CoinWallet` and, for creators, a `CreditLedger`, within the same transaction, verified by direct database inspection in the test.
**E2E tests:** new fan account reaches the Discovery feed with a wallet balance chip correctly reading "0 Coins" rather than an error or blank state; new creator account additionally has a Creator Studio earnings view correctly reading "0 Credits available."
**Edge cases:** role upgrade from fan to creator correctly provisions a `CreditLedger` exactly once, even if the upgrade endpoint is called twice in rapid succession (idempotency); a currency conversion rate's `effectiveFrom` is scheduled in the future (must not yet be treated as active).
**QA checklist:** manually verify, in a staging environment, that a full signup-to-first-purchase path produces ledger entries that reconcile exactly to the displayed balance at every step — this reconciliation check should be a standing, automated QA job, not a one-time manual verification.
**Acceptance criteria:** zero wallet-provisioning failures across a load test simulating concurrent signups at expected launch-day volume.

### 20. Future Enhancements

- Multi-currency wallet support (localized display currency for Coins pricing, still backed by the same single internal ledger) as the platform expands to new markets.
- A third internal denomination for time-limited promotional credits (distinct from purchased Coins) if Part C7's bonus/promotional system grows complex enough to warrant its own ledger rather than being modeled as adjustments to the existing Coins balance.

### 21. Tech Stack

- **Frontend:** No dedicated screens (§5); the app-shell balance chip reads `sessionStore.wallet.balance`, hydrated from `GET /v1/wallet/summary` via TanStack Query and reconciled against server truth per Part C2's rules.
- **Backend:** NestJS wallet-provisioning logic runs inside the same database transaction as A3's `POST /v1/profiles` call — implemented as a transactional side-effect, not a separate service or async job, specifically to guarantee no user ever reaches the app shell without a wallet row (§7, §17).
- **Third-party services:** payment processor (CCBill/Segpay/Epoch/Verotel-class, §2.8) for the eventual purchase side; no third-party service is called during provisioning itself.
- **Data layer:** PostgreSQL `coin_wallets`, `credit_ledgers`, `currency_conversion_rates`, with unique constraints on `userId` enforcing the "exactly one wallet" invariant at the database level (§12) — chosen specifically for the transactional/row-locking guarantees this ledger architecture depends on (§2.8).



\newpage


# Part B — Discovery & Creator Profile

Global API conventions, auth model, RBAC, money-handling rules, and error-envelope format are defined once in the Master Index (§2) and apply to every endpoint below without being restated per module.

---

## Module B1 — Discovery Feed

**Previous Module:** A4 Wallet Creation · **Next Module:** B5 Creator Profile (via tap-through), or B2/B3/B4 laterally
**Dependencies:** A2 (verification gates all content rendering), A4 · **Consumed Services:** Recommendation/ranking service (Part I2), Content moderation status service (Part G1)
**Produced Events:** `feed_viewed`, `feed_item_impression`, `feed_item_tapped`
**Shared Components:** `PostCard`, `LockedMediaCard` (shared verbatim with C3), `CreatorSuggestionRow`
**Shared State:** `feedStore` (scroll position persisted per tab-switch, per Module 1.0's shell contract)
**Global Context:** The default post-onboarding landing surface; the top of the discovery-to-subscription funnel that Part C's entire revenue surface depends on.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: this is the core daily surface fans open first, and its algorithmic ranking/media pre-fetching pipeline is high-complexity work that needs to be built and tuned well before launch.

### 1. Overview

**Purpose:** Surface free/teaser content from followed and algorithmically-suggested creators, functioning as the primary discovery-to-subscription conversion funnel.
**Business Goal:** Maximize qualified profile visits (a visit likely to convert to subscription/PPV) per session, not raw engagement time alone — an important distinction from social-media feeds optimized purely for attention.
**User Goal:** See content worth their time from creators they already follow, plus be shown new creators worth following, without the feed feeling like an uninterrupted ad for paid content.
**Platform Goal:** A feed ranking signal that improves as more purchase-outcome data accumulates (Part I2), rather than a static reverse-chronological or engagement-only ranking.
**Revenue Impact:** Directly upstream of every subscription (C1) and PPV (C3) purchase — this feed is the single highest-leverage discovery surface in the product.
**Success Metrics:** Feed-to-profile-visit rate, profile-visit-to-subscribe conversion rate (segmented by whether the visit originated from this feed), session length, scroll depth before disengagement.

### 2. Feature Description

**Competitor analysis:**
- **Fansly's built-in discovery feed** mixes followed-creator content with algorithmic suggestions in one stream — proven to work for this exact content category, unlike a pure social-media feed since a large fraction of the audience isn't yet following anyone at signup. *Weakness:* Fansly's suggestion algorithm is reported by creators as opaque and hard to reason about for growth planning. *Our improvement:* Part F2's creator analytics surfaces which specific feed placements drove a given creator's profile visits, giving creators actionable growth signal Fansly doesn't expose.
- **Instagram Explore's grid-first algorithmic discovery** proves that a well-tuned recommendation model can meaningfully outperform pure-follow feeds for surfacing content people didn't know to look for. *Our improvement:* applied here via Part I2, tuned specifically toward purchase-outcome signals (did a suggested creator's profile convert) rather than Instagram's engagement-only signals (likes/comments), which are a weaker proxy for what this platform actually needs to optimize.
- **Reddit's mixed-subscription-plus-algorithmic-feed model** (home feed blends subscribed communities with suggested ones) is architecturally the closest non-adult analog to what's needed here, validating the "blend, don't force a binary choice" pattern at feed-architecture scale.

### 3. User Journey

1. User lands on Discovery immediately after onboarding (A3) or via the Home tab.
2. Feed renders: interleaved `PostCard`s (followed creators, free posts), `InlineLockedPostCard`s (followed creators' PPV teasers), and periodic `CreatorSuggestionRow`s (algorithmic, horizontal scroll of 4–6 non-followed creators).
3. Scrolling triggers cursor-paginated loads (`GET /v1/feed?cursor=`); a skeleton-shimmer placeholder shows below the fold while the next page loads, never a blocking spinner that halts the scroll.
4. Tapping a post opens a focused single-post view (same `PostCard`, expanded, with comments if enabled); tapping a creator's name/avatar navigates to B5.
5. Tapping a locked teaser card opens the identical unlock flow used everywhere locked content appears (C3) — same component, same behavior, regardless of entry surface.
6. Pull-to-refresh at the top of the feed re-fetches from the newest cursor, with new-items-since-last-view surfaced as a "X new posts" pill rather than silently reordering content under the user's thumb.

### 4. UX Flow

**Entry Points:** Home tab (default landing), notification deep-link to a specific feed item, "back to feed" from any tap-through. **Exit Points:** profile tap → B5; post tap → focused post view (a modal-like overlay, not a full navigation, so back returns to the exact same scroll position). **Deep Linking:** `app://feed/post/:postId` opens directly to a focused single post, pre-loading enough surrounding context that "back" still lands somewhere sensible (the general feed, not a dead end). **Stack Navigation:** feed itself is a tab root (no "back" target above it); everything opened from it stacks on top.

### 5. UI Layout

Single-column vertical list on mobile (≤1023px); 2-column masonry with a sticky right-rail `CreatorSuggestionRow` on desktop (≥1024px). `PostCard`: avatar+name row → media (respecting original aspect ratio, capped max-height to prevent one tall image dominating the viewport) → caption (2-line clamp with "more") → engagement row (like/comment/share counts, icon + count, never icon-only). Locked cards use the identical blur/padlock/price treatment specified in Part C3 §5 — this module does not define its own locked-content visual, it consumes C3's.

### 6. Component Breakdown

- **PostCard** — Props: `post, onLike, onComment, onShare`. States: default, liked (optimistic), locked (delegates to `LockedMediaCard`). Reused in B5's profile grid and B2/B3's tap-through detail views.
- **CreatorSuggestionRow** — Props: `creators[], reason ('trending'|'similar_to_followed'|'new')`. The `reason` is shown as a small label ("Because you follow @x") for transparency — never an unexplained suggestion.
- **InfiniteScrollLoader** — Props: `onLoadMore, hasMore`. Shared across every paginated list in the product (B4 search results, D1 message history, F2 analytics tables).

### 7. Functional Behaviour

- Feed ranking request (`GET /v1/feed?cursor=`) is a single call returning a pre-mixed sequence of posts and suggestion-row markers — the client does not independently decide interleaving ratios; ranking logic lives entirely server-side (Part I2) so it can be tuned without a client release.
- Like/comment/share actions are optimistic (UI updates immediately) with a rollback-on-failure pattern (§8).
- Locked-item tap opens C3's unlock modal via the shared `GlobalOverlayPortal` (Module 1.0), never a separate feed-owned modal implementation.

### 8. State Management

**Loading:** skeleton-shimmer cards below the fold during pagination; a full-screen skeleton only on true first load (cold cache). **Empty:** a new account following nobody sees a suggestion-only feed with explanatory copy ("Follow creators to build your feed — here's who's popular right now") rather than a blank screen. **Failure:** a failed page-load shows an inline retry row at the point of failure, not a full-screen error (the already-loaded content above it remains usable). **Offline:** last-cached feed page renders with an offline banner; pagination is disabled with a clear "reconnect to load more" affordance. **Optimistic Updates:** like-tap increments immediately; if the server call fails, the count reverts and a small non-blocking toast explains the like didn't register. **Real-time:** new-posts-since-load are not injected live mid-scroll (would cause disorienting content shift) — surfaced instead as the "X new posts" pill mentioned above, applied only on manual pull-to-refresh or tab re-entry.

### 9. Business Rules

- Suggested (non-followed) creators shown in `CreatorSuggestionRow` must have `verificationStatus: approved` and zero active moderation strikes above the platform's configured threshold (Part G1) — a creator under active review is never algorithmically promoted, only still visible if directly followed.
- Locked-content teaser cards must never include `fullMediaUrl` in the API response for a non-purchasing viewer (restated from the Frontend spec, elevated here to a hard backend contract requirement, not a UI convention) — this is enforced by the API layer itself, independent of what any client chooses to render.
- Feed excludes content from any creator the viewer has blocked (Part G1) or who has blocked the viewer, bidirectionally, at the query level, not filtered client-side.

### 10. Data Requirements

**FeedItem (API projection, not its own table):** `postId`, `type (enum: free | locked_teaser | suggestion_row)`, `creator {id, handle, avatarUrl}`, `previewMediaUrl`, `fullMediaUrl (present only if unlocked/free)`, `priceCents (locked only)`, `caption`, `likeCount`, `commentCount`, `viewerHasLiked`, `createdAt`. Backed by the `posts` entity (Appendix K2) joined against the viewer's subscription/purchase state at query time.

### 11. Backend Integration

| Endpoint | Method | Auth | Rate Limit | requiredRole |
|---|---|---|---|---|
| `GET /v1/feed` | GET | Access token | 120/hr | fan or creator |
| `GET /v1/feed/suggested-creators` | GET | Access token | 60/hr | fan or creator |
| `POST /v1/posts/:id/like` | POST | Access token | 300/hr | fan or creator |
| `POST /v1/posts/:id/comment` | POST | Access token | 60/hr | fan or creator |

Pagination: cursor-based per Master Index §2.1. No websocket surface for the feed itself (comments/likes are pull-refreshed, not pushed — a deliberate choice, since live-updating like counts on a scrolling feed adds complexity with limited user value compared to, say, live chat in Part E where real-time genuinely matters).

### 12. Database Dependencies

**Entities:** `posts`, `post_likes`, `post_comments`, `blocks` (consumed, owned by Part G1), `subscriptions` (consumed, owned by Part C1) for locked/unlocked determination. **Indexes:** `posts.creatorId + createdAt` (feed assembly), `posts.visibility + moderationStatus` (excludes non-public/actioned content at the query level). **Soft Delete:** a creator-deleted post is excluded from all feed queries immediately (`deletedAt` check) but retained per Master Index §2.4's audit-retention rule.

### 13. Cross-Module Dependencies

**Receives from:** receives verification/session gating from A2/A4, unlock/entitlement state from C1/C3, moderation and block-list filtering from G1, and ranked ordering from I2's recommendation service.
**Hands off to:** nothing downstream at the feed level — this is a leaf discovery surface — though tap-throughs hand the viewer onward to B5 (profile), C1/C3 (purchase), and B2/B3/B4 laterally.
**Breaks if changed:** altering the `FeedItem` projection shape breaks the shared `PostCard`/`LockedMediaCard` components consumed by B5's profile grid as well.

### 14. Error Handling

| Scenario | Behavior |
|---|---|
| Ranking service (I2) timeout | Falls back to a simple reverse-chronological followed-creator feed rather than an error screen — degraded ranking beats no feed. |
| Like/comment write fails | Optimistic UI rolls back; toast offers a manual retry. |
| Pagination cursor invalid/expired (long-idle session) | Silently restarts pagination from the top with a note, rather than surfacing a raw error. |

### 15. Security
Feed API enforces block-list filtering server-side (never client-side only); locked media URLs are never included in any response payload for a non-entitled viewer, checked per-request against current subscription/purchase state, not a cached entitlement flag that could go stale.

### 16. Accessibility
Media carries alt text where creators provide it; engagement buttons have accessible names beyond icon glyphs; skeleton loaders are marked `aria-busy` rather than silently present with no assistive-tech signal.

### 17. Performance
Intersection-Observer-driven lazy media loading and play/pause; image responses are served pre-sized per breakpoint (server-side resizing, not full-resolution-then-client-scale) to control mobile data usage.

### 18. Analytics
**Events:** `feed_viewed`, `feed_item_impression {postId, position}`, `feed_item_tapped {postId, type}`, `suggestion_row_creator_tapped {creatorId, reason}`. **Funnel:** impression → tap → (for creator taps) profile visit (B5) → subscribe (C1)/unlock (C3), the platform's single most-monitored funnel. **Revenue link:** directly upstream of C1/C3 GPV; ranking quality (I2) is evaluated primarily against this funnel's conversion rate, not engagement metrics alone.

### 19. Testing
**Unit:** feed-item projection correctly hides `fullMediaUrl` for non-entitled viewers. **Integration:** ranking-service timeout correctly triggers fallback feed. **E2E:** new account sees suggestion-only empty state; scrolling triggers pagination; tapping locked content opens C3's unlock modal. **Edge cases:** a followed creator is suspended mid-session (their content must disappear from a subsequent page load, not remain visible); rapid like/unlike toggling (must not create duplicate like records or desync the optimistic counter). **Acceptance criteria:** feed's first page renders in under 1.5s on a median connection; zero instances of locked full-resolution media appearing in network payloads for non-entitled viewers, verified by an automated payload-inspection test.

### 20. Future Enhancements
Personalization controls (mute topic/creator without a full block); a "for you" vs. "following" explicit dual-tab toggle if user research shows demand for separating the two ranking modes explicitly (see Part B UX pattern note in the Frontend-only predecessor document) rather than the current blended single stream.

### 21. Tech Stack

- **Frontend:** React Native (Expo) feed screen built from `PostCard`, `LockedMediaCard`, `CreatorSuggestionRow`, and `InfiniteScrollLoader` (Appendix K3); TanStack Query drives the cursor-paginated `GET /v1/feed` reads with skeleton-shimmer placeholders, and Zustand's `feedStore` persists scroll position across tab-switches per Module 1.0's shell contract.
- **Backend:** NestJS feed-assembly service exposing the `/v1/feed` and `/v1/feed/suggested-creators` endpoints; ranking itself is delegated to Part I2's recommendation service rather than computed in this service, so the feed endpoint's job is to call I2, merge in moderation/block state from Part G1, and return one pre-mixed response.
- **Third-party services:** none directly consumed by this module beyond the internal I2 ranking service and G1 moderation-status service — no external SaaS dependency at the feed-assembly layer itself.
- **Data layer:** PostgreSQL `posts`, `post_likes`, `post_comments` tables (§10/§12) joined against `subscriptions` (C1) at query time for lock state; Redis caches hot feed pages and enforces the rate limits in §11; Elasticsearch/OpenSearch-backed signals feed I2's ranking model even though this module doesn't query the index directly.

---

## Module B2 — Stories / Ephemeral Content

**Previous/Next:** sits alongside B1 · **Dependencies:** B1, A2 · **Consumed Services:** Signed time-limited media URL service
**Produced Events:** `story_viewed`, `story_reply_sent` · **Shared Components:** `StoryRingList`, `StoryViewerModal` · **Shared State:** none beyond per-session viewed-state cache · **Global Context:** feeds reply messages directly into D1.
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — not required for a lean v1 launch and targeted for the first post-launch phase, with moderate implementation complexity.

### 1. Overview
**Purpose:** 24-hour ephemeral content for lower-stakes, higher-frequency posting than the main feed. **Business Goal:** increase posting frequency from creators who find permanent-post pressure inhibiting. **User Goal:** quick, low-commitment glimpses into a creator's day. **Revenue Impact:** indirect — drives session frequency and creator-fan intimacy, which correlates with subscription retention. **Success Metrics:** stories-viewed-per-session, story-to-DM-reply rate, creator story-posting frequency.

### 2. Feature Description
**Competitor analysis:** Snapchat/Instagram Stories validated the format at massive scale; the color-coded ring (unseen/seen/live) is copied near-verbatim here because it is a fully-solved, universally-understood UI pattern — there is no benefit to reinventing it. *Our addition beyond both:* a distinct ring treatment for subscriber-exclusive stories (see UI Layout), since neither Snapchat nor Instagram has a paid-subscription content-gating concept baked into Stories the way this platform needs.

### 3. User Journey
Ring row atop B1's feed → tap → full-screen viewer, auto-advancing segments, tap-left/right to navigate manually → reply composes directly into D1 as a quoted-story message → dismiss returns to exact B1 scroll position.

### 4. UX Flow
Entry: B1's ring row, live-indicator ring (links into Part E). Exit: dismiss (swipe-down or tap-X) returns to origin. Modal: full-screen takeover, not a sheet. Deep Linking: `app://stories/:creatorId` opens directly to that creator's active segments.

### 5. UI Layout
64px circular avatars; gradient ring (unseen), gray ring (seen), pulsing ring (live, links to E1), gold ring (subscriber-exclusive story). Viewer: full-bleed media, top segmented progress bar, bottom reply input.

### 6. Component Breakdown
**StoryRing** — Props: `creator, state ('unseen'|'seen'|'live'|'exclusive')`. **StoryViewerModal** — Props: `creatorId, initialSegmentIndex`. **StorySegmentProgressBar** — auto-advances per segment duration (5s image, video-length clip).

### 7. Functional Behaviour
Tap-right advances/ends viewer for that creator and opens the next unseen ring; tap-left rewinds one segment or exits to the previous creator's last segment. Reply input sends via `POST /v1/stories/:id/reply`, which creates a D1 message tagged with a story-reference.

### 8. State Management
Loading: next segment's media pre-fetches during the current segment's playback to avoid load flicker. Failure: a broken media segment auto-skips to the next after a brief error flash, rather than freezing the viewer. Real-time: live-ring state updates via the same websocket channel Part E uses for stream start/stop events.

### 9. Business Rules
Segments expire and become unqueryable exactly 24 hours after `createdAt`, enforced via signed URL expiry at the media layer, not merely hidden client-side. Subscriber-exclusive stories are excluded entirely (not shown as locked teasers) from non-subscribers' ring row — unlike PPV content, Stories don't use the tease-then-unlock pattern.

### 10. Data Requirements
**Story entity:** `id`, `creatorId`, `mediaUrl (signed, time-limited)`, `visibility (enum: public | subscribers_only)`, `createdAt`, `expiresAt`. **StoryView entity:** `storyId`, `viewerId`, `viewedAt` (drives the seen/unseen ring state, also visible to the creator as a viewer list — see Cross-Module Dependencies).

### 11. Backend Integration
`GET /v1/stories/feed`, `GET /v1/stories/:creatorId`, `POST /v1/stories/:id/viewed`, `POST /v1/stories/:id/reply`. requiredRole: fan or creator; posting a story is `POST /v1/stories` restricted to `requiredRole: creator`.

### 12. Database Dependencies
`stories`, `story_views`. Index: `stories.creatorId + expiresAt` (for the cleanup job and ring-state queries). No soft-delete needed beyond natural expiry, though a creator-initiated early delete does set `deletedAt` for immediate removal ahead of the natural 24h window.

### 13. Cross-Module Dependencies

**Receives from:** receives ring-row placement context from B1 and live-stream start/stop state from Part E (drives the pulsing live ring).
**Hands off to:** hands story-view counts and viewer lists to F2's creator analytics, and hands reply messages directly to D1 as story-referenced messages.
**Breaks if changed:** altering the `Story` entity's `visibility` enum or the ring-state values (`unseen`/`seen`/`live`/`exclusive`) would break B1's ring-row rendering contract and Part E's live-ring signal, both of which key off this module's data shape.

### 14. Error Handling
Expired-but-still-linked story (stale push notification) → "This story has expired" state, not a broken media player. Reply-send failure → message remains in D1's composer as a draft, not silently lost.

### 15. Security
Signed URLs prevent a story's media from being accessible after expiry even if a direct link was captured/shared during its active window.

### 16. Accessibility
Pause-on-long-press for extended reading time; captions supported where provided; auto-advance respects reduced-motion by extending segment duration rather than disabling entirely (a fixed-duration ephemeral format doesn't have a meaningful "static" fallback the way route transitions do).

### 17. Performance
Next-segment media pre-fetch capped to avoid excessive bandwidth use on a data-limited connection; only the immediate next segment is buffered, not the entire remaining sequence.

### 18. Analytics
**Events:** `story_ring_tapped`, `story_segment_viewed {duration}`, `story_reply_sent`. **KPI:** creator posting frequency (stories/week) as a leading indicator of overall creator activity/retention.

### 19. Testing
E2E: post a story → appears in follower's ring row within one poll/push cycle → view → marks seen → expires after 24h and is excluded from subsequent fetches. Edge case: creator posts a story, then is suspended (G3) before it expires — the story must be immediately excluded from all viewers' rings, same as any other suspended-creator content.

### 20. Future Enhancements
Story highlights (permanent creator-curated collections surviving past 24h); polls/questions stickers as monetizable interaction points (a natural extension into Part C's gifting model — "tip to answer").

### 21. Tech Stack

- **Frontend:** React Native full-screen `StoryViewerModal` and `StoryRingList` (Appendix K3), with `StorySegmentProgressBar` driving auto-advance; TanStack Query pre-fetches the next segment's media during current-segment playback (§8), and the per-session viewed-state cache lives in local component state rather than a global Zustand store.
- **Backend:** NestJS stories module exposing `GET /v1/stories/feed`, `GET /v1/stories/:creatorId`, `POST /v1/stories/:id/viewed`, and `POST /v1/stories/:id/reply`; a scheduled cleanup job sweeps expired rows off `stories.creatorId + expiresAt`, and the live-ring state pushes over the same Socket.IO/Redis Pub/Sub channel Part E uses for stream start/stop events.
- **Third-party services:** the signed time-limited media URL service (object storage + CDN, e.g. S3/Cloudflare R2 behind CloudFront/Cloudflare) that enforces the 24-hour expiry at the media layer itself, and the FFmpeg-based transcoding pipeline for video segments.
- **Data layer:** PostgreSQL `stories` and `story_views` tables (§10/§12); Redis holds short-TTL viewed-state and rate-limit counters for reply posting.

---

## Module B3 — Vertical Short-Form Feed (Reels-style)

**Dependencies:** B1, A2 · **Consumed Services:** Adaptive video transcoding pipeline · **Produced Events:** `clip_viewed`, `clip_completed`, `clip_subscribed_from` · **Shared Components:** `ReelsPager`, `ThumbZoneActionStack`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — not launch-blocking, but pulled up from Low because building a vertical video feed with algorithmic ranking and buffering discipline is high-complexity work that needs an early start.

### 1. Overview
**Purpose:** Top-of-funnel discovery for users following nobody yet, using short vertical video as a lower-commitment format than a full profile visit. **Revenue Impact:** primarily a top-of-funnel subscription driver (`clip_subscribed_from` directly attributes conversions back to this surface, distinct from B1's attribution). **Success Metrics:** completion rate per clip, subscribe-from-clip conversion rate, average session clips-watched.

### 2. Feature Description
**Competitor analysis:** TikTok/Reels/Spotlight all validate full-screen vertical autoplay with thumb-zone actions as the category-defining pattern for this content shape; there is no meaningful variation to invent here, only careful implementation. *Our addition:* the Subscribe action in the thumb-zone stack opens C1 as an overlay without leaving the feed (competitors' equivalent action is typically "Follow," a free action — ours is a paid one, so the overlay-without-navigating-away pattern matters more here to preserve viewing momentum).

### 3. User Journey
Vertical swipe, one clip per swipe (snap-scroll) → tap Subscribe opens C1's tier sheet as an overlay → tap creator handle opens B5 in a new stack (preserves the clip feed underneath) → tap back returns exactly to the clip that was playing.

### 4–6. UX Flow / UI Layout / Component Breakdown
As specified in the predecessor Frontend Design Specification's Module 3.2 (full-viewport video, thumb-zone floating action column bottom-right, scrim-gradient caption overlay) — carried forward unchanged, since that module's UI treatment was already at full frontend depth; this Part adds the backend/data/testing layers that document lacked.

### 7. Functional Behaviour
Intersection-Observer triggers play/pause per card; only current+next clip are buffered (hard cap, enforced client-side) to bound bandwidth/battery cost. Subscribe tap opens C1's overlay without pausing the underlying video (so returning from a cancelled subscribe flow resumes exactly where the user left off).

### 8. State Management
Loading: skeleton video-frame placeholder (a blurred first-frame thumbnail) rather than a spinner, so the feed never looks broken during buffering. Offline: cached-and-already-viewed clips remain swipeable; new clips show a clear "reconnect to load more" end-of-feed card.

### 9. Business Rules
Only free/public clips are eligible for this feed — locked/PPV content is never distributed here, since the format's autoplay-first-frame convention is incompatible with a meaningful paywall gate (a blurred autoplaying video with no clear unlock affordance visible before playback starts would be confusing and low-converting compared to the feed/profile paywall pattern).

### 10. Data Requirements
**Clip entity:** `id`, `creatorId`, `hlsManifestUrl`, `durationSeconds`, `caption`, `createdAt`. Distinct from `posts` (B1) — clips are always short-form video, always free, always vertical-format; a creator publishing flow (equivalent to the predecessor doc's Module 9.1) chooses "Spotlight" as a destination to create a `Clip` row rather than a `Post` row.

### 11. Backend Integration
`GET /v1/spotlight/feed?cursor=`, `POST /v1/spotlight/:id/like|comment|share`. Manifests are HLS (adaptive bitrate), never raw MP4, generated by the transcoding pipeline at upload time (Part D/creator-tools scope).

### 12. Database Dependencies
`clips`, `clip_likes`, `clip_comments`. Index: `clips.createdAt` for chronological-with-ranking-boost feed assembly (ranking detail owned by Part I2, same service as B1).

### 13. Cross-Module Dependencies

**Receives from:** receives shared ranking infrastructure from B1 and the subscribe-tier overlay from C1 (opened without leaving this feed).
**Hands off to:** hands clip performance data (views, completion rate, subscribe-attribution) to F2's creator analytics.
**Breaks if changed:** altering the `Clip` entity's separation from `posts` (§10) would break the "Spotlight" publishing destination choice and F2's clip-specific analytics rollups, which assume clips are never `Post` rows.

### 14. Error Handling
HLS manifest fails to load → auto-skip to next clip after a brief retry, logging the failure for infra monitoring rather than stalling the whole feed on one bad asset.

### 15. Security
Signed, short-lived manifest URLs prevent hotlinking of full video assets outside the app.

### 16. Accessibility
Autoplay respects OS-level reduced-motion/data-saver settings, falling back to tap-to-play; mute-state persists across the session.

### 17. Performance
Aggressive preload-window limiting (current+next only) is this module's single most important performance rule — unbounded preloading here is the most common way a short-form feed silently becomes the app's largest bandwidth/battery cost.

### 18. Analytics
**Events:** `clip_viewed`, `clip_completed {watchPercentage}`, `clip_subscribed_from {creatorId}`. **Revenue link:** `clip_subscribed_from` directly attributes C1 subscriptions to this surface, letting product compare its conversion efficiency against B1's.

### 19. Testing
Load test: confirm preload window never exceeds 2 buffered clips under rapid-swipe conditions. E2E: subscribe-from-clip-overlay correctly returns to the same clip, still playing, on dismiss/cancel.

### 20. Future Enhancements
Sound/music attribution bar; duet/react-to-clip creator tools.

### 21. Tech Stack

- **Frontend:** React Native `ReelsPager` (snap-scroll vertical pager) and `ThumbZoneActionStack` (Appendix K3), driven by an Intersection-Observer-equivalent play/pause hook; TanStack Query manages the cursor-paginated `GET /v1/spotlight/feed`, with a hard client-side cap limiting the video pre-fetch/buffer window to the current-plus-next clip only (§7/§17) to bound bandwidth and battery cost.
- **Backend:** NestJS spotlight module exposing `GET /v1/spotlight/feed?cursor=` and the like/comment/share endpoints; ranking/feed-assembly reuses Part I2's recommendation service, the same one B1 calls, per §12's shared-ranking-infra note.
- **Third-party services:** the adaptive video transcoding pipeline (FFmpeg-based) that produces HLS manifests at upload time, served through signed short-lived URLs from CDN/object storage to prevent hotlinking (§15).
- **Data layer:** PostgreSQL `clips` and `clip_likes`/`clip_comments` tables, kept distinct from B1's `posts` table (§10); Redis-backed rate limiting on the like/comment/share endpoints, matching B1's pattern.

---

## Module B4 — Search, Explore & Tagging

**Dependencies:** B1 · **Consumed Services:** Search index service (Elasticsearch/OpenSearch-class) · **Produced Events:** `search_performed`, `tag_explored`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — a basic launch can ship with just the main Discovery Feed, with search/tagging following shortly after; moderate complexity driven by the Elasticsearch integration.

### 1–2. Overview / Feature Description
**Purpose:** Intent-driven discovery for users who know what they want, complementing B1's algorithmic serendipity. Modeled on Instagram Explore's grid-first density with Fansly-style creator/tag/post tri-tab results.

### 3. User Journey
Tap search → recent searches shown (locally cached, not server-stored, for privacy) → type → debounced (300ms) live results tabbed Creators/Posts/Tags → tap result navigates to B5 or a tag-filtered grid.

### 4–6. UX/Layout/Components
Grid-first default state (trending tags as pills + trending creator/post masonry grid); search-active state replaces grid with tabbed ranked results. `TagChip`, `ExploreGrid`, `SearchResultTabs` (Appendix K3).

### 7. Functional Behaviour
Debounced query fires `GET /v1/search?q=&type=`; results grouped server-side by type in one response to avoid three separate round-trips per keystroke.

### 8. State Management
Empty query state: trending grid. Empty results state: "No results for 'x'" with 2-3 spelling-adjacent suggestions if the search index's fuzzy-match confidence is high enough, otherwise no suggestion rather than a low-confidence guess.

### 9. Business Rules
Search results exclude suspended/under-review creators and any content from blocked/blocking relationships, identical filtering rule to B1.

### 10. Data Requirements
Search index documents are a denormalized projection of `profiles` and `posts`, kept in sync via an event-driven pipeline (a profile/post update publishes an event the search indexer consumes) rather than being queried live against the primary database — search relevance and primary-database transactional integrity are deliberately separated concerns.

### 11. Backend Integration
`GET /v1/search?q=&type=creator|post|tag`, `GET /v1/explore/trending-tags`, `GET /v1/explore/grid`.

### 12. Database Dependencies
No new primary entities — this module's data layer is the search index itself (external to the primary relational store) plus a `saved_searches` entity if the future-enhancement recent/saved-search sync ships.

### 13. Cross-Module Dependencies

**Receives from:** receives moderation/block exclusion logic from G1 (identical filtering rule to B1) and search-index documents from the event-driven pipeline that projects `profiles` and `posts` updates.
**Hands off to:** hands off result taps to B1/B5 — a search result navigates to a creator's profile (B5) or a tag-filtered grid (B1's content).
**Breaks if changed:** altering the denormalized search-index document shape (§10) requires updating both the event-driven indexer pipeline and the primary-database `ILIKE`-style fallback query (§14) in lockstep, since the fallback must return a result shape the client can render identically to a normal search response.

### 14. Error Handling
Search index outage → graceful degradation to primary-database `ILIKE`-style fallback search (slower, less relevant, but functional) rather than a broken search screen — better degraded than dead for a feature this discovery-critical.

### 15. Security
Query strings are sanitized before indexing/logging to avoid log-injection and to keep raw search-query analytics free of anything a user might paste that shouldn't be retained (e.g., accidentally pasted personal data).

### 16. Accessibility
Live-results region uses `aria-live=polite` announcing result count changes; tag chips are real buttons.

### 17. Performance
Debounce plus request-cancellation-on-keystroke (an in-flight search request is aborted if a new keystroke supersedes it before the response returns) to avoid stale-result flicker.

### 18. Analytics
**Events:** `search_performed {query, resultCount}`, `search_result_tapped {type, position}`, `tag_explored {tag}`. Aggregate query analytics (top zero-result queries) directly inform what creators/content the platform should be recruiting or promoting.

### 19. Testing
Integration: search-index outage triggers fallback path correctly. Edge case: query containing only special characters/emoji handled gracefully (no crash, sensible empty-or-fallback result).

### 20. Future Enhancements
Personalized ranking (weight results toward tags/creators similar to the viewer's subscription history); saved/recent search sync across devices.

### 21. Tech Stack

- **Frontend:** React Native search screen built from `TagChip`, `ExploreGrid`, `SearchResultTabs` (Appendix K3); TanStack Query drives the debounced (300ms), request-cancellation-on-keystroke query pattern in §17, and recent searches are cached locally (not via a server-synced store) per the privacy note in §3.
- **Backend:** a NestJS search module exposes `GET /v1/search?q=&type=`, `GET /v1/explore/trending-tags`, and `GET /v1/explore/grid`, grouping results by type server-side (§7) to avoid multiple round-trips per keystroke, with query strings sanitized before logging (§15); an index outage falls back to a PostgreSQL `ILIKE`-style query (§14).
- **Third-party services:** Elasticsearch/OpenSearch is the primary engine here, not a peripheral dependency — it is what §4's grid-first trending results and tabbed search results are actually served from.
- **Data layer:** no new primary entities beyond an optional future `saved_searches` table (§12); the search index itself is the module's real data layer, kept in sync with PostgreSQL `profiles`/`posts` via an event-driven indexing pipeline (§10) rather than live queries against the primary store.

---

## Module B5 — Creator Profile (Public + Subscriber Views)

**Previous Module:** B1 (typical entry) · **Next Module:** C1 (Subscribe) or C3 (Unlock) or D1 (Message)
**Dependencies:** A2, A3, C1 (tier data), C3 (unlock state) · **Consumed Services:** none beyond standard content/entitlement services
**Produced Events:** `profile_viewed`, `profile_tab_switched`, `subscribe_cta_tapped`
**Shared Components:** `ProfileHero`, `StickySubscribeBar`, `PostGrid` (reuses B1's `PostCard`/`LockedMediaCard`)
**Shared State:** none beyond standard per-navigation state
**Global Context:** The platform's highest-converting single screen; every discovery surface (B1, B3, B4) and every notification/DM ultimately funnels here before a purchase happens.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: every creator link and every purchase flow resolves here, so nothing in Part C can convert without it; complexity is moderate, mostly composed-read-view work rather than novel algorithmic build.

### 1. Overview
**Purpose:** The creator's storefront — present identity, social proof, and a clear paywall in one screen optimized for conversion. **Business Goal:** maximize visit-to-subscribe and visit-to-first-purchase conversion rate. **User Goal (fan):** quickly assess whether a creator's content is worth paying for. **User Goal (creator):** a profile that fairly represents them and converts visitors without requiring ongoing manual tuning. **Revenue Impact:** the single highest-leverage screen in the entire product for GPV. **Success Metrics:** visit-to-subscribe rate, visit-to-PPV-unlock rate, average session time on profile before a purchase decision.

### 2. Feature Description
**Competitor analysis:** OnlyFans/Fansly's dual-tab (Free/Subscribers) architecture with a sticky subscribe CTA is the proven category standard; Patreon's tiered-benefit checkmark cards (surfaced here via the Subscribe overlay, C1, not this module directly) round out the pattern. *Weakness observed across all three:* none clearly separates "one-time PPV items available for purchase without a subscription" from "subscriber-only content," often conflating the two in a single locked-grid visual, which under-communicates that a visitor doesn't have to subscribe to buy *something*. *Our improvement:* the Free tab explicitly surfaces individually-priced PPV items inline (not only inside the Subscribers tab), giving a lower-commitment purchase path than subscribing, which broadens the top of the monetization funnel for cautious first-time buyers.

### 3. User Journey
1. Arrival from any discovery surface → hero renders (avatar, banner, display name, handle, verified badge if applicable, follower/subscriber count, bio) → social-proof row → sticky Subscribe/tier-summary bar → dual-tab content area, defaulting to Free.
2. Non-subscriber on Free tab sees free posts interspersed with individually-priced PPV items (per the improvement above); tapping Subscribers tab shows a fully-blurred grid (C3's `LockedMediaCard` pattern) with subscribe emphasis.
3. Subscriber on Subscribers tab sees the full unlocked grid directly.
4. Tapping Subscribe/tier CTA opens C1's tier-comparison overlay without leaving this screen; on success, the Subscribers tab immediately reflects unlocked content with no page reload.
5. A Message button (visible per Part D1's messaging-permission rules — some creators may restrict DMs to subscribers only) opens D1's thread with this creator.
6. A Report/Block entry point (three-dot menu) opens G1's flow.

### 4. UX Flow
Entry points: any discovery surface, a shared profile URL/deep-link (`app://creator/:handle`), a notification. Exit points: Subscribe (C1 overlay), Unlock (C3 overlay), Message (D1), Report/Block (G1), back to the originating discovery surface. Deep linking: `/creator/:handle` and `/creator/:handle/subscribed` both resolve to this same screen with the appropriate default tab, and correctly reflect the viewer's real entitlement regardless of which URL was used to arrive (the URL is a UX default-tab hint, never itself a security boundary).

### 5. UI Layout
As specified in the predecessor Frontend Design Specification's Module 4.0 (hero → sticky CTA → dual-tab → grid), carried forward with the Free-tab PPV-inline addition described above.

### 6. Component Breakdown
`ProfileHero`, `StickySubscribeBar`, `ProfileTabBar`, `PostGrid` (reused from B1), `FollowButton` (free, distinct from Subscribe — following is a no-cost notification-preference action, not a monetization action, and must never be visually confusable with Subscribe).

### 7. Functional Behaviour
Profile data (`GET /v1/creators/:handle`) is fetched as a single viewer-state-aware response — the same entitlement-consistency requirement as B1's feed (§13 of B1) applies here: Free/Subscribed content and the viewer's actual entitlement must originate from one query, never two independently-cacheable calls that can drift and briefly show the wrong tab's true content.

### 8. State Management
Loading: skeleton hero + skeleton grid. Empty (creator has posted nothing yet): a plain "This creator hasn't posted yet — check back soon" state, shown identically whether viewed by a subscriber or not (an empty content grid isn't a paywall-relevant state). Failure: profile-not-found (deleted/never existed) renders a dedicated 404-style creator-not-found screen, distinct from a network-error retry state.

### 9. Business Rules
A suspended creator's profile (G3) is not fully hidden but replaced with a neutral "This profile is currently unavailable" state for all viewers, including existing subscribers — subscribers are not billed during a suspension window (enforced by C1's billing logic pausing, not this module). Follower count is always public; subscriber count is creator-configurable to show or hide (a common creator preference, since some prefer not to publicly signal a lower/higher subscriber count than competitors).

### 10. Data Requirements
Composed from `profiles` (A3), `subscription_tiers`/`subscriptions` (C1), `posts` with per-viewer `locked` flags (B1's projection, reused). No new primary entity of its own beyond what A3/C1/B1 already define — this module is fundamentally a composed read view.

### 11. Backend Integration
`GET /v1/creators/:handle` (viewer-state-aware, SSR'd for the Free tab specifically to support search-engine indexability and social-link-preview generation, per Master Index's general performance/SEO posture — the Subscribers tab is never SSR'd, since it must never render entitled content to an unauthenticated crawler).

### 12. Database Dependencies
No new tables. Query-level joins across `profiles`, `subscription_tiers`, `subscriptions`, `posts`. Index requirements are owned by the underlying entities' own modules (A3, C1, B1).

### 13. Cross-Module Dependencies

**Receives from:** receives profile/identity data from A3, tier and subscription state from C1, unlock/entitlement state from C3, moderation and suspension state from G1/G3, and message-button permission rules from D1.
**Hands off to:** hands off to every discovery surface that links here (B1, B3, B4) as their terminal node, and hands off to C1 (Subscribe), C3 (Unlock), D1 (Message), and G1 (Report/Block) as the entry point into each of those flows.
**Breaks if changed:** altering the composed response shape requires coordinated updates to B1's `PostCard` reuse and C1's overlay-driven "Subscribers tab refresh without reload" contract.

### 14. Error Handling
Creator not found/deleted → dedicated not-found state (§8). Suspended creator → neutral unavailable state (§9), never a raw 403/404. Entitlement check fails transiently (a momentary billing-system hiccup incorrectly shows a subscriber as unsubscribed) → the profile fails closed (shows the paywalled view) rather than failing open (never risk showing paid content to someone the system can't currently confirm is entitled), with the discrepancy logged for reconciliation.

### 15. Security
Server-side entitlement check on every request to this endpoint, never a client-cached "I'm subscribed" flag trusted for content-serving decisions — identical principle to B1 §15.

### 16. Accessibility
Proper ARIA tab/tabpanel roles on the Free/Subscribers tab bar; locked-grid cells announce "locked, subscribe to view" to assistive tech even where visually only a blur is shown.

### 17. Performance
Free-tab SSR for fast first paint and shareable link previews; Subscribers-tab content is client-fetched post-auth-check only.

### 18. Analytics
**Events:** `profile_viewed {source}`, `profile_tab_switched`, `subscribe_cta_tapped`, `message_button_tapped`. **Funnel:** this is the terminal node of B1/B3/B4's funnels and the entry node of C1/C3's — the platform's central conversion-measurement junction.

### 19. Testing
E2E: non-subscriber sees blurred Subscribers tab and inline free-tab PPV items; subscriber sees full unlocked grid; subscribe-overlay success updates the tab without reload; suspended-creator profile shows the neutral unavailable state for both subscribers and non-subscribers. Edge case: a subscription expires while the fan is actively viewing the Subscribers tab (mid-session) — the next content fetch (not a jarring live mid-scroll change) must correctly re-lock content on the following visit.

### 20. Future Enhancements
Creator-customizable accent color/banner layout; a public "recent activity" indicator (last-post timestamp) to signal an active vs. dormant creator to prospective subscribers.

### 21. Tech Stack

- **Frontend:** React Native screen composed from `ProfileHero`, `StickySubscribeBar`, `ProfileTabBar`, `PostGrid` (reusing B1's `PostCard`/`LockedMediaCard`), and `FollowButton` (Appendix K3's shared component library, built on NativeWind); TanStack Query caches the single viewer-state-aware `GET /v1/creators/:handle` response so the Free/Subscribed content and the viewer's entitlement never drift across two independently-cached calls (§7).
- **Backend:** a NestJS creators module serves `GET /v1/creators/:handle` with server-side rendering for the Free tab specifically (SEO/link-preview indexability, §11/§17) while the Subscribers tab is always client-fetched post-auth-check, and the endpoint performs a fresh server-side entitlement check on every request rather than trusting any client-cached flag (§15).
- **Third-party services:** none beyond the standard content/entitlement services this module composes over (A3, C1, C3) — this is a read-heavy display surface with no independent external integration of its own.
- **Data layer:** Redis-backed caching of the composed profile response is what keeps this high-traffic, read-heavy screen fast, sitting in front of query-level joins across PostgreSQL `profiles`, `subscription_tiers`, `subscriptions`, and `posts` (§10/§12) — no new primary tables of its own.



\newpage


# Part C — Monetization Core

Every module in this Part writes through the single Wallet Deduction Engine (C2) — no module implements its own balance-mutation logic. This is the most financially load-bearing Part of the specification; every business rule here exists to keep the ledger correct, auditable, and resistant to double-spend, race conditions, and fraud.

---

## Module C1 — Subscriptions & Tiered Membership

**Previous Module:** B5 Creator Profile · **Next Module:** C2 (payment processing), then unlocks B5's Subscribers tab
**Dependencies:** A4, B5, C2 · **Consumed Services:** Payment processor (CCBill/Segpay/Epoch/Verotel), Recurring-billing scheduler
**Produced Events:** `subscription_created`, `subscription_renewed`, `subscription_cancelled`, `subscription_payment_failed`
**Shared Components:** `TierCard`, `TierComparisonSheet`, `PaymentMethodSelector`
**Shared State:** `subscriptionStore` (per-creator entitlement cache, always reconciled against server truth before any content-gating decision)
**Global Context:** The platform's primary recurring-revenue mechanism; every subscription write also writes a C2 ledger entry.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking core revenue mechanism.

### 1. Overview
**Purpose:** Recurring, tiered access to a creator's Subscribers-only content. **Business Goal:** predictable recurring GPV (subscriptions are materially more forecastable than one-off PPV/tip revenue) and the retention effects of a standing payment relationship. **User Goal (fan):** clear, comparable tiers with no surprise billing. **User Goal (creator):** flexible tier design without needing to understand payment-processor mechanics directly. **Revenue Impact:** typically the single largest GPV category on comparable platforms. **Success Metrics:** subscribe conversion rate (from B5), monthly recurring revenue (MRR), churn rate, involuntary-churn rate (failed-payment-caused, distinct from voluntary cancellation — an operationally fixable category via card-updater tooling).

### 2. Feature Description
**Competitor analysis:** Patreon's tiered-benefit checkmark cards are the clearest, most copied pattern in this space and are adopted here near-verbatim for the comparison UI. Fansly's multi-tier model (vs. OnlyFans' historical single-tier-per-creator model) gives creators meaningfully more pricing flexibility, which we adopt (1–4 tiers, creator-configured) over OnlyFans' simpler model. *Weakness across the category:* renewal/cancellation terms are frequently under-communicated at the point of purchase, which drives both consumer complaints and a higher chargeback rate than necessary. *Our improvement:* explicit renewal-date and one-tap-cancel copy is shown at the confirm step of every subscribe flow, before the charge — reducing "I didn't realize this would auto-renew" chargebacks, which materially matters for maintaining payment-processor standing (Master Index §2.6's chargeback-rate constraint).

### 3. User Journey
1. From B5, tap Subscribe/tier CTA → `TierComparisonSheet` (bottom sheet mobile / modal desktop) shows 1–4 tier cards side by side, each with price/month and a checkmark benefit list; the creator-designated "recommended" tier is visually emphasized.
2. Select a tier → payment step: choose Coins-balance payment (if sufficient balance exists) or a saved/new card via the processor's hosted-fields SDK.
3. Confirm step shows: tier name, price, "renews monthly on [date]," and "cancel anytime" — all as plain visible text, not a footnote — before the final confirm tap.
4. Confirm → `POST /v1/subscriptions` → on success, a brief success animation plays, the sheet closes, and B5's Subscribers tab immediately reflects unlocked content without a page reload.
5. An existing subscriber tapping the same CTA instead sees a "Manage Subscription" sheet: current tier, renewal date, an Upgrade-tier option, and Cancel.
6. Cancel → confirmation ("You'll keep access until [renewal date], then it won't renew") → `DELETE /v1/subscriptions/:id` sets `cancelAtPeriodEnd: true` rather than revoking access immediately — a subscriber who cancels retains what they already paid for through the current period, a fairness norm consistent with every competitor studied and a direct chargeback-rate mitigation.

### 4. UX Flow
Entry: B5's Subscribe CTA only (no other entry point — subscriptions are always initiated from the creator's own profile, never from a generic "browse subscriptions" screen, since context/identity matters for this purchase decision). Exit: success returns to B5 with the Subscribers tab active; cancel/dismiss returns to whatever tab was active before the sheet opened. Modal: bottom sheet (mobile) / centered modal (desktop), never a full-page navigation — preserves the sense of "still on the creator's profile."

### 5. UI Layout
As specified in the predecessor Frontend Design Specification's Module 4.1 — tier cards with checkmark lists, recommended-tier emphasis, payment-method selector, explicit renewal/cancel confirm copy. Carried forward unchanged at the UI layer; this Part adds the backend/ledger/error/testing layers.

### 6. Component Breakdown
`TierCard`, `TierComparisonSheet`, `PaymentMethodSelector`, `SubscribeConfirmStep`, `ActiveSubscriptionBadge`, `ManageSubscriptionSheet`.

### 7. Functional Behaviour
Subscribing via Coins balance debits `CoinWallet` synchronously through C2 at confirm time. Subscribing via card charges the processor directly (not via Coins) — subscriptions support both payment paths, since forcing a Coins top-up before every subscription would add unnecessary friction for a fan who only ever wants to subscribe, never tip/gift. Recurring renewal is scheduled server-side by the billing scheduler, not client-triggered — the app does not need to be open for a renewal to process.

### 8. State Management
Loading: payment-processing state disables the confirm button and shows an inline spinner within it (never a full-screen blocking loader, consistent with A1's pattern). Failure: card-decline shows the processor's decline reason where available (mapped to a small set of user-actionable categories — insufficient funds, expired card, bank declined — never a raw processor error code). Real-time: none — subscription state changes are reflected on next fetch, not pushed live, since a subscription's state changes at human-decision speed, not requiring live sync.

### 9. Business Rules
Tier prices must fall within platform-configured min/max bounds (this is the authoritative source A3 §9 referenced). A subscriber is never charged twice for the same billing period, enforced via idempotency keys on the renewal job (Master Index §2.1) plus a unique constraint on `(subscriptionId, billingPeriodStart)` in the ledger. Cancellation always takes effect at period end, never immediately mid-period, except when triggered by a creator suspension (G3), in which case billing pauses immediately and no further charge occurs until/unless the creator is reinstated. Upgrading tiers mid-period is prorated (credited the unused portion of the current tier toward the new tier's price) — downgrading takes effect at the next renewal, not immediately (prevents a fan from downgrading to avoid a charge after already consuming the current period's higher-tier content).

### 10. Data Requirements
**SubscriptionTier entity:** `id`, `creatorId`, `name`, `priceCents`, `benefitList (array of strings)`, `isRecommended (bool)`, `isActive (bool — a retired tier remains referenced by historical subscriptions but can't be newly subscribed to)`. **Subscription entity:** `id`, `fanId`, `creatorId`, `tierId`, `status (enum: active | cancelled_pending_end | expired | payment_failed)`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd (bool)`, `paymentMethod (enum: coins | card)`.

### 11. Backend Integration
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `GET /v1/creators/:handle/tiers` | GET | Access token | Public (Free-tab-visible pricing) |
| `POST /v1/subscriptions` | POST | Access token, Idempotency-Key | `{ tierId, paymentMethod, paymentMethodId? }` |
| `GET /v1/subscriptions/me` | GET | Access token | List of the fan's active/past subscriptions |
| `PATCH /v1/subscriptions/:id` | PATCH | Access token, owner-only | `{ tierId }` (upgrade/downgrade) |
| `DELETE /v1/subscriptions/:id` | DELETE | Access token, owner-only | Sets `cancelAtPeriodEnd: true` |
| Webhook: `payment.subscription_renewed` \| `payment.subscription_failed` | Processor→Platform | Signature-verified | Drives `status` transitions |

### 12. Database Dependencies
**Entities:** `subscription_tiers`, `subscriptions`, plus a `ledger_entries` row per C2's contract for every charge/renewal. **Indexes:** `subscriptions.fanId + creatorId` (unique-ish — one active subscription per fan/creator pair, enforced at the application+constraint level), `subscriptions.currentPeriodEnd` (for the renewal scheduler's due-for-renewal query). **Audit fields:** every status transition is logged to `subscription_status_history` for dispute resolution (a fan disputing "I cancelled but was still charged" is resolved by inspecting this history, not by trusting the current `status` alone).

### 13. Cross-Module Dependencies

**Receives from:** A4 (session/wallet primitives) and C2 (every subscription charge is processed through the ledger engine).
**Hands off to:** B5 (entitlement check unlocks Subscribers-tab content), C2 (every charge flows through here as a write), F1 (creator earnings breakdown by subscription revenue), and G3 (suspension pauses billing).
**Breaks if changed:** altering `status` enum values requires updates everywhere entitlement is checked (B5 primarily).

### 14. Error Handling
| Scenario | Behavior |
|---|---|
| Card declined at initial subscribe | Inline decline-category message; subscription is not created (no partial/pending subscription state exists for a failed initial charge). |
| Card declined at renewal | Subscription enters `payment_failed` status; access is not immediately revoked — a grace period (configurable, default 3 days) allows the fan to update payment before access lapses, with a notification (Part I1) prompting them to do so; card-updater integration (Master Index-referenced processor feature) attempts automatic recovery first, before ever notifying the user. |
| Idempotency-key collision (duplicate renewal attempt) | Second attempt returns the original successful result rather than double-charging — verified by the ledger's unique billing-period constraint. |
| Creator deletes/retires a tier a fan is actively subscribed to | Existing subscribers on the retired tier are grandfathered at their current price/benefits until they cancel; only new subscriptions to that tier are blocked. |

### 15. Security
Card data never touches platform servers (hosted-fields/tokenized SDK, per Master Index-referenced PCI posture). Idempotency keys prevent duplicate-charge exploits from retried requests. Renewal webhook payloads are signature-verified before being trusted to change billing state.

### 16. Accessibility
Tier comparison is fully screen-reader navigable with price/benefits as real text; renewal/cancel terms are never conveyed by color or icon alone.

### 17. Performance
Tier list is cached aggressively (rarely changes) with cache invalidation on creator edit; subscription-state checks on B5 are optimized via a single composed query (B5 §11), not N+1 lookups per post.

### 18. Analytics
**Events:** `tier_comparison_viewed`, `subscription_created {tierId, priceCents, paymentMethod}`, `subscription_cancelled {reason?}`, `subscription_payment_failed {declineCategory}`, `subscription_renewed`. **KPIs:** MRR, net revenue retention, involuntary vs. voluntary churn split (these require different fixes — involuntary churn is a card-updater/dunning problem, voluntary churn is a content/value problem). **Revenue link:** direct — this module's `priceCents` events are a primary GPV input.

### 19. Testing
**Unit:** proration math for mid-period upgrades. **Integration:** renewal webhook correctly transitions status and writes exactly one ledger entry per billing period even under simulated duplicate-webhook delivery. **E2E:** full subscribe→access-granted→cancel→access-retained-until-period-end→access-revoked-after-period-end lifecycle. **Edge cases:** fan subscribes, creator immediately retires that tier, fan's subsequent renewal must still process at the grandfathered price; two devices attempt to subscribe the same fan to the same creator simultaneously (must not create two active subscriptions — unique constraint enforced). **Acceptance criteria:** zero double-charge incidents across a load test of concurrent renewal-webhook delivery with intentional duplicates injected.

### 20. Future Enhancements
Annual billing option at a discount; a free trial period (with the same explicit-terms-at-confirm principle applied to trial-to-paid conversion).

### 21. Tech Stack

- **Frontend:** React Native (Expo) screens built from `TierCard`, `TierComparisonSheet`, `PaymentMethodSelector`, `SubscribeConfirmStep`, `ManageSubscriptionSheet` (Appendix K3); Zustand's `subscriptionStore` caches per-creator entitlement, always reconciled against server truth via TanStack Query before any content-gating decision (§8).
- **Backend:** NestJS subscriptions module exposing the `/v1/subscriptions` REST surface (§11), plus a server-side recurring-billing scheduler that triggers renewals independent of client presence (§7).
- **Third-party services:** a high-risk-vertical payment processor (CCBill/Segpay/Epoch/Verotel-class) via hosted-fields SDK for card charges, including its card-updater/dunning tooling for involuntary-churn recovery (§14).
- **Data layer:** PostgreSQL `subscription_tiers`, `subscriptions`, and `subscription_status_history` tables (§10, §12); every charge and renewal also writes a C2 `ledger_entries` row.

---

## Module C2 — Wallet Deduction Engine (Ledger)

**Previous/Next:** consumed by every other module in this Part, plus D3/E2
**Dependencies:** A4 · **Consumed Services:** Payment processor, Double-entry ledger/accounting service
**Produced Events:** `ledger_entry_created`, `wallet_balance_changed`
**Shared Components:** `WalletScreen`, `CoinPackageGrid`, `TransactionHistoryList`
**Shared State:** `walletStore.balance` (client cache, always reconciled against server truth before authorizing any spend)
**Global Context:** The single choke point every monetized action in the product writes through — no other module is permitted to mutate a balance directly.
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking, and the single highest financial-integrity-complexity module in the entire specification, since every monetized action in the product writes through this ledger.

### 1. Overview
**Purpose:** Provide one correct, auditable, race-condition-safe mechanism for (a) converting real money into Coins, and (b) debiting Coins / crediting Credits for every monetized action platform-wide. **Business Goal:** zero ledger discrepancies, ever — this is a hard operating requirement for a payments business, not a target to approach. **User Goal:** buying Coins and seeing an accurate, immediately-reflected balance. **Revenue Impact:** this module doesn't generate revenue itself but every dollar of GPV passes through it — its correctness is the precondition for the business being auditable and bankable at all. **Success Metrics:** ledger reconciliation discrepancy count (target: 0), Coins-purchase completion rate, average purchase size, best-value-package attach rate.

### 2. Feature Description
**Competitor analysis:** Tango's Coins→Diamonds split and BIGO's Diamonds→Beans split (Master Index §1) both validate the dual-denomination architecture this module implements. *Our implementation's specific improvement over both:* an explicit, queryable, immutable ledger-entry table as the actual source of truth (with `balance` columns as a derived/cached total), rather than treating a mutable balance column as authoritative — this is standard double-entry-accounting practice that a pure balance-column design (which is all a UI teardown of competitor apps can reveal about their internals) may or may not implement, and which this specification treats as non-negotiable given the fraud and audit stakes of a payments platform in this content category specifically.

### 3. User Journey
1. Tap the wallet balance chip (visible in the app shell at all times) → `WalletScreen`: large balance display, `CoinPackageGrid` (tiered packages, largest carrying a "best value" badge), `TransactionHistoryList` below.
2. Select a package → payment method (saved card / new card via processor SDK) → confirm → balance updates with a count-up animation reflecting the new total once the server confirms the charge (never before — no optimistic balance increase for real-money purchases, unlike the optimistic-like pattern in B1, since overstating a spendable balance before payment confirmation is a real risk vector, not just a minor UX inconsistency).
3. Any spend action elsewhere in the app (C1, C3, C4, D3, E2) that would exceed the current balance triggers an inline top-up prompt (a lightweight sheet over the current context) rather than a hard error — completing the top-up resumes the original spend action automatically.

### 4. UX Flow
Entry: wallet chip (global, Module 1.0's shell), inline top-up prompts from any spend point. Exit: successful purchase returns to WalletScreen (if entered directly) or resumes the originating spend flow (if entered via inline prompt).

### 5. UI Layout
As specified in the predecessor Frontend Design Specification's Module 6.0 — balance display, package grid with best-value badge, transaction history, inline top-up affordance. Carried forward unchanged at the UI layer.

### 6. Component Breakdown
`WalletScreen`, `BalanceDisplay`, `CoinPackageGrid`, `CoinPackageCard`, `TransactionHistoryList`, `InlineTopUpPrompt`, `PaymentMethodManager`.

### 7. Functional Behaviour — The Deduction Algorithm

Every spend request (subscribe, unlock, tip, gift, paid message, paid call minute) calls a single internal function, `debitAndCredit(spenderId, recipientId, amountCoins, reason, idempotencyKey)`, which:

1. Opens a database transaction with a row-level lock on the spender's `CoinWallet` row (prevents a race where two simultaneous spends both read a sufficient balance before either has committed its debit — the classic double-spend bug).
2. Verifies `balance >= amountCoins`; if not, aborts the transaction and returns `INSUFFICIENT_BALANCE` — no partial debit ever occurs.
3. Writes an immutable `ledger_entries` row: `{ type: 'debit', walletId: spenderWallet, amount: amountCoins, reason, idempotencyKey, createdAt }`.
4. Decrements the cached `CoinWallet.balance` by `amountCoins` within the same transaction.
5. If a recipient is specified (a creator, for tips/gifts/subscriptions/PPV/paid content — not for pure Coins purchases, which have no recipient), computes the Credits owed via the current `coins_to_credits` conversion rate (Master Index §2.5/A4 §9), writes a corresponding `ledger_entries` credit row against the recipient's `CreditLedger`, and increments its `pendingBalance` (not `availableBalance` directly — see Part F1 for the holding-period mechanic).
6. Commits the transaction atomically — steps 3–5 either all succeed or all roll back together; there is no code path where a debit is recorded without its corresponding credit, or vice versa.

### 8. State Management
Loading: package-purchase confirm button shows an inline spinner during processor communication. Failure: card decline surfaces the same decline-category messaging pattern as C1. Optimistic Updates: explicitly *not* used for balance increases from real-money purchase (§3); *is* used for balance decreases from a spend action inside a live/real-time context (E2's gift-send) where perceived responsiveness during a live stream matters more, with the same rollback-on-server-rejection pattern as B1's like button. Real-time: balance is not pushed live via websocket to every screen; the wallet chip re-fetches on app-foreground and after any completed spend/purchase action.

### 9. Business Rules
No spend action is ever permitted to take a balance negative — enforced at the database transaction level (step 2 above), not merely checked in application code, so a bug elsewhere in the codebase cannot bypass this constraint. Every debit must have a `reason` drawn from a fixed enum (`subscription`, `ppv_unlock`, `tip`, `gift`, `paid_message`, `paid_call_minute`) — an unclassified debit is a schema violation, not a valid state, since financial reporting (F1, H4) depends on being able to categorize every transaction. Coins purchases are non-refundable by default once spent (standard across every competitor studied) but the *unspent* Coins balance itself is eligible for a processor-mediated refund within the payment processor's own dispute window, handled as a special-cased reversing ledger entry, never a silent balance edit.

### 10. Data Requirements
**LedgerEntry entity (append-only, the true source of truth):** `id`, `walletType (enum: coin_wallet | credit_ledger)`, `walletId`, `type (enum: debit | credit)`, `amount (integer)`, `reason (enum, see above)`, `relatedEntityType (enum: subscription | post | gift | message | call_minute | purchase)`, `relatedEntityId`, `idempotencyKey (unique)`, `createdAt`. **CoinWallet/CreditLedger:** as defined in A4 §10, with `balance`/`availableBalance`/`pendingBalance` now explicitly documented as derived caches reconciled against a running sum of `LedgerEntry` rows.

### 11. Backend Integration
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `GET /v1/wallet/summary` | GET | Access token | As A4 §11 |
| `GET /v1/wallet/packages` | GET | None (public pricing) | — |
| `POST /v1/wallet/purchase` | POST | Access token, Idempotency-Key | `{ packageId, paymentMethodId }` |
| `GET /v1/wallet/transactions?cursor=` | GET | Access token | Paginated `LedgerEntry` history, spender's own wallet only |
| Internal: `debitAndCredit(...)` | — | — | Not a public API; called by C1/C3/C4/C5/D3/E2's own endpoints server-side |

### 12. Database Dependencies
**Entities:** `ledger_entries` (the module's core table), `coin_wallets`, `credit_ledgers` (owned by A4, mutated here). **Indexes:** `ledger_entries.idempotencyKey` (unique — the primary double-charge defense), `ledger_entries.walletId + createdAt` (transaction history queries), `ledger_entries.reason + createdAt` (financial reporting queries for F1/H4). **Never hard-deleted** — `ledger_entries` has no `deletedAt` at all; a correction is always a new reversing entry, never an edit or delete of history, which is the fundamental invariant of double-entry accounting.

### 13. Cross-Module Dependencies

**Receives from:** A4 (the wallet/session primitives this engine mutates).
**Hands off to:** C1, C3, C4, C5, D3, E2 (every module that moves money calls this engine — it has no other consumers because nothing else in the product moves money), and read-only to F1 (earnings dashboard), H4 (admin financial operations), and Part K6 (analytics event dictionary references `ledger_entries.reason` directly).
**Breaks if changed:** this is the single highest-blast-radius module in the entire specification for financial-integrity reasons — any schema change here requires a full regression pass across every Part in Category C, D3, and E2.

### 14. Error Handling
| Scenario | Behavior |
|---|---|
| Row-lock contention (two simultaneous spends against the same wallet) | The second transaction waits for the lock, then re-evaluates balance freshly — never evaluates against a stale pre-lock read. |
| Payment processor charge succeeds but the platform's own commit fails after (network partition mid-transaction) | The purchase is reconciled via a webhook-driven reconciliation job that checks processor-confirmed charges against `ledger_entries` and creates any missing credit entry — a fan is never charged real money without eventually receiving the Coins, even across a partial-failure window. |
| Recipient's `CreditLedger` write fails after the spender's debit already committed | This is structurally prevented by doing both within one atomic transaction (§7 step 6) — there is no valid intermediate state where a debit exists without its paired credit; a failure at any point rolls back the entire transaction, including the debit. |
| Idempotency key reused with a different payload (e.g., same key, different `amountCoins`) | Rejected with `409 IDEMPOTENCY_KEY_CONFLICT` rather than silently processing either the original or new payload — an ambiguous retry is treated as a client bug to surface, not silently resolved. |

### 15. Security
Row-level locking plus the append-only ledger design together are the platform's primary defense against double-spend and balance-manipulation exploits. No client-facing API ever accepts a raw balance value to set (A4 §15, restated) — every change is a computed effect of a validated spend/purchase action. All `debitAndCredit` calls are server-to-server (from within C1/C3/C4/C5/D3/E2's own backend handlers), never directly reachable from any client request.

### 16. Accessibility
Balance and transaction-history figures are always available as plain text (never solely as a styled/graphical balance widget) for screen-reader users; the best-value package badge includes a text explanation of the per-unit rate, not just a highlight color.

### 17. Performance
Row-level locking is scoped as narrowly as possible (single wallet row, short transaction duration) to avoid becoming a throughput bottleneck during high-concurrency events (e.g., a viral live stream generating a burst of simultaneous gifts, Part E2) — this is a specific, tested-for load scenario (§19), not an incidental design detail.

### 18. Analytics
**Events:** `wallet_purchase_completed {packageId, priceCents, coinsGranted}`, `wallet_balance_low_prompted` (when an inline top-up is triggered by an insufficient-balance spend attempt — a strong purchase-intent signal). **KPIs:** average purchase size, best-value-package attach rate, top-up-prompt-to-purchase conversion rate. **Revenue link:** `wallet_purchase_completed` is the platform's primary real-money-in event.

### 19. Testing
**Unit:** row-lock acquisition and balance-sufficiency check under simulated concurrent access. **Integration:** full `debitAndCredit` transaction correctly writes paired debit+credit ledger entries or rolls back both together on any injected failure point. **Load test:** simulated burst of 500 concurrent gift-sends against a single popular live stream's viewers spending against their own distinct wallets (no lock contention expected there) *and* a stress test of many simultaneous spends against a small number of shared-recipient wallets (lock contention expected and must degrade gracefully, not deadlock). **Edge cases:** exact-balance spend (balance goes to precisely 0, must succeed, not be rejected by an off-by-one comparison); idempotency-key retry after a genuine prior success (must return the original result, not error or double-process). **Acceptance criteria:** zero discrepancies between the sum of `ledger_entries` and cached `balance` columns across a full reconciliation pass after a sustained load test.

### 20. Future Enhancements
Multi-currency wallet display (A4 §20, restated); an auto-reload feature (top up automatically when balance falls below a user-configured threshold, with explicit opt-in and easy disable, given the consumer-protection sensitivity of any auto-charging feature).

### 21. Tech Stack

- **Frontend:** No dedicated screens of its own beyond `WalletScreen`, `CoinPackageGrid`, and `TransactionHistoryList` (Appendix K3) for Coins purchase; the wallet chip and every purchase confirmation UI elsewhere read this module's result via TanStack Query against Zustand's `walletStore.balance`, never mutate it directly.
- **Backend:** NestJS wallet module implementing the single internal `debitAndCredit(...)` function (§7) that every other monetization module calls server-to-server — no public API accepts a raw balance mutation (§15).
- **Third-party services:** the payment processor for real-money Coins purchases, plus a webhook-driven reconciliation job that reconciles processor-confirmed charges against `ledger_entries` after any partial-failure window (§14).
- **Data layer:** PostgreSQL is the centerpiece — the immutable, append-only `ledger_entries` table (never hard-deleted, §12) is the true source of truth, mutated only under a row-level lock on the spender's `CoinWallet` row (§7 step 1) so double-spend is structurally impossible rather than merely application-checked; `balance`/`availableBalance`/`pendingBalance` are derived caches reconciled against it.

---

## Module C3 — Locked / Blurred Media Gate (PPV Unlock)

**Dependencies:** B1, B5, C2 · **Produced Events:** `content_unlock_viewed`, `content_unlocked`, `content_unlock_failed`
**Shared Components:** `LockedMediaCard` (the single most-reused component in the product — B1, B5, D1 all consume it verbatim)
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking core revenue mechanism.

### 1. Overview
**Purpose:** One-off, per-item purchase of individual content pieces, independent of subscription status. **Business Goal:** capture revenue from fans unwilling to commit to a recurring subscription, and from subscribers who want a specific higher-tier item their subscription doesn't include. **Revenue Impact:** typically the second-largest GPV category after subscriptions on comparable platforms, and often the *primary* category for a platform's highest-earning individual pieces of content. **Success Metrics:** unlock conversion rate (impressions of a locked card → purchases), average PPV price, PPV attach rate per subscriber (subscribers who also buy PPV items, proving the two aren't purely substitutes).

### 2. Feature Description
**Competitor analysis:** the CSS-blur-plus-padlock-plus-price pattern is the fully standardized convention across OnlyFans, Fansly, and Fanvue — there is no meaningful variation left to differentiate on at the visual level, so this specification, like the predecessor Frontend document, adopts it directly rather than inventing an alternative purely for novelty's sake. The genuine differentiation opportunity is backend correctness (never leaking full-resolution media to non-purchasers, per §15) and conversion-optimizing details like the optional teaser strip — both already specified.

### 3–8. User Journey / UX Flow / UI Layout / Component Breakdown / Functional Behaviour / State Management
Carried forward from the predecessor Frontend Design Specification's Module 5.0 in full — that module's frontend-layer detail (blur treatment, unlock modal, teaser strip, unblur animation, insufficient-balance redirect into C2's top-up flow) is already complete and is incorporated here by reference rather than restated, since this Part's purpose is to add the backend/ledger/security/testing layers the earlier document didn't cover.

### 9. Business Rules
A PPV item's price is set by the creator within platform min/max bounds (same config source as C1's tier bounds). A subscriber and a non-subscriber pay the identical PPV price for the same item — subscription status does not discount PPV pricing by default (a creator may choose to mark specific items "included with Tier X," which is a distinct content-visibility rule owned by B5/C1, not a PPV discount mechanic). An unlock, once purchased, is permanent for that fan regardless of later unsubscribing — access to already-purchased PPV items is not revocable by a subsequent subscription cancellation, since it was never subscription-gated in the first place.

### 10. Data Requirements
**Unlock entity:** `id`, `fanId`, `postId`, `priceCentsPaidEquivalent (Coins amount at time of purchase, for historical accuracy even if pricing later changes)`, `unlockedAt`. A `posts` row with `visibility: ppv` carries its own `priceCoins` field (Appendix K2).

### 11. Backend Integration
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `POST /v1/media/:postId/unlock` | POST | Access token, Idempotency-Key | Calls C2's `debitAndCredit` internally; returns the now-unlocked `fullMediaUrl` only on success |
| `GET /v1/media/:postId` | GET | Access token | Returns `previewUrl` only, plus `locked: true/false` per viewer, never `fullMediaUrl` for a non-entitled viewer — restated as a hard contract requirement, not a UI convention, per B1 §9 |

### 12. Database Dependencies
**Entities:** `unlocks`, plus the `ledger_entries` rows C2 writes for every unlock. **Indexes:** `unlocks.fanId + postId` (unique — prevents double-charging for a re-tap on an already-unlocked item; the unlock endpoint checks this first and returns the existing unlock's media immediately, free, rather than attempting a second charge). **Ownership:** `unlocks` rows are permanent and never cascade-deleted even if the underlying post is later deleted by the creator (the fan's proof-of-purchase and the platform's revenue record both survive independent of the content's current existence — the media file itself may be retained or tombstoned per a separate content-retention policy, but the transaction record is not).

### 13. Cross-Module Dependencies

**Receives from:** C2 (the `debitAndCredit` engine this module's unlock endpoint calls internally).
**Hands off to:** B1, B5, D1 (all three render `LockedMediaCard` against this module's unlock-state data).
**Breaks if changed:** altering the unlock-state contract breaks entitlement checks in all three consuming modules simultaneously.

### 14. Error Handling
| Scenario | Behavior |
|---|---|
| Insufficient balance | `402 INSUFFICIENT_BALANCE` → inline redirect into C2's top-up sheet, returning to this same unlock confirmation on completion (predecessor doc's specified flow, restated as a hard contract). |
| Re-unlock attempt on already-owned content | No charge attempted; the existing unlock's `fullMediaUrl` is returned immediately (idempotent-by-business-logic, not just by idempotency-key). |
| Post deleted by creator after purchase, before a later re-access | Fan retains access to their own cached/downloaded copy where applicable; a fresh fetch returns a "this creator removed this content" state rather than the media, since the platform cannot serve a file the creator has withdrawn, but the `Unlock` ledger record and the fan's payment remain valid and are never refunded solely due to creator-initiated deletion (a distinct scenario from a moderation-driven removal, which may trigger a refund per G1's policy). |

### 15. Security
Full-resolution media URLs are generated and returned only within the successful unlock response itself, are signed and short-lived, and are never embedded in any feed/profile/chat payload ahead of purchase — restated as the module's single most important security invariant, verified by an automated payload-inspection test (§19).

### 16. Accessibility
Carried forward from the predecessor document's Module 5.0 §accessibility notes (aria-label conveys locked state and price; focus management on the unlock modal).

### 17. Performance
Signed URL generation adds negligible latency to the unlock response; the blur-rendering performance concern (heavy CSS backdrop-filter on low-end devices) is a frontend concern already addressed in the predecessor document and carried forward unchanged.

### 18. Analytics
**Events:** `content_unlock_viewed {postId, priceCoins}`, `content_unlocked {postId, priceCoins}`, `content_unlock_failed {reason}`. **Funnel:** view→unlock conversion rate is tracked per-post, giving creators (via F2) direct signal on which content and which price points convert best.

### 19. Testing
Includes an automated test that inspects every API response payload across B1/B5/D1 for the presence of `fullMediaUrl` on any item where the requesting test-user is not entitled — this specific test is treated as a release-blocking check given the severity of a leak here, not an optional nice-to-have test case.

### 20. Future Enhancements
Time-limited unlock discounts (creator-initiated flash pricing on an existing PPV item) as a re-engagement tool for content that stopped converting at its original price.

### 21. Tech Stack

- **Frontend:** `LockedMediaCard` (Appendix K3, the most-reused component in the product) renders the blur/padlock/price treatment carried forward from the predecessor Frontend Design Specification's Module 5.0; TanStack Query drives the insufficient-balance redirect into C2's top-up sheet (§4).
- **Backend:** NestJS media-gating module fronting `POST /v1/media/:postId/unlock`, which calls C2's `debitAndCredit` internally and never returns `fullMediaUrl` to a non-entitled viewer (§11, §15).
- **Third-party services:** the payment processor, reached only indirectly via C2's shared `debitAndCredit` path — this module has no direct third-party dependency of its own.
- **Data layer:** S3-compatible object storage behind a CDN, serving `fullMediaUrl` only as a signed, short-lived URL generated at the moment of a successful unlock (§15); PostgreSQL's `unlocks` table (unique on `fanId + postId`, §12) is the entitlement source of truth that signed-URL issuance checks against.

---

## Module C4 — Tipping & Gifting

**Dependencies:** C2, and (for live-context gifting) Part E · **Produced Events:** `tip_sent`, `gift_sent`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking core revenue mechanism, with added real-time complexity in the live-streaming context.

### 1. Overview
**Purpose:** Spontaneous, in-the-moment monetary support, in chat/on posts (tips) or during live streams (gifts, rendered by E2). **Revenue Impact:** highest-velocity, most impulse-driven revenue category — Tango/BIGO/Chaturbate's entire business model centers on this category during live sessions specifically.

### 2. Feature Description
Carried forward from the predecessor document's Module 6.1 in full, including the Chaturbate-style creator-defined tip menu and goal-bar mechanics (goal bars get their own full module here, C5, given the depth this specification requires).

### 3–8. Journey/Flow/Layout/Components/Behaviour/State
As specified in the predecessor document's Module 6.1 — single-tap send for small amounts, confirm-step threshold for larger gifts, cost-proportional icon sizing.

### 9. Business Rules
A tip/gift is a debit-only-side transaction from the fan's perspective (no "item" is unlocked in return, distinguishing this from C3) — the creator-side credit is otherwise identical in mechanism to a PPV unlock's credit (same `debitAndCredit` call, `reason: tip` or `reason: gift`). Tips/gifts below a configurable threshold (default: no confirm step) vs. above it (confirm required) is a platform-wide config value, not hardcoded per the predecessor document's flagged open risk — product/legal jointly own this threshold given the direct tension between impulse-spend conversion and consumer-protection exposure the predecessor document explicitly called out.

### 10. Data Requirements
**Tip/Gift entity:** `id`, `fanId`, `creatorId`, `amountCoins`, `context (enum: chat | post | live)`, `giftCatalogItemId (nullable — null for a free-text tip amount, populated for a catalog gift)`, `createdAt`.

### 11. Backend Integration
`GET /v1/gifts/catalog`, `POST /v1/gifts/send { recipientId, giftCatalogItemId | amountCoins, context, contextId }` — internally calls C2's `debitAndCredit`; in a live context (`context: live`), additionally emits the websocket event Part E2 consumes for the on-screen animation.

### 12. Database Dependencies
`tips_gifts`, `gift_catalog_items` (creator-configurable tip-menu entries, per predecessor doc §Key UI/UX Patterns). Indexes: `tips_gifts.creatorId + createdAt` (for F1/F2 earnings-by-source breakdowns and leaderboard queries).

### 13. Cross-Module Dependencies

**Receives from:** C2 (the `debitAndCredit` engine every tip/gift send calls) and, for live context, Part E's real-time infrastructure.
**Hands off to:** E2 (live rendering via the shared websocket event), F1 (earnings breakdown), F2 (top-fans/top-gifters analytics).
**Breaks if changed:** altering the tip/gift event payload shape would break E2's live-overlay rendering and F1/F2's earnings and leaderboard aggregation simultaneously, since all three consume this module's event stream directly.

### 14. Error Handling
Insufficient balance → same C2 top-up redirect pattern as C3. Send-to-self attempted (a creator tipping their own alt account, a fraud pattern) → blocked server-side and flagged to G2's fraud engine, not merely disallowed silently.

### 15. Security
Send-to-self and rapid-fire self-dealing patterns (a small number of fan accounts repeatedly gifting one creator in a way that matches known fraud signatures) are monitored by G2, not this module directly, but this module is required to emit the event stream (§18) G2 consumes.

### 16. Accessibility
Carried forward from predecessor document Module 6.1.

### 17. Performance
Live-context gift sends must complete (debit + websocket emit) within a low enough latency to feel real-time during a live stream — this module's live-context path is held to Part E's overall live-latency budget, not treated as a generic API call.

### 18. Analytics
**Events:** `tip_sent {amountCoins, context}`, `gift_sent {giftCatalogItemId, context}`. **KPIs:** average tip size, gifts-per-live-viewer-hour, top-gifter concentration (what % of gift revenue comes from the top 1% of spenders — a figure worth watching both commercially and from a consumer-protection standpoint).

### 19. Testing
Load test specifically simulating a viral live-stream gifting burst (shared with C2 §19's load test scenario). Edge case: gift sent to a creator who goes offline/ends stream in the same instant (must still process the transaction; the live-overlay rendering in E2 may simply have nothing to animate against, which is an E2 concern, not a reason to fail the underlying financial transaction).

### 20. Future Enhancements
Recurring/scheduled tips (a fan opts into a standing weekly tip, distinct from a subscription since it carries no content-access entitlement).

### 21. Tech Stack

- **Frontend:** single-tap/confirm-threshold send UI carried forward from the predecessor document's Module 6.1 (Appendix K3 components); in a live context the client subscribes to the same WebSocket channel Part E2's live room uses to render on-screen gift animations.
- **Backend:** NestJS gifting module exposing `POST /v1/gifts/send`, which calls C2's `debitAndCredit` and, for `context: live`, additionally emits over a Socket.IO gateway shared with Part E2's live-room infrastructure so the debit and the live animation trigger from one request (§11, §17).
- **Third-party services:** none beyond C2's payment-processor dependency; live-context delivery relies on Redis Pub/Sub (shared with Part E) to fan the gift/tip event out to every connected viewer of that stream.
- **Data layer:** PostgreSQL `tips_gifts` and `gift_catalog_items` tables (§12), indexed on `creatorId + createdAt` for F1/F2 earnings and leaderboard queries; Redis carries the low-latency live-event fan-out, not the transaction record itself.

---

## Module C5 — Creator Goals

**Dependencies:** C4 · **Produced Events:** `goal_created`, `goal_progress_updated`, `goal_completed`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — an enhancement layered on top of C4's tipping/gifting, not required for launch, with moderate implementation complexity.

### 1–2. Overview / Feature Description
**Purpose:** A creator-set fundraising target (e.g. "200 more Coins to unlock the next song") displayed as a progress bar, driving burst tipping near the goal threshold — a pattern proven on Chaturbate and adapted here for both live and non-live contexts. **Revenue Impact:** measurably increases tip volume in the window immediately before a goal completes, per the well-documented "almost there" psychological effect this pattern relies on across every platform that implements it.

### 3–8. Journey/Flow/Layout/Components/Behaviour/State
A creator sets a goal (target Coins amount + a description of the reward) from Creator Studio; it renders as a `GoalProgressBar` wherever the creator's tipping surface appears (their profile, live stream). Every qualifying tip (`context` matching the goal's scope) increments progress in real time where the surface is live (E2) or on next load where it isn't (B5). On completion, a celebratory state plays and the goal is archived (visible in history, not deleted).

### 9. Business Rules
A creator may have at most one *active* goal per context (profile vs. live) at a time — multiple simultaneous goals in the same context would dilute the psychological "almost there" effect this feature depends on and add UI clutter. Goal progress only counts tips/gifts explicitly tagged to that goal by the fan's client at send-time (an ambient/untagged tip does not silently count toward an active goal — the fan should always know, at the moment of tipping, whether their tip is being counted toward a specific visible goal).

### 10. Data Requirements
**Goal entity:** `id`, `creatorId`, `context (enum: profile | live)`, `targetCoins`, `currentCoins (denormalized running total, reconciled against tagged `tips_gifts` rows)`, `description`, `status (enum: active | completed | cancelled)`, `createdAt`, `completedAt`.

### 11. Backend Integration
`POST /v1/goals`, `GET /v1/goals/active?creatorId=`, tip/gift send (C4) accepts an optional `goalId` to tag toward.

### 12. Database Dependencies
`goals`. Index: `goals.creatorId + status` (at-most-one-active-goal enforcement).

### 13. Cross-Module Dependencies

**Receives from:** C4 (tip/gift events tagged with a `goalId`).
**Hands off to:** E2 (live progress-bar rendering), B5 (profile-context progress bar), F2 (goal-completion analytics).
**Breaks if changed:** altering the goal-progress event shape or the `Goal` entity's `status` enum would break both E2's live rendering and B5's profile display, since both read this module's progress state directly.

### 14. Error Handling
Goal target reached exactly by a tip that also exceeds it (overshoot) → the full tip amount is still credited to the creator (never capped/refunded at the goal boundary) — the goal simply marks complete; goal completion and payment processing are independent concerns.

### 15. Security
Goal creation/editing is creator-role-restricted and rate-limited to prevent spammy goal creation/cancellation cycling.

### 16. Accessibility
Progress is announced as a percentage/fraction via aria-live, not conveyed only by bar fill, per the predecessor document's Module 6.1 pattern extended here.

### 17. Performance
Live-context goal updates ride the same websocket channel as E2's gift events, avoiding a separate polling mechanism.

### 18. Analytics
**Events:** `goal_created`, `goal_progress_updated {percentComplete}`, `goal_completed {timeToComplete}`. **KPI:** tip-volume lift in the 10 minutes preceding goal completion vs. the creator's baseline tip rate — the specific metric that validates or invalidates this feature's ROI for a given creator.

### 19. Testing
E2E: goal reaches 100% mid-live-stream and the celebratory state renders correctly for all concurrent viewers via the shared websocket event. Edge case: creator cancels a goal mid-progress (already-tagged tips remain valid transactions; only the goal's own display/tracking is cancelled).

### 20. Future Enhancements
Recurring/templated goals (a creator's standing weekly goal that auto-resets) once usage data shows demand.

### 21. Tech Stack

- **Frontend:** `GoalProgressBar` (Appendix K3) rendered on both B5's profile surface and E2's live overlay; it updates over the same real-time channel C4 uses for live gift events, and refreshes on next TanStack Query fetch when the surface isn't live (§7, §17).
- **Backend:** NestJS goals module exposing `POST /v1/goals` and `GET /v1/goals/active`; goal progress is incremented as a side effect of C4's tip/gift send when a `goalId` is tagged (§11).
- **Third-party services:** none directly — this module rides entirely on C2/C4's existing payment and event infrastructure.
- **Data layer:** PostgreSQL `goals` table (§12) with `currentCoins` denormalized and reconciled against tagged `tips_gifts` rows; the same Redis Pub/Sub channel as C4 carries live progress updates.

---

## Module C6 — Referral Rewards & Promotional Credits

**Dependencies:** C2, A1 · **Produced Events:** `referral_link_shared`, `referral_signup_attributed`, `promotional_credit_granted`
**Priority:** [🟢 LOW PRIORITY]{custom-style="Priority Low"} — a growth-loop feature that can safely wait past launch, with low-to-moderate implementation complexity.

### 1–2. Overview / Feature Description
**Purpose:** Growth-loop incentive (existing users refer new users, both sides receive a Coins bonus on the new user's first qualifying purchase) plus a general-purpose promotional-credit mechanism (marketing campaigns, customer-support goodwill grants, A/B test incentives). **Business Goal:** lower blended customer acquisition cost via a referral loop with a built-in fraud-resistance model (reward is tied to the referred user's first *purchase*, not merely signup, which is the standard defense against fake-referral farming).

### 3. User Journey
User shares a personal referral link/code (from Settings, J1) → a new user signs up via that link (attribution captured at A1's signup call via a referral-code parameter) → when the new user completes their first qualifying purchase (any C1/C2/C3/C4 spend above a minimum threshold), both the referrer and the referred user receive a promotional-Coins grant, delivered as a distinct `PromotionalCredit` ledger entry, with a notification (Part I1) to both.

### 4–8. Flow/Layout/Components/Behaviour/State
A simple Settings-surfaced share sheet (native OS share) for the referral link; a "Rewards" list showing pending/earned referral bonuses. No live/real-time surface.

### 9. Business Rules
A referral reward is granted exactly once per referred-user, attributed to whichever referral code was present at that user's original signup (not overridable by a later-applied code). Reward issuance requires the referred user's first qualifying purchase to survive the standard chargeback/refund window before being treated as final (a purchase that's later reversed does not retroactively claw back an already-spent promotional credit, but does prevent the reward from being granted in the first place if the reversal happens before the grant would have fired). Promotional credits are modeled as their own `LedgerEntry.reason: promotional_credit` — distinct from a real-money Coins purchase — so financial reporting (F1, H4) can always separate real GPV from promotional grants.

### 10. Data Requirements
**Referral entity:** `id`, `referrerId`, `referredUserId`, `referralCode`, `attributedAt (signup time)`, `qualifyingPurchaseId (nullable until fulfilled)`, `rewardGrantedAt (nullable)`. **PromotionalCredit entity:** `id`, `userId`, `amountCoins`, `sourceType (enum: referral | marketing_campaign | support_goodwill | ab_test)`, `sourceReferenceId`, `grantedBy (system or an admin userId, per H4)`, `createdAt`.

### 11. Backend Integration
`GET /v1/referrals/my-code`, `GET /v1/referrals/history`, internal `grantPromotionalCredit(userId, amountCoins, sourceType, sourceReferenceId)` (called by this module's own referral-fulfillment job and, separately, by H4's admin tooling for support-goodwill grants — the function itself is shared, the callers are distinct).

### 12. Database Dependencies
`referrals`, `promotional_credits`, plus the `ledger_entries` rows written for every grant. Index: `referrals.referredUserId` (unique — one attributed referrer per new user).

### 13. Cross-Module Dependencies

**Receives from:** A1 (referral-code attribution captured at signup) and C2 (the grant mechanism this module's fulfillment job calls).
**Hands off to:** F1/H4 (reporting must separate promotional from real GPV, restated).
**Breaks if changed:** altering the `Referral` or `PromotionalCredit` entity shape would break F1/H4's real-vs-promotional GPV separation, which depends on `LedgerEntry.reason: promotional_credit` being reliably distinguishable.

### 14. Error Handling
Referral code invalid/expired at signup → signup proceeds normally with no attribution, never blocked — a broken referral code must never be allowed to break onboarding itself. Duplicate/self-referral attempt (a user referring their own second account) → blocked and flagged to G2 if the fraud engine's device/identity signals indicate a match.

### 15. Security
Self-referral and multi-accounting abuse of this system is a direct, well-understood fraud vector across the industry; G2's fraud engine specifically monitors referral-reward patterns (shared device fingerprints, shared payment methods across "unrelated" referrer/referred pairs) as one of its standing detection rules.

### 16. Accessibility
Standard form/list accessibility; no unique concerns beyond the baseline.

### 17. Performance
Referral attribution is a lightweight write at signup time with negligible latency impact on A1's critical path.

### 18. Analytics
**Events:** `referral_link_shared {channel}`, `referral_signup_attributed`, `referral_reward_granted`. **KPI:** referral-driven signup percentage of total signups, referral-to-qualifying-purchase conversion rate, blended CAC impact.

### 19. Testing
Fraud-simulation test: shared-device self-referral is correctly flagged and reward withheld. Edge case: referred user's qualifying purchase is refunded within the chargeback window before reward grant — reward must not fire.

### 20. Future Enhancements
Tiered referral rewards (bigger bonus for referring a user who becomes a paying subscriber vs. a one-off PPV buyer); creator-specific referral programs (a creator's own fans refer new subscribers to that specific creator).

### 21. Tech Stack

- **Frontend:** a Settings-surfaced native OS share sheet for the referral link plus a simple "Rewards" list (Appendix K3); no live/real-time surface.
- **Backend:** NestJS referrals module exposing `GET /v1/referrals/my-code` and `/history`, and an internal `grantPromotionalCredit(...)` function called by both this module's fulfillment job and H4's admin tooling.
- **Third-party services:** none directly; attribution runs through A1's existing signup flow.
- **Data layer:** PostgreSQL `referrals` and `promotional_credits` tables (§12); each grant also writes a C2 `ledger_entries` row tagged `reason: promotional_credit` for reporting separation.

---

## Module C7 — Bonuses

**Dependencies:** C2, C6 (shares the `PromotionalCredit` mechanism) · **Produced Events:** `bonus_granted`
**Priority:** [🟢 LOW PRIORITY]{custom-style="Priority Low"} — a discretionary/promotional feature, safely deferrable past launch, with low implementation complexity.

### 1–2. Overview / Feature Description
**Purpose:** Platform-initiated, non-referral promotional Coins grants — a welcome bonus for new fans, a win-back bonus for lapsed users, a loyalty bonus for high-frequency spenders — as a distinct, admin-configurable campaign mechanism sharing C6's underlying `PromotionalCredit` data model but driven by platform rules/segments rather than user-to-user referral action.

### 3–8. Journey/Flow/Layout/Components/Behaviour/State
Bonuses are typically delivered as a notification (Part I1) plus a small in-app banner/badge on the wallet screen ("You have a $2 bonus — use it by [date]") rather than a dedicated screen of their own; claiming is automatic (credited directly) or a single-tap "claim" depending on the campaign's configuration in H4's admin tooling.

### 9. Business Rules
Every bonus grant is time-limited (has an expiry) and is spent before a user's regular purchased-Coins balance in any transaction (bonus-first spend ordering) so that promotional credit doesn't sit unused indefinitely while a user spends their own purchased Coins instead — this requires the `debitAndCredit` engine (C2) to be bonus-aware: `LedgerEntry` debits must specify which balance pool (bonus vs. purchased) they're drawing from, and the spend logic always exhausts unexpired bonus balance first.

### 10. Data Requirements
Extends C6's `PromotionalCredit` entity with `expiresAt` and `campaignId`; `CoinWallet` conceptually tracks a `bonusBalance` sub-total distinct from `purchasedBalance`, both summing to the total `balance` shown to the user (the user sees one number; the split is an internal spend-ordering detail, not a UI concern this module needs its own screen for, beyond perhaps a small "(includes $2 bonus)" annotation).

### 11. Backend Integration
`GET /v1/bonuses/available`, `POST /v1/bonuses/:id/claim` (for claim-required campaigns), internal `grantPromotionalCredit` (shared with C6, `sourceType: marketing_campaign`).

### 12. Database Dependencies
Extends `promotional_credits` (C6) with `expiresAt`, `campaignId`; a `campaigns` entity (owned by H4's admin tooling) defines segment-targeting rules this module's grant job reads.

### 13. Cross-Module Dependencies

**Receives from:** C2 (bonus-aware spend-ordering logic within `debitAndCredit`) and C6 (the shared `PromotionalCredit` entity and `grantPromotionalCredit` function this module extends).
**Hands off to:** H4 (campaign creation/management), F1/H4 (reporting separates bonus-funded GPV from real-money GPV, since bonus-funded spend is not incremental real revenue even though it appears as a normal transaction to the receiving creator — creators are still paid in real terms per Part F, the platform absorbs the bonus cost, not the creator).
**Breaks if changed:** altering the bonus-vs-purchased balance split or the `expiresAt`/`campaignId` fields would break C2's spend-ordering logic and H4's campaign reporting simultaneously.

### 14. Error Handling
Expired unclaimed bonus → silently removed from "available" list, no error state needed (an expired bonus is simply gone, not a failure state the user needs to be told about beyond perhaps a "your bonus expired" notification if product chooses to send one).

### 15. Security
Bonus-grant campaigns are admin-role-restricted to create (H4) and are rate/budget-capped per campaign to prevent a misconfiguration from issuing unbounded promotional liability.

### 16. Accessibility
Standard notification/banner accessibility; bonus expiry is stated as plain text/date, never conveyed by urgency-styling alone.

### 17. Performance
Bonus-balance-aware spend ordering adds one additional lookup to C2's debit logic; negligible at the transaction volumes discussed in C2 §17's load-test scenarios.

### 18. Analytics
**Events:** `bonus_granted {campaignId, amountCoins}`, `bonus_claimed`, `bonus_expired_unused`, `bonus_spent {amountCoins}`. **KPI:** bonus-to-real-purchase conversion lift (do users who receive a bonus go on to make a real purchase at a higher rate than a matched control group who didn't) — this is the metric that justifies the promotional spend, tracked per campaign in H4/H5's reporting.

### 19. Testing
Unit: spend-ordering logic correctly exhausts bonus balance before purchased balance across a multi-transaction sequence. Edge case: a spend amount exceeds the remaining bonus balance (must correctly split the debit across bonus + purchased balance in one atomic transaction, recorded as such in the ledger for accurate reporting).

### 20. Future Enhancements
Segment-triggered automated bonus campaigns (e.g., an automatic small win-back bonus triggered by 14 days of inactivity) once the campaign-management tooling in H4 supports rule-based automation rather than only manually-launched campaigns.

### 21. Tech Stack

- **Frontend:** a wallet-screen banner/badge plus an optional single-tap claim action (Appendix K3); no dedicated screen.
- **Backend:** NestJS bonuses module exposing `GET /v1/bonuses/available` and `POST /v1/bonuses/:id/claim`, sharing C6's `grantPromotionalCredit` function and extending C2's `debitAndCredit` with bonus-aware, bonus-first spend ordering (§9, §11).
- **Third-party services:** none directly; campaign targeting rules are authored in H4's admin tooling.
- **Data layer:** PostgreSQL extends C6's `promotional_credits` table with `expiresAt`/`campaignId`, and `CoinWallet` tracks a `bonusBalance` sub-total distinct from `purchasedBalance` (§10, §12).



\newpage


# Part D — Messaging & Paid Calls

---

## Module D1 — Direct Messaging (Transactional Chat)

**Dependencies:** A2, C2, C3 (reuses `LockedMediaCard`) · **Consumed Services:** Real-time messaging infra (Socket.io or managed provider)
**Produced Events:** `message_sent`, `message_read`, `locked_message_unlocked`
**Shared Components:** `ChatThreadView`, `MessageBubble`, `LockedMediaCard` (reused verbatim from C3)
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking core retention/monetization surface; real-time complexity (WebSocket delivery, offline queueing) makes this both urgent and non-trivial to build.

### 1. Overview
**Purpose:** Direct fan-creator communication with embedded monetization (locked media messages, inline tips). **Business Goal:** a second major PPV surface beyond the profile grid — many creators' highest-value content is sold via DM specifically because of its personalized, requested-by-name framing. **User Goal:** a familiar messaging experience that doesn't feel transactional at every turn, with monetized moments clearly and fairly marked. **Revenue Impact:** typically a top-3 GPV category (subscriptions, PPV, DM-sold content) on comparable platforms. **Success Metrics:** message-to-purchase conversion rate, average revenue per active conversation, response-time (creator side, since a slow creator response measurably reduces conversion on a warm, in-context sale).

### 2. Feature Description
**Competitor analysis:** OnlyFans and Passes both prove the "familiar chat shell plus embedded commerce" pattern at scale. Passes' emphasis on paid DMs and group chats as a CRM-style tool for creators managing many fans simultaneously is a specific improvement worth adopting — our D2 (Mass Messaging) is this platform's answer to that same need, kept as a distinct module rather than bolted onto D1 so the one-to-one and one-to-many mental models stay clean and don't get confused in the UI. Telegram/Discord validate that a chat product can support rich embedded content types (media, forwarded content, bots/commands) without the shell itself feeling cluttered — the discipline of "one consistent bubble shape per content type" from those products is applied here.

### 3. User Journey
Open thread list → select/open a thread → paginated history loads upward → compose text/media/gift → creator (composing) can toggle "lock this message" before sending, entering a price → recipient sees a `LockedMediaCard`-style bubble inline → tap to unlock via the identical C3 flow used everywhere else in the product → unlocked content displays permanently in that message's place, in-thread, from then on.

### 4. UX Flow
Two-pane (list + thread) on desktop; single-pane stack (list → thread → back) on mobile. Deep link: a push notification for a new message opens directly to that thread, scrolled to the new message.

### 5. UI Layout
Standard bubble-thread layout (creator left, own messages right); composer bar with text field + attach-media + gift-button (C4) + creator-only price-lock toggle.

### 6. Component Breakdown
`ChatThreadList`, `ChatThreadView`, `MessageBubble`, `LockedMessageBubble` (thin wrapper around `LockedMediaCard`), `ChatComposer`, `PriceLockToggle` (creator-only), `TypingIndicator`.

### 7. Functional Behaviour
Sending a priced message creates a `posts`-equivalent row scoped to that message (a `visibility: ppv, context: dm` content item, reusing C3's unlock mechanism against a message-scoped content ID rather than a feed-post ID) — this reuse means D1 does not reimplement any unlock/payment logic, it only reimplements the *bubble presentation* of an otherwise-identical C3 flow. Typing indicators and read receipts are pushed via websocket, not polled.

### 8. State Management
Loading: paginated history uses the shared `InfiniteScrollLoader` (B1 §6). Offline: composed-but-unsent messages queue locally and auto-send on reconnect, shown with a distinct "sending..." bubble state in the meantime, never silently lost. Real-time: new messages, typing indicators, and read receipts are all websocket-pushed.

### 9. Business Rules
A creator may configure whether DMs are open to all fans, subscribers-only, or closed entirely (surfaced as the Message button's visibility on B5) — enforced server-side on thread-creation, not merely hidden client-side. Mass-messaged content (D2) appears as an ordinary message within the normal per-fan thread, indistinguishable in the UI from a one-to-one message except that it may be sent to many threads simultaneously by the backend fan-out job.

### 10. Data Requirements
**Thread entity:** `id`, `fanId`, `creatorId`, `lastMessageAt`. **Message entity:** `id`, `threadId`, `senderId`, `type (enum: text | media | locked_media | gift_notification)`, `content`, `priceCoins (nullable)`, `unlockId (nullable, references C3's Unlock entity once purchased)`, `createdAt`, `readAt (nullable)`.

### 11. Backend Integration
`GET /v1/messages/threads`, `GET /v1/messages/:threadId?cursor=`, `POST /v1/messages/:threadId { type, content, priceCoins? }`, websocket channel per thread for delivery/typing/read-receipts. Locked-message unlock reuses `POST /v1/media/:contentId/unlock` (C3) with a `context: dm` content reference.

### 12. Database Dependencies
`threads`, `messages`. Indexes: `threads.fanId + creatorId` (unique — one thread per pair), `messages.threadId + createdAt` (paginated history). Soft delete: a deleted message is tombstoned (`deletedAt` + content redacted from normal reads) but retained per Master Index §2.4, since a message can be the subject of a dispute or report (G1).

### 13. Cross-Module Dependencies

**Receives from:** A2 (verification status gating access to messaging, same as any content surface); C2/C3 (the payment and unlock mechanics powering priced/locked messages); C4 (the inline gift button embedded in the composer).
**Hands off to:** D2 (fan-out messages land as ordinary rows in this module's threads), G1 (messages are a report/moderation target), F1 (DM revenue rolls into the creator earnings breakdown).
**Breaks if changed:** altering the `Message` entity shape (e.g. the `type`/`priceCoins`/`unlockId` fields) breaks D2's fan-out — which writes directly into this same table — and F1's DM-revenue rollup at the same time, since both read this schema without translation.

### 14. Error Handling
Message send fails (network) → queued-and-retried per §8, never silently dropped. Unlock-within-DM fails (insufficient balance) → identical C2 top-up redirect as every other unlock surface. Recipient has blocked sender (G1) → send is rejected client-visibly ("You can't message this user") rather than silently swallowed, which would be more confusing than a clear explanation.

### 15. Security
Message content is never rendered unescaped (XSS defense, same principle as A3 §15 applied to a much higher-volume, more adversarial-input surface). Locked-media unlock within DM enforces the identical entitlement/URL-leak protections as C3 §15 — a DM is not a lower-security context than the feed.

### 16. Accessibility
Bubbles use semantic list structure for screen-reader navigation; locked bubbles announce the same "locked, unlock for $X" pattern as C3.

### 17. Performance
Real-time delivery degrades gracefully to polling if the websocket connection drops (predecessor document's flagged requirement, restated as a hard contract here) rather than silently failing to show new messages.

### 18. Analytics
**Events:** `thread_opened`, `message_sent {type, priceCoins?}`, `locked_message_unlocked {priceCoins}`. **KPI:** message-to-purchase conversion rate, creator response-time distribution (surfaced back to creators via F2 as an actionable metric, since faster response times are within a creator's direct control and demonstrably affect conversion).

### 19. Testing
E2E: full price-locked message send → recipient sees locked bubble → unlock → permanent unlocked display on subsequent thread loads. Edge case: sender and recipient simultaneously view/mark-read the same message (read-receipt race, must not duplicate or lose the read state).

### 20. Future Enhancements
Voice notes; disappearing/self-destructing messages as a premium DM feature.

### 21. Tech Stack

- **Frontend:** React Native (Expo) `ChatThreadList`/`ChatThreadView`/`MessageBubble`/`ChatComposer` screens (§6), with TanStack Query driving the paginated `InfiniteScrollLoader` history fetch (§8) and Zustand holding the active thread's live websocket/typing state; composed-but-unsent messages queue in local state and auto-flush on reconnect.
- **Backend:** NestJS messaging module exposing the `/v1/messages/...` REST surface (§11) alongside a colocated Socket.IO gateway per thread — the real-time channel this module is built around — for message delivery, typing indicators, and read receipts.
- **Third-party services:** none of its own; locked-message pricing reuses C3's PPV-unlock flow and C2's wallet debit rather than integrating a separate payment provider.
- **Data layer:** PostgreSQL `threads`/`messages` tables (§10/§12) with the `threads.fanId+creatorId` and `messages.threadId+createdAt` indexes; Redis Pub/Sub fans new-message/typing/read-receipt events out across backend instances.

---

## Module D2 — Mass Messaging / Broadcast Tools (Creator Side)

**Dependencies:** D1, C3 · **Produced Events:** `broadcast_sent`, `broadcast_message_unlocked`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — a valuable creator growth tool but not required for launch; moderate complexity built as a thin fan-out layer on top of D1's already-existing thread/message infrastructure.

### 1–2. Overview / Feature Description
**Purpose:** Compose once, send to a filtered fan segment — the highest-leverage repeat-revenue tool for an established creator, converting existing relationships into PPV revenue without relying on discovery. Carried forward from the predecessor document's Module 7.1 at the frontend layer; this Part adds backend fan-out mechanics.

### 3–8. Journey/Flow/Layout/Components/Behaviour/State
As specified previously: segment-filter chips (All subscribers / specific tier / lapsed-30-days / custom), live recipient-count readout, hard confirm step showing exact count before dispatch.

### 9. Business Rules
A broadcast fans out as individual `Message` rows into each matching thread (D1) — recipients never see it as a distinct "broadcast inbox," preserving D1's one-thread-per-relationship model. Segment filters are evaluated at send-time, not cached from an earlier estimate — the exact recipient list is locked in at the moment of dispatch, and the confirmation count shown to the creator must match the actual fan-out count (a discrepancy here is a data-integrity bug worth its own monitoring alert, since it directly affects creator trust in the tool).

### 10. Data Requirements
**Broadcast entity:** `id`, `creatorId`, `segmentFilter (JSON)`, `messageContent`, `priceCoins (nullable)`, `recipientCountAtSend`, `sentAt`. Individual fan-out messages reference `broadcastId` for analytics rollup without changing D1's `Message` shape otherwise.

### 11. Backend Integration
`GET /v1/studio/segments/estimate?filter=`, `POST /v1/studio/broadcasts { segmentFilter, messageContent, priceCoins? }` — the fan-out itself runs as an asynchronous background job (not synchronous within the API call) for segments large enough that inline fan-out would time out the request; the creator sees the broadcast marked "sending" and then "sent to N fans" once the job completes.

### 12. Database Dependencies
`broadcasts`, plus the fan-out `messages` rows (D1). Index: `broadcasts.creatorId + sentAt` (for F2's broadcast-performance analytics).

### 13. Cross-Module Dependencies

**Receives from:** D1 (the thread/message schema this module fans messages into) and C3 (the PPV-unlock mechanism reused for priced broadcasts).
**Hands off to:** F2 (broadcast performance and revenue analytics).
**Breaks if changed:** since a broadcast is implemented as individual `messages` rows tagged with `broadcastId`, any change to D1's `Message` schema must be mirrored here, and any change to the `broadcastId` rollup field breaks F2's broadcast-performance analytics.

### 14. Error Handling
Fan-out job partially fails (some thread-writes fail mid-batch) → the job retries only the failed subset, tracked individually, so a creator never has a broadcast silently under-delivered without any record of the shortfall; F2's broadcast analytics reflect actual-delivered count, not just the count estimated at send-time.

### 15. Security
Segment-estimate and dispatch endpoints are creator-role-restricted and rate-limited (a creator blasting many large broadcasts in rapid succession is both a spam risk to fans and a fan-out infrastructure load concern).

### 16. Accessibility
Segment filters are checkboxes with clear labels; recipient-count updates are announced via aria-live.

### 17. Performance
Asynchronous fan-out (§11) is the key performance design decision — this module must never block the creator's UI on a potentially-slow full-segment write.

### 18. Analytics
**Events:** `broadcast_sent {segmentFilter, recipientCount, priceCoins}`, `broadcast_message_unlocked {broadcastId}`. **KPI:** revenue-per-broadcast, unlock rate by segment type (does "lapsed-30-days" targeting actually re-engage vs. "all subscribers" blasts — directly actionable for creators via F2).

### 19. Testing
Load test: fan-out job against a large (10,000+) recipient segment completes within an acceptable background-processing window and correctly records partial-failure retries. E2E: recipient count shown at confirm matches actual delivered count reported after send completes.

### 20. Future Enhancements
Scheduled/recurring broadcasts; A/B message variants sent to segment splits with performance comparison in F2.

### 21. Tech Stack

- **Frontend:** React Native segment-filter chips and live recipient-count readout (§3–8) built on the shared component library, with TanStack Query polling `GET /v1/studio/segments/estimate` for the live count shown before the hard confirm step.
- **Backend:** NestJS `studio` module exposing `POST /v1/studio/broadcasts` (§11); the fan-out itself runs as an asynchronous background job rather than inline in the request — a Redis-backed job queue (BullMQ-class) processes per-recipient writes and tracks partial-failure retries individually (§14), since this is fundamentally a queue-processing problem, not a synchronous request/response one.
- **Third-party services:** reuses C3's PPV-unlock mechanism for priced broadcasts; no messaging-specific third-party service beyond D1's real-time infrastructure, which the fan-out job writes into.
- **Data layer:** PostgreSQL `broadcasts` table plus the fan-out `messages` rows it writes into D1's schema (§10/§12), indexed on `broadcasts.creatorId + sentAt` for F2's rollups; Redis backs the fan-out job queue's per-recipient progress and retry state.

---

## Module D3 — Paid Calls (Voice/Video)

**Dependencies:** C2, A2 · **Consumed Services:** WebRTC SFU infrastructure (e.g. LiveKit/Agora, shared provider choice with Part E's multi-guest infra), Per-minute billing meter
**Produced Events:** `call_requested`, `call_started`, `call_ended`, `call_billed`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — not strictly launch-blocking, but pulled up from Medium because of genuinely high complexity (WebRTC session setup plus server-authoritative per-increment metered billing) that needs a long build lead time regardless of exact launch timing.

### 1. Overview
**Purpose:** Real-time, per-minute-billed 1:1 voice or video calls between a fan and creator — a premium, high-intimacy monetization surface distinct from asynchronous messaging. **Business Goal:** capture a high-willingness-to-pay use case (real-time personal attention) that neither subscriptions nor PPV addresses. **User Goal (fan):** request and pay for a call with clear, predictable per-minute pricing and no surprise charges. **User Goal (creator):** control availability and pricing, and be paid reliably for exactly the time delivered. **Revenue Impact:** typically a smaller-volume but very high-ARPU-per-transaction category. **Success Metrics:** call-request-to-accept rate, average call duration, per-minute price distribution, call-drop/technical-failure rate.

### 2. Feature Description
**Competitor analysis:** Passes explicitly offers paid video calls as a differentiator from OnlyFans' historically call-free model — validating demand for this category within the same broad platform type. Chaturbate's per-minute private-show billing (distinct feature, same billing *mechanism* — metered real-time consumption) is the closest architectural analog for how per-minute deduction should work, adapted here from a public/group-viewable private show to a strictly 1:1 call context.

### 3. User Journey
1. Fan taps "Request Call" on a creator's profile (visible only if the creator has enabled calls and set a per-minute rate) → sees the rate and an estimated cost for a typical call length → confirms request.
2. Creator receives a real-time call-request notification (accept/decline, with a countdown — an unanswered request auto-expires after a configurable window, e.g. 60 seconds) — no charge occurs at request time, only on the call actually connecting.
3. On accept, a WebRTC session establishes; per-minute billing begins at connection, not at request or ringing.
4. Live in-call UI shows an elapsed-time and running-cost counter to the fan at all times (never a surprise total at the end).
5. Either party can end the call at any time; billing stops immediately at end, rounded to the nearest billing increment (e.g. per-minute, with the partial final minute billed in full, or per-15-seconds if the platform chooses finer granularity — a config value, not hardcoded, so it can be tuned).
6. Post-call, both parties see a simple summary (duration, total cost/earned) in their respective histories.

### 4. UX Flow
Entry: creator profile (B5)'s "Request Call" affordance (only rendered if enabled). Exit: call end → summary screen → returns to the profile or wherever the request originated. No deep linking into an active call from outside the app (a call in progress is not a shareable/resumable link, for privacy and security reasons).

### 5. UI Layout
Request screen: rate + estimated cost, single confirm button. In-call: standard video-call chrome (self-view PiP, mute/camera-toggle, end-call button) plus a persistent, unobtrusive elapsed-time/running-cost readout — this cost transparency is the single most important UI element in the entire module given the real-time-metered-billing nature of the feature.

### 6. Component Breakdown
`CallRequestSheet`, `IncomingCallRequestBanner` (creator side, with accept/decline + countdown), `InCallView`, `RunningCostMeter`, `CallSummaryCard`.

### 7. Functional Behaviour
Billing runs as a server-side metering job tied to the WebRTC session's actual connected duration (not client-reported duration, which could be manipulated) — the meter debits the fan's `CoinWallet` via C2's `debitAndCredit` in fixed increments (e.g. every 15 seconds) throughout the call, rather than one lump charge at the end, so that a fan who runs low on balance mid-call is handled gracefully (§14) rather than accumulating an uncollectable debt.

### 8. State Management
Loading: connecting state after accept, before media streams establish. Failure: connection failure surfaces a clear retry option, with no charge having occurred if the call never actually connected. Real-time: the cost meter updates live throughout the call, driven by the same per-increment billing tick as the actual charge, so the displayed cost is never out of sync with what's actually being charged.

### 9. Business Rules
No call can begin billing before a WebRTC connection is confirmed established on both ends — a "ringing" or "connecting" period is always free. If a fan's balance is insufficient to cover the next billing increment mid-call, the call is gracefully ended by the system (not abruptly cut with no warning — a 10-second on-screen low-balance warning precedes the forced end, giving the fan a chance to top up via C2's inline flow without dropping the call, if they act in time). A creator's per-minute rate can only be changed between calls, never mid-call (the rate in effect at call start is locked for that call's entire duration, protecting the fan from a rate change surprise mid-conversation).

### 10. Data Requirements
**Call entity:** `id`, `fanId`, `creatorId`, `ratePerMinuteCoins (locked at call start)`, `status (enum: requested | accepted | declined | expired | active | ended)`, `connectedAt (nullable)`, `endedAt (nullable)`, `totalBilledCoins`, `endReason (enum: fan_ended | creator_ended | insufficient_balance | technical_failure)`.

### 11. Backend Integration
| Endpoint | Method | Notes |
|---|---|---|
| `POST /v1/calls/request` | POST | `{ creatorId }` — no charge |
| Websocket: `call.incoming` / `call.accepted` / `call.declined` / `call.expired` | — | Real-time signaling |
| `POST /v1/calls/:id/accept` \| `/decline` | POST | Creator-only |
| WebRTC signaling handled by the SFU provider's own SDK, brokered through the platform backend for auth | — | — |
| Internal metering job | — | Ticks every billing increment, calls C2's `debitAndCredit` with `reason: paid_call_minute` |
| `POST /v1/calls/:id/end` | POST | Either party |

### 12. Database Dependencies
**Entities:** `calls`, plus one `ledger_entries` row per billing increment (not one row for the whole call — this granularity matters for accurate mid-call insufficient-balance handling and for a fan being able to see exactly how a call's total was accumulated in their transaction history). Index: `calls.creatorId + status` (for the creator's incoming-request queue and call-history list).

### 13. Cross-Module Dependencies

**Receives from:** C2 (the `debitAndCredit` per-increment billing primitive), A2 (the verification gate applied identically to this paid feature), Part E (the shared WebRTC/SFU infrastructure choice, though calls and live multi-guest rooms remain otherwise functionally independent).
**Hands off to:** F1 (call revenue in the earnings breakdown), F2 (call analytics).
**Breaks if changed:** changing the billing-increment mechanism or the `Call` entity's `endReason`/`totalBilledCoins` fields breaks F1's revenue rollup and F2's call analytics; changing the SFU provider choice must stay coordinated with Part E since both modules share the same infrastructure contract.

### 14. Error Handling
| Scenario | Behavior |
|---|---|
| Fan's balance runs out mid-call | 10-second on-screen warning with an inline top-up option; call ends automatically if not resolved in time, `endReason: insufficient_balance`, billed only through the last fully-covered increment. |
| WebRTC connection drops unexpectedly (network failure, not either party ending) | `endReason: technical_failure`; the last billing increment is not charged if it wasn't fully delivered (billing is metered in arrears per completed increment, never charged in advance for time not yet delivered). |
| Creator doesn't respond to a request within the countdown | `status: expired`; fan is notified plainly, no charge occurred. |
| Both parties attempt to end the call simultaneously | Idempotent end-handling — the call ends once, cleanly, regardless of which end-request arrives first at the server. |

### 15. Security
Server-authoritative billing (metering tied to actual server-observed connection duration, never client-reported) is this module's core financial-integrity control, directly analogous to C2's "never trust the client for a balance-affecting figure" principle. Call signaling/media are end-to-end encrypted per the WebRTC provider's standard security model; call recording (if ever offered) would require explicit two-party consent captured before any recording begins — not implemented in this version, flagged under Future Enhancements given the significant legal complexity of consent-to-record rules varying by jurisdiction.

### 16. Accessibility
Running-cost meter is available as live-updating plain text, not only a visual counter; incoming-call-request banner supports both audio alert and full-screen visual presentation for accessibility.

### 17. Performance
Billing-increment granularity (§9) is chosen to balance metering accuracy against write-volume load on C2's ledger — a very fine granularity (e.g. per-second) would multiply ledger write volume substantially for limited accuracy benefit over a per-15-second increment.

### 18. Analytics
**Events:** `call_requested`, `call_accepted`, `call_declined`, `call_started`, `call_ended {durationSeconds, totalBilledCoins, endReason}`. **KPI:** request-to-accept rate (a low rate may indicate pricing or availability-signaling problems worth surfacing to creators via F2), average revenue per call, technical-failure rate (an infrastructure-health metric as much as a product one).

### 19. Testing
Integration: metering job correctly ticks and charges at the configured increment against a simulated long-running call; insufficient-balance mid-call correctly triggers the warning-then-graceful-end sequence without an uncollectable negative balance ever occurring (this is the module's most safety-critical test case, sharing C2's "balance never goes negative" invariant). E2E: full request→accept→connect→bill→end→summary lifecycle for both a fan-ended and creator-ended call. Edge case: creator declines while the fan's app is backgrounded (must still deliver the decline notification correctly on foreground).

### 20. Future Enhancements
Group/multi-fan paid calls (a creator hosting a small paid group call, distinct from Part E's broader multi-guest live-room concept); scheduled/bookable calls rather than only on-demand requests.

### 21. Tech Stack

- **Frontend:** React Native `CallRequestSheet`/`IncomingCallRequestBanner`/`InCallView`/`RunningCostMeter`/`CallSummaryCard` (§6), integrating the WebRTC SFU provider's client SDK for media, with Zustand driving the live elapsed-time/running-cost readout off the same per-increment billing ticks the server actually charges against — never a client-estimated figure.
- **Backend:** NestJS call-signaling module handling `/v1/calls/...` (§11) plus a Socket.IO channel for `call.incoming`/`call.accepted`/`call.declined`/`call.expired` signaling; a separate internal metering job — the centerpiece of this module's backend — ticks every billing increment and calls C2's `debitAndCredit` with `reason: paid_call_minute`, tied to server-observed connection duration rather than client-reported time.
- **Third-party services:** a managed WebRTC SFU (LiveKit primary, Agora/Mux Real-Time as alternates — the same provider choice as Part E's multi-guest infrastructure), brokered through the platform backend for auth per §11.
- **Data layer:** PostgreSQL `calls` table plus one `ledger_entries` row per billing increment (§12, deliberately fine-grained for accurate mid-call insufficient-balance handling), indexed on `calls.creatorId + status` for the creator's incoming-request queue and call-history list.



\newpage


# Part E — Live Streaming System

All six modules here share one live-room websocket channel and one WebRTC/low-latency streaming infrastructure choice — they are documented separately because each owns a distinct UI surface and rule set, not because they run on separate infrastructure.

---

## Module E1 — Live Stream Viewer Interface

**Dependencies:** A2, C2 · **Consumed Services:** Low-latency streaming provider (WebRTC or LL-HLS — e.g. LiveKit, Agora, Mux Real-Time)
**Produced Events:** `live_session_joined`, `live_session_left`, `live_session_ended`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking core product differentiator; high complexity given the low-latency WebRTC/LL-HLS streaming infrastructure this module requires.

### 1. Overview
**Purpose:** Base full-screen live viewing surface — join, view, leave — that E2–E5 layer their features on top of. **Business Goal:** live is the platform's highest-intensity monetization surface (gifting velocity during live sessions materially exceeds async tipping rates on every competitor studied); reliable, low-latency viewing is the precondition for that. **Revenue Impact:** indirect but foundational to E2/C4's gifting revenue. **Success Metrics:** join success rate, median join latency, concurrent-viewer capacity per stream, stream-abandonment rate in the first 10 seconds (a proxy for buffering/join-quality problems).

### 2. Feature Description
**Competitor analysis:** Tango/BIGO/TikTok LIVE all use full-bleed video with minimal chrome — validated, not reinvented here. The critical differentiator this specification calls out (predecessor document's flagged risk) is latency: standard HLS's 6–30 second delay meaningfully weakens the real-time gifting feedback loop E2 depends on, so this module mandates a WebRTC or low-latency-HLS provider specifically, not generic HLS, despite the added infrastructure complexity — this is a considered trade-off, not an oversight.

### 3. User Journey
Tap a live indicator (Stories ring B2, feed, profile) → join transition (brief, <2s target) → full-screen viewer mounts with E2–E5 layered in per that room's active features (PK battle, party room, or standard single-creator broadcast) → viewer count and LIVE badge visible throughout → stream ends → `LiveEndedCard` replaces video with a summary and follow-prompt.

### 4–6. UX Flow / UI Layout / Component Breakdown
Carried forward from the predecessor document's Module 8.0 — full-viewport player, minimal top bar (avatar/name, viewer count, LIVE badge, close), no scrubber controls (broadcast, not on-demand).

### 7. Functional Behaviour
Joining a room calls `POST /v1/live/:roomId/join`, which performs the same verification/ban-status access-control check as any content-serving endpoint before returning a playable session token — access control is checked at join time, not assumed from general app access.

### 8. State Management
Loading: brief branded loading transition, not a generic spinner, during the join handshake. Failure: join failure (room ended just before join completed, access denied) shows a specific reason, not a generic error. Real-time: viewer count and room-state updates stream continuously via the shared live-room websocket channel.

### 9. Business Rules
A stream can only be joined by verified accounts (A2) — enforced at `join`, not merely at general app-level gating, since a live room is a distinct access-controlled resource. A creator's stream automatically ends (and all viewers are gracefully disconnected with a clear reason) if the creator's account is suspended (G3) mid-broadcast.

### 10. Data Requirements
**LiveSession entity:** `id`, `creatorId`, `status (enum: live | ended)`, `startedAt`, `endedAt`, `peakViewerCount`, `roomMode (enum: standard | pk_battle | party_room)`.

### 11. Backend Integration
`POST /v1/live/:roomId/join`, `GET /v1/live/:roomId` (manifest/session token), websocket channel `live:{roomId}` for viewer-count/state events.

### 12. Database Dependencies
`live_sessions`. Index: `live_sessions.creatorId + status` (for "is this creator currently live" checks used by B2's live-ring indicator and B5's profile).

### 13. Cross-Module Dependencies

**Receives from:** verification/ban-status access control from A2, checked at `join` (§9); live-context ledger wiring from C2.
**Hands off to:** E2–E5, which all mount within this module's player; live-ring state to B2; profile live-indicator state to B5; live session revenue/analytics data to F1/F2; a session-end signal to G3 when a creator's suspension force-ends a broadcast mid-session.

### 14. Error Handling
Room ended between the join-tap and the join-request completing → clear "This stream just ended" state, not a broken player attempting to load a nonexistent manifest. Provider infrastructure outage → falls back to a "Live streaming is temporarily unavailable" platform-wide banner rather than a per-room error, since this class of failure is typically provider-wide, not room-specific.

### 15. Security
Join tokens are short-lived and scoped to one room/session, preventing a leaked token from granting standing access.

### 16. Accessibility
Viewer count/LIVE status announced on entry; pulsing LIVE badge dampens to static under reduced-motion.

### 17. Performance
Provider choice (WebRTC/LL-HLS) is the primary performance lever here — restated from §2, this is the module's single most consequential technical decision.

### 18. Analytics
**Events:** `live_session_joined {roomId, joinLatencyMs}`, `live_session_left {watchDurationSeconds}`, `live_session_ended`. **KPI:** join latency distribution, average watch duration, concurrent-peak-viewer trend per creator (a growth signal surfaced to creators via F2).

### 19. Testing
Load test: concurrent-join burst against a single popular stream (shared scenario class with C2/C4's gifting-burst load tests, since a viral moment triggers both simultaneously). E2E: stream ends while a viewer is actively watching → `LiveEndedCard` renders correctly rather than a frozen/broken player.

### 20. Future Enhancements
Multi-bitrate manual quality selection; DVR-style rewind for the last few minutes of a live session.

### 21. Tech Stack

- **Frontend:** React Native (Expo, bare workflow — required for native WebRTC module access) full-screen player built from the shared component library (Appendix K3); Zustand holds transient per-second room state (`viewerCount`, `roomMode`, join status), since state that updates every second doesn't belong in TanStack Query's cache.
- **Backend:** NestJS `live` module exposing `POST /v1/live/:roomId/join` and `GET /v1/live/:roomId`; the colocated Socket.IO gateway publishes viewer-count/state events on the shared `live:{roomId}` channel, fanned out across backend instances via Redis Pub/Sub.
- **Third-party services:** A managed low-latency WebRTC SFU (LiveKit as the primary reference choice, Agora or Mux Real-Time as alternates) — mandated over generic HLS specifically because standard HLS's 6–30 second delay would break the real-time gifting feedback loop E2 depends on (§2), this module's single most consequential technical decision.
- **Data layer:** PostgreSQL `live_sessions`, indexed on `creatorId + status` (§12) for the "is this creator currently live" checks B2/B5 depend on.

---

## Module E2 — Virtual Gift Overlay & Animation System

**Dependencies:** C4, E1 · **Produced Events:** `gift_animation_rendered`, `gift_animation_batched`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: this is the core live-monetization loop; moderate-to-high complexity from real-time animation queueing and circuit-breaker batching under load.

### 1–2. Overview / Feature Description
Carried forward from the predecessor document's Module 8.1 (value-tiered animation intensity, full-screen high-tier treatment with sender attribution, Z-index overlay layer) — this Part adds the event-consumption contract and batching/throttling rules needed to survive a viral gifting burst without crashing the client.

### 7. Functional Behaviour
Consumes the websocket `gift.sent` event (emitted by C4 §11 when `context: live`) and queues it through a `GiftAnimationQueue`. Above a configurable per-second event-rate threshold, the queue switches from individual animations to a batched summary rendering ("+47 roses") — this is a hard client-side circuit breaker, not merely an optimization, since unbounded individual-animation rendering during a viral moment is a proven way to crash or freeze the viewer's client (predecessor document's flagged risk, now specified as an enforced rule rather than a noted concern).

### 9. Business Rules
The batching threshold is a client-config value (not hardcoded), tunable without a release, since the right threshold depends on real-world device performance data gathered post-launch. Batching affects only the *animation rendering* — every individual gift is still billed and ledgered exactly once via C4/C2 regardless of whether it renders individually or as part of a batch summary; batching is purely a rendering-layer concern with zero financial-logic impact.

### 11. Backend Integration
No REST surface of its own; purely a consumer of C4's `gift.sent` websocket event stream, scoped per `roomId`.

### 13. Cross-Module Dependencies

**Receives from:** the `gift.sent` websocket event stream from C4, scoped per `roomId`; mounts within E1's live player.
**Hands off to:** nothing financial — this module is rendering-only by construction and cannot affect billing correctness even if it has a bug, a deliberate architectural isolation between "money movement" (C2/C4) and "money-triggered visual effects" (this module).

### 14. Error Handling
Animation asset fails to load → skip that specific animation silently (log for infra monitoring) rather than blocking the queue or crashing the render layer — a missed animation is a cosmetic miss, never a reason to fail anything financial.

### 17. Performance
The batching circuit-breaker (§7) is this module's primary performance safeguard, load-tested explicitly (§19) against the same viral-burst scenario class as C2/C4.

### 18. Analytics
**Events:** `gift_animation_rendered {tier}`, `gift_animation_batched {countBatched}`. Used to tune the batching threshold based on real device-performance telemetry post-launch, not just launch-time guesses.

### 19. Testing
Load test: inject a simulated burst of 500+ `gift.sent` events/second against a test client and verify the batching circuit-breaker engages and the client remains responsive (frame rate does not collapse) throughout.

### 20. Future Enhancements
Per-viewer animation-intensity preference (a "reduce gift animations" setting for viewers who find the full-screen high-tier treatment distracting, independent of the general reduced-motion accessibility setting).

### 21. Tech Stack

- **Frontend:** React Native `GiftAnimationQueue` overlay layer (Z-indexed above E1's player), driving value-tiered animation intensity from queued `gift.sent` events; Zustand tracks the current per-second event rate so the queue can flip between individual and batched ("+47 roses") rendering without triggering a re-render storm.
- **Backend:** No REST surface of its own (§11) — purely a consumer of C4's `gift.sent` event, delivered over the shared `live:{roomId}` Socket.IO channel and fanned out via Redis Pub/Sub; the batching threshold itself is a Redis-backed, remotely-tunable client-config value (§9), not a code constant.
- **Third-party services:** None beyond the CDN serving gift-animation sprite/asset bundles.
- **Data layer:** None — this module holds no persistent state of its own; every gift is still billed and ledgered exactly once via C2/C4 (§9) regardless of whether it renders individually or as part of a batch summary.

---

## Module E3 — High-Velocity Live Chat Overlay

**Dependencies:** E1 · **Produced Events:** `live_chat_message_sent`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: a live stream without chat is a materially incomplete product for this content category; moderate complexity.

Carried forward from the predecessor document's Module 8.2 (fading-transparency scrolling overlay, list virtualization). **Addition here:** server-side rate limiting per user (a chat-spam defense, distinct from the client-side rendering-performance virtualization already specified) — `POST /v1/live/:roomId/chat` is rate-limited to a configurable messages-per-minute ceiling per user, independent of the client's rendering throttle, since a determined spammer could otherwise bypass a client-only limit entirely.

**Data:** chat messages in a live room are ephemeral by design (not persisted beyond the session's own recent-message buffer used for reconnection/late-join catch-up) — unlike D1's permanent message history, live chat has no long-term storage requirement, which is a deliberate scope reduction versus treating it as "just another message type."

**Testing:** load test shared with E1/E2's viral-burst scenario; verify server-side rate limiting correctly throttles an abusive single-user message flood without affecting other users' messages in the same room.

### 13. Cross-Module Dependencies

**Receives from:** mounts within E1's live player (E1 is this module's sole declared dependency).
**Hands off to:** rendered chat messages to viewers within the same live room over the shared `live:{roomId}` websocket channel; unlike D1's messages, live chat data is not handed off to any persistent-storage-consuming module, since it is ephemeral by design.

### 21. Tech Stack

- **Frontend:** React Native fading-transparency scrolling overlay (carried forward from the predecessor document's Module 8.2) using list virtualization to keep frame rate stable in high-volume live rooms.
- **Backend:** NestJS `POST /v1/live/:roomId/chat` endpoint; the shared Socket.IO `live:{roomId}` gateway broadcasts messages to all room participants, with Redis-backed per-user token buckets enforcing the server-side messages-per-minute rate limit independent of the client's rendering throttle.
- **Third-party services:** None — chat is fully first-party, unlike any messaging stack requiring an outside provider.
- **Data layer:** No permanent storage — only an ephemeral recent-message buffer (Redis, TTL'd to the session) used for reconnection/late-join catch-up, a deliberate scope reduction versus D1's permanent PostgreSQL message history.

---

## Module E4 — PK Battle / Split-Screen Competition UI

**Dependencies:** E1, E2 · **Produced Events:** `pk_battle_started`, `pk_battle_score_updated`, `pk_battle_ended`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — a phase-3 engagement feature, pulled up from Low because synchronizing dual-stream state and competitive scoring is genuinely high-complexity work needing early planning.

Carried forward from the predecessor document's Module 8.3. **Backend addition:** battle score is computed server-side as a running sum of `gift.sent` events tagged with `battleSide` (a field C4's send endpoint accepts specifically when `context: live` and the room is in `pk_battle` mode) — the score is never client-computed or client-trusted, for the same integrity reasons as every other money-adjacent figure in this specification. **Business rule:** a battle's timer and winner determination are authoritative server-side; the client only renders the server-pushed state. **Testing:** verify simultaneous gifts to both sides during the final seconds of a battle resolve deterministically (no race condition in winner determination) via the same row-level-lock discipline C2 uses for wallet balances, applied here to the battle-score aggregate.

### 13. Cross-Module Dependencies

**Receives from:** mounts within E1's live player and reuses E2's gift-animation overlay for battle-side gifting; consumes `gift.sent` events tagged with `battleSide` from C4, accepted specifically when `context: live` and the room is in `pk_battle` mode.
**Hands off to:** authoritative, server-computed battle state (running score, timer, winner) to the client-side split-screen renderer — the client only renders what the server determines, never independently derives the outcome.
**Breaks if changed:** score integrity depends on the same row-level-lock discipline C2 uses for wallet balances, applied here to the battle-score aggregate — relaxing that locking discipline reintroduces the exact race condition (simultaneous late-battle gifts to both sides) this module's tests are designed to catch.

### 21. Tech Stack

- **Frontend:** React Native split-screen dual-stream renderer mounted inside E1's player, consuming server-pushed score/timer/winner state over the shared `live:{roomId}` channel; Zustand holds the live battle-score-per-side state client-side for the split-screen UI.
- **Backend:** NestJS PK-battle logic extending C4's gift-send path to accept and aggregate a `battleSide`-tagged running sum, guarded by the same row-level-lock discipline C2 applies to wallet balances to keep the score aggregate race-free.
- **Third-party services:** The same WebRTC SFU as E1, running two simultaneous publish/subscribe streams (one per side) rather than E1's single-stream case.
- **Data layer:** Battle-score aggregate and timer state live alongside the `live_sessions` record in PostgreSQL, row-locked during concurrent score updates exactly as C2's wallet-balance rows are.

---

## Module E5 — Multi-Guest / Party Room Grid

**Dependencies:** E1 · **Consumed Services:** WebRTC SFU (multi-party — a materially different infrastructure mode than E1's one-to-many broadcast path)
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — a phase-3 feature, pulled up from Low for the same reason as E4: multi-party WebRTC SFU grid layout is high-complexity work needing early planning.

Carried forward from the predecessor document's Module 8.4. **Backend addition:** seat-assignment state (`POST /v1/live/:roomId/seats/:seatId/join`) is authoritative server-side and conflict-resolved (two simultaneous join attempts on the same open seat must not both succeed) via the same optimistic-then-verify pattern used elsewhere, with the loser shown a graceful "that seat was just taken" state rather than a raw error. **Cross-module note:** explicitly scoped as separate infrastructure from E1's standard broadcast path (predecessor document's flagged risk, restated as an architectural decision here) — a party room is a genuinely different real-time topology (many-to-many) than a standard live broadcast (one-to-many), and should be budgeted, capacity-planned, and load-tested as such.

### 13. Cross-Module Dependencies

**Receives from:** mounts within E1's live player, but runs on a separate multi-party WebRTC SFU mode rather than E1's one-to-many broadcast path (see Consumed Services above).
**Hands off to:** authoritative, conflict-resolved seat-assignment state (via `POST /v1/live/:roomId/seats/:seatId/join`) to the client grid renderer.
**Breaks if changed:** must be budgeted, capacity-planned, and load-tested as its own infrastructure class, separate from E1 — a party room's many-to-many topology is genuinely different from a standard broadcast's one-to-many topology, and conflating the two was the predecessor document's flagged risk this module's separation explicitly addresses.

### 21. Tech Stack

- **Frontend:** React Native grid-layout renderer mounted inside E1's player, rendering N guest video tiles from the multi-party SFU session rather than E1's single full-bleed stream; Zustand tracks per-seat occupancy state for optimistic UI updates ahead of server confirmation.
- **Backend:** NestJS `POST /v1/live/:roomId/seats/:seatId/join` enforcing authoritative, conflict-resolved seat assignment via an optimistic-then-verify pattern, over the shared `live:{roomId}` Socket.IO channel.
- **Third-party services:** The same WebRTC SFU vendor as E1, but its multi-party mode — a materially different infrastructure/capacity-planning profile from E1's one-to-many broadcast path, per this module's Consumed Services line.
- **Data layer:** Seat-assignment state persisted alongside the `live_sessions` record in PostgreSQL, with conflict resolution guaranteeing a seat is never double-claimed.

---

## Module E6 — Creator Broadcast Tools

**Dependencies:** E1, A2, A3 (published profile required) · **Produced Events:** `broadcast_started`, `broadcast_stopped`, `broadcast_settings_changed`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: a creator cannot go live at all without at least the basic broadcast controls this module owns.

### 1. Overview
**Purpose:** The creator-side controls to start/stop a live session, configure its mode (standard/PK/party room), and manage in-session settings (mute a guest, end a PK battle early, kick a disruptive chat participant). Not present in the predecessor Frontend document, which specified only the viewer-side surfaces — this module closes that gap.

### 3. User Journey
Creator taps "Go Live" from Creator Studio → pre-flight check (camera/mic permission, connection-quality indicator) → configures title/mode → taps Start → session transitions to live, viewers can now join (E1) → in-session, creator has access to a control panel (mute-all-guests, moderate chat, end battle, view live viewer/gift stats) → taps End → session transitions to ended, summary shown (viewer peak, gift revenue, duration).

### 9. Business Rules
Only a `verificationStatus: approved` creator with a published profile (A3) can start a broadcast — enforced identically to publishing any other content. A creator cannot start a second concurrent live session while already live (one active `LiveSession` per creator, enforced at the database level).

### 11. Backend Integration
`POST /v1/live/start { mode, title }`, `POST /v1/live/:roomId/stop`, `PATCH /v1/live/:roomId/settings`, creator-only moderation actions (`POST /v1/live/:roomId/mute-guest`, `/kick-chat-user`) scoped to `requiredRole: creator` and ownership of that specific room.

### 13. Cross-Module Dependencies

**Receives from:** verified/approved creator status and published-profile confirmation from A2/A3, required to start a broadcast (§9).
**Hands off to:** session-state control over E1/E4/E5 (start/stop/mode/moderation actions originate here); `broadcast_started`/`broadcast_stopped` timestamps to F1/F2 for per-session revenue/analytics rollup.

### 14. Error Handling
Creator's connection drops mid-broadcast → session enters a brief grace-period "reconnecting" state visible to viewers (not an immediate hard end) before auto-ending if the creator doesn't reconnect within a configurable window — avoids abruptly killing a session over a momentary network blip.

### 19. Testing
E2E: full start→viewers join→gifts sent→creator ends→summary-with-accurate-revenue-total lifecycle, cross-checked against C2's ledger for that session's `reason: gift` entries to confirm the summary total is not independently computed/potentially-drifting from the actual ledger truth.

### 20. Future Enhancements
Scheduled "going live soon" announcements pushed to subscribers ahead of a planned broadcast.

### 21. Tech Stack

- **Frontend:** React Native Creator Studio broadcast-control screens (pre-flight camera/mic permission check, connection-quality indicator, in-session control panel) built on native camera/microphone modules — the publish-side counterpart to E1's viewer-side player, driving the streaming SDK's *publish/ingest* API rather than its playback API.
- **Backend:** NestJS `live` module endpoints `POST /v1/live/start`, `POST /v1/live/:roomId/stop`, `PATCH /v1/live/:roomId/settings`, and creator-only moderation actions (`mute-guest`, `kick-chat-user`), all scoped to `requiredRole: creator` and ownership of that specific room.
- **Third-party services:** The same low-latency WebRTC/LL-HLS provider as E1 (§21 there), used here on its publish/ingest side (camera/mic capture and upstream encoding) rather than its playback side.
- **Data layer:** PostgreSQL `live_sessions` (shared with E1), enforcing one active session per creator at the database level (§9); end-of-session revenue summaries are cross-checked against C2's ledger `reason: gift` entries (§19) rather than independently computed.



\newpage


# Part F — Creator Economy Backend

---

## Module F1 — Creator Earnings & Payout Dashboard

**Dependencies:** C2, A2 · **Produced Events:** `payout_requested`, `payout_status_changed`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: creators must be able to see what they've earned from day one, or the entire monetization loop feels untrustworthy.

### 1. Overview
**Purpose:** The creator's financial home — available/pending/lifetime balance, earnings-by-source breakdown, and the payout request flow. **Business Goal:** creator trust in getting paid accurately and on time is the single strongest lever on creator retention (a creator who doesn't trust the payout system leaves for a competitor regardless of how good the content tools are). **User Goal:** always know exactly how much is available to withdraw, why, and when it will arrive. **Revenue Impact:** doesn't generate GPV directly but creator retention (driven by this module's reliability) directly sustains the supply side of the entire marketplace. **Success Metrics:** payout request success rate, median payout processing time, creator-reported payout-discrepancy rate (target: zero).

### 2. Feature Description
**Competitor analysis:** Tango's and BIGO's creator dashboards both clearly separate available-now balance from a pending/holding balance — adopted here directly, since obscuring this distinction is a proven, well-documented source of creator support tickets and distrust across the category. OnlyFans' creator stats page validates a source-breakdown view (subscriptions vs. tips vs. PPV) as table-stakes for a creator to understand where their income actually comes from.

### 3. User Journey
Creator opens Studio → Earnings tab → sees `availableBalance`, `pendingBalance` (with a tooltip explaining the holding period, §9), `lifetimeEarned`, and a source-breakdown chart → taps Request Payout → selects a payout method (from those the processor/geography support, per §14) → sees the platform's minimum-threshold and processing-time messaging inline, before confirming → confirms → request appears in payout history with a status that updates as it progresses (`requested → processing → paid` or `failed`).

### 4–6. UX Flow / UI Layout / Component Breakdown
Carried forward from the predecessor document's Module 10.0 — available/pending/lifetime summary cards, source-breakdown chart, payout request flow with explicit threshold/ETA messaging.

### 7. Functional Behaviour
`availableBalance` reflects `CreditLedger.availableBalance` (A4/C2) — Credits move from `pendingBalance` to `availableBalance` automatically once the holding period (§9) elapses, via a scheduled job, not a user action. A payout request debits `availableBalance` immediately (optimistically reserving the funds against double-withdrawal) and creates a `Payout` record that F3 then processes against the actual external payment rail.

### 8. State Management
Loading: balance figures count up on load (predecessor doc's pattern). Failure: a failed payout (F3's processing failed) reverts the reserved `availableBalance` and notifies the creator with a specific reason, never leaving funds in limbo with no visible status.

### 9. Business Rules
Newly-earned Credits sit in `pendingBalance` for a configurable holding period (default: 7 days) before becoming withdrawable — this window exists specifically to absorb the chargeback/refund-dispute window on the originating real-money transaction (Master Index §2.6's chargeback-rate constraint), so the platform is never in a position of having already paid out Credits backed by a since-reversed charge. A payout request must meet a platform-configured minimum threshold (distinct per payout method, since some rails have their own minimums). A creator with any unresolved fraud flag (G2) or active moderation strike above a configured severity has payout requests held for manual review (H4) rather than auto-processed.

### 10. Data Requirements
As defined in A4/C2 (`CreditLedger`), plus **Payout entity:** `id`, `creatorId`, `amountCoins`, `amountUsdEquivalent`, `method (enum: bank_transfer | processor_specific_rail)`, `status (enum: requested | processing | paid | failed | held_for_review)`, `requestedAt`, `paidAt`, `failureReason (nullable)`.

### 11. Backend Integration
`GET /v1/studio/earnings/summary`, `GET /v1/studio/earnings/breakdown?range=`, `POST /v1/studio/payouts { methodId }`, `GET /v1/studio/payouts/history`.

### 12. Database Dependencies
`payouts`, reading from `credit_ledgers` and `ledger_entries` (C2). Index: `payouts.creatorId + status` (history list and the admin financial-ops queue, H4).

### 13. Cross-Module Dependencies
**Receives from:** C2 (source of funds — the `CreditLedger` balance this module displays and debits), A2 (payout eligibility gate — verification status is a precondition for any payout request), G2 (fraud hold signal — an unresolved fraud flag routes a request to `held_for_review` per §9).
**Hands off to:** F3 (executes the actual transfer against the external payout rail once a request leaves this module as `requested`), H4 (admin oversight/manual review queue for held or failed payouts), F2 (earnings trend charts read off this module's underlying data).
**Breaks if changed:** Changing the `Payout.status` enum values or the `CreditLedger` balance-field semantics (`availableBalance`/`pendingBalance`) would break F3's processing consumption, H4's review queue, and F2's earnings charts simultaneously, since all three read this module's data shapes directly.

### 14. Error Handling
| Scenario | Behavior |
|---|---|
| No payout method available for creator's geography/processor combination | Clear messaging naming the constraint, with a support-contact path (H6), rather than a generic "payout unavailable" dead end — restated from the predecessor document's flagged risk, now with an explicit support escalation path defined. |
| Payout fails at the external rail (F3) after being marked `processing` | `availableBalance` reservation is reversed, `status: failed` with `failureReason`, creator notified (Part I1). |
| Creator has a pending fraud/moderation hold | `status: held_for_review`, with plain (not alarmist) messaging that the request is under standard review — never silently stuck with no visible status. |

### 15. Security
Payout method changes (adding a new bank account/rail) require re-authentication (step-up, not just the standing session token) given the fraud sensitivity of redirecting where a creator's earnings are sent. All payout state transitions are audit-logged (Part I5).

### 16. Accessibility
Chart data available as a plain-text table toggle (predecessor doc's pattern, restated).

### 17. Performance
Balance/breakdown queries are served from denormalized, periodically-refreshed aggregates for the chart view (not a live full-ledger scan on every dashboard load), reconciled against the authoritative ledger sum at least daily.

### 18. Analytics
**Events:** `earnings_dashboard_viewed`, `payout_requested {amountCoins, method}`, `payout_status_changed {status}`. **KPI:** median time-to-payout, payout failure rate by method/geography (directly actionable for expanding payout-method coverage).

### 19. Testing
Integration: holding-period job correctly moves Credits from pending to available exactly at the configured window boundary. E2E: full request→processing→paid lifecycle reflected accurately in creator-facing status. Edge case: a chargeback arrives against a transaction whose Credits have already moved to `availableBalance` and been withdrawn (this scenario is deliberately made rare by the holding period but not impossible) — handled as a negative-balance/debt scenario resolved by H4's admin tooling, never silently absorbed or ignored.

### 20. Future Enhancements
Downloadable earnings statements for tax/accounting use; instant-payout option at a fee, for creators who don't want to wait the standard processing time.

### 21. Tech Stack

- **Frontend:** React Native (Expo) Studio Earnings tab built on the shared component library (Appendix K3), with TanStack Query driving periodic refresh of `availableBalance`/`pendingBalance`/`lifetimeEarned` and the source-breakdown chart; the count-up balance animation and payout-request flow are one-shot mutations, not cached reads.
- **Backend:** NestJS module exposing `/v1/studio/earnings/*` and `/v1/studio/payouts/*` (§11); a scheduled job moves Credits from `pendingBalance` to `availableBalance` at the holding-period boundary (§9), and every payout state transition is written to the `payouts` table and audit-logged (§15).
- **Third-party services:** none directly — this module reserves funds and creates `Payout` records but does not itself talk to a payout rail; that integration belongs to F3, which this module hands approved requests off to.
- **Data layer:** PostgreSQL `payouts` table (§10), reading `credit_ledgers` and `ledger_entries` (C2); Redis-backed denormalized, periodically-refreshed aggregates serve the balance/breakdown views (§17), reconciled against the authoritative ledger sum at least daily.

---

## Module F2 — Creator Analytics Dashboard

**Dependencies:** F1 · **Produced Events:** none (read-only analytics surface)
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — valuable for creator retention but not required for launch; moderate complexity.

### 1–2. Overview / Feature Description
Carried forward from the predecessor document's Module 10.1 — subscriber growth/churn, content performance, top-fans, traffic sources, now with the specific data sources named: subscriber trend from C1's `subscriptions` table, content performance from C3's `unlocks` + B1's impression events, top-fans from C4's `tips_gifts` aggregated by fan, traffic sources from B1/B3/B4/B5's `profile_viewed {source}` event.

### 11. Backend Integration
`GET /v1/studio/analytics/overview|subscribers|content|top-fans?range=` — each backed by a pre-aggregated rollup table refreshed on a schedule (hourly), not a live query across raw event tables, to keep dashboard load times acceptable as data volume grows.

### 12. Database Dependencies
Rollup tables: `creator_analytics_daily` (one row per creator per day per metric category), populated by a scheduled aggregation job reading from C1/C3/C4/B1's raw tables/events — this is a data-warehouse-style star-schema pattern kept explicitly separate from the transactional tables those modules own, so analytics query load never contends with live transactional traffic.

### 13. Cross-Module Dependencies
**Receives from:** F1 (Studio context this dashboard is presented alongside), C1 (subscriber trend data from the `subscriptions` table), C3 (content performance data from `unlocks` events), B1 (impression events feeding content performance, plus `profile_viewed {source}` events feeding traffic sources), B3/B4/B5 (additional `profile_viewed {source}` events for traffic-source attribution), C4 (top-fans data from `tips_gifts` aggregated by fan).
**Hands off to:** nothing downstream in the backend — per its "none" produced-events status, this is a terminal, read-only creator-facing surface whose output (charts and metrics) is consumed directly by the creator via the Studio UI, not by another module.
**Breaks if changed:** If C1/C3/C4/B1's underlying raw event or table schemas change without a corresponding update to the `creator_analytics_daily` aggregation job, the rollup figures silently drift out of sync with ground truth — exactly the failure mode the reconciliation test in §19 exists to catch.

### 18. Analytics
This module *is* the analytics surface for creators; its own instrumentation is limited to `analytics_dashboard_viewed {tab}` for the platform's own product-usage tracking of the tool itself.

### 19. Testing
Data-accuracy test: rollup table figures reconcile exactly against a direct raw-table count for a fixed test dataset — this reconciliation check is the module's most important test, since a subtly-wrong analytics number erodes creator trust just as much as a payout discrepancy would.

### 20. Future Enhancements
Cohort retention analysis (do fans who subscribed via a specific broadcast/promotion retain longer); predictive churn-risk flagging per fan.

### 21. Tech Stack

- **Frontend:** React Native (Expo) Studio Analytics tabs (overview/subscribers/content/top-fans) built on the shared component library's chart primitives (Appendix K3); TanStack Query drives the `range=`-parameterized queries per tab, caching results appropriately given the underlying rollups only refresh hourly.
- **Backend:** NestJS analytics module serving `/v1/studio/analytics/overview|subscribers|content|top-fans?range=` (§11) as a pure read surface — no mutations, no produced events, consistent with this module's read-only role.
- **Third-party services:** none directly — per the platform's canonical stack, this module is grounded in the central Analytics Platform (Part I3) pattern rather than computing metrics independently, keeping creator-facing figures consistent with the platform's own internal reporting.
- **Data layer:** PostgreSQL `creator_analytics_daily` star-schema rollup table (§12), populated by a scheduled hourly aggregation job over C1/C3/C4/B1's raw tables/events; Redis caching of hot rollup queries keeps dashboard load times acceptable as data volume grows.

---

## Module F3 — Payout Processing (External Rails)

**Dependencies:** F1 · **Consumed Services:** Banking/payout rail providers (varies by geography — ACH/wire in the US, local rails elsewhere; the same class of adult-industry-compatible processors named in Master Index apply here too, since standard payout rails like PayPal broadly exclude this content category)
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: creators must actually be able to get paid; high complexity (payout-rail integration, dual-control approval workflow).

### 1. Overview
**Purpose:** Actually move money from the platform's operating account to a creator's bank/payout method once F1 approves a request. **Business Goal:** reliable, compliant, cost-efficient payout execution across every launch geography, accounting for the reality that many mainstream payout rails decline this content category entirely (predecessor document's flagged constraint, now owned explicitly by this module). **Revenue Impact:** payout cost (rail fees) is a direct operating-margin line item; payout reliability is a creator-retention driver as established in F1.

### 9. Business Rules
Payout method availability is a backend-driven configuration per creator geography — never a hardcoded assumption in any client — since a payout rail available in one country may be entirely unavailable in another for this content category specifically. Every payout batch is reconciled against the platform's operating-account statement before being marked definitively `paid` (a two-step confirmation: rail-accepted, then bank-confirmed) rather than trusting the rail's initial acceptance alone as final.

### 11. Backend Integration
This module is primarily backend-to-backend (no direct client-facing API beyond what F1 already exposes) — it consumes `Payout` records in `requested` status, submits them to the appropriate rail's API based on the creator's configured method and geography, and updates `status` based on the rail's webhook/callback.

### 12. Database Dependencies
Reads/writes `payouts` (F1's entity). Adds `PayoutBatch` entity for rails that process in batches rather than individually (`id`, `railProvider`, `submittedAt`, `reconciledAt`, `payoutIds[]`).

### 13. Cross-Module Dependencies
**Receives from:** F1 (approved `Payout` records in `requested` status, submitted for execution against the appropriate external rail).
**Hands off to:** F1 (status updates — `processing`, `paid`, or `failed` — written back onto the shared `payouts` table that F1's creator-facing dashboard reads and reacts to), H4 (admin visibility into `PayoutBatch` status and manual-intervention tooling for failed payouts).
**Breaks if changed:** Changing the `Payout.status` enum values or the rail webhook/callback contract would break F1's creator-facing status display and H4's admin review tooling at the same time, since both read `status` directly off the same `payouts` table this module writes to.

### 14. Error Handling
Rail rejects a payout (invalid bank details, geography restriction discovered at submission time despite passing earlier eligibility checks) → `status: failed`, `failureReason` populated with a specific, actionable cause where the rail provides one, creator prompted to update payout details rather than left in an unexplained failed state.

### 15. Security
Bank account details are stored via the payout rail provider's own tokenized vault where available (mirroring C2's card-tokenization posture) rather than raw account numbers in platform-owned storage. Payout batch submission requires a second-admin-approval step for batches above a configured value threshold (a standard financial-operations control against a single compromised admin account or insider-fraud scenario).

### 18. Analytics
**KPI:** payout cost as a percentage of GPV (rail fees), payout success rate by rail/geography — both are direct operating-efficiency metrics owned jointly by finance and platform ops.

### 19. Testing
Integration: full submit→rail-webhook→reconciliation lifecycle against each supported rail's sandbox. Edge case: a rail's webhook is delayed/lost — the reconciliation job's periodic status-poll backstop (same pattern as A2's verification-status polling backstop) must eventually catch and correctly resolve the true status.

### 20. Future Enhancements
Additional rail integrations as the platform expands to new launch geographies; automated tax-form generation (1099-equivalent per jurisdiction) tied to cumulative annual payout totals.

### 21. Tech Stack

- **Frontend:** none — this module has no direct client-facing API of its own beyond what F1 already exposes (§11); its processing status reaches creators only through F1's Studio Earnings screens.
- **Backend:** NestJS payout-processing module operating backend-to-backend, submitting `Payout` records to the appropriate rail's API based on creator geography/method and updating `status` from the rail's webhook/callback (§11); a periodic reconciliation job (§19) polls rail status as a backstop when a webhook is delayed or lost.
- **Third-party services:** a payout-rail integration (e.g. Payoneer, Tipalti, or direct ACH/wire per creator geography) sitting behind an internal abstraction, plus that rail provider's own tokenized bank-account vault for storing account details (§15).
- **Data layer:** PostgreSQL `payouts` (shared with F1) and `payout_batches` tables (§12); Datadog/Grafana-class centralized logging and metrics for webhook delivery, since a missed or delayed payout callback needs to be caught, not silently lost.



\newpage


# Part G — Trust & Safety

---

## Module G1 — Content Moderation & Reporting

**Dependencies:** A2 · **Consumed Services:** Automated content-classification service (image/video hash-matching against known-illegal-content databases, e.g. PhotoDNA-class services; NLP-based text moderation for messages/comments)
**Produced Events:** `content_reported`, `content_actioned`, `user_blocked`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking legal/compliance requirement, since a platform serving this content category cannot legally operate without a moderation pipeline from day one; moderate-to-high complexity.

### 1. Overview
**Purpose:** User-facing reporting/blocking plus the visible states content enters when actioned — required infrastructure for any UGC adult-content platform, not optional. **Business Goal:** meet platform-liability and §2257-adjacent legal obligations while keeping false-positive removals (legitimate content wrongly actioned) low enough to preserve creator trust. **User Goal:** a low-friction way to report genuinely harmful content/behavior, and clarity when their own content is actioned. **Platform Goal:** catch the highest-severity content categories (non-consensual material, apparent-minor content) automatically and immediately, with human review as the backstop for ambiguous cases, never the primary defense for the highest-severity categories. **Success Metrics:** time-to-action on high-severity reports (target: automated/near-immediate for the highest-severity categories), false-positive rate on automated actions, report volume by category.

### 2. Feature Description
This module's design is dictated by legal/safety necessity more than competitive differentiation — every platform in this content category implements some version of it, and the bar is "does it actually work reliably," not "is it novel." **Reference pattern:** automated hash-matching against known-CSAM/NCII databases (industry-standard practice, legally expected, not a competitive feature) runs on every uploaded image/video before it is ever eligible to go live, full stop — this check is not something even the fastest-moving competitor skips, and neither does this platform.

### 3. User Journey
Report: three-dot menu on any content/user/message → `ReportReasonSheet` (predefined categories first, optional free-text detail second) → submit → confirmation with an honest processing-time expectation. Block: confirm modal explaining bidirectional effect (hides content both ways, ends any active subscription/thread) → immediate effect. Content owner whose content is actioned: sees `ContentRestrictedPlaceholder` with a reason and an appeal path (G3).

### 4–6. UX Flow / UI Layout / Component Breakdown
Carried forward from the predecessor document's Module 11.0 — category-based report reasons, labeled placeholder states for actioned content (never silent removal), calm/non-punitive visual treatment throughout.

### 7. Functional Behaviour
Every uploaded image/video passes through automated hash-matching and classification *before* being eligible for publish (a hard pre-publish gate, not a post-publish scan) — content flagged by this pre-publish check is never made live and is routed directly to human review or, for the highest-confidence highest-severity matches, automatically blocked and reported to the relevant authority/clearinghouse as legally required, without waiting for human review at all. User reports on already-live content route into a review queue (H3) triaged by severity.

### 8. State Management
Report submission: optimistic confirmation (the report is queued even if the review backend has a momentary hiccup — reporting must never silently fail). Content-restricted state: `ContentRestrictedPlaceholder` is a permanent, clearly-labeled state, not a temporary loading state, once applied.

### 9. Business Rules
Reports fall into a fixed, non-extensible-by-the-reporting-user category list (Master Index-referenced principle: structured data over free text for the primary classification) — categories include at minimum: non-consensual content, apparent-underage content, harassment/threats, spam, impersonation, other. Apparent-underage-content reports are always routed to the highest-priority, fastest-response review lane (H3), regardless of general queue volume, and trigger an automatic precautionary content-hold pending review rather than waiting for the normal queue order. A user may not report the same content more than once (subsequent taps show "already reported, under review" rather than creating duplicate queue entries).

### 10. Data Requirements
**Report entity:** `id`, `reporterId`, `targetType (enum: post|message|profile|comment|live_session)`, `targetId`, `reasonCategory`, `detail (nullable)`, `status (enum: pending|reviewed_actioned|reviewed_no_action)`, `createdAt`, `reviewedAt`, `reviewedBy (admin userId)`. **Block entity:** `blockerId`, `blockedId`, `createdAt`.

### 11. Backend Integration
`POST /v1/reports { targetType, targetId, reasonCategory, detail? }`, `POST /v1/users/:id/block`, `DELETE /v1/users/:id/block`, `GET /v1/account/content-status/:contentId` (drives the restricted-placeholder state). Internal: automated pre-publish classification hook, called synchronously from every media-upload path (B/C/D/E's respective publish endpoints) before `visibility` can be set to anything publicly-reachable.

### 12. Database Dependencies
`reports`, `blocks`, `content_moderation_actions` (append-only log of every automated or human action taken against a piece of content, independent of the `reports` table since an action can originate from automated pre-publish scanning with no user report involved at all). Index: `reports.status + reasonCategory` (H3's triage queue), `blocks.blockerId` and `blocks.blockedId` (bidirectional feed-filtering lookups used by B1/B4/B5/D1).

### 13. Cross-Module Dependencies
**Receives from:** Receives the authenticated user/session context from Module A2, which every report/block action and every pre-publish classification check is scoped to.
**Hands off to:** Hands off block-filtering state (`blocks.blockerId`/`blocks.blockedId`) to B1/B4/B5/D1's feeds and threads; hands off the pre-publish classification gate to every content-publish path (B/C/D/E's respective publish endpoints); hands off report queue entries to H3's review queue; hands off shared signal input to G2; hands off actioned-content outcomes to G3, where a severe/repeated action can trigger account suspension.
**Breaks if changed:** A2's session/auth contract changing breaks report/block attribution; any upload path (B/C/D/E) that bypasses the synchronous pre-publish classification hook breaks the hard-gate guarantee in §7.

### 14. Error Handling
Automated classification service outage → publish is held (fails closed — content does not go live if it cannot be checked) rather than failing open, given the severity of what this check exists to catch. Duplicate report → handled per Business Rules (no duplicate queue entry, clear "already reported" state).

### 15. Security
Report and block records are never visible to the reported/blocked party (a reporter's identity is never disclosed to the person they reported, a standard and important safety property). Automated classification results and hash-matches against external clearinghouse databases are handled per those databases' own strict access/reporting protocols, not stored more broadly than legally required.

### 16. Accessibility
Report category list fully keyboard/screen-reader navigable with literal, non-euphemistic labels (predecessor doc's requirement, restated). Restricted/suspended states announced immediately on screen load.

### 17. Performance
Pre-publish classification is designed to complete within a few seconds for the common case (image) and a longer but bounded window for video, with the publish flow (Part A3/predecessor doc's Module 9.1) showing an honest "processing" state during that window rather than implying instant availability.

### 18. Analytics
**Events:** `content_reported {reasonCategory}`, `content_actioned {reasonCategory, automated: bool}`, `user_blocked`. **KPI:** automated-catch rate vs. human-review-catch rate for high-severity categories (the ratio product/trust-and-safety leadership watches most closely — a low automated-catch rate for the highest-severity categories is a P0 investment gap, not a normal KPI fluctuation).

### 19. Testing
Integration: pre-publish classification hook correctly blocks a test-harness-flagged asset from ever reaching a publishable state across every upload path (B/C/D/E) — tested per path, since a gap in even one upload surface is a critical miss. E2E: report → queue entry created with correct priority → (simulated) admin action → reporter and content-owner both see the correct resulting state.

### 20. Future Enhancements
Reporter feedback loop (optional, careful-worded notification of report outcome, balanced against not over-promising specifics that could aid bad-faith reporters in gaming the system).

### 21. Tech Stack

- **Frontend:** `ReportReasonSheet` and `ContentRestrictedPlaceholder` (Appendix K3) are built in React Native (Expo) and live inside the main consumer app rather than the admin surfaces, since reporting/blocking is a fan- and creator-facing action; the report-a-post entry point is reached from the three-dot menu on any content/user/message per §3, with TanStack Query driving the `GET /v1/account/content-status/:contentId` poll behind the placeholder state.
- **Backend:** NestJS handlers for `POST /v1/reports`, `POST/DELETE /v1/users/:id/block`, and the internal synchronous pre-publish classification hook called from B/C/D/E's own publish endpoints per §11 — this hook is what makes the pre-publish gate in §7 a hard blocker rather than an async scan.
- **Third-party services:** An automated content-classification/hash-matching service (PhotoDNA-class, per §2's reference pattern) checked against known-CSAM/NCII databases, plus NLP-based text moderation for messages/comments — the same class of image/video moderation service used for avatar uploads in Part A3, run here as the pre-publish gate ahead of H3's human-review queue.
- **Data layer:** PostgreSQL `reports`, `blocks`, and the append-only `content_moderation_actions` log (§12), with Redis rate-limit token buckets on report submission to prevent report-spam abuse and to back the fast `blocks.blockerId`/`blocks.blockedId` bidirectional lookups consumed by B1/B4/B5/D1's feed-filtering.

---

## Module G2 — Fraud & Risk Engine

**Dependencies:** A1, C2, C6 · **Consumed Services:** Device fingerforming/fraud-signal vendor (e.g. Sift, Forter-class service), IP/geolocation risk data
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking for a payments platform, since chargeback and fraud exposure exists from the first transaction; high complexity (rules/scoring engine, multiple signal sources).

### 1. Overview
**Purpose:** Detect and act on payment fraud, multi-accounting/referral abuse, and account-takeover patterns across the platform. **Business Goal:** keep chargeback rate under the payment processor's tolerance threshold (Master Index §2.6 — losing processor access is a platform-ending risk, not a normal cost of doing business) and prevent promotional-abuse (C6/C7) from eroding those programs' ROI. **Success Metrics:** chargeback rate, fraud-catch rate vs. false-positive rate on legitimate users, referral-abuse detection rate.

### 2. Feature Description
This is a backend risk-scoring system with minimal dedicated UI of its own — its user-facing surface is almost entirely the *consequences* it triggers in other modules (a payout held per F1 §9, a signup blocked per A1, a referral reward withheld per C6). **Reference pattern:** industry-standard risk scoring combines device fingerprinting, velocity checks (how many accounts/actions from one device/IP/payment-instrument in a time window), and behavioral signals (unusual spend patterns, e.g., a brand-new account immediately making the platform's maximum-size purchase, which is a classic stolen-card testing pattern) into a composite risk score consulted by other modules at their own decision points, rather than this module blocking actions unilaterally and centrally.

### 7. Functional Behaviour
Every financially-significant action (signup, first purchase, large purchase, payout request, referral-reward qualification) calls `getRiskScore(userId, actionContext)`, which returns a score and a set of specific triggered signals; the *calling* module (A1, C2, F1, C6 respectively) owns the decision of what to do with that score (block, hold-for-review, allow-with-monitoring) — this engine scores risk, it does not unilaterally execute account actions itself, keeping a clean separation between risk-assessment and risk-response ownership.

### 9. Business Rules
A composite risk score above a high-severity threshold triggers an automatic hold (payout, per F1 §9) or block (signup/purchase) without waiting for human review; a score in a mid-range triggers routing to manual review (H4) rather than an automatic action, balancing catch-rate against false-positive cost. Risk thresholds are config-driven (not hardcoded) and reviewed/adjusted periodically based on observed outcomes (§18), since a fraud landscape shifts over time and a static threshold decays in effectiveness.

### 10. Data Requirements
**RiskSignal entity (append-only log):** `id`, `userId`, `actionContext`, `signalType (enum: device_velocity | ip_risk | spend_anomaly | referral_pattern | chargeback_history)`, `score`, `createdAt`. **RiskDecision entity:** records what the calling module actually did in response, for outcome analysis (§18).

### 11. Backend Integration
Internal `getRiskScore(userId, actionContext)` — not a public API; called server-to-server from A1, C2, F1, C6's own handlers.

### 12. Database Dependencies
`risk_signals`, `risk_decisions`. Index: `risk_signals.userId + createdAt` (per-user risk history lookups feeding the composite score calculation).

### 13. Cross-Module Dependencies
**Receives from:** Nothing upstream within this specification — this is a foundational risk-scoring service, receiving only the raw `actionContext` each calling module passes into `getRiskScore` at its own decision point.
**Hands off to:** Hands off a composite risk score and triggered-signal set to A1 (signup/login risk), C2 (purchase risk), F1 (payout risk), and C6 (referral-abuse detection), each of which owns its own resulting decision (block, hold, allow-with-monitoring) per §7.
**Breaks if changed:** Any change to `getRiskScore`'s signature or score semantics breaks all four calling modules' decision logic simultaneously, since none of them re-derive risk independently.

### 14. Error Handling
Risk-scoring service unavailable at decision time → calling modules fail toward their own configured safe-default (e.g., C2's purchase flow proceeds without a risk-check delay for typical small purchases but F1's payout flow fails closed, holding for manual review, given the asymmetric cost of a bad payout vs. a delayed one).

### 15. Security
Risk signals themselves (device fingerprints, IP history) are sensitive operational data, access-restricted to the fraud/trust-and-safety admin role (H4), never exposed to the scored user themselves (revealing exact fraud signals would help bad actors evade them).

### 18. Analytics
**KPI:** chargeback rate trend, false-positive rate (legitimate users incorrectly held/blocked — tracked via appeal outcomes, G3), fraud-ring detection rate (clusters of accounts sharing signals, caught as a group rather than one at a time).

### 19. Testing
Simulation test suite: known fraud patterns (card-testing velocity, referral self-dealing, device-fingerprint clustering) each correctly trigger their expected risk-decision outcome in a test environment seeded with synthetic fraud scenarios.

### 20. Future Enhancements
Machine-learning-based anomaly scoring supplementing the initial rule-based signal set, once sufficient labeled outcome data (confirmed fraud vs. confirmed false-positive) has accumulated to train it responsibly.

### 21. Tech Stack

- **Frontend:** No dedicated end-user UI — per §2 this module's only user-facing surface is the *consequences* other modules trigger (a payout hold in F1, a signup block in A1, a withheld referral reward in C6). Its only direct UI footprint is inside Part H's admin surfaces, where H4's fraud/trust-and-safety review queue (built on the shared internal component library, Appendix K3, on NativeWind) surfaces mid-range-score cases for manual review.
- **Backend:** NestJS server-to-server `getRiskScore(userId, actionContext)` (§11), called synchronously from A1, C2, F1, and C6's own handlers — deliberately not exposed as a public `/v1/...` endpoint, keeping risk-assessment ownership separate from each caller's risk-response decision per §7.
- **Third-party services:** A device fingerprinting/fraud-signal vendor (Sift/Forter-class, per the module header) plus IP/geolocation risk data feeding the composite score's `device_velocity` and `ip_risk` signal types (§10); the rules-engine/ML-scoring layer itself may be this vendor's own scoring or an in-house layer, per §20's planned evolution to ML-based anomaly scoring.
- **Data layer:** PostgreSQL `risk_signals` (append-only) and `risk_decisions` tables (§12), plus Redis for fast-access lookups of device fingerprints and IP history so `getRiskScore` can be consulted synchronously at each caller's own decision point without introducing latency into signup, purchase, or payout flows.

---

## Module G3 — Account Suspension & Appeals

**Dependencies:** G1, G2, A1 · **Produced Events:** `account_suspended`, `appeal_submitted`, `appeal_resolved`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — needed, but a basic/manual version can launch first and be automated later; moderate complexity.

### 1. Overview
**Purpose:** The account-level consequence pathway for serious/repeated moderation or fraud findings, plus a fair, visible appeal path. **Business Goal:** remove genuinely bad actors decisively while giving legitimate users who were wrongly actioned a real path to resolution — both matter for the platform's legal standing and its reputation among creators specifically, who have the most to lose from a wrongful suspension.

### 3. User Journey
Suspension triggered (by G1's severe/repeated content action or G2's high-severity fraud finding) → account's next auth check (Module A1 §14) returns `accountStatus: suspended` → app shell routes to a dedicated `AccountSuspendedScreen` (replaces the entire app, not a partial/degraded experience) showing the reason category and an appeal entry point → user submits an appeal (free-text plus any relevant context) → routed to H3/H4's admin review → resolution (`upheld` or `overturned`) delivered via notification, with account access restored immediately on `overturned`.

### 9. Business Rules
A suspension always states a reason category to the user (never an unexplained lockout) even when full detail can't be disclosed (e.g., to protect an ongoing fraud investigation, the category is still given even if specifics are withheld). An appeal is reviewed by an admin who was not the original actioning admin where volume permits (a basic fairness/bias-mitigation control). During an active subscription-billing pause triggered by suspension (per C1 §9), no charges occur; on `overturned` resolution, the subscription resumes at the next natural billing date rather than attempting to retroactively charge for the paused period.

### 10. Data Requirements
**Suspension entity:** `id`, `userId`, `reasonCategory`, `triggeredBy (enum: moderation | fraud | manual_admin)`, `sourceReferenceId (the Report or RiskSignal that triggered it, where applicable)`, `suspendedAt`, `liftedAt (nullable)`. **Appeal entity:** `id`, `suspensionId`, `userStatement`, `status (enum: pending|upheld|overturned)`, `resolvedBy`, `resolvedAt`.

### 11. Backend Integration
`GET /v1/account/status`, `POST /v1/account/appeals { statement }`, admin-side resolution endpoints owned by H3/H4.

### 12. Database Dependencies
`suspensions`, `appeals`. Index: `suspensions.userId + liftedAt` (is-currently-suspended checks, consulted by A1's session/auth flow).

### 13. Cross-Module Dependencies
**Receives from:** Receives suspension triggers from G1 (severe/repeated content actions) and G2 (high-severity fraud findings), and identity/session context from A1.
**Hands off to:** Hands off the current `accountStatus` to A1's auth-time status check (returned on the account's next auth check per §3); hands off the billing-pause state to C1 (no charges during an active suspension, resuming at the next natural billing date on `overturned`); hands off a profile-unavailable state to B5; hands off submitted appeals to H3/H4's admin review workflow.
**Breaks if changed:** A1's auth check failing to consult the current suspension status would let a suspended account keep sessions alive; C1 attempting to retroactively charge for a paused period would break the resume behavior in §9.

### 14. Error Handling
Appeal submitted for an already-resolved suspension (race with an admin action) → shows the actual current resolved state rather than accepting a now-moot appeal into the queue.

### 15. Security
Suspension/appeal records are audit-logged (Part I5) in full, including which admin acted and when, given the fairness and potential legal-dispute stakes of account-level enforcement actions.

### 16. Accessibility
Suspension screen uses calm, plain, non-judgmental language (predecessor document's principle, restated) and meets the same accessibility bar as the rest of the product.

### 18. Analytics
**KPI:** appeal overturn rate (a sustained high overturn rate for a given trigger category is a signal that G1/G2's automated triggers for that category are miscalibrated and need tuning, not just a per-case fairness metric).

### 19. Testing
E2E: full suspend→appeal→overturn→access-restored lifecycle, including correct subscription-billing resumption behavior. Edge case: a user has multiple active subscriptions as a fan at the time of a creator-side suspension of their own separate creator account (must correctly distinguish which role/account context is actually suspended — a dual-role account's fan activity should not be incorrectly frozen by a creator-side action against the same underlying user, unless the suspension is explicitly account-wide).

### 20. Future Enhancements
A graduated-response system (warnings and temporary restrictions short of full suspension for lower-severity first offenses) rather than the current binary suspended/not-suspended model, once volume justifies the added workflow complexity.

### 21. Tech Stack

- **Frontend:** The dedicated `AccountSuspendedScreen` (Appendix K3, React Native/Expo) replaces the entire app shell per §3 rather than degrading it partially; TanStack Query drives the `GET /v1/account/status` check at auth time, and Zustand's `sessionStore` (shared with A1) holds the resulting `accountStatus` client-side so every screen can react to a suspension immediately.
- **Backend:** NestJS handlers for `GET /v1/account/status` and `POST /v1/account/appeals { statement }` (§11), with admin-side resolution endpoints owned by H3/H4; the suspend/appeal/overturn lifecycle in §3 writes through to A1's own auth check so `accountStatus: suspended` is enforced at the next session validation, not just client-side.
- **Third-party services:** Push/email notification delivery (FCM/APNs, SendGrid/Postmark-class) for the appeal-resolution notification in §3, since resolution (`upheld` or `overturned`) is delivered out-of-band rather than requiring the user to poll.
- **Data layer:** PostgreSQL `suspensions` and `appeals` tables (§12), indexed on `suspensions.userId + liftedAt` for the is-currently-suspended check A1's auth flow consults on every session validation; suspension/appeal actions also write to the platform's Audit Log (Part I5) per §15, given the fairness and potential legal-dispute stakes involved.



\newpage


# Part H — Admin / Backoffice Platform

This Part did not exist in the predecessor Frontend Design Specification at all. It is the internal tool platform-employees (Support Agents, Platform Admins — Master Index §2.3) use to operate the business day to day: reviewing flagged content, approving payouts, managing user disputes, and watching platform health. It is a separate application surface from the consumer app, sharing only the backend services (C, F, G) it manages.

---

## Module H1 — Admin Dashboard Overview

**Dependencies:** I4 (RBAC) · **Consumed Services:** none beyond the platform's own data
**Produced Events:** `admin_session_started`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — the internal admin shell can launch in a basic form and improve iteratively; complexity is low-to-moderate.

### 1. Overview
**Purpose:** Landing screen for any admin session — a role-appropriate summary (a Support Agent sees their queue; a Platform Admin sees platform-wide health) and navigation into the specific tools (H2–H6). **Business Goal:** every admin's first screen should immediately surface what needs their attention right now, not require hunting through a generic nav menu. **User Goal (admin):** know what to work on next within seconds of logging in.

### 3. User Journey
Admin authenticates (a separate, stronger-auth login flow than the consumer app — see Security) → lands on a role-scoped dashboard: Support Agent sees "Your queue: 12 pending reports, 3 pending appeals"; Platform Admin additionally sees platform health tiles (active users, GPV today, chargeback rate trend, open high-severity fraud flags) → clicks into any tile/queue to enter the relevant tool (H2–H6).

### 5. UI Layout
Dense, information-forward layout (unlike the consumer app's restrained, whitespace-generous style) — admin tooling optimizes for information density and task throughput over visual polish, a deliberate and appropriate difference in design language for an internal tool used for hours at a stretch by trained staff.

### 9. Business Rules
Dashboard content is strictly role-scoped (Master Index §2.3) — a Support Agent never sees platform-wide financial tiles a Platform Admin sees, enforced server-side on the summary endpoint, not hidden client-side.

### 11. Backend Integration
`GET /v1/admin/dashboard/summary` (returns a role-appropriate payload shape based on the authenticated admin's role).

### 13. Cross-Module Dependencies

**Receives from:** Role/permission data from I4 (RBAC), which the `GET /v1/admin/dashboard/summary` endpoint uses to shape the response; queue-count summaries from H3 (review queue) and H4 (financial ops queue); open fraud-flag counts from G2.
**Hands off to:** Nothing structurally downstream — this module produces no data other Parts consume; it is the landing screen that routes the admin (not data) onward into H2–H6.
**Breaks if changed:** If H3/H4/G2's summary-count contracts change shape without this module updating in lockstep, dashboard tiles silently show stale or incorrect counts; if role-scoping enforcement ever moved client-side instead of staying on the summary endpoint itself, a lower-privileged admin could see fields their role shouldn't.

### 15. Security
Admin authentication requires MFA (distinct and stronger than the consumer A1 flow, appropriate given the sensitivity of what admin tooling can access/action) and is session-timeout-limited more aggressively than the consumer app.

### 18. Analytics
Internal tool-usage analytics (which tiles/queues admins actually use) inform future admin-tooling investment priority — a distinct, internal-facing analytics use case from every other Part's user-facing analytics.

### 19. Testing
Role-scoping test: a Support Agent's dashboard payload never includes fields a Platform-Admin-only view should show, verified by an automated contract test per role.

### 20. Future Enhancements
Customizable/pinnable dashboard tiles per admin's own working preferences.

### 21. Tech Stack

- **Frontend:** A separate internal web admin console (React + TypeScript, not the React Native mobile app — admin tooling is desktop/web-first) renders the role-scoped summary tiles and queue-count cards described in §5's dense, information-forward layout; TanStack Query caches the `GET /v1/admin/dashboard/summary` response per role.
- **Backend:** Node.js + NestJS serves the single role-aware `GET /v1/admin/dashboard/summary` aggregation endpoint, pulling counts from H3/H4/G2 server-side rather than letting the client assemble them.
- **Third-party services:** None beyond the platform's own data (per header); Datadog/Grafana-class observability captures the internal tool-usage analytics referenced in §18.
- **Data layer:** PostgreSQL, read-only aggregation queries only — this module owns no new entities of its own; role-scoping is enforced against I4's permission matrix at query time.

---

## Module H2 — User & Creator Management

**Dependencies:** A1, A2, A3, G3 · **Produced Events:** `admin_user_action_taken`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: ops must be able to manage users/creators, including reviewing Part A2's verification cases, from day one.

### 1. Overview
**Purpose:** Look up any user/creator account, view their full history (verification status, subscriptions, transactions, reports filed/against them, prior admin actions), and take direct account actions (manual suspension, manual verification override, manual role change) outside the automated flows in Parts A/G. **Business Goal:** give support/ops staff the tools to resolve the long tail of cases automated systems can't or shouldn't fully automate (a legitimate user's edge-case dispute, a manual identity-verification override for a documented unusual case).

### 3. User Journey
Admin searches a user by handle/email/phone/userId → account detail view: profile summary, verification status and history, active subscriptions (as fan and/or creator), recent transactions (read-only, links into H4 for any action needed), report history (both filed by and against this user), prior admin actions taken on this account → admin selects an action (suspend, lift suspension, override verification status, adjust role) → confirmation modal requiring a written reason (mandatory, never a reason-less action) → action applied and logged.

### 9. Business Rules
Every admin action against a user account requires a recorded reason (free text, mandatory field) — an admin cannot suspend, verify, or role-change an account without leaving an auditable justification, regardless of how routine the action seems. Certain high-impact actions (permanent ban, verification override) require a second admin's approval (a four-eyes/dual-control principle) above a configured severity, mirroring F3's payout dual-control pattern.

### 10. Data Requirements
Reads across `users`, `creator_verifications` (A2), `subscriptions` (C1), `ledger_entries` (C2, read-only), `reports`/`suspensions` (G1/G3). **AdminAction entity (append-only):** `id`, `adminId`, `targetUserId`, `actionType`, `reason`, `secondApproverAdminId (nullable)`, `createdAt`.

### 11. Backend Integration
`GET /v1/admin/users/search?q=`, `GET /v1/admin/users/:id` (full detail aggregation), `POST /v1/admin/users/:id/actions { actionType, reason }`.

### 12. Database Dependencies
`admin_actions` (new), read access (via admin-scoped queries, never write access outside this module's own controlled action endpoints) to the entities listed above.

### 13. Cross-Module Dependencies

**Receives from:** Account/profile data from A1 (`users`), verification history from A2 (`creator_verifications`), subscription state from C1, read-only ledger entries from C2, and report/suspension history from G1/G3; I4's role matrix dictates which actions a given admin role may take.
**Hands off to:** Verification-override actions to A2, suspend/lift actions to G3; its account-detail aggregation is itself consumed as a read-only view by H4 (financial-ops case review, per H4 §3) and H6 (support-ticket investigation, per H6 §3).
**Breaks if changed:** As the highest-privilege surface in the specification, a change to its action-type contract or a weakening of the dual-control/mandatory-reason requirement propagates directly into A2's verification state and G3's suspension state; because H4 and H6 both embed this module's account-detail view, a change to that view's data shape breaks their investigation flows too.

### 14. Error Handling
Dual-control action submitted without a second approver yet → held in a `pending_second_approval` state, visible to other eligible admins, not silently lost.

### 15. Security
This module is the highest-privilege surface in the entire specification (direct ability to alter verification/suspension state and view financial history) — access is the most tightly role-gated (I4) and the most thoroughly audit-logged (I5) of any module.

### 19. Testing
Dual-control test: a high-severity action correctly blocks completion until a second, different admin approves. Audit test: every action type correctly produces a complete, immutable `AdminAction` record including the mandatory reason.

### 20. Future Enhancements
Bulk actions for clearly-patterned cases (e.g., a confirmed fraud ring of multiple linked accounts) with the same reason/audit rigor applied to each individual account within the bulk action, not a single blanket log entry covering many accounts ambiguously.

### 21. Tech Stack

- **Frontend:** Internal web admin console (React + TypeScript, not the mobile app) with a user-search view, a full account-detail aggregation screen, and a mandatory-reason confirmation modal that gates every action button described in §3.
- **Backend:** Node.js + NestJS handles `GET /v1/admin/users/search`, `GET /v1/admin/users/:id`, and `POST /v1/admin/users/:id/actions`, including the `pending_second_approval` dual-control state machine described in §14.
- **Third-party services:** None unique to this module — it reads across services other Parts already integrate (A2/A3's verification providers, C2's payment processor data) rather than calling any third party directly.
- **Data layer:** PostgreSQL `admin_actions` table (new, append-only per §10), plus read-only queries against `users`, `creator_verifications`, `subscriptions`, `ledger_entries`, `reports`, and `suspensions` — this module never writes to those tables directly, only through its own controlled action endpoints (§12).

---

## Module H3 — Content Review Queue

**Dependencies:** G1 · **Produced Events:** `review_item_actioned`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: this is the operational tool that makes Part G1's moderation pipeline actually work; without it, moderation reports have nowhere to go.

### 1. Overview
**Purpose:** The triaged work queue where human reviewers process reports (G1) and automated-classification borderline cases. **Business Goal:** fast, consistent, well-prioritized human review — the backstop for everything G1's automated layer can't confidently resolve alone. **Success Metrics:** median time-to-resolution by severity lane, reviewer-consistency rate (do different reviewers reach the same call on similar cases, measured via periodic calibration sampling).

### 3. User Journey
Reviewer opens queue (auto-sorted: apparent-underage-content lane always first regardless of submission order, per G1 §9, then other severity lanes) → selects next item → sees the reported content, the report's category/detail, the content owner's account history summary, and any automated-classification signal already attached → decides: no action, remove content, remove content + warn creator, remove content + suspend creator (escalates into H2/G3) → decision recorded with a reason, reporter and content-owner notified per G1's contracted states.

### 9. Business Rules
A reviewer cannot review a report they filed themselves (conflict-of-interest prevention) or a case involving an account they have a recorded prior personal action history with beyond a normal caseload level (a lighter-touch bias-mitigation control). Every decision is recorded with the specific policy category it falls under (not just "removed" but "removed: non-consensual content policy §X") for consistency tracking and appeal review (G3).

### 11. Backend Integration
`GET /v1/admin/review-queue?severityLane=`, `POST /v1/admin/review-queue/:reportId/decide { decision, policyCategory, notes }`.

### 13. Cross-Module Dependencies

**Receives from:** Reports and automated-classification signals from G1.
**Hands off to:** Decision outcomes back to G1 (the `content_actioned` event, plus reporter/content-owner notification per G1's contracted states) and, for suspend decisions, into G3's suspension flow.
**Breaks if changed:** Since the apparent-underage-content lane's priority ordering is the most closely monitored guarantee this queue provides, any change to the lane-sorting logic or to the conflict-of-interest assignment rule risks a severity-inversion or a bias/appeal-integrity problem that G3's appeal process would then have to absorb.

### 15. Security
Reviewers never see the reporter's identity (G1 §15, restated) — the queue interface itself enforces this, not merely a policy reviewers are trusted to follow.

### 18. Analytics
**KPI:** time-to-resolution by lane (the apparent-underage lane's time-to-resolution is the single most closely monitored metric in this entire specification, given the stakes), inter-reviewer consistency rate.

### 19. Testing
Queue-ordering test: an apparent-underage-content report is always surfaced ahead of lower-severity reports regardless of submission timestamp order. Conflict-of-interest test: a reviewer cannot be assigned/self-select a case they filed or have a disqualifying history with.

### 20. Future Enhancements
Reviewer calibration sampling (periodic re-review of already-decided cases by a second reviewer, blind to the first decision, to measure and improve consistency).

### 21. Tech Stack

- **Frontend:** Internal web admin console (React + TypeScript, not the mobile app) presenting the single-item review interface from §3 — reported content, category/detail panel, account-history summary, and decision buttons — tuned for high-volume, one-item-at-a-time throughput rather than dashboard browsing.
- **Backend:** Node.js + NestJS serves `GET /v1/admin/review-queue?severityLane=` and `POST /v1/admin/review-queue/:reportId/decide`, enforcing the apparent-underage-first lane ordering and the conflict-of-interest exclusion rule (§9) server-side, never as a client-side filter.
- **Third-party services:** Consumes G1's automated-classification signal (an ML/computer-vision content-classification vendor owned by G1, not this module) as an input attached to each queue item.
- **Data layer:** PostgreSQL — reads and writes against G1's `reports` table directly; this module adds no separate review-queue entity of its own, only decision fields on that shared table.

---

## Module H4 — Financial Operations

**Dependencies:** C2, F1, F3, G2 · **Produced Events:** `financial_review_decided`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: payout approvals, refunds, and dual-control review of high-impact financial actions must exist from day one, and the dual-control/budget-cap logic involved is itself high-complexity.

### 1. Overview
**Purpose:** Admin tooling for payout approvals/holds (F1 §9's held-for-review state lands here), refund/chargeback management, and promotional-campaign management (C6/C7's `campaigns` entity is created and managed here). **Business Goal:** the operational control point for every financially consequential decision that isn't fully automatable — refund adjudication, fraud-hold resolution, promotional budget management.

### 3. User Journey
Financial-ops admin sees a queue of held payouts (from G2's fraud flags or F1's threshold rules) → reviews the account's transaction/verification history (via a read-only view into H2's aggregation) → approves (releases the payout to F3) or denies (with a reason, which may itself trigger a G3 suspension flow for confirmed fraud) → separately, a refund/chargeback queue lists disputed transactions requiring a decision (refund, contest the chargeback with the processor, or accept it) → separately, campaign management creates/edits/pauses promotional-credit campaigns (C7), setting segment-targeting rules and budget caps.

### 9. Business Rules
A promotional campaign requires a budget cap (maximum total promotional-Coins liability) set at creation — an uncapped campaign cannot be launched, preventing a configuration mistake from creating unbounded financial exposure. Refund decisions above a configured value threshold require the same dual-control approval pattern as H2's high-impact actions and F3's large payout batches.

### 10. Data Requirements
`campaigns` (referenced by C7), `refund_decisions`, extends H2's `admin_actions` pattern for financial-specific action types.

### 11. Backend Integration
`GET /v1/admin/payouts/held`, `POST /v1/admin/payouts/:id/approve|deny`, `GET /v1/admin/disputes`, `POST /v1/admin/disputes/:id/decide`, `POST /v1/admin/campaigns`, `PATCH /v1/admin/campaigns/:id`.

### 13. Cross-Module Dependencies

**Receives from:** Held-payout queue items from F1 and G2 (fraud flags), dispute-source transactions from C2, and a read-only view into H2's account-detail aggregation for reviewing account history during payout/dispute review.
**Hands off to:** Approved-payout release to F3, campaign activation to C7, and fraud-confirmed denials that escalate into G3's suspension flow.
**Breaks if changed:** A change to F1/G2's held-payout contract or C2's transaction shape breaks this module's review queues; because the dual-control and budget-cap enforcement owned here is what keeps campaign liability bounded (C7) and payout release correct (F3), weakening either control has direct financial-exposure consequences downstream.

### 15. Security
Highest financial-privilege surface alongside F3's batch-approval control; dual-control and full audit-logging (I5) apply throughout, consistent with H2's pattern for account-level actions.

### 18. Analytics
**KPI:** refund/chargeback resolution time, promotional-campaign ROI (bonus-to-real-purchase lift, per C7 §18, reported here for the admins who actually manage campaign budgets).

### 19. Testing
Budget-cap enforcement test: a campaign cannot be activated without a set cap, and campaign spend is hard-stopped once the cap is reached regardless of remaining segment-eligible users.

### 20. Future Enhancements
Automated chargeback-response assembly (pre-filling the standard evidence package a payment processor requires to contest a chargeback, reducing manual admin effort on the highest-volume dispute type).

### 21. Tech Stack

- **Frontend:** Internal web admin console (React + TypeScript, not the mobile app) presenting the held-payout queue, the refund/chargeback dispute queue, and campaign-creation/edit forms with budget-cap and segment-targeting fields, all described in §3.
- **Backend:** Node.js + NestJS exposes `GET /v1/admin/payouts/held`, `POST /v1/admin/payouts/:id/approve|deny`, `GET /v1/admin/disputes`, `POST /v1/admin/disputes/:id/decide`, and `POST/PATCH /v1/admin/campaigns`, enforcing the budget-cap and dual-control rules from §9 server-side.
- **Third-party services:** The same payout-rail integrations F3 uses (Payoneer/Tipalti/ACH/wire-class) to actually release an approved payout, and the same payment processor (CCBill/Segpay/Epoch-class) Part C uses when contesting or accepting a chargeback.
- **Data layer:** PostgreSQL `campaigns` and `refund_decisions` tables (§10), plus H2's `admin_actions` table extended with financial-specific action types for this module's own audit trail.

---

## Module H5 — Platform Reporting

**Dependencies:** F2, H4 · **Produced Events:** none (read-only)
**Priority:** [🟢 LOW PRIORITY]{custom-style="Priority Low"} — executive/ad hoc reporting can start manual and be automated later; complexity is low-to-moderate.

### 1. Overview
**Purpose:** Platform-wide (not per-creator) business reporting — GPV trends, active-user counts, cohort retention, chargeback-rate trend, creator-supply health — for leadership/ops decision-making. **Business Goal:** the single source of truth leadership uses to run the business, distinct from F2's per-creator-facing analytics.

### 11. Backend Integration
`GET /v1/admin/reports/gpv-trend`, `/active-users`, `/cohort-retention`, `/chargeback-rate`, `/creator-supply-health` — all served from the same rollup-table architecture as F2 (§12 of F2), scoped platform-wide rather than per-creator.

### 12. Database Dependencies
Shares F2's `creator_analytics_daily`-style rollup infrastructure, aggregated further to platform-wide rollups (`platform_analytics_daily`).

### 13. Cross-Module Dependencies

**Receives from:** F2's rollup-table architecture and pattern (`creator_analytics_daily`-style aggregation, extended here to `platform_analytics_daily`), plus data originating in nearly every Part — C (GPV), A (signups/active-users), C1 (retention/churn), G2 (chargeback rate) — and financial-operations resolution data from H4.
**Hands off to:** Nothing downstream — it produces no events (per header) and exists purely as a reporting lens for leadership/ops decision-making over data owned elsewhere.
**Breaks if changed:** Since this module invents nothing of its own, any drift in F2's rollup architecture or in the upstream Parts' underlying transactional data breaks reconciliation accuracy here first — the same reconciliation-discipline risk called out in §19, modeled on F2 §19.

### 19. Testing
Same reconciliation-accuracy testing discipline as F2 §19 — a platform-reporting figure that doesn't reconcile against raw transactional truth is a serious credibility problem for the team relying on it to make decisions.

### 20. Future Enhancements
Configurable/exportable custom report builder for ad hoc leadership questions beyond the standing dashboard set.

### 21. Tech Stack

- **Frontend:** Internal web admin console (React + TypeScript, not the mobile app) rendering read-only trend charts and health tiles for GPV, active users, cohort retention, chargeback rate, and creator-supply health — no write interactions, consistent with this module producing no events.
- **Backend:** Node.js + NestJS serves `GET /v1/admin/reports/gpv-trend`, `/active-users`, `/cohort-retention`, `/chargeback-rate`, and `/creator-supply-health` (§11), all reading from pre-computed rollups rather than aggregating raw transactional data on request.
- **Third-party services:** Datadog/Grafana-class observability tooling underlies the platform's own metrics pipeline; no external reporting vendor — this module is a lens over the platform's own rollup data.
- **Data layer:** PostgreSQL `platform_analytics_daily` rollup table, built atop the same `creator_analytics_daily`-style rollup infrastructure F2 owns, aggregated further to platform-wide scope (§12).

---

## Module H6 — Support Tooling

**Dependencies:** H2, D1 (for support-initiated messaging where applicable) · **Produced Events:** `support_ticket_created`, `support_ticket_resolved`
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — support agents need some tooling early, but a basic version can launch first and expand later.

### 1. Overview
**Purpose:** Ticket-based support-case management for user-submitted help requests (billing questions, technical issues, the manual-review edge cases F1 §14 and A2 §9 explicitly route here). **Business Goal:** timely, trackable resolution of user issues that fall outside fully-automated flows.

### 3. User Journey
User submits a support request (from Settings, Part J) with a category and description → creates a `SupportTicket` → routed to a support agent's queue (prioritized by category severity, similar in spirit to H3's lane prioritization) → agent investigates (using H2's account-detail view where relevant) → responds/resolves, with the resolution and any account action taken (via H2, if applicable) linked to the ticket for a complete record.

### 9. Business Rules
A ticket referencing a financial dispute is cross-linked to H4's dispute-decision record rather than duplicating that decision-making process within the ticketing tool itself — support tooling coordinates and tracks, it does not re-implement financial or moderation decision logic owned by other Parts.

### 10. Data Requirements
**SupportTicket entity:** `id`, `userId`, `category`, `description`, `status (enum: open|in_progress|resolved|closed)`, `assignedAdminId`, `resolutionNotes`, `linkedActionIds[] (references into H2/H4's action records where applicable)`.

### 11. Backend Integration
`POST /v1/support/tickets`, `GET /v1/admin/support/tickets?status=`, `PATCH /v1/admin/support/tickets/:id`.

### 13. Cross-Module Dependencies

**Receives from:** Support requests submitted from Settings (Part J); account-detail context from H2; verification edge-case escalations from A2 (per A2 §9); financial-dispute records from H4.
**Hands off to:** Cross-linked references into H2 (when an account action is taken as part of ticket resolution) and H4 (when a ticket reflects a financial-dispute decision); resolution notifications back to the user via Part J's notification surface.
**Breaks if changed:** Since a ticket's `linkedActionIds` point at H2/H4's action records rather than duplicating their data, a change to either module's action-record shape breaks this module's cross-link integrity test (§19) — the ticket would show a stale or broken reference instead of the dispute's actual current status.

### 19. Testing
E2E: ticket creation → agent assignment → resolution → user notified, full lifecycle. Cross-link integrity test: a ticket referencing an H4 dispute correctly reflects that dispute's actual current status rather than a stale copy.

### 20. Future Enhancements
A user-facing ticket-status view (currently resolution is delivered via notification only, per §3) if ticket volume/complexity grows enough to justify a dedicated status-tracking screen for users.

### 21. Tech Stack

- **Frontend:** Internal web admin console (React + TypeScript, not the mobile app) providing the support-agent ticket queue (sorted by category severity, §3) and a ticket-detail view that surfaces cross-links into H2/H4 records.
- **Backend:** Node.js + NestJS exposes `POST /v1/support/tickets` (user-facing, called from the consumer app's Settings screen per Part J), `GET /v1/admin/support/tickets?status=`, and `PATCH /v1/admin/support/tickets/:id` for agent-side triage and resolution.
- **Third-party services:** None unique to this module — ticket-resolution notifications ride the shared push/email/SMS providers I1's notification system already integrates, rather than this module owning its own delivery channel.
- **Data layer:** PostgreSQL `SupportTicket` entity (§10) with a `linkedActionIds[]` array referencing H2/H4 action records directly rather than duplicating their data.



\newpage


# Part I — Cross-Cutting Systems

These five modules have no place in the linear product flow (Master Index §1) because every other module depends on them. They are platform infrastructure, specified once here rather than redefined per consumer.

---

## Module I1 — Notification System

**Dependencies:** none (foundational) · **Consumed Services:** Push notification provider (APNs/FCM), Email delivery provider, SMS provider (shared with A1)
**Produced Events:** consumes events from every other Part; produces `notification_sent`, `notification_opened`
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: per the Master Index's own product flow, notifications fire from nearly every module in the product, so nothing else can be considered complete without it.

### 1. Overview
**Purpose:** Deliver in-app, push, and email notifications for every event across the platform that a user needs to know about — new subscriber, gift received, message received, verification resolved, payout status, moderation action, appeal resolution. **Business Goal:** timely notification delivery is a direct driver of session frequency and revenue-moment responsiveness (a creator notified instantly of a new paid message replies faster, converting better per D1 §18).

### 3. User Journey
Any producing module emits a typed notification event → this module renders it per-channel (in-app notification-center entry always; push if the app is backgrounded and the user has push enabled; email for a smaller set of high-importance/low-frequency categories like payout completion or account security) → user taps a push/in-app notification → deep-links directly to the relevant screen (a message notification opens that thread, D1; a gift notification opens the earnings summary, F1) — never to a generic app-open with no context.

### 7. Functional Behaviour
Every notification-producing event across every Part (a non-exhaustive illustrative list: `subscription_created` (C1) → creator notified; `gift_sent` (C4) → creator notified; `message_sent` (D1) → recipient notified if not actively viewing that thread; `creator_verification_resolved` (A2) → creator notified; `payout_status_changed` (F1) → creator notified; `content_actioned` (G1) → content owner notified; `appeal_resolved` (G3) → user notified) is mapped to a notification template in a central registry (Appendix K6 cross-references this registry against the Analytics Event Dictionary, since many notification triggers and analytics events share the same underlying source event).

### 8. State Management
Delivery failure (push token invalid/expired) → falls back to in-app-only for that event, and flags the stale token for cleanup, rather than retrying indefinitely against a dead token.

### 9. Business Rules
Users can configure per-category notification preferences (Part J1) — every category is opt-outable except account-security and legal/compliance notices (a suspension notice, a payout-issue notice), which are always delivered regardless of preference settings, since these are not optional/marketing-style communications. Push-permission is requested at the first meaningful triggering event (predecessor document's Module 13.0 pattern), not at app launch.

### 10. Data Requirements
**Notification entity:** `id`, `userId`, `category`, `sourceEventType`, `sourceEventId`, `channels (array: in_app|push|email)`, `readAt (nullable)`, `createdAt`.

### 11. Backend Integration
`GET /v1/notifications?cursor=`, `PATCH /v1/notifications/:id/read`, `POST /v1/notifications/push-token`. Internal: an event-bus subscriber pattern — this module subscribes to the platform's internal event bus rather than every other module calling it directly, decoupling notification delivery from the producing module's own request/response cycle (a subscription-purchase request, for example, completes and returns to the user without waiting on notification delivery to finish).

### 12. Database Dependencies
`notifications`, `push_tokens`. Index: `notifications.userId + createdAt` (notification-center list), `push_tokens.userId` (multi-device support).

### 13. Cross-Module Dependencies
**Receives from:** receives typed notification-trigger events from effectively every Part in the specification (a non-exhaustive illustrative list: `subscription_created` from C1, `gift_sent` from C4, `message_sent` from D1, `creator_verification_resolved` from A2, `payout_status_changed` from F1, `content_actioned` from G1, `appeal_resolved` from G3).
**Hands off to:** hands off notification-preference configuration to Part J1 (preference management), and hands off deep-link targets back to every module whose events it renders (a message notification deep-links into D1, a gift notification into F1).
**Breaks if changed:** if the central notification-template registry (Appendix K6) drifts from the actual events being emitted, notifications silently stop firing for that event type with no error surfaced anywhere else in the system.

### 14. Error Handling
Email/SMS provider outage → in-app and push channels still attempt delivery independently (channels are not all-or-nothing) — restated as a resilience principle: a single channel's failure never blocks the others.

### 15. Security
Notification content never includes sensitive payload details beyond what's needed for the deep-link context (e.g., a payout notification states "Your payout was processed" rather than including the full amount in a push-notification banner potentially visible on a locked screen).

### 16. Accessibility
Toasts/in-app notifications use `aria-live=polite` (predecessor document's Module 13.0 pattern, restated); critical/blocking notices use `assertive`.

### 17. Performance
Event-bus-driven async delivery (§11) ensures notification processing never adds latency to the producing module's own critical path.

### 18. Analytics
**Events:** `notification_sent {category, channel}`, `notification_opened {category}`. **KPI:** open rate by category (informs which notification types are actually valuable to users vs. candidates for reduced frequency/deprioritization).

### 19. Testing
Integration: an event from any producing Part correctly generates the right notification template with a correctly-resolving deep link. Edge case: user has push disabled entirely but an account-security notice must still be delivered via in-app/email regardless (§9's non-optional category rule enforced, not merely documented).

### 20. Future Enhancements
Digest/batching options for high-frequency categories (e.g., a creator receiving many individual gift notifications during a busy live stream could opt into a single post-stream summary instead of one push per gift).

### 21. Tech Stack

- **Frontend:** React Native (Expo) notification-center screen and toast components drawn from the shared internal component library (Appendix K3); TanStack Query drives the paginated `GET /v1/notifications?cursor=` list, while a Zustand store tracks unread-count badge state client-side as `notification_opened` events fire.
- **Backend:** NestJS event-bus subscriber module that listens to the platform's internal event bus rather than being called directly by producing modules, decoupling delivery from each producer's own request/response cycle (§11); the same Socket.IO gateway used for real-time push also delivers in-app notifications while the app is foregrounded.
- **Third-party services:** FCM (Android) and APNs (iOS) for push, SendGrid/Postmark-class email delivery for the high-importance/low-frequency categories (§9), and a Twilio-class SMS provider shared with A1 for any SMS-channel notices.
- **Data layer:** PostgreSQL `notifications` and `push_tokens` tables (§12); Redis Pub/Sub fans event-bus messages out across backend instances so notification delivery scales horizontally without every instance needing a direct subscription to every producing module.

---

## Module I2 — Search & Recommendation Engine

**Dependencies:** none (foundational) · **Consumed Services:** Search index infrastructure, ranking/ML model serving
**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — basic search can launch as a simple query (per Part B4) while the recommendation half phases in after launch, but the ranking-model work carries moderate-to-high complexity.

### 1. Overview
**Purpose:** Powers B1's feed ranking, B3's clip ranking, and B4's search relevance from one shared underlying service, rather than three independent ranking implementations. **Business Goal:** ranking quality is directly tied to discovery-to-purchase conversion (B1 §18) — this is arguably the single highest-leverage piece of backend infrastructure for GPV growth after the payment/ledger system itself.

### 7. Functional Behaviour
Maintains a denormalized, continuously-updated index of creators/posts/clips/tags (fed by an event-driven pipeline reacting to content-publish and purchase-outcome events across B and C) and serves ranked results to B1/B3/B4 via internal ranking calls; the specific ranking model (initially rule-based — recency, engagement, purchase-conversion-rate-weighted — evolving toward a learned model as outcome data accumulates) is intentionally not fixed in this specification, since it is expected to iterate independently of the rest of the product.

### 9. Business Rules
Ranking must respect G1's moderation-exclusion and blocking rules as a hard filter applied before ranking, never as a post-ranking filter that could still let excluded content momentarily rank highly before being stripped.

### 12. Database Dependencies
A separate search/ranking index (external to the primary transactional database, per B4 §11's already-established principle) kept in sync via an event pipeline, not live joins against transactional tables.

### 13. Cross-Module Dependencies
**Receives from:** receives G1's moderation-exclusion and blocking rules as a hard pre-ranking filter, and receives purchase-outcome signal from C1/C3/C4 to improve ranking quality over time.
**Hands off to:** hands off ranked results to B1 (feed ranking), B3 (clip ranking), and B4 (search relevance) via internal ranking calls — one shared service rather than three independent implementations.
**Breaks if changed:** if G1's exclusion rules are applied after ranking instead of before it, excluded/blocked content could momentarily rank highly before being stripped, which this module's design explicitly prevents.

### 14. Error Handling
Service outage → each consuming module's own documented fallback applies (B1 §14's reverse-chronological fallback; B4 §14's primary-database fallback search) — this module's own outage-handling responsibility is to fail in a way its consumers can detect and fall back from cleanly, not to guarantee its own uptime alone.

### 18. Analytics
Ranking-model quality is evaluated against B1/B3/B4's own conversion-funnel metrics (this module has no independent success metric of its own — its only job is to improve those consuming modules' funnels).

### 19. Testing
Offline model-evaluation harness (ranking quality measured against historical outcome data before any new ranking model version is promoted to serve live traffic) — a standard ML-serving practice applied here given the direct revenue sensitivity of ranking quality.

### 20. Future Enhancements
Personalized ranking incorporating individual viewer purchase history (B4 §20's flagged future direction), applied consistently across B1/B3/B4 once validated.

### 21. Tech Stack

- **Frontend:** No dedicated screens of its own — B1's feed, B3's clip feed, and B4's search-results screens (all React Native/Expo, TanStack Query for the fetched result pages) simply render whatever ranked list this module returns.
- **Backend:** A NestJS internal ranking-service module exposing internal ranking calls to B1/B3/B4, plus an event-driven pipeline (subscribed to content-publish and purchase-outcome events across B and C) that keeps the index continuously updated.
- **Third-party services:** Elasticsearch/OpenSearch for the denormalized creator/post/clip/tag index (the same index B4 §11 already establishes), with a ranking/ML model-serving layer for the learned-model evolution path described in §7.
- **Data layer:** A separate search/ranking index external to the primary transactional database (§12), kept in sync via an event pipeline rather than live joins — Redis caches hot ranking results to keep B1/B3/B4 feed loads fast.

---

## Module I3 — Analytics Platform

**Dependencies:** none (foundational) · **Consumed Services:** Event-streaming/warehouse infrastructure
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking: every KPI, dashboard, and success metric defined anywhere in this entire specification depends on events being captured correctly from day one — this cannot be retrofitted after the fact without losing historical data.

### 1. Overview
**Purpose:** Ingests every `Events:` entry specified across every Part of this document into a queryable warehouse, and is what F2/H5's rollup tables are ultimately built from. **Business Goal:** one consistent event schema and pipeline rather than each Part inventing its own analytics plumbing.

### 10. Data Requirements
A canonical event schema (`eventType`, `userId`, `timestamp`, `properties: JSON`, `sessionId`) that every event named in every Part's §18 conforms to — Appendix K6 is the authoritative registry of every valid `eventType` and its expected `properties` shape.

### 11. Backend Integration
Client and server both emit events via a shared internal SDK/library to this platform's ingestion endpoint; F2 and H5's rollup tables are scheduled batch jobs reading from this platform's warehouse, not separate ad hoc pipelines each Part builds independently.

### 13. Cross-Module Dependencies
**Receives from:** receives every `Events:` entry specified in every Part's §18 across the entire document, via the shared internal SDK/library every client and server emits through.
**Hands off to:** hands off warehouse data to F2 and H5's scheduled rollup batch jobs, and hands off purchase-outcome/ranking-quality signal to I2.
**Breaks if changed:** if an emitted event drifts from the Appendix K6 registry's canonical schema, it silently corrupts whatever downstream rollup (F2, H5) or ranking signal (I2) depends on it, since nothing else in the system independently validates event shape.

### 15. Security
Event payloads are scrubbed of any field that would violate the platform's own data-minimization posture (e.g., never logging raw payment-card data in an analytics event, even inadvertently — a specific, checked rule given how easy this class of mistake is to make when instrumentation is added ad hoc).

### 18. Analytics
This module's own health metrics (event-ingestion success rate, pipeline latency) are the platform's analytics-about-analytics — necessary given how much of F2/H5's credibility depends on this pipeline's completeness and correctness.

### 19. Testing
Schema-conformance test: every event emitted anywhere in the codebase validates against the Appendix K6 registry at CI time, catching a drifted/malformed event before it reaches production and silently corrupts a downstream rollup.

### 20. Future Enhancements
Real-time (streaming, not batch) rollups for the highest-value near-real-time use cases (e.g., a creator's live-session revenue counter, E6 §3, benefits from lower-latency aggregation than the standard hourly-batch rollup pattern used elsewhere).

### 21. Tech Stack

- **Frontend:** No end-user UI of its own — client apps emit events through a shared internal SDK (React Native/TypeScript) that every screen across every Part calls into on the relevant user action, rather than each screen implementing its own event-logging code.
- **Backend:** NestJS ingestion endpoint receiving events from both client and server emitters (§11); scheduled batch jobs (read by F2 and H5) run against the warehouse rather than each Part maintaining its own ad hoc rollup pipeline.
- **Third-party services:** A managed event-streaming/queue layer feeding an analytics-optimized columnar warehouse (e.g., a BigQuery/Snowflake/Redshift-class store) that F2's and H5's reporting, and every Part's own §18 Analytics section, ultimately read from.
- **Data layer:** The canonical event schema (`eventType`, `userId`, `timestamp`, `properties: JSON`, `sessionId`, §10) lands in the warehouse rather than PostgreSQL directly, keeping high-volume event writes off the primary transactional database.

---

## Module I4 — RBAC & Permissions

**Dependencies:** A1 · Referenced by every module in this specification
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking foundational access control, referenced by the `requiredRole` declaration on nearly every API endpoint across every Part.

### 1. Overview
**Purpose:** The authoritative definition of the four roles (Fan, Creator, Support Agent, Platform Admin — Master Index §2.3) and exactly what each can do, so every other module's `requiredRole` declarations trace back to one source of truth rather than being independently invented per endpoint.

### 9. Business Rules
Role permissions are additive and explicit — an endpoint with no stated `requiredRole` restriction is a specification error, not an intentional "open to everyone" default; every endpoint across every Part must explicitly declare its required role(s), including "any authenticated user," never leaving it implicit. Support Agent is a strict subset of Platform Admin's permissions (H3's review queue and H6's ticketing, but not H2's high-impact account actions or H4's financial operations beyond viewing) — the exact permission matrix is maintained as a living config table, not hardcoded per-endpoint checks scattered through the codebase, so a role's permissions can be audited and changed in one place.

### 10. Data Requirements
**Permission matrix (config, not a typical database entity):** `role × resource × action → allowed (bool)`, versioned so a permission change's effective date is auditable alongside I5's action logs.

### 11. Backend Integration
A shared authorization-check library/middleware every endpoint in every Part calls, referencing the current permission matrix — this is infrastructure every other Part's Backend Integration section assumes exists, restated here as its actual owner.

### 13. Cross-Module Dependencies
**Receives from:** receives its foundational identity/session context from A1, and receives the requirement to declare a `requiredRole` from every endpoint's own Backend Integration section across every Part.
**Hands off to:** hands off role-evaluation results to every module in the specification — the permission matrix is the one source of truth every other Part's `requiredRole` declaration traces back to.
**Breaks if changed:** a bug in the permission matrix or its evaluation logic can silently over- or under-grant access across the entire platform, and any change to the matrix itself requires Platform-Admin-role approval and an I5 audit-log entry.

### 15. Security
This module is, alongside C2 and H2, one of the three highest-blast-radius modules in the specification — a bug in the permission matrix or its evaluation logic can silently over- or under-grant access across the entire platform. Changes to the permission matrix itself require Platform-Admin-role approval and are audit-logged (I5).

### 19. Testing
A comprehensive automated test suite asserting every documented `requiredRole` across every Part's Backend Integration section actually matches the deployed permission matrix — this cross-Part consistency check is this module's single most valuable test, since it's the mechanism that keeps this 40+-module specification's many independently-written `requiredRole` declarations honest against the real system.

### 20. Future Enhancements
Finer-grained permission scopes within Platform Admin (e.g., a Financial-Ops-only admin distinct from a Trust-and-Safety-only admin) once headcount/org structure justifies splitting the current single Platform Admin role.

### 21. Tech Stack

- **Frontend:** No screens of its own — the shared internal component library (Appendix K3) and navigation layer consult the current user's role (from Zustand's `sessionStore`, set at A1 login) to conditionally render admin-only affordances, but the actual authorization decision is never trusted to the client.
- **Backend:** A shared NestJS authorization-check middleware/guard every endpoint in every Part attaches to, evaluating the current permission matrix on every request (§11) rather than each Part hand-rolling its own role check.
- **Third-party services:** None — this is deliberately kept as internal, auditable infrastructure rather than delegated to an external authorization-as-a-service provider, given its status as one of the specification's three highest-blast-radius modules (§15).
- **Data layer:** The permission matrix lives as a versioned config table in PostgreSQL (`role × resource × action → allowed`, §10), with every change requiring Platform-Admin approval and an I5 audit-log entry.

---

## Module I5 — Audit Logging

**Dependencies:** none (foundational) · Referenced by every module that performs a state-changing admin action
**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking legal/compliance requirement, referenced by nearly every admin-initiated action in Part H.

### 1. Overview
**Purpose:** An immutable record of every state-changing action taken by an admin (H2, H3, H4) or by the system on the system's own initiative (an automated fraud-hold, an automated content action) — the record every dispute, legal request, and internal investigation is resolved against.

### 9. Business Rules
Every write to this log is append-only — there is no update or delete operation exposed anywhere in the system for an audit-log entry, by design, mirroring C2's `ledger_entries` immutability principle applied here to actions rather than money. Every admin-initiated action across H2/H3/H4 is required to write an audit-log entry as part of the same transaction as the action itself (not a best-effort side-effect that could be silently skipped on a partial failure).

### 10. Data Requirements
**AuditLogEntry entity:** `id`, `actorType (enum: admin | system)`, `actorId (nullable for system-initiated)`, `action`, `targetType`, `targetId`, `reason (nullable — populated for admin actions per H2 §9's mandatory-reason rule)`, `metadata (JSON)`, `createdAt`.

### 11. Backend Integration
An internal write-only logging call every admin-action endpoint across H2/H3/H4 invokes synchronously within its own transaction — not a public API.

### 13. Cross-Module Dependencies
**Receives from:** receives audit-log write calls from H2, H3, H4, G3, A2 (verification overrides), and F3 (payout batch approvals) — each written synchronously within the same transaction as the action itself.
**Hands off to:** hands off prior-action history to H2's account-detail view, and hands off records to legal/compliance requests (outside this document's scope but a real consumer of this data).
**Breaks if changed:** if any admin-action endpoint across H2/H3/H4 skips its audit-log write, the system of record for disputes and legal/compliance requests has a gap that cannot be reconstructed after the fact, since every write is append-only with no update/delete path to backfill it.

### 15. Security
Access to query the audit log is itself a restricted, logged action (auditing who looks at the audit log is a standard defense-in-depth practice for this class of system).

### 19. Testing
Completeness test: every admin-action endpoint across H2/H3/H4 is verified (via a static/contract check, not just a manual review) to write a corresponding audit-log entry — a missing audit write on any admin action is treated as a release-blocking defect given this log's role as the system of record for disputes.

### 20. Future Enhancements
Tamper-evidence (cryptographic chaining of log entries) if the compliance requirements of a future launch jurisdiction demand it beyond simple database-level immutability.

### 21. Tech Stack

- **Frontend:** No direct UI — H2's account-detail view (React Native/Expo, TanStack Query) is the sole consumer that renders this module's data, as a read-only prior-action history list.
- **Backend:** A NestJS internal write-only logging call invoked synchronously, inside the same transaction as the triggering action, by every admin-action endpoint across H2/H3/H4 (§11) — never a public API, and never a best-effort side effect that could be silently skipped.
- **Third-party services:** None by design — keeping this module free of external dependencies avoids introducing any failure mode that could cause an admin action to commit without its corresponding audit-log entry.
- **Data layer:** PostgreSQL append-only `AuditLogEntry` table (§10) with no update or delete operation exposed anywhere in the system, mirroring Part C2's `ledger_entries` immutability principle applied to actions rather than money.



\newpage


# Part J — Account Settings & Lifecycle

---

## Module J1 — Settings, Privacy & Safety Controls

**Dependencies:** A1, A3, I1 · **Produced Events:** `settings_updated`

**Priority:** [🟡 MEDIUM PRIORITY]{custom-style="Priority Medium"} — a baseline settings screen is needed at launch, but the full privacy-control suite (geo-restriction, screenshot warnings, billing-descriptor preview) can phase in shortly after; moderate complexity.

### 1. Overview
**Purpose:** Standard account management plus the category-specific privacy controls this platform needs beyond a generic social app: geo-restriction, billing-descriptor preview, notification preferences, blocked-user management, screenshot-warning toggle. **Business Goal:** creator trust in privacy controls (specifically geo-restriction) is a documented real-world adoption factor for creators in this content category, distinct from general social-app privacy expectations.

### 3. User Journey
Settings → grouped list (Account / Privacy / Notifications / Payment Methods / Blocked Users / Legal) → Privacy group surfaces geo-restriction (creator-only: multi-select country list with search, saves per-selection with no separate save button), billing-descriptor preview (fan-facing: "Your card statement will show: XXXX*ENT"), screenshot-warning toggle → Notifications group lets the user opt in/out per category (I1 §9's non-optional categories are shown but disabled/greyed, with an explanation, rather than simply omitted, so the user understands why they can't turn those off) → Payment Methods lists/manages saved cards (via the processor's tokenized vault, C2 §15) → Blocked Users lists/manages blocks (G1) → Legal links to ToS/Privacy Policy and the account-deletion flow (J2).

### 9. Business Rules
Geo-restriction is creator-only and affects content *visibility* (a restricted-country viewer sees the creator as if the profile didn't exist in discovery/search, not a visible-but-blocked state) — enforced server-side on every content-serving endpoint (B1/B3/B4/B5), keyed off the viewer's IP-derived geography, not a client-side hide. Billing-descriptor text is read-only/informational to the fan (not configurable by them) but is itself a real value the platform's payment-processor integration determines — this screen surfaces it accurately, it doesn't invent placeholder text.

### 10. Data Requirements
**UserSettings entity:** `userId`, `notificationPreferences (JSON, per-category)`, `geoRestrictions (creator only, array of country codes)`, `screenshotWarningEnabled (bool)`.

### 11. Backend Integration
`GET/PATCH /v1/settings`, `GET/PATCH /v1/settings/geo-restrictions`, `GET /v1/settings/billing-descriptor-preview`, `GET /v1/settings/payment-methods`, `DELETE /v1/settings/payment-methods/:id`.

### 12. Database Dependencies
`user_settings`. Geo-restriction enforcement is a query-time join against this table from every content-serving endpoint in B — a cross-cutting dependency worth flagging explicitly (a new content-serving endpoint added later must remember to apply this filter, the same class of easy-to-miss cross-cutting rule as G1's block-filtering).

### 13. Cross-Module Dependencies
**Receives from:** A1 (authenticated session identity this module's settings are keyed against), A3 (creator/fan role determining which controls, e.g. geo-restriction, are shown), I1 (the notification-category taxonomy, including which categories are non-optional, that this screen renders and enforces).
**Hands off to:** B1/B3/B4/B5 (the geo-restriction filter this module writes, which every content-serving endpoint must query at serve time), I1 (the notification preferences this module writes, applied to every outbound notification), G1 (the blocked-user list surfaced here, sourced from and managed via G1), C2 (payment-method add/remove requests, executed through C2's tokenized-vault integration).

### 14. Error Handling
Geo-restriction save partially fails (some countries saved, request errors mid-way) → the whole update is transactional (all-or-nothing), never a partially-applied restriction list left silently incomplete.

### 15. Security
Payment-method deletion requires the same tokenized-vault interaction as adding one (C2 §15) — the platform never handles raw card data at any point in this flow either.

### 16. Accessibility
All toggles show clear on/off text state (predecessor document's principle, restated); destructive actions elsewhere reachable from this screen (account deletion, J2) require explicit typed confirmation, not a single tap.

### 17. Performance
Settings reads are cached client-side aggressively (rarely change) with straightforward invalidation on any successful `PATCH`.

### 18. Analytics
**Events:** `settings_updated {category}`, `geo_restriction_changed {countryCount}`. **KPI:** geo-restriction adoption rate among creators (informs whether this feature is being found/used as intended).

### 19. Testing
E2E: a creator geo-restricts a country → a test account with that geography's IP correctly cannot find that creator in discovery/search/direct-profile-link. Edge case: a subscriber in a newly-geo-restricted country retains their existing subscription (geo-restriction affects new discovery, not existing paid relationships, unless the creator separately and explicitly removes a specific subscriber — a distinct, intentional action from geo-restriction).

### 20. Future Enhancements
Screenshot-detection (OS-level signal where available) triggering an in-app notice to the content owner, as a stronger (though still not fully preventable, per the predecessor document's honesty principle about this feature's real limits) deterrent than the current warning-toggle alone.

### 21. Tech Stack

- **Frontend:** React Native (Expo) settings screens (grouped list, toggles, the multi-select country picker for geo-restriction) built from the shared component library (Appendix K3); TanStack Query caches the `GET /v1/settings` reads client-side per §17, with mutations invalidating that cache on every successful `PATCH`.
- **Backend:** NestJS settings module exposing `GET/PATCH /v1/settings`, `GET/PATCH /v1/settings/geo-restrictions`, `GET /v1/settings/billing-descriptor-preview`, and the payment-method endpoints, with the geo-restriction filter enforced server-side as a query-time join consumed by every content-serving endpoint in B.
- **Third-party services:** the same tokenized-vault payment processor integration C2 uses for saved-card add/remove (§15) — this module never touches raw card data — plus whatever billing-processor API supplies the accurate billing-descriptor text shown to fans.
- **Data layer:** PostgreSQL `user_settings` table (§10) holding `notificationPreferences`, `geoRestrictions`, and `screenshotWarningEnabled`; Redis fronts the aggressively-cached settings reads described in §17, invalidated on any successful `PATCH`.

---

## Module J2 — Account Deletion & Data Retention

**Dependencies:** A2, C1, C2, G1 · **Produced Events:** `account_deletion_requested`, `account_deletion_completed`

**Priority:** [🔴 HIGH PRIORITY]{custom-style="Priority High"} — launch-blocking legal/data-privacy-law requirement; high complexity (the retention-treatment registry must correctly classify every entity across the entire schema, per this module's own completeness-testing requirement).

### 1. Overview
**Purpose:** Let a user delete their account while correctly handling the legally-mandated retention of specific record categories (identity verification records, financial/transaction records) that cannot be deleted even at the user's own request. **Business Goal:** honor user deletion rights (where they exist) without violating §2257 record-keeping or financial audit-trail requirements — getting this balance wrong in either direction is a real legal-exposure risk.

### 3. User Journey
Settings → Legal → Delete Account → explanation screen stating plainly what will and won't be deleted (content removed from public view, messages tombstoned, but transaction/verification records retained per legal requirement, stated in plain language, not buried in a policy link) → typed confirmation (per J1 §16's destructive-action pattern) → if the account has an active subscription-as-creator relationship with any fans, an additional warning about those fans losing access → deletion request queued (not always instant — see Business Rules) → `account_deletion_completed` fires once processing finishes, with a final confirmation notification.

### 9. Business Rules
Content (posts, profile, messages) is immediately unpublished/hidden from all other users at request time, but the underlying records are soft-deleted (Master Index §2.4) and retained for a standard operational grace period (e.g., 30 days, recoverable if the deletion was a mistake/impulse decision) before a final hard-delete pass removes everything not under a legal retention hold. Records under a legal retention hold (creator identity-verification records per §2257, financial transaction/ledger records per standard accounting/audit requirements) are never deleted regardless of user request or elapsed time — they are retained for the legally mandated minimum period, described honestly to the user at request time (§3) rather than glossed over. A creator with an active fraud investigation (G2) or open moderation case (G1) cannot complete a self-service deletion until that case resolves — the deletion request is held, with a clear explanation, rather than allowed to proceed and potentially destroy evidence relevant to an open case.

### 10. Data Requirements
**DeletionRequest entity:** `id`, `userId`, `requestedAt`, `gracePeriodEndsAt`, `status (enum: pending_grace_period | held_pending_case | completed | cancelled_by_user)`, `heldReasonCaseId (nullable, references a G1/G2 case)`.

### 11. Backend Integration
`POST /v1/account/deletion-request`, `DELETE /v1/account/deletion-request` (cancel within grace period), a scheduled job that executes final hard-deletion (excluding legally-held record categories) once the grace period elapses and no hold applies.

### 12. Database Dependencies
The hard-deletion job must correctly enumerate every table containing user-linked data across every Part of this specification and apply the correct treatment per table (hard-delete, anonymize, or retain-under-hold) — Appendix K2's Database Entity Reference is required to include a `retentionTreatment` classification per entity specifically so this job has a complete, auditable list to execute against rather than relying on tribal knowledge of what's in the schema.

### 13. Cross-Module Dependencies
**Receives from:** G1, G2 (open-case/fraud-investigation status this module checks before allowing a self-service deletion to proceed — an open case holds the request rather than letting it complete).
**Hands off to:** A2 (identity-verification records this module must retain under legal hold rather than delete), C2 (financial/ledger records retained under the same hold, per standard audit requirements), and every content/message-owning module — B, D — which receive this module's soft-deletion cascade when a deletion request clears its grace period.

### 14. Error Handling
Hard-deletion job encounters a table not yet classified in the K2 retention-treatment registry → fails closed (halts and alerts, does not guess) — an unclassified table is a specification gap to fix, never a case to silently skip past or silently delete without knowing whether that was legally correct.

### 15. Security
Deletion requests and their processing are audit-logged (I5) — deletion is itself a sensitive, disputable action worth a permanent record of when and how it was requested and executed, ironically the one category of action that must be logged forever even as it deletes everything else.

### 16. Accessibility
Deletion-flow explanation screen uses plain language (avoiding legal jargon) about what is and isn't deleted, consistent with the platform's general plain-language principle for consequential/compliance-adjacent screens (A2 §16, G3 §16).

### 18. Analytics
**Events:** `account_deletion_requested {reason category if provided}`, `account_deletion_cancelled`, `account_deletion_completed`. **KPI:** deletion-request rate as a churn signal, cancellation-within-grace-period rate (a high cancellation rate might suggest deletion is sometimes an impulse action worth better in-flow retention prompts, a product decision distinct from the legal-compliance mechanics this module exists for).

### 19. Testing
Completeness test: the hard-deletion job's table enumeration is checked against the full Appendix K2 entity list at CI time, failing the build if a new entity is added to the schema without a corresponding `retentionTreatment` classification — this prevents the exact "silently skip an unclassified table" failure mode flagged in §14 from ever reaching production undetected. E2E: full request→grace-period→cancel-and-restore lifecycle, and separately, full request→grace-period→hard-delete-completes lifecycle, verifying retained-category records genuinely survive and everything else genuinely doesn't.

### 20. Future Enhancements
A data-export ("download your data") feature offered alongside deletion, a common and reasonable pairing for user-data-rights requests generally, scoped as a natural companion feature once deletion itself is solid.

### 21. Tech Stack

- **Frontend:** React Native (Expo) deletion-flow screens (plain-language explanation, typed confirmation per J1 §16's destructive-action pattern, active-subscription warning) built from the shared component library (Appendix K3); a one-shot mutation posts `POST /v1/account/deletion-request` rather than any cached read.
- **Backend:** NestJS account-lifecycle module exposing `POST /v1/account/deletion-request` and `DELETE /v1/account/deletion-request` (grace-period cancellation), plus a background job scheduler that runs the final hard-deletion pass once the grace period elapses and no G1/G2 hold applies.
- **Third-party services:** none directly consumer-facing; the hard-deletion job's retain-vs-delete decision for financial records depends on the same payment-processor/ledger integration C2 uses, and identity-verification records held under §2257 stay in whatever verification-document store A2 uses.
- **Data layer:** PostgreSQL `deletion_requests` table (§10) tracking `status`/`gracePeriodEndsAt`/`heldReasonCaseId`; the scheduled hard-deletion job queries every table in the schema per Appendix K2's `retentionTreatment` classification, and a CI-time completeness check (§19) fails the build if any schema entity lacks that classification. Deletion processing is audit-logged (Part I5) per §15.



\newpage


# Part K — Appendices

---

## K1. Competitor Research Matrix

Full per-module competitor analysis appears inline throughout Parts A–J. This table is the consolidated cross-reference: which platforms were studied for which feature category, and the single most important takeaway adopted or deliberately rejected from each.

| Feature Category | Platforms Studied | Key Takeaway Adopted | Weakness Deliberately Avoided |
|---|---|---|---|
| Subscription paywall & tiering | OnlyFans, Fansly, Patreon, Passes | Fansly/Patreon's multi-tier model (C1); Patreon's checkmark-card comparison UI | OnlyFans' historical single-tier rigidity |
| PPV / locked content | OnlyFans, Fansly, Fanvue | Universal blur-padlock-price pattern (C3) — a fully standardized convention, not worth reinventing | Under-communicated renewal terms driving chargebacks (fixed via explicit confirm-step copy, C1 §2) |
| DM monetization | OnlyFans, Passes, Telegram, Discord | Passes' paid-DM/CRM tooling (D1, D2); Telegram/Discord's rich-embedded-content discipline | — |
| Virtual currency / gifting economy | Tango, BIGO Live, Chaturbate, Stripchat, LiveJasmin | Tango/BIGO's dual-denomination Coins↔Credits split (A4, C2) — the structural core of the entire monetization layer | Chaturbate's single-token model's lack of independent purchase/payout margin control |
| Live streaming & battles | Tango, BIGO Live, Twitch, TikTok LIVE | Full-bleed minimal-chrome viewer (E1); BIGO's PK battle tug-of-war (E4) | Standard HLS latency undermining the live-gifting feedback loop (addressed via mandated low-latency provider, E1 §2) |
| Discovery & short-form | Instagram, TikTok, Snapchat, Reddit | TikTok/Reels thumb-zone action stack (B3); Reddit's blended-feed architecture (B1) | Pure engagement-only ranking (addressed by purchase-outcome-weighted ranking, I2) |
| Ephemeral content | Snapchat, Instagram | Color-coded ring states (B2) — fully solved UI pattern | — |
| Creator dashboards & payouts | Tango, BIGO Live, OnlyFans, YouTube | Available-vs-pending balance separation (F1) — proven trust-builder across every gifting platform studied | Obscuring the pending/available distinction (a documented support-ticket source) |
| Identity/age verification | OnlyFans, Patreon, Substack | Automated document+liveness-first, human-review-as-fallback (A2) | Handwritten-note-holding-ID step reported as the most confusing part of OnlyFans' flow (replaced with an automated liveness check) |
| Community/moderation tooling | Discord, Reddit, X (Twitter) | Structured report-category-first UX (G1); Discord's scaled human-plus-automated moderation split (G1, H3) | — |

## K2. Database Entity Reference

Consolidated across every Part. `Retention Treatment` (referenced by Part J2's deletion job) is one of: **Hard-delete** (removed entirely on user deletion, after grace period), **Anonymize** (user linkage stripped, record kept for aggregate reporting), **Retain-under-hold** (never deleted regardless of user request — legal requirement).

| Entity | Owning Module | Key Fields | Relationships | Retention Treatment |
|---|---|---|---|---|
| users | A1 | phone, email, authProvider, identityStrength | 1:1 with every other entity below | Anonymize |
| otp_codes | A1 | codeHash, expiresAt, attempts | — | Hard-delete (short TTL regardless) |
| sessions | A1 | refreshTokenHash, deviceInfo | → users | Hard-delete on revocation |
| age_tokens | A2 | issuedAt, expiresAt, jurisdiction | → users | Anonymize |
| creator_verifications | A2 | status, vendorReferenceId, rejectionReasonCode | → users | Retain-under-hold (§2257) |
| verification_attempts | A2 | attemptNumber, outcome | → users | Retain-under-hold |
| profiles | A3 | handle, bio, avatarUrl, publishedAt | 1:1 users | Hard-delete |
| coin_wallets | A4 | balance | 1:1 users | Retain-under-hold (financial) |
| credit_ledgers | A4 | availableBalance, pendingBalance, lifetimeEarned | 1:1 users | Retain-under-hold |
| currency_conversion_rates | A4 | rate, effectiveFrom/To | platform config | Retain (not user-linked) |
| posts | B1 | visibility, priceCoins, moderationStatus | → profiles | Hard-delete |
| post_likes / post_comments | B1 | — | → posts, users | Hard-delete |
| stories | B2 | mediaUrl, expiresAt, visibility | → profiles | Hard-delete (natural expiry) |
| story_views | B2 | viewedAt | → stories, users | Hard-delete |
| clips | B3 | hlsManifestUrl, durationSeconds | → profiles | Hard-delete |
| subscription_tiers | C1 | priceCents, benefitList | → profiles | Anonymize |
| subscriptions | C1 | status, currentPeriodEnd, cancelAtPeriodEnd | → users ×2 | Retain-under-hold (financial) |
| subscription_status_history | C1 | — | → subscriptions | Retain-under-hold |
| ledger_entries | C2 | type, amount, reason, idempotencyKey | → wallets | Retain-under-hold (never deleted) |
| unlocks | C3 | priceCentsPaidEquivalent, unlockedAt | → users, posts | Retain-under-hold |
| tips_gifts | C4 | amountCoins, context | → users ×2 | Retain-under-hold |
| gift_catalog_items | C4 | — | → profiles | Anonymize |
| goals | C5 | targetCoins, currentCoins, status | → profiles | Anonymize |
| referrals | C6 | referralCode, rewardGrantedAt | → users ×2 | Anonymize |
| promotional_credits | C6/C7 | amountCoins, sourceType, expiresAt | → users | Retain-under-hold |
| threads / messages | D1 | type, priceCoins, unlockId | → users ×2 | Hard-delete (tombstone first) |
| broadcasts | D2 | segmentFilter, recipientCountAtSend | → profiles | Anonymize |
| calls | D3 | ratePerMinuteCoins, totalBilledCoins, endReason | → users ×2 | Retain-under-hold (financial) |
| live_sessions | E1 | status, peakViewerCount, roomMode | → profiles | Anonymize |
| payouts | F1 | amountCoins, method, status | → users | Retain-under-hold |
| payout_batches | F3 | railProvider, reconciledAt | → payouts | Retain-under-hold |
| reports | G1 | reasonCategory, status | → users, content | Retain-under-hold |
| blocks | G1 | — | → users ×2 | Hard-delete |
| content_moderation_actions | G1 | — | → content | Retain-under-hold |
| risk_signals / risk_decisions | G2 | signalType, score | → users | Retain-under-hold |
| suspensions / appeals | G3 | reasonCategory, status | → users | Retain-under-hold |
| admin_actions | H2 | actionType, reason, secondApproverAdminId | → users, admins | Retain-under-hold (never deleted) |
| campaigns | H4 | budgetCap, segmentRules | platform config | Retain |
| refund_decisions | H4 | — | → ledger_entries | Retain-under-hold |
| support_tickets | H6 | category, status, linkedActionIds | → users | Anonymize |
| notifications / push_tokens | I1 | category, channels | → users | Hard-delete |
| audit_log_entries | I5 | actorType, action, reason | → any entity | Retain-under-hold (never deleted, no exceptions) |
| user_settings | J1 | geoRestrictions, notificationPreferences | 1:1 users | Hard-delete |
| deletion_requests | J2 | status, gracePeriodEndsAt | → users | Retain-under-hold (the record that the deletion happened, ironically) |

## K3. Design System (Reference)

Full detail (component-level breakdown per module) lives in each Part's UI Layout/Component Breakdown sections. Core tokens, consolidated:

**Color:** Neutral 900 `#12121A` (text) · Neutral 50 `#FAFAFC` (surface) · Brand Accent `#4F46E5` (navigation/links) · Monetization Accent `#FF3B6B` (reserved exclusively for Subscribe/Unlock/Send Gift — never used elsewhere, so "this costs money" is instantly recognizable) · Success `#1FAA6E` · Warning `#E0A324` · Error `#D8342A` · Live indicator `#FF2D2D`.
**Typography:** Display 28–32px/700, Title 20–22px/600, Body 15–16px/400, Caption 13px/400, Label 12px/600 uppercase.
**Spacing scale:** 4/8/12/16/24/32/48/64px.
**Motion scale:** fast 100ms, base 150ms, moderate 200ms, slow 300ms, deliberate 400ms — every module's Color & Motion Specs section references these named tokens rather than inventing new timing values.

## K4. API Standards & Error Code Registry

Base conventions defined in Master Index §2.1–2.2. Consolidated error codes used across this specification (non-exhaustive — each Part's Error Handling section is authoritative for its own domain; this table is the cross-Part quick reference):

| Code | HTTP Status | Origin Module | Meaning |
|---|---|---|---|
| `UNDERAGE` | 403 | A2 | Age-gate determined the user is below the jurisdictional threshold |
| `CODE_EXPIRED` | 410 | A1 | OTP code past its 10-minute TTL |
| `OAUTH_TOKEN_INVALID` | 401 | A1 | Social-auth provider token rejected/expired |
| `HANDLE_TAKEN` | 409 | A3 | Race-condition loss on a unique handle |
| `PUBLISH_REQUIREMENTS_NOT_MET` | 422 | A3 | Creator profile missing a required field for publish |
| `WALLET_NOT_PROVISIONED` | 500 | A4 | Structural data-integrity fault (should be impossible) |
| `INSUFFICIENT_BALANCE` | 402 | C2/C3/C4/D3 | Wallet balance below the requested spend |
| `IDEMPOTENCY_KEY_CONFLICT` | 409 | C2 | Same idempotency key reused with a different payload |
| `FORBIDDEN_ROLE` | 403 | I4 (platform-wide) | Authenticated but insufficient role for the requested action |
| `UNAUTHENTICATED` | 401 | I4 (platform-wide) | No valid session |
| `REJECTED_DOCUMENT_AUTHENTICITY` / `REJECTED_FACE_MISMATCH` | 200 (business rejection, not transport error) | A2 | Specific creator-verification rejection reasons |

## K5. QA Master Checklist (Cross-Part, Release-Blocking Items)

These are the specific checks flagged as release-blocking (not merely "nice to verify") across the specification, gathered in one place because they are the items most likely to be quietly skipped under release-schedule pressure if not called out centrally:

1. **Entitlement-leak test (C3 §19):** automated payload inspection confirms no `fullMediaUrl` is ever returned to a non-entitled viewer across B1, B5, D1.
2. **Ledger reconciliation (C2 §19):** sum of `ledger_entries` matches cached wallet `balance` columns exactly after a full load test, with zero discrepancy tolerance.
3. **Pre-publish moderation gate (G1 §19):** automated classification correctly blocks a flagged test asset from reaching publishable state across every upload path (B, C, D, E) — checked per path.
4. **RBAC consistency (I4 §19):** every documented `requiredRole` across every Part's Backend Integration table matches the deployed permission matrix.
5. **Audit completeness (I5 §19):** every admin-action endpoint in H2/H3/H4 is verified to write a corresponding audit-log entry.
6. **Deletion-retention completeness (J2 §19):** every database entity has a classified `retentionTreatment` (K2); the hard-deletion job fails closed on any unclassified entity.
7. **Double-spend/race safety (C2 §19):** row-lock discipline holds under simulated concurrent-spend load; exact-balance edge case succeeds correctly.
8. **Call billing safety (D3 §19):** metered per-minute billing never produces a negative balance; insufficient-balance mid-call triggers graceful warn-then-end, never an abrupt cut with an uncollectable charge.
9. **Viral-burst resilience (C2/C4/E2/E3 §19, shared scenario class):** gift-sending and live-chat systems remain responsive under a simulated viral-moment load spike; the animation-batching circuit breaker (E2) engages correctly.
10. **Reconciliation accuracy for all analytics/reporting rollups (F2/H5 §19):** rollup-table figures match raw-table ground truth for a fixed test dataset.

## K6. Analytics Event Dictionary (Registry)

The authoritative list is maintained as a living config the Analytics Platform (I3) validates against at CI time (I3 §19) — reproduced here as the human-readable reference, grouped by Part. Every event name below appears with its producing module in that Part's §18 (Analytics) section; this table exists purely as a consolidated index, not a duplicate specification.

**Auth/Identity (A):** `user_registered`, `otp_verified`, `age_gate_result`, `creator_verification_resolved`, `profile_published`, `wallet_provisioned`.
**Discovery (B):** `feed_item_impression`, `feed_item_tapped`, `story_segment_viewed`, `clip_completed`, `search_performed`, `profile_viewed`.
**Monetization (C):** `subscription_created`, `subscription_cancelled`, `wallet_purchase_completed`, `content_unlocked`, `tip_sent`, `gift_sent`, `goal_completed`, `referral_reward_granted`, `bonus_granted`.
**Messaging (D):** `message_sent`, `locked_message_unlocked`, `broadcast_sent`, `call_ended`.
**Live (E):** `live_session_joined`, `gift_animation_batched`, `pk_battle_ended`, `broadcast_started`.
**Creator Economy (F):** `payout_requested`, `payout_status_changed`, `analytics_dashboard_viewed`.
**Trust & Safety (G):** `content_reported`, `content_actioned`, `user_blocked`.
**Admin (H):** `admin_user_action_taken`, `review_item_actioned`, `financial_review_decided`.
**Cross-Cutting (I):** `notification_sent`, `notification_opened`.
**Lifecycle (J):** `settings_updated`, `account_deletion_requested`, `account_deletion_completed`.

## K7. Glossary

- **Coins** — the platform's fan-facing purchasable virtual currency (A4). Real money in, Coins out.
- **Credits** — the platform's creator-facing earned virtual currency (A4), converted from spent Coins at a platform-controlled rate; the margin between the Coins purchase rate and the Credits payout rate is where platform take-rate structurally lives.
- **GPV (Gross Payment Volume)** — total real-money value flowing through the wallet in a period; the platform's primary North Star metric (Master Index §2.6).
- **PPV (Pay-Per-View)** — a one-off priced content item, independent of subscription (C3), as distinct from a recurring subscription (C1).
- **Ledger Entry** — an immutable, append-only record of a single debit or credit (C2); the actual source of financial truth, with wallet `balance` fields as derived caches.
- **Entitlement** — whether a given viewer is currently authorized to see a given piece of full-resolution content (via subscription, C1, or unlock, C3) — always checked server-side, never trusted from a client-cached flag.
- **RBAC (Role-Based Access Control)** — the four-role permission model (Fan, Creator, Support Agent, Platform Admin) governing every endpoint (I4).
- **Holding Period** — the interval (default 7 days) newly-earned Credits sit in `pendingBalance` before becoming withdrawable, absorbing the chargeback/dispute window on the originating charge (F1 §9).
- **Dual-Control** — a requirement that a high-impact admin action (large payout batch, permanent ban) be approved by a second, different admin before taking effect (H2/H4/F3).
- **Soft Delete** — marking a record `deletedAt` and excluding it from normal queries without physically removing it, used for most content; distinct from the stronger `Retain-under-hold` classification (K2) applied to legally-mandated record categories that survive even a user's own deletion request.

## K8. End-to-End System Wiring

The Master Index's §1 Complete Product Flow traces the product at the *stage* level — nine stages, each naming a Part. This appendix traces the same territory again at the *module and data-handoff* level: five complete, real user journeys, walked module-by-module, call-by-call, with the exact field/event/endpoint each step hands to the next. Where the Master Index answers "what are the stages," this appendix answers "which module calls which, passing exactly what" — the level of detail an engineer actually needs to verify nothing is a dead end, and the level a QA engineer needs to write a true end-to-end test rather than 44 isolated module tests. Every module referenced below is documented in full in its own Part; nothing here overrides or restates those modules' own specifications, it only sequences them.

### K8.1 — Fan Signup to First Subscription Purchase

1. **A1 Authentication** — fan completes phone-OTP signup → `POST /v1/auth/otp/verify` returns `{ accessToken, refreshToken, user, isNewAccount: true }` → the JWT (`userId`, `role: fan`, `verificationStatus: none`) is stored in `sessionStore`. Emits `user.registered`.
2. **A2 Age Verification** — the new account is routed into the fan age-gate interstitial → `POST /v1/verification/age-token { dateOfBirth }` → on pass, a signed `ageToken` is issued and `sessionStore.verificationStatus` updates. Emits `age_gate_passed`.
3. **A3 Profile Creation (fan path)** — the auto-suggested handle is accepted → `POST /v1/profiles` creates the `Profile` row → `sessionStore.profile` populates. Emits `profile_created`.
4. **A4 Wallet Creation** — triggered synchronously inside A3's `POST /v1/profiles` transaction (never a separate async step) → a `CoinWallet` row is created with `balance: 0`. Emits `wallet_provisioned`; the app shell's balance chip now reads "0 Coins" via `GET /v1/wallet/summary`.
5. **B1 Discovery Feed** — the fan lands here immediately after A3/A4 complete, scrolls, and taps into a creator's post, landing on that creator's profile.
6. **B5 Creator Profile** — the fan views the creator's public profile and taps Subscribe on a tier card, carrying `creatorId` and `tierId` into the purchase flow.
7. **C1 Subscriptions** — the fan confirms the tier price; if `CoinWallet.balance` is insufficient, C2's inline top-up flow opens first. Once funded, `POST /v1/subscriptions { creatorId, tierId }` fires with an `Idempotency-Key` header (Master Index §2.1).
8. **C2 Wallet Deduction Engine (Ledger)** — C1's call invokes C2's `debitAndCredit` internally: debits the fan's `CoinWallet`, credits the creator's `CreditLedger.pendingBalance` net of platform fee, and writes two immutable `ledger_entries` rows (debit + credit) inside one row-locked database transaction. Emits `wallet_purchase_completed` and `subscription_created`.
9. **B5 Creator Profile (return visit)** — the fan's view of the profile now shows subscriber-only content unlocked, per B5's entitlement check against C1's subscription record (the **Entitlement** glossary term, above).
10. **F1 Creator Earnings & Payout Dashboard** — the creator's `CreditLedger.pendingBalance` reflects the new subscription the next time they open Creator Studio — a pull-on-read surface, not a push.
11. **I3 Analytics Platform** — every event emitted in steps 1–8 lands in the central event pipeline, rolling up into GPV (Master Index §2.6) and each Part's own Success Metrics.

### K8.2 — Fan Sends a Live Gift During a Stream

1. **E1 Live Stream Viewer Interface** — the fan joins a creator's live room via `POST /v1/live/:roomId/join`, connecting to the shared `live:{roomId}` WebSocket channel this entire Part shares.
2. **C4 Tipping & Gifting** — the fan taps a gift from the catalog → `POST /v1/gifts/send { recipientId, giftCatalogItemId, context: 'live', contextId: roomId }`.
3. **C2 Wallet Deduction Engine** — the same `debitAndCredit` mechanism as K8.1 step 8 fires: debits the fan's `CoinWallet`, credits the creator's `CreditLedger`, held to Part E's live-latency budget since this must feel instantaneous mid-stream.
4. **E2 Virtual Gift Overlay & Animation System** — on successful debit, the backend emits `gift.sent` on the `live:{roomId}` channel → every connected viewer's client receives it → E2's `GiftAnimationQueue` renders the animation, or batches it into a summary once the per-second event-rate circuit breaker trips.
5. **C5 Creator Goals** — if the creator has an active goal, the same `gift.sent` event also drives goal-progress updates over the identical WebSocket channel, avoiding a second polling mechanism.
6. **F1 Creator Earnings Dashboard** — `CreditLedger.pendingBalance` reflects the gift on next read.
7. **I3 Analytics Platform** — `gift_sent` and, where applicable, `goal_completed` roll up into GPV and live watch-time metrics.

### K8.3 — Creator Publishes PPV Content and Gets Paid Out

1. An already-verified, published creator (A2/A3 complete) uploads a new post via Creator Studio (F1/F2) and marks it `visibility: ppv` with a price.
2. **C3 Locked/Blurred Media Gate** — the content stores with a blurred preview visible in Discovery (B1) and the creator's profile (B5); the full-resolution asset sits behind a signed URL issued only on a successful unlock.
3. A fan taps to unlock → `POST /v1/media/:contentId/unlock` → **C2 Wallet Deduction Engine** debits the fan's `CoinWallet` and credits the creator's `CreditLedger` — C3 reuses C2's `debitAndCredit` rather than reimplementing ledger logic, exactly as C1 does in K8.1. Emits `content_unlocked`.
4. **F1 Creator Earnings Dashboard** — the credited amount sits in `CreditLedger.pendingBalance` for the Holding Period (default 7 days, glossary above) before becoming withdrawable, absorbing the chargeback/dispute window on the originating charge.
5. Once the holding period elapses, the balance moves to `availableBalance`; the creator requests a payout → **F3 Payout Processing** picks up the `Payout` record in `requested` status, submits it to the creator's configured rail (Payoneer/Tipalti/ACH/wire, Master Index §2.8), and updates `status` from the rail's webhook callback.
6. **H4 Financial Operations** — payouts above a configured threshold require dual-control admin approval before F3 submits them to the rail at all.
7. **I5 Audit Logging** — the H4 approval action is written to the immutable audit log as part of the same transaction as the approval itself.
8. **I3 Analytics Platform** — `content_unlocked`, `payout_requested`, and `payout_status_changed` roll up into GPV and creator-retention metrics.

### K8.4 — Fan Reports Content, Moderation Actions It

1. **G1 Content Moderation & Reporting** — a fan reports a piece of content or a creator from wherever it's visible (B1 feed, B5 profile, D1 messaging) → a `Report` row is created with a structured reason category.
2. **H3 Content Review Queue** — the report lands in the admin review queue; an automated first-pass classification service may pre-triage it before a human reviewer sees it.
3. A Support Agent or Platform Admin (role-gated by **I4 RBAC**) actions the report — content is removed/restricted, or the case is escalated.
4. **G2 Fraud & Risk Engine** — a coordinated-abuse or repeat-offender pattern feeds into the account's risk score independently of the moderation action itself.
5. **G3 Account Suspension & Appeals** — for a severe or repeated violation, the account is suspended; the next time that user's JWT is checked, **A1**'s app-shell interception routes them to the Account Suspended screen instead of the normal app based on the `accountStatus: suspended` claim.
6. The suspended user can file an appeal through G3, which routes back into H3's queue for a second human review.
7. **I5 Audit Logging** — every moderation and suspension action in this chain writes to the immutable audit log.
8. **I1 Notification System** — both the reporting user and the actioned user receive an outcome notification, per each module's own notification-triggering rules.

### K8.5 — Account Deletion Request

1. **J1 Settings** — the user navigates to Settings → Legal → Delete Account.
2. **J2 Account Deletion & Data Retention** — typed confirmation completes → `POST /v1/account/deletion-request` creates a `DeletionRequest` row with `status: pending_grace_period`.
3. **G1/G2 (hold check)** — an open moderation case (G1) or active fraud investigation (G2) holds the request (`status: held_pending_case`) rather than letting it proceed, preserving evidence.
4. Content across **B (Discovery/Profile)** and **D (Messaging)** is immediately soft-deleted (unpublished/hidden) at request time, while the underlying rows remain through the grace period.
5. A cancellation within the grace period restores everything; otherwise a scheduled hard-deletion job runs, consulting Appendix K2's `retentionTreatment` classification for every table in the schema — hard-deleting most content, but never **A2**'s verification records or **C2**'s ledger/transaction records, which are legally retained regardless of the user's request.
6. **I5 Audit Logging** — the deletion request and its eventual processing are themselves logged permanently, even as they delete everything else.