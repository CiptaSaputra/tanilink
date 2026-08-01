# TaniLink — Architecture

> Diperbarui per 2026-08-01. Mencerminkan arsitektur nyata: **Next.js 15 App Router + PostgreSQL (Drizzle) + React Context (5 domain)**.
> Dokumentasi lama yang menggambarkan Vite SPA + AppContext monolith sudah tidak berlaku sejak CHANGELOG 1.3.0/1.4.0.

## Application Type

Full-stack web app: Next.js 15 (App Router) dengan API Routes di server dan database PostgreSQL. Frontend adalah React SPA yang dilaunch dari Next.js; semua operasi data lewat HTTP API — **tidak ada lagi akses localStorage untuk data domain** (kecuali auth session).

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Next.js 15 (App Router)                    │
│                                                              │
│  ┌───────────────────────┐       ┌─────────────────────────┐ │
│  │  app/ (route entries) │       │  app/api/* (REST)       │ │
│  │  ├── /login /register │       │  auth, harvests, demands│ │
│  │  ├── /dashboard       │──────▶│  matches, pre-orders,   │ │
│  │  └── / (redirect)     │       │  batches, conversations,│ │
│  └───────────────────────┘       │  messages, payments,    │ │
│          │                       │  reviews, prices        │ │
│          ▼                       └───────────┬─────────────┘ │
│  ┌───────────────────────────────────────────▼─────────────┐ │
│  │              PostgreSQL (Docker, port 5434)              │ │
│  │      Drizzle ORM — 12 tabel (users, harvests, demands,  │ │
│  │      matches, pre_orders, harvest_batches, conversations,│ │
│  │      messages, payment_confirmations, reviews, market_   │ │
│  │      prices)                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────── Client Components ───────────────────┐ │
│  │  src/components/  (role views, modals, map, navbar)     │ │
│  │      │                                                 │ │
│  │  ┌───▼───────────────────────────────────────────────┐ │ │
│  │  │  Providers:  UI → Data → Chat → Payment → Review │ │ │
│  │  │  AuthProvider  (wrapping root)                    │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  │      │  hanya akses via src/services/*.ts (fetch)      │ │
│  │      ▼                                                 │ │
│  │  src/services/*  →  HTTP GET/POST/PUT/PATCH/DELETE      │ │
│  │      │  ke /api/*                                       │ │
│  │      ▼                                                 │ │
│  │  App Router API Routes → Drizzle → PostgreSQL           │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Context / Data Flow

```
User Action (form submit, button click)
       │
       ▼
Component calls context action (useData, useChat, ...)
       │
       ▼
Context calls service layer (src/services/*.ts)
       │
       ▼
Service performs HTTP fetch → Next.js API Route → Drizzle → PostgreSQL
       │
       ▼
Context updates state (optimistic update untuk match status)
       │
       ▼
Polling DataContext (tiap 3 detik) menjaga data tetap sinkron
       │
       ▼
showNotification() → UI feedback (toast)
```

Auth session (opsional) tetap di localStorage (`flw_auth_session`) — hanya token session, bukan data domain.

---

## Component Hierarchy

```
<RootApp>                          — src/components/RootApp.tsx (client, ssr:false)
  <AuthProvider>                    — src/context/AuthContext.tsx
    <DashboardApp>                  — src/components/dashboard/DashboardApp.tsx
      <UIProvider>                  — notifikasi, activeRole
        <DataProvider>              — harvests, demands, matches, preOrders, batches
          <ChatProvider>            — conversations, messages
            <PaymentProvider>       — paymentConfirmations
              <ReviewProvider>      — reviews
                <Navbar />
                <InteractiveMap />  — Leaflet.js + Nominatim
                <AnimatePresence> (role switching)
                  <FarmerView />    — role === 'PETANI'
                  <BuyerView />     — role === 'PEMBELI'
                  <PPLView />       — role === 'PPL'
                  <DinasView />     — role === 'DINAS'
                  <AdminView />     — role === 'ADMIN'
                  <KolektorView />  — role === 'KOLEKTOR'
                <PublicDashboard /> — role === 'PUBLIK' / tanpa login
```

Semua role view dibungkus `ErrorBoundary` (crash role A tidak mematikan role B).

---

## Data Model (Database)

Schema: `src/db/schema.ts` (Drizzle `pgTable`). Migrasi: `drizzle/`.

```
users                    — id, name, email, passwordHash, role, region, createdAt
harvests                 — id, farmerId/Name, commodity, landArea, expectedVolume,
                            askingPrice, lat/lng, region, plantingDate,
                            expectedHarvestDate, weatherRiskLevel, isPublished, status
demands                  — id, buyerId/Name, commodity, requiredVolume, offerPrice,
                            lat/lng, region, dateRequired, status
matches                  — id, harvestId, demandId, score, distanceKm, scoreDetails(jsonb),
                            status, bidVolume, bidPrice
pre_orders               — id, matchId, harvestId, demandId, agreedPricePerKg,
                            agreedVolumeKg, farmer/buyerName, commodity, deliveryMode, status
harvest_batches          — id, plantingId, farmerId/Name, commodity, region, lat/lng,
                            preOrderId, actualVolumeKg, harvestDate, shelfLifeDays,
                            priorityScore, status
conversations            — id, matchId, farmerUserId, buyerUserId
messages                 — id, conversationId, senderUserId, content, sentAt
payment_confirmations    — id, preOrderId, proofImageUrl, status, notes
reviews                  — id, preOrderId, reviewerUserId, revieweeUserId, rating, comment
market_prices            — id, commodity, region, pricePerKg, dateRecorded
```

---

## Key Data Relationships

```
Harvest
  ├── matches             (dihitung backend: matchingEngine, trigger saat POST harvest)
  │     └── preOrders     (dibuat saat match → CONFIRMED via /api/pre-orders/confirm)
  │           ├── paymentConfirmations
  │           └── reviews
  ├── harvestBatches      (dibuat saat farmer mark harvest done)
  │     └── routeStops    (dihitung routeOptimizer — bukan tabel DB)
  └── conversations
        └── messages
```

---

## Module Architecture

### 1. Harvest Forecasting (`src/utils/forecasting.ts`)

Pure function. Holt's Double Exponential Smoothing + Fourier series (K=2) + exogenous rain factor. 95% confidence interval. Displayed di DinasView (SVG chart).

### 2. Smart Matching (`src/utils/matchingEngine.ts`, `src/utils/matching.ts`)

- `runMatchingForHarvest(harvest)` dipanggil dari POST `/api/harvests`
- Haversine distance + volume fit + price fit, weighted sum pakai `COMMODITY_WEIGHTS`
- Hasil disimpan ke tabel `matches`

### 3. Price Prediction (`app/api/prices/route.ts`)

- Baca `market_prices` historis dari DB (filter commodity + region)
- Prediksi 14 hari: Simple Moving Average + tren linier + noise kecil
- Dikonsumsi grafik harga di dashboard

### 4. Route Optimization (`src/utils/routeOptimizer.ts`)

- `optimizeBatchRoutes()` / `optimizeCollectorRoutes()` — Clarke-Wright Savings + 2-opt Local Search
- Haversine distance matrix
- Rekomendasi saja — status `PICKED_UP_DIRECTLY` untuk deviasi

### 5. Distribution Priority (dalam `DataContext.createHarvestBatch`)

- shelfLifeScore = (1 / shelfLifeDays) × 4000
- overdueScore = min(40, overdueDays × 4)
- volumeScore = min(20, floor(volumeKg / 1000))
- priorityScore = min(100, sum)

### 6. Chat (`src/components/ChatModal.tsx` + `src/services/chatService.ts`)

- Dua kanal: in-app chat (persisted ke DB via API) + link `wa.me` di kartu match
- Bukan WhatsApp Business API

---

## Folder Organization

```
app/
├── (auth)/login, (auth)/register     — halaman auth
├── dashboard/                        — halaman dashboard
├── api/                              — 45+ REST route handlers
├── layout.tsx, page.tsx, not-found.tsx
src/
├── components/                       — role views, modals, map, navbar
├── context/                          — Auth, UI, Data, Chat, Payment, Review
├── services/                         — HTTP service layer (fetch → /api/*)
├── db/                               — Drizzle connection, schema, seed, migrate
├── utils/                            — forecasting, matching, routeOptimizer, bmkg, geocoding
├── constants/commodities.ts          — runtime data komoditas + weights
├── data/                             — seed data & demo users
└── types.ts                          — pure type definitions
drizzle/                              — migration files
docker-compose.yml                    — PostgreSQL 15 (port 5434)
drizzle.config.ts                     — Drizzle kit config
```

---

## Design Decisions

### Why React Context (not Redux/Zustand)?
MVP scope — zero external state deps. 5 domain contexts mengisolasi re-render. Migrate ke Zustand ada di roadmap (medium-term).

### Why PostgreSQL + Drizzle (bukan localStorage)?
Kebutuhan multi-user & persistence. Semua data domain lewat API → DB. localStorage hanya untuk auth session.

### Why Next.js App Router?
PRD: landing page + API routes dalam satu project. SSR/SEO untuk landing. API Routes menangani seluruh CRUD.

### Why Leaflet (not Google Maps)?
Free, open-source, no API key. Route optimization memakai algoritma custom (Clarke-Wright + 2-opt), bukan Google Maps Directions API.

### Why no Payment Gateway?
PRD mengecualikan pembayaran otomatis. Transaksi di luar sistem; upload bukti opsional.

### Why per-commodity weights (not admin-adjustable)?
Domain knowledge di-encode di `COMMODITY_WEIGHTS`. Mencegah admin override food-science defaults.

### Why no blockchain / hash-chain?
PRD melarang blockchain. Tidak ada kode SHA-256 ledger. Label "Hash-Chain" di UI hanyalah branding visual.

### Why password hash btoa?
Demo-only. Tanpa salt, tidak aman produksi. Perlu bcrypt/argon saat production.
