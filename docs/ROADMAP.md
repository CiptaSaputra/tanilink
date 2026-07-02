# TaniLink — Roadmap

> Prioritized development phases. Short-term = make it real. Medium-term = make it reliable. Long-term = make it complete.

---

## Short-Term (Next 1–3 Months)

### 1. Authentication & RBAC
- [ ] Integrate Better Auth with email/password login
- [ ] Registration flow for farmers, buyers, PPL, collectors
- [ ] JWT-based session management
- [ ] RBAC middleware at API level (when backend exists)
- **Priority:** Critical
- **Dependency:** PRD FR-01, FR-02
- **Current:** 🔴 Not Started

### 2. Database Layer
- [ ] Set up SQLite (dev) / PostgreSQL (prod) with Drizzle ORM
- [ ] Create schema migrations matching `types.ts` interfaces
- [ ] Replace all localStorage reads/writes with Drizzle queries
- [ ] Pre-populate seed data via Drizzle seeds
- **Priority:** Critical
- **Dependency:** PRD FR-03 through FR-21 (all data features)
- **Current:** 🔴 Not Started

### 3. Next.js Migration
- [ ] Scaffold Next.js app with App Router
- [ ] Migrate existing components (Vite → Next.js)
- [ ] Create API route handlers for all CRUD operations
- [ ] Set up landing page (public routes) separate from dashboard (auth routes)
- **Priority:** High
- **Dependency:** Item 2 (DB layer)
- **Current:** 🔴 Not Started

### 4. API Routes
- [ ] `POST /api/plantings` — farmer adds planting
- [ ] `GET /api/plantings` — list plantings (filtered by role)
- [ ] `POST /api/demands` — buyer creates demand
- [ ] `GET /api/matches` — get match recommendations
- [ ] `POST /api/matches/:id/confirm` — confirm match → pre-order
- [ ] `POST /api/conversations/:id/messages` — send chat
- [ ] `GET /api/forecasts` — harvest forecasts
- [ ] `POST /api/batches` — create harvest batch
- [ ] `PATCH /api/batches/:id/status` — update batch status
- **Priority:** High
- **Current:** 🔴 Not Started

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
- [ ] Split AppContext into domain contexts or adopt Zustand
- [ ] Normalize state (arrays → ID maps)
- [ ] Add async action handlers with loading/error states
- **Priority:** High
- **Rationale:** Monolith context becomes bottleneck with API integration.

### 7. Component Decomposition
- [ ] Extract PlantingForm, MatchCard, PreOrderPanel from FarmerView
- [ ] Extract DemandForm, MatchCard from BuyerView
- [ ] Make PaymentModal and ReviewModal reusable components
- [ ] Split InteractiveMap into map + sidebar sub-components
- **Priority:** High
- **Rationale:** FarmerView (820 lines) and BuyerView (630 lines) are maintainability risks.

### 8. Price Prediction Module
- [ ] Implement price-per-kg forecasting (not just volume)
- [ ] Fetch BMKG weather data for exogenous variables
- [ ] Display price trend chart in farmer dashboard
- **Priority:** Medium
- **Current:** 🟡 Partial (volume forecast only)

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

### 13. Quality Grading (Computer Vision)
- [ ] TensorFlow.js model for produce quality assessment
- [ ] Photo upload in batch creation flow
- **Priority:** Low
- **Rationale:** Explicit roadmap item in PRD, not MVP.

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

| Phase | Features | Est. Effort | Team Size | Duration |
|-------|----------|-------------|-----------|----------|
| Short-term | Auth, DB, Next.js, API, Landing | 2–3 months | 2 devs | 8–12 weeks |
| Medium-term | Refactor, Price, Notifications, Mobile | 2–3 months | 2 devs | 8–12 weeks |
| Long-term | Deploy, WhatsApp, CV, Integrations, Mobile App | 4–6 months | 2–3 devs | 16–24 weeks |

**Total estimated development:** 8–12 months with 2 developers.
