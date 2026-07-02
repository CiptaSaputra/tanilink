# TaniLink — Architecture

## Application Type

Single-page application (SPA) built with React 18 + Vite. All logic runs in the browser. No server-side rendering. No backend API.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    index.html                         │
│              Leaflet CSS + React Root                 │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                    App.tsx                            │
│  ┌─────────────────────────────────────────────────┐ │
│  │               AppProvider (Context)              │ │
│  │   ├── State: harvests, demands, matches,         │ │
│  │   │         preOrders, batches, conversations,   │ │
│  │   │         messages, payments, reviews          │ │
│  │   ├── Actions: addHarvest, addDemand,            │ │
│  │   │         updateMatchStatus, sendMessage, ...  │ │
│  │   ├── localStorage sync (10 effects)             │ │
│  │   └── useEffect: auto-compute matches            │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌──────────────┐    ┌─────────────────────────────┐  │
│  │   Navbar      │    │     InteractiveMap          │  │
│  │  (RoleSwitch) │    │  (Leaflet + Nominatim)      │  │
│  └──────────────┘    └─────────────────────────────┘  │
│                                                       │
│  ┌───────────────── Role Views ──────────────────┐   │
│  │   FarmerView │ BuyerView │ PPLView           │   │
│  │   DinasView  │ AdminView │ KolektorView      │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  ┌────────────┐    ┌──────────────────────────────┐   │
│  │ ChatModal  │    │  Modals (Payment, Review,    │   │
│  │            │    │          HarvestBatch)        │   │
│  └────────────┘    └──────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Context / Data Flow

```
User Action (form submit, button click)
       │
       ▼
Component calls context action
(e.g., addHarvest, addDemand)
       │
       ▼
AppContext updates state
       │
       ├──→ localStorage.setItem("flw_*", data)  (persistence)
       │
       ├──→ useEffect re-runs matching engine     (auto compute)
       │
       └──→ showNotification()                     (UI feedback)
       │
       ▼
All consumers re-render with new state
```

## Component Hierarchy

```
<App>
  <AppProvider>
    <AppContent>
      <Navbar />
        ├── Role buttons (setRole)
        └── Reset Data button
      <InteractiveMap />
        ├── Leaflet.js map render
        ├── Harvest markers (dots)
        ├── Demand markers (squares)
        ├── Match polylines (dashed)
        └── Sidebar info panel
      <AnimatePresence> (role switching)
        <FarmerView />       — if role === 'PETANI'
        <BuyerView />        — if role === 'PEMBELI'
        <PPLView />          — if role === 'PPL'
        <DinasView />        — if role === 'DINAS'
        <AdminView />        — if role === 'ADMIN'
        <KolektorView />     — if role === 'KOLEKTOR'
      </AnimatePresence>
      <NotificationToast /> — fixed position
      <!-- Modals are rendered inside role views -->
    </AppContent>
  </AppProvider>
</App>
```

---

## Data Model (Context State)

```
AppContext State Shape:

harvests: Harvest[]          — Planting records (source of truth)
demands: Demand[]            — Buyer demand listings
matches: Match[]             — Computed match scores (auto-generated)
preOrders: PreOrder[]        — Confirmed agreements
harvestBatches: HarvestBatch[] — Post-harvest batch records
conversations: Conversation[] — Chat session metadata
messages: Message[]          — Chat messages
paymentConfirmations: PaymentConfirmation[] — Optional proof uploads
reviews: Review[]            — Post-transaction ratings
activeRole: Role             — Current UI role
activeUser: { PETANI, PEMBELI, PPL, KOLEKTOR } — Simulated user identities
notification: { message, type } | null — Toast state
```

---

## Key Data Relationships

```
Harvest
  ├── harvestForecasts    (computed from ALL harvests)
  ├── matches             (computed from harvest + demand cross-product)
  │     └── preOrders     (created when match → CONFIRMED)
  │           ├── paymentConfirmations
  │           └── reviews
  ├── harvestBatches      (created when farmer marks harvest done)
  │     └── routeStops    (computed by routeOptimizer)
  └── conversations
        └── messages
```

