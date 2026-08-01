# TaniLink — Roadmap

> Prioritized development phases. Short-term = make it real. Medium-term = make it reliable. Long-term = make it complete.

---

## Short-Term (Next 1–3 Months)

### 1. Authentication & RBAC
- [x] Login & registration flow (farmers, buyers, PPL, collectors) — `/api/auth/*`
- [x] Session management (localStorage-based, demo)
- [ ] JWT-based session management (production)
- [ ] RBAC middleware at API level (no `middleware.ts` yet)
- **Priority:** Critical
- **Dependency:** PRD FR-01, FR-02
- **Current:** ✅ Complete (demo-grade; production hardening pending)

### 2. Database Layer
- [x] PostgreSQL (dev & prod) with Drizzle ORM
- [x] Schema migrations matching `types.ts` interfaces (`drizzle/0000_*.sql`)
- [x] Replace all localStorage reads/writes with Drizzle queries (via API service layer)
- [x] Pre-populate seed data via `src/db/seed.ts`
- **Priority:** Critical
- **Dependency:** PRD FR-03 through FR-21 (all data features)
- **Current:** ✅ Complete

### 3. Next.js Migration
- [x] Scaffold Next.js app with App Router
- [x] Migrate existing components (Vite → Next.js)
- [x] Create API route handlers for all CRUD operations (45+ routes)
- [ ] Set up landing page (public routes) separate from dashboard (auth routes)
- **Priority:** High
- **Dependency:** Item 2 (DB layer)
- **Current:** ✅ Complete (landing page belum)

### 4. API Routes
- [x] `POST /api/harvests` — farmer adds planting
- [x] `GET /api/harvests` — list plantings
- [x] `POST /api/demands` — buyer creates demand
- [x] `GET /api/matches` — get match recommendations
- [x] `POST /api/pre-orders/confirm` — confirm match → pre-order (atomic transaction)
- [x] `POST /api/conversations/:id/messages` — send chat
- [x] `GET /api/prices?commodity=&region=` — price history + 14-day prediction
- [x] `POST /api/harvest-batches` — create harvest batch
- [x] `PATCH /api/batches/:id/status` — update batch status
- **Priority:** High
- **Current:** ✅ Complete

### 5. Landing Page
- [ ] Public page: problem statement, solution overview, CTA per role
- [ ] Registration/login forms
- [ ] Info architecture: For Farmers / For Buyers / For Government
- **Priority:** Medium
- **Dependency:** Item 1 (auth)
- **Current:** 🔴 Not Started

---

## Medium-Term (3–6 Months)

### 6. State Management Refactor
- [x] Split AppContext into domain contexts (UI, Data, Chat, Payment, Review)
- [ ] Normalize state (arrays → ID maps) / adopt Zustand
- [ ] Add async action handlers with loading/error states
- **Priority:** High
- **Current:** ✅ Context split done (1.4.0). Normalization & Zustand pending.

### 7. Component Decomposition
- [x] Extract PlantingForm, MyHarvestsTable, MatchCardList from FarmerView
- [x] Extract DemandForm, MatchCardList from BuyerView
- [x] Make PaymentModal, ReviewModal, HarvestBatchModal reusable components
- [ ] Split InteractiveMap into map + sidebar sub-components
- **Priority:** High
- **Rationale:** Most decomposition done (H-05, H-06, M-01). InteractiveMap (~600 lines) still pending.

### 8. Price Prediction Module
- [x] Implement price-per-kg forecasting (not just volume) — `/api/prices`
- [ ] Fetch BMKG weather data for exogenous variables
- [x] Display price trend chart in farmer dashboard
- **Priority:** Medium
- **Current:** 🟡 Partial (price-per-kg prediction via moving average + linear trend; no weather exogenous vars yet)

### 9. Notification System
- [ ] Match recommendation notifications
- [ ] New message notifications
- [ ] Pre-order status change notifications
- [ ] Batch pickup reminders
- **Priority:** Medium
- **Current:** 🟡 Partial (in-app toast only)

### 10. Mobile Optimization
- [ ] Touch-optimized interactions (map gestures, form inputs)
- [ ] Install PWA support (service worker, manifest)
- [ ] Mobile-specific navigation (bottom nav instead of role switcher)
- [ ] Test on real Android/iOS devices
- **Priority:** Medium
- **Current:** 🟡 Partial (responsive CSS, no PWA)

---

## Long-Term (6–12 Months)

### 11. Production Deployment
- [ ] Deploy to Vercel with PostgreSQL (Neon / Supabase)
- [ ] Custom domain + SSL
- [ ] Analytics (Vercel Analytics / Plausible)
- [ ] Error monitoring (Sentry)
- **Priority:** High

### 12. WhatsApp Business API Integration
- [ ] Alternative to in-app chat (more familiar for farmers)
- [ ] Status notifications via WhatsApp
- **Priority:** Low
- **Rationale:** Requires business verification process.

### 13. Quality Grading & Disease Detection (Computer Vision)
- [ ] TensorFlow.js model for produce quality assessment / disease detection
- [ ] Photo upload in batch creation flow
- **Priority:** Low
- **Rationale:** Explicit roadmap item in PRD, not MVP. (`@tensorflow/tfjs` is a dependency but unused.)

### 14. Data Integration
- [ ] BMKG weather API for improved forecasting
- [ ] Ministry of Agriculture price portal data (Panel Harga Pangan)
- [ ] BPS production statistics for calibration
- **Priority:** Medium

### 15. Advanced Route Optimization
- [ ] Replace heuristic solver with Google OR-Tools (Python backend)
- [ ] Real-time traffic data from Google Maps / OSRM
- [ ] Time-window constraints (per-market opening hours)
- **Priority:** Low
- **Rationale:** Current VRP solver works for MVP.

### 16. Mobile App (React Native)
- [ ] Farmer-focused mobile app with offline support
- [ ] Push notifications for matches, messages, batch updates
- **Priority:** Low

### 17. Localization
- [ ] Multi-language support (Indonesian, English, regional languages)
- [ ] RTL support (not needed now, but good practice)
- **Priority:** Low

---

## Effort Estimate

> Short-term & most of medium-term sudah selesai (per 2026-08-01).

| Phase | Features | Est. Effort | Team Size | Duration |
|-------|----------|-------------|-----------|----------|
| Short-term | Auth, DB, Next.js, API, Landing | 2–3 months | 2 devs | 8–12 weeks — **selesai** (kecuali landing page) |
| Medium-term | Refactor, Price, Notifications, Mobile | 2–3 months | 2 devs | 8–12 weeks — **sebagian selesai** (context split, decomposition, price) |
| Long-term | Deploy, WhatsApp, CV, Integrations, Mobile App | 4–6 months | 2–3 devs | 16–24 weeks |

**Total estimated development:** 8–12 months with 2 developers.
