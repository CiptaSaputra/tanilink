# TaniLink — TODO List

> Categorized by priority. Each item includes a description, why it matters, estimated difficulty, and related files.

---

## High Priority

### H-01: Implement Authentication & Login
**Description:** Add proper auth (Better Auth recommended per PRD) with email/password login, registration, and session management for all 6 roles.
**Why:** Without auth, there is no real multi-user system. Anyone can impersonate any role.
**Difficulty:** Medium (3–5 days)
**Files:** New: `src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/pages/Register.tsx`
**PRD:** FR-01, FR-02

### H-02: Replace localStorage with Database Layer
**Description:** Set up Drizzle ORM with SQLite (dev) / PostgreSQL (prod). Create schema migrations matching all types. Replace all localStorage reads/writes.
**Why:** localStorage is ephemeral (5MB limit, cleared by browser). Real users need persistent, shared data.
**Difficulty:** Hard (1–2 weeks)
**Files:** All `src/context/AppContext.tsx`, new `src/db/schema.ts`, `src/db/seed.ts`
**PRD:** FR-03 through FR-21 (all data endpoints)

### H-03: Create API Routes
**Description:** Build Next.js API route handlers for all CRUD operations: plantings, demands, matches, pre-orders, batches, conversations, messages, payments, reviews, forecasts.
**Why:** Frontend must communicate with backend. Currently no API exists.
**Difficulty:** Hard (1–2 weeks)
**Files:** New: `src/app/api/`
**PRD:** All features

### H-04: Split AppContext Monolith
**Description:** Decompose AppContext.tsx (670 lines) into domain-specific contexts: DataContext (harvests/demands), ChatContext, UIContext, or adopt Zustand.
**Why:** Single context re-renders all consumers on any state change. Performance degrades as state grows.
**Difficulty:** Medium (2–3 days)
**Files:** `src/context/AppContext.tsx`

### [DONE] H-05: Decompose FarmerView (820 lines)
**Description:** Extract PlantingForm, MyHarvestsTable, MatchCardList, PreOrderPanel, DeliveryModeSelector, PaymentModal, ReviewModal into separate components.
**Why:** Maintainability — one file should not contain 6 distinct UI sections and 3 modals.
**Difficulty:** Medium (2–3 days)
**Files:** `src/components/FarmerView.tsx`

### [DONE] H-06: Decompose BuyerView (630 lines)
**Description:** Extract DemandForm, MatchCardList, PreOrderPanel, PaymentModal, ReviewModal.
**Why:** Same as H-05. Duplicated modal code between FarmerView and BuyerView.
**Difficulty:** Medium (1–2 days)
**Files:** `src/components/BuyerView.tsx`

---

## Medium Priority

### [DONE] M-01: Extract Reusable Modal Components
**Description:** Create standalone `PaymentModal`, `ReviewModal`, and `HarvestBatchModal` components used by both FarmerView and BuyerView.
**Why:** Eliminates code duplication. Single source of truth for modal behavior.
**Difficulty:** Easy (1 day)
**Files:** `src/components/FarmerView.tsx`, `src/components/BuyerView.tsx`

### M-02: Add Error Boundaries
**Description:** Wrap each role view in an ErrorBoundary component that shows a fallback UI on crash.
**Why:** Current architecture crashes entire app on any component error.
**Difficulty:** Easy (0.5 day)
**Files:** `src/App.tsx`, new: `src/components/ErrorBoundary.tsx`

### [DONE] M-03: Move Seed Data from AppContext
**Description:** Extract SEED_HARVESTS and SEED_DEMANDS to `src/seed/` or `src/data/` directory.
**Why:** AppContext should contain context logic, not data. Seed data has no place in production code.
**Difficulty:** Easy (0.5 day)
**Files:** `src/context/AppContext.tsx`, new: `src/data/seed.ts`

### M-04: Separate Types from Runtime Constants
**Description:** Move `COMMODITY_LIST` and `COMMODITY_WEIGHTS` from `types.ts` to `src/constants/commodities.ts`.
**Why:** `types.ts` should contain only type definitions. Runtime data belongs in constants.
**Difficulty:** Easy (0.5 day)
**Files:** `src/types.ts`, new: `src/constants/commodities.ts`

### M-05: Implement Price Prediction (per kg)
**Description:** Add price-per-kg forecasting using historical price data and regression/exponential smoothing. Display trend chart in farmer dashboard.
**Why:** PRD specifies Price & Demand Prediction as a core module. Currently only volume forecasting exists.
**Difficulty:** Medium (2–3 days)
**Files:** `src/utils/forecasting.ts`, `src/components/DinasView.tsx`, `src/components/FarmerView.tsx`
**PRD:** FR-07

