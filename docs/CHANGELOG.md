# TaniLink — Changelog

> Based on current implementation state. All entries reflect the codebase as of July 2026.

---

## 1.5.0 (2026-08-01 — H-02/H-03 selesai: PostgreSQL + API backend nyata)

### Added
- **Database layer (PostgreSQL 15 + Drizzle ORM)** — menggantikan seluruh akses localStorage untuk data domain.
  - `src/db/index.ts` — koneksi Drizzle + Pool (DATABASE_URL, fallback `127.0.0.1:5434`).
  - `src/db/schema.ts` — 12 tabel: users, harvests, demands, matches, pre_orders, harvest_batches, conversations, messages, payment_confirmations, reviews, market_prices.
  - `drizzle/0000_*.sql` — migrasi awal. `drizzle.config.ts` + script `db:push` / `db:seed`.
  - `src/db/seed.ts` — seed users, harvests, demands, matches, pre-orders, market_prices (30 hari historis).
- **`app/api/` routes (45+ handlers)** — semua CRUD via REST:
  - Auth: `POST /api/auth/login`, `POST /api/auth/register` (validasi + cek duplikat email + blokir self-register ADMIN/DINAS).
  - Data: harvests, demands, matches (+ status), pre-orders (+ confirm atomic transaction), harvest-batches (+ status), conversations, messages, payments, reviews, prices.
- **Service layer HTTP** — semua `src/services/*.ts` diubah dari localStorage → `fetch("/api/...")`.
- **`/api/prices`** — prediksi harga per kg 14 hari (moving average + tren linier) dari data `market_prices` di DB.
- **Matching engine di backend** — POST `/api/harvests` memicu `runMatchingForHarvest` (Haversine + volume + price fit, bobot per komoditas).

### Changed
- **`src/context/DataContext.tsx`** — data di-fetch dari API (polling tiap 3 detik), bukan localStorage. Pre-order confirm via API atomic transaction.
- **`src/context/AuthContext.tsx`** — login/register memanggil `/api/auth/*`. Session tetap di localStorage.
- **`src/components/AdminView.tsx`** — tombol reset kini juga membersihkan DB backend (`clearAllDatabaseAndStorage`).
- **`README.md`** — setup sekarang butuh Docker + `npx drizzle-kit push` + `tsx src/db/seed.ts`.

### Architecture
- Frontend → Service layer (`src/services`) → API Routes → Drizzle → PostgreSQL.
- localStorage hanya untuk auth session (`flw_auth_session`), bukan data domain.

### Known Issues (baru)
1. **Password hash masih `btoa`** — demo-only, tidak aman produksi (perlu bcrypt/argon).
2. **Tidak ada RBAC middleware server** — proteksi role hanya client-side (belum ada `middleware.ts`).
3. **`ignoreBuildErrors` aktif** di `next.config.mjs` — ada beberapa TypeScript strict error yang belum dibereskan.
4. **`/api/harvests` GET** masih ada komentar/duplikasi logika response shape.
5. **Manual pin drag gesture** belum — seleksi koordinat via map click.
6. **`@tensorflow/tfjs`, `qrcode.react`, `@google/genai`, `express`** ter-install tapi tidak terpakai (bloat dependencies).

---

## 1.4.0 (2026-07-02 — H-04: Split AppContext Monolith)

### Added
- **`src/context/UIContext.tsx`** — UI state: `activeRole`, `notification`, `setRole`, `resetAllData`. Terpisah dari domain data.
- **`src/context/DataContext.tsx`** — Domain data: `harvests`, `demands`, `matches`, `preOrders`, `harvestBatches` + CRUD.
- **`src/context/ChatContext.tsx`** — Chat: `conversations`, `messages`, `sendMessage`, `startConversation`.
- **`src/context/PaymentContext.tsx`** — Payment: `paymentConfirmations`, `addPaymentConfirmation`, `confirmPayment`.
- **`src/context/ReviewContext.tsx`** — Review: `reviews`, `addReview`.
- **`src/utils/matching.ts`** — Pure functions `calculateDistance` + `scoreMatch` dipindah dari AppContext.
- **Provider nesting** di `DashboardApp.tsx`: `UIProvider → DataProvider → ChatProvider → PaymentProvider → ReviewProvider`.

### Changed
- **Semua komponen** (16 files) — migrasi dari `useApp()` ke hook spesifik: `useData()`, `useUI()`, `useChat()`, `usePayment()`, `useReview()`.
- **Re-render isolation** — komponen yang hanya butuh UI state tidak lagi re-render saat data domain berubah, dan sebaliknya.

