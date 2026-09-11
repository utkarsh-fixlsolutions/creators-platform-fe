# LUXE — Creator & Fan Ecosystem (Frontend)

LUXE is a luxury editorial creator monetization platform connecting high-end creators with dedicated fans through subscription tiers, PPV exclusive media, encrypted direct messaging, and interactive live broadcasts.

## Architecture

This is the **decoupled frontend application**, built with:
- **Core**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with Custom Luxury Design Tokens (`#F8F6F2`, `#111111`, `#C5A880`, `#4F46E5`)
- **Typography**: Cormorant Garamond / Playfair Display (editorial serif) + Inter / Outfit (clean sans)
- **Animations**: GSAP (ScrollTrigger & timeline pinning) + Framer Motion (page transitions & modals) + Lenis (smooth momentum scroll)
- **State Management**: Zustand stores with role-based dual switching:
  - `sessionStore.ts`: Multi-role JWT claims (`fan` | `creator` | `both`), active role selector, KYC status
  - `walletStore.ts`: Double-entry virtual coins balance (fans) & credits ledger (creators)
- **Routing**: `react-router-dom` v7 with decoupled layout shells:
  - `/` — Luxury Editorial Landing Page
  - `/app/*` — Fan Consumer Experience (Discovery Feed, Clips, Explore, Direct Messages, Live Viewer, Wallet)
  - `/studio/*` — Creator Studio Workspace (KPI Dashboard, Earnings & Payouts, CMS Uploader, Broadcast CRM, Live Room, Security Settings)
- **API Client**: Standalone typed Fetch/Axios client (`src/api/client.ts`) with Bearer token authentication and Idempotency keys communicating with the Backend REST API (`http://localhost:4000/v1`).

---

## Directory Structure

```
Creators_Platform Redefined/
├── src/
│   ├── api/                  # Typed REST Client & WebSocket connectors
│   │   └── client.ts
│   ├── components/
│   │   ├── layout/           # Distinct layout shells
│   │   │   ├── MarketingLayout.tsx   # Landing page navbar + footer
│   │   │   ├── FanAppLayout.tsx      # Fan top search & coin bar + mobile tabs
│   │   │   └── CreatorStudioLayout.tsx # Creator Studio sidebar workspace
│   │   ├── sections/         # Landing page editorial sections
│   │   └── ui/               # Reusable buttons, cards, modals
│   ├── pages/
│   │   ├── fan/              # Fan Experience routes (/app/*)
│   │   │   ├── FanFeedPage.tsx       # B1 Discovery Feed + PPV & Subscription cards
│   │   │   ├── CreatorProfilePage.tsx # B5 Creator Profile & Tier Comparison
│   │   │   ├── FanExplorePage.tsx    # B4 Explore & Search
│   │   │   ├── FanClipsPage.tsx      # B3 Vertical Short Clips
│   │   │   ├── FanMessagesPage.tsx   # D1 Direct Messaging & PPV bubbles
│   │   │   └── FanLivePage.tsx       # E1 Live Stream & Gifting Overlay
│   │   └── studio/           # Creator Studio routes (/studio/*)
│   │       ├── StudioOverviewPage.tsx  # F1/F2 KPIs & Launchpad
│   │       ├── StudioEarningsPage.tsx  # F1/F3 Available vs Pending balances & Bank Payouts
│   │       ├── StudioCreatePage.tsx    # CMS Content Uploader & Price Gating
│   │       ├── StudioBroadcastPage.tsx # D2 Mass Broadcasts & Audience CRM
│   │       ├── StudioLivePage.tsx      # E6 WebRTC Broadcast Studio
│   │       └── StudioSettingsPage.tsx  # J1 Geo-blocking & Security
│   ├── routes/
│   │   └── AppRouter.tsx     # Central Route tree
│   ├── store/                # Zustand State Stores
│   │   ├── sessionStore.ts   # Role and Auth state
│   │   └── walletStore.ts    # Dual Ledger & Coin state
│   ├── styles/               # Global CSS & Design Tokens
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Set VITE_API_BASE_URL to your backend API endpoint
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