### M-06: Create API Service Abstraction
**Description:** Create `src/services/api.ts` that wraps all data operations. Initially backed by localStorage, but swappable to HTTP fetch when backend is ready.
**Why:** Smooths the transition from frontend-only to full-stack. All data access goes through one layer.
**Difficulty:** Medium (2 days)
**Files:** New: `src/services/api.ts`, `src/context/AppContext.tsx`

### M-07: Add Pagination / Virtualization
**Description:** Virtualize long lists (harvests, demands, matches, messages) using react-window or intersection observer.
**Why:** With 100+ records, DOM performance degrades. Chat history grows unbounded.
**Difficulty:** Medium (1–2 days)
**Files:** All view components with list rendering

### M-08: Normalize State
**Description:** Replace arrays with `Record<string, T>` (ID maps) for O(1) lookups. Keep sorted array for display.
**Why:** Current array lookups are O(n) and become slow with hundreds of records.
**Difficulty:** Medium (1–2 days)
**Files:** `src/context/AppContext.tsx`

---

## Low Priority

### L-01: Create Landing Page
**Description:** Public-facing page explaining TaniLink's problem, solution, and CTA per role.
**Why:** Users need a way to discover and understand the platform before logging in.
**Difficulty:** Medium (2 days)
**Files:** New: `src/pages/Landing.tsx`
**PRD:** FR-02 (implied)

### L-02: Implement Form Validation
**Description:** Add field-level validation with error messages for all forms (planting, demand, harvest batch).
**Why:** Currently no validation — empty fields and invalid values silently succeed.
**Difficulty:** Easy (1–2 days)
**Files:** All form components

### L-03: Add Loading States
**Description:** Show loading spinners/skeletons during async operations.
**Why:** When backend is added, all operations become async. UI must handle loading states.
**Difficulty:** Easy (1 day)
**Files:** All view components

### L-04: Refactor InteractiveMap (660 lines)
**Description:** Split map rendering, data markers, and sidebar info panel into separate components.
**Why:** Reduce file size. Enable independent testing of map vs sidebar.
**Difficulty:** Medium (1–2 days)
**Files:** `src/components/InteractiveMap.tsx`

### L-05: Add Chat Input to Matches Table
**Description:** Show unread message count next to match cards. Add quick-reply from match list.
**Why:** Improves chat discoverability. Reduced from chat flow since removed.
**Difficulty:** Easy (0.5 day)
**Files:** `src/components/FarmerView.tsx`, `src/components/BuyerView.tsx`

### L-06: Upgrade to Next.js + App Router
**Description:** Migrate from Vite SPA to Next.js for SSR, API routes, and SEO.
**Why:** PRD specifies Next.js. Enables landing page SEO and unified frontend+backend.
**Difficulty:** Hard (1–2 weeks)
**Files:** Entire project structure
**PRD:** Tech Stack

### L-07: Integrate WhatsApp API for Chat
**Description:** Replace or augment in-app chat with WhatsApp Business API.
**Why:** Farmers are more familiar with WhatsApp. Higher engagement.
**Difficulty:** Hard (1–2 weeks)
**Files:** `src/components/ChatModal.tsx`
**PRD:** FR-11 (roadmap)

### L-08: Mobile PWA Support
**Description:** Add manifest.json, service worker, offline support.
**Why:** Farmers use phones. PWA is cheaper than native app.
**Difficulty:** Medium (2–3 days)
**Files:** New: `public/manifest.json`, `src/service-worker.ts`

### L-09: BMKG Weather Integration
**Description:** Fetch real weather data for improved forecasting and distribution priority.
**Why:** Current rain factor uses static monsoon pattern. Real data improves accuracy.
**Difficulty:** Medium (2–3 days)
**Files:** `src/utils/forecasting.ts`

### L-10: Add Test Coverage
**Description:** Set up Vitest + React Testing Library. Test matching engine, forecasting, route optimizer, and critical UI flows.
**Why:** Zero tests currently. Core algorithms (matching, forecasting, routing) should have unit tests.
**Difficulty:** Medium (3–5 days)
**Files:** New: `src/__tests__/`

---

## Backlog (Deferred)

- Computer vision quality grading (TensorFlow.js) — roadmap
- Google OR-Tools route optimization backend — roadmap
- React Native mobile app — roadmap
- Multi-language localization — roadmap
- Analytics dashboard (Vercel/Plausible) — post-deploy
- Error monitoring (Sentry) — post-deploy