### Removed
- **`src/context/AppContext.tsx`** — di-rename ke `.old` (tidak digunakan lagi).

## 1.3.1 (2026-07-02 — Hotfix: CSS tidak muncul di Next.js)

### Fixed
- **`postcss.config.mjs`** — ditambahkan konfigurasi PostCSS dengan `@tailwindcss/postcss`. Root cause: project menggunakan `@tailwindcss/vite` plugin yang hanya bekerja di Vite, tidak di Next.js. Next.js membaca Tailwind lewat PostCSS pipeline.
- **`app/layout.tsx`** — hapus duplikasi import font Inter via `next/font/google`. Font sudah di-import di `src/index.css` via Google Fonts URL, duplikasi menyebabkan konflik.
- **`app/not-found.tsx`** — tambah halaman 404 agar build Next.js tidak error saat collecting page data.

### Installed
- `@tailwindcss/postcss` (devDependency) — PostCSS plugin untuk Tailwind v4 di Next.js.

---

## 1.3.0 (2026-07-02 — H-03: Next.js 15 App Router Migration)

### Added
- **Next.js 15** — menggantikan Vite sebagai framework. App Router dengan `app/` directory.
- **`app/layout.tsx`** — root layout dengan metadata dan font Inter dari Google Fonts.
- **`app/page.tsx`** — root redirect: belum login → `/login`, sudah login → `/dashboard`.
- **`app/(auth)/login/page.tsx`** — route login (`/login`).
- **`app/(auth)/register/page.tsx`** — route register (`/register`).
- **`app/dashboard/page.tsx`** — route dashboard (`/dashboard`) dengan auth guard.
- **API Routes (server-side, dynamic)**:
  - `GET/POST /api/harvests`
  - `GET/POST /api/demands`
  - `GET /api/matches`, `PATCH /api/matches/[id]/status`
  - `GET/POST /api/pre-orders`, `PATCH /api/pre-orders/[id]`
  - `GET/POST /api/conversations`, `GET/POST /api/conversations/[id]/messages`
  - `GET/POST /api/payments`, `PATCH /api/payments/[id]/confirm`
  - `GET/POST /api/reviews`
  - `PATCH /api/batches/[id]/status`
- **`next.config.mjs`** — konfigurasi Next.js (skip TS/lint errors saat build untuk sekarang).
- **`src/components/RootApp.tsx`**, **`LoginApp.tsx`**, **`RegisterApp.tsx`**, **`DashboardApp.tsx`** — wrapper client components untuk dynamic import dengan `ssr: false`.

### Changed
- **`package.json`** scripts — `dev/build/start` sekarang menggunakan Next.js CLI.
- **`tsconfig.json`** — diupdate untuk Next.js App Router (jsx: preserve, Next.js plugin).
- **`src/services/storage.ts`** — SSR-safe: semua fungsi cek `typeof window === 'undefined'` sebelum akses localStorage.
- **`src/context/AuthContext.tsx`** dan **`AppContext.tsx`** — ditambah `'use client'` directive.
- **`src/App.tsx`** dan **`src/main.tsx`** — di-rename ke `.old` (tidak digunakan lagi).

### Architecture
- Semua komponen tetap di `src/components/` — tidak dipindahkan ke `app/`.
- `app/` hanya berisi route entrypoints dan API handlers.
- Dynamic import dengan `ssr: false` digunakan untuk komponen yang butuh `localStorage`/Leaflet/browser API.

---

## 1.2.0 (2026-07-02 — H-02: API Service Abstraction Layer)

### Added
- **`src/services/storage.ts`** — typed localStorage helper terpusat: `STORAGE_KEYS` constants, `storageRead/Write/Remove/ReadArray/ClearDomain`. Semua akses storage melalui helper ini (tidak ada `localStorage` call langsung di komponen/context).
- **`src/services/harvestService.ts`** — `harvestGetAll/ById/Add/Update/Remove/SaveAll/Reset`. Termasuk migrasi data legacy (strip H-LIVE, backfill `isPublished`).
- **`src/services/demandService.ts`** — `demandGetAll/ById/Add/Update/Remove/SaveAll/Reset`.
- **`src/services/matchService.ts`** — `matchGetAll/SaveAll/UpdateStatus/Upsert/Clear`.
- **`src/services/preOrderService.ts`** — `preOrderGetAll/ById/Add/Update/SetDeliveryMode/Complete/Clear` + `batchGetAll/ById/Add/Update/UpdateStatus/Clear`.
- **`src/services/chatService.ts`** — `conversationGetAll/GetByMatchId/Add/Clear` (idempotent) + `messageGetAll/GetByConversation/Add/Clear`.
- **`src/services/paymentService.ts`** — `paymentGetAll/ById/GetByPreOrder/UpsertByPreOrder/Confirm/Clear`.
- **`src/services/reviewService.ts`** — `reviewGetAll/ById/GetByPreOrder/GetByReviewee/Add/Clear`.
- **`src/services/index.ts`** — barrel export semua service.