---

## Module Architecture

### 1. Harvest Forecasting (`src/utils/forecasting.ts`)

Pure function: `generateHarvestForecast(harvests, region, commodity) → RegionForecast`

- STL-style decomposition (Trend × Seasonal × Residual)
- Holt's Double Exponential Smoothing for trend
- Fourier series (K=2) for seasonality
- Exogenous rain factor from Indonesia monsoon pattern
- 95% confidence interval widening with √h

### 2. Matching Engine (`src/context/AppContext.tsx` via `scoreMatch`)

Pure function: `scoreMatch(harvest, demand) → Match`

- Haversine distance for location proximity
- Ratio-based volume fit score
- Offer/asking price ratio score
- Weighted sum using `COMMODITY_WEIGHTS[commodity]` defaults

Computed reactively via `useEffect` whenever `[harvests, demands]` change.

### 3. Route Optimization (`src/utils/routeOptimizer.ts`)

Pure functions:
- `optimizeBatchRoutes(batches, depot, capacity, vehicles) → VehicleRoute[]`
- `optimizeCollectorRoutes(harvests, depot, capacity, vehicles) → VehicleRoute[]`

Algorithm:
1. Build Haversine distance matrix
2. Clarke-Wright Savings heuristic for route merging
3. 2-opt Local Search for intra-route optimization

### 4. Distribution Priority (`src/context/AppContext.tsx` via `createHarvestBatch`)

Inline computation:
- shelfLifeScore = (1 / shelfLifeDays) × 4000
- overdueScore = min(40, overdueDays × 4)
- volumeScore = min(20, floor(volumeKg / 1000))
- priorityScore = min(100, sum of above) ≤ 70 high, ≥ 40 medium

### 5. Chat (`src/components/ChatModal.tsx`)

- Simple push-to-messages array model
- Conversation created on match confirm
- Messages persisted in localStorage
- Current user filtering by `senderUserId`

---

## Folder Organization

```
src/
├── components/
│   ├── AdminView.tsx        — Admin dashboard
│   ├── BuyerView.tsx        — Buyer dashboard
│   ├── ChatModal.tsx        — Chat dialog
│   ├── DinasView.tsx        — Dinas Pertanian dashboard
│   ├── FarmerView.tsx       — Farmer dashboard
│   ├── InteractiveMap.tsx   — Leaflet map + side panel
│   ├── KolektorView.tsx     — Collector dashboard
│   ├── Navbar.tsx           — App header + role switcher
│   └── PPLView.tsx          — Extension worker dashboard
├── context/
│   └── AppContext.tsx       — Global state + logic
├── utils/
│   ├── forecasting.ts       — Harvest forecast engine
│   └── routeOptimizer.ts    — VRP solver
├── types.ts                 — All type definitions + constants
├── App.tsx                  — Root component
├── main.tsx                 — Entry point
└── index.css                — Tailwind theme (Natural Tones)
```

---

## Design Decisions

### Why React Context (not Redux/Zustand)?
MVP scope — zero external state dependencies. Acceptable for <10k lines. Must migrate for production.

### Why localStorage (not DB)?
Prototype-only. Allows zero-config setup and page-refresh persistence. 5MB limit will be reached with chat at scale.

### Why Vite (not Next.js)?
Initial choice. PRD specifies Next.js for landing page + API routes in one project. Migration expected.

### Why Leaflet (not Google Maps)?
Free, open-source, no API key required. Acceptable for MVP with demo data.

### Why no Payment Gateway?
PRD explicitly excludes automated payments. Transactions are off-system. Optional proof upload only.

### Why per-commodity weights (not admin-adjustable)?
Domain expertise encoded into `COMMODITY_WEIGHTS`. Prevents well-meaning admin from overriding food-science defaults.

### Why PICKED_UP_DIRECTLY batch status?
PRD specifies that routes are recommendations only. Buyers with their own fleet may bypass consolidation entirely.

### Why no blockchain?
PRD explicitly prohibits blockchain/hash-chain. Centralized database trust model is sufficient for this use case.
