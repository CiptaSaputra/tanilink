# TaniLink — Changelog

> Based on current implementation state. All entries reflect the codebase as of July 2026.

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

### Known Issues
1. **No authentication** — Role switching is a UI toggle. No login, password, or session management.
2. **No backend API** — All data is in-memory + localStorage. No multi-user support.
3. **No error boundaries** — Component crash crashes entire app.
4. **Monolith AppContext** — All state in one context causes unnecessary re-renders.
5. **FarmerView (820 lines) and BuyerView (630 lines)** — Need decomposition into sub-components.
6. **Price prediction is volume-only** — Price-per-kg forecasting not yet implemented.
7. **Komoditas type casts** — Required when using as object keys.
8. **No form validation** — Missing error states and field-level validation messages.