### Changed
- **AppContext** (`src/context/AppContext.tsx`) — semua `localStorage.getItem/setItem/removeItem` diganti dengan panggilan ke service layer. File turun dari ~670 baris menjadi 477 baris. Tidak ada `useEffect` persistence — service layer yang menangani persistence secara sinkron saat state berubah.

### Architecture Note
Service layer saat ini backed oleh localStorage. Untuk swap ke HTTP/database:
1. Ubah implementasi fungsi di `src/services/*.ts` (ganti `storageRead/Write` dengan `fetch()`)
2. AppContext dan semua komponen **tidak perlu diubah**

---

## 1.1.0 (2026-07-02 — H-01: Authentication & RBAC)

### Added
- **AuthContext** (`src/context/AuthContext.tsx`) — email/password login, registration, logout. Session persisted via `localStorage` key `flw_auth_session`. User registry stored in `flw_users`.
- **LoginPage** (`src/components/auth/LoginPage.tsx`) — form email + password, show/hide password toggle, error messages, 6 quick-login demo buttons.
- **RegisterPage** (`src/components/auth/RegisterPage.tsx`) — form name/email/role/region/password/confirmPassword, field-level validation. Role terbatas: Petani, Pembeli, PPL, Kolektor. Admin & Dinas tidak bisa self-register.
- **AuthGate** di `App.tsx` — redirect ke Login/Register jika belum login. Loading screen saat restore session.
- **Seed Users** (`src/data/users.ts`) — 6 akun demo (petani, pembeli, ppl, kolektor, dinas, admin), password: `demo123`.
- **User & Auth types** di `types.ts` — `User`, `AuthUser`, `LoginCredentials`, `RegisterData`, `AuthContextProps`.

### Changed
- **App.tsx** — `AuthProvider` membungkus seluruh app. `AppProvider` hanya mount setelah user terautentikasi.
- **Navbar** — menampilkan nama, wilayah, role badge, dan tombol Logout setelah login. Role switcher disembunyikan untuk non-Admin. Admin tetap bisa switch role untuk kebutuhan demo.
- **AppContext** — `activeRole` diambil dari `currentUser.role` (bukan localStorage manual). `activeUser` dihitung dinamis berdasarkan user yang login; role lain tetap fallback ke data demo.

### Fixed
- **FR-01** (Role-Based Access) — dari 🟡 Partial 40% → ✅ Complete 90%. RBAC nyata via AuthContext; setiap user memiliki role tetap.
- **FR-02** (Auth & Login) — dari 🔴 Not Started 0% → ✅ Complete 90%.

### Known Limitations (sisa gap menuju 100%)
- Password di-hash dengan `btoa` (demo-only, tidak aman untuk produksi). Perlu diganti dengan `bcrypt` saat backend tersedia.
- Tidak ada JWT / refresh token — session hanya `localStorage`, tidak cross-device.
- Tidak ada middleware RBAC di sisi server (belum ada backend).

---

## 1.0.0 (MVP Showcase Build)

### Added
- **Harvest Forecasting Engine** — Holt's Double Exponential Smoothing + Fourier Seasonal K=2 + Rain Exogenous factor. 4-week projection with 95% confidence interval. SVG interactive chart in DinasView.
- **Smart Matching Engine** — Haversine distance, volume fit, and price fit scores with per-commodity default weights (`COMMODITY_WEIGHTS`). Auto-computed on harvest/demand changes.
- **Route Optimization (VRP Solver)** — Clarke-Wright Savings algorithm + 2-opt Local Search. Displayed in DinasView (tab 3) and KolektorView.
- **Distribution Priority** — Priority score calculation from shelf life, overdue days, and batch volume. Displayed in AdminView sorted by urgency.
- **6 User Roles** — Petani, Pembeli, PPL, Dinas, Admin, Kolektor. Role switching via Navbar buttons.
- **Interactive Map** — Leaflet.js with harvest markers (colored dots), demand markers (colored squares), match polylines (dashed lines). Click to select coordinates. Commodity filter pills.
- **Farmer Dashboard** — Planting input form (commodity, land area, coordinates, isPublished toggle), GPS geolocation, my harvests table, match recommendations with accept/confirm flow, harvest batch creation, delivery mode selection.
- **Buyer Dashboard** — Demand input form (commodity, volume, price, deadline, coordinates), my demands table, match recommendations with accept/confirm flow.
- **PPL Dashboard (Read-Only)** — Regional aggregates, commodity breakdown, harvest list, batch status monitoring. No input forms.
- **Admin Dashboard** — Per-commodity default weights display (read-only), match transaction log with dispute resolution, distribution priority queue, pre-order summary, review monitoring.
- **Dinas Dashboard** — Three tabs: national monitoring (supply/demand bar chart, regional surplus risk index), time-series forecasting (SVG chart + weekly breakdown), route optimization (VRP per depot).
- **Kolektor Dashboard** — Recommended first-mile routes per vehicle, batch status updates (IN_TRANSIT, PICKED_UP_DIRECTLY, DELIVERED).
- **Chat (In-App)** — Farmer–buyer messaging tied to match conversations. Messages persisted in localStorage.
- **Pre-Order System** — Created on match CONFIRMED. Includes agreed price, volume, deliveryMode. Status: CONFIRMED → COMPLETED.
- **Payment Confirmation (Optional)** — Upload proof URL. Status: not_submitted → submitted → confirmed.
- **Reviews & Ratings** — Star rating (1–5) + comment after pre-order COMPLETED.
- **Notification Toast** — Success/warning/info toast messages on all state-changing actions.
- **Seed Data** — 9 sample harvests across 5 regions, 6 sample buyer demands.
- **Natural Tones Theme** — Custom Tailwind color palette (nat-green, nat-brown, nat-sage, etc.). Inter font.
- **localStorage Persistence** — All domain data persisted to localStorage for page-refresh durability.

### Changed
- **Removed all `inputSource`/`inputByUserId` fields** from Harvest type and related logic (PRD: no third-party data input).
- **Removed CV Grading** (TensorFlow.js) from FarmerView (PRD: roadmap feature, not MVP).
- **Removed QR Code / Blockchain Trace** — TraceModal and QrCode scanner removed (PRD: no blockchain).
- **Removed batch input from FarmerView** — `inputSource: 'ppl'` flow removed.
- **Rewrote PPLView** from batch-input-enabled to read-only monitoring.
- **Rewrote AdminView** from weight-slider-controlled to per-commodity default-weights display.
- **Replaced single-weight-set matching** with `COMMODITY_WEIGHTS` (per-commodity defaults).
- **Upgraded `scoreMatch`** to use commodity-specific weights instead of a global adjustable set.
- **Expanded `PreOrder`** type with `deliveryMode` and `COMPLETED` status.
- **Added `isPublished`** field to Harvest type with toggle in form.
- **Added `PICKED_UP_DIRECTLY`** status to HarvestBatch for route-deviation scenarios.
- **Extended Role type** to include `KOLEKTOR`.
- **Renamed/branded UI** references from blockchain/certificate to pre-order/agreement terminology.

### Fixed
- **PPL proxy input conflict** — PPL can no longer input data on behalf of farmers.
- **Admin weight manipulation** — Admin can no longer freely adjust matching weights.
- **Match status persistence** — Manual match status updates now preserved across re-renders.
- **localStorage data cleaning** — Legacy H-LIVE simulator entries stripped on load.
- **Seed data migration** — Old entries without `isPublished` auto-migrated to `true`.

### Known Issues (status per 1.5.0)
1. ~~**No authentication**~~ → **Resolved** (1.1.0) — login/register + RBAC via AuthContext & backend API.
2. ~~**No backend API**~~ → **Resolved** (1.5.0) — PostgreSQL + Drizzle + 45+ API routes.
3. ~~**No error boundaries**~~ → **Resolved** (M-02) — semua role view di-wrap ErrorBoundary.
4. ~~**Monolith AppContext**~~ → **Resolved** (1.4.0) — 5 domain contexts (UI, Data, Chat, Payment, Review).
5. ~~**FarmerView/BuyerView too large**~~ → **Resolved** (H-05, H-06, M-01) — decomposed + reusable modals.
6. ~~**Price prediction volume-only**~~ → **Resolved** (1.5.0) — `/api/prices` price-per-kg prediction.
7. **Komoditas type casts** — Required when using as object keys.
8. **No form validation** — Missing error states and field-level validation messages.
