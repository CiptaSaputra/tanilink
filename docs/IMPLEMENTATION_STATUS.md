# TaniLink — Implementation Status

> Comparison of current implementation against PRD requirements.
> **Versi ini diverifikasi terhadap kode per 2026-08-01.** Daftar API routes nyata: `find app/api -name "route.ts"`.

## Legend

- ✅ **Complete** — Fully implemented per PRD
- 🟡 **Partial** — Implemented but with gaps
- 🔴 **Not Started** — Not yet implemented
- ➖ **Not Planned** — Explicitly excluded per PRD

---

## Feature Implementation Status

| # | Feature | Status | Progress | Notes |
|---|---------|--------|----------|-------|
| FR-01 | Role-Based Access | ✅ Complete | 95% | RBAC via AuthContext + user registry di DB. 7 roles (incl. PUBLIK). Admin & Dinas tidak bisa self-register (server-enforced di `/api/auth/register`). Belum ada middleware/JWT — session hanya localStorage. |
| FR-02 | Farmer Registration & Login | ✅ Complete | 90% | Email/password login + register via `/api/auth/login` & `/api/auth/register`, diverifikasi ke tabel `users` (PostgreSQL). Password di-hash `btoa` (demo-only). Session persisted di localStorage. |
| FR-03 | Farmer Self-Input Planting Data | ✅ Complete | 100% | Form di FarmerView (commodity, date, area, coords, notes, isPublished). Proxy fields tidak ada. |
| FR-04 | Geolocation Auto-Fill + Pin Adjustment | 🟡 Partial | 60% | GPS button fetch koordinat. Map **click** set koordinat. Manual pin **drag gesture** belum — seleksi lewat click. |
| FR-05 | Opt-In Publication per Planting | ✅ Complete | 100% | Toggle di form. |
| FR-06 | Harvest Forecasting | ✅ Complete | 100% | Holt's Double ES + Fourier K=2 + Rain Factor. Displayed di DinasView SVG chart. |
| FR-07 | Price & Demand Prediction | ✅ Complete | 80% | **Price-per-kg prediction ada**: `/api/prices` baca `market_prices` dari DB, prediksi 14 hari (moving average + tren linier). Volume forecasting juga ada. Gap: belum disimpan ke tabel `price_predictions`. |
| FR-08 | Buyer Publishes Demand | ✅ Complete | 100% | Form di BuyerView. Tersimpan ke DB via `/api/demands`. |
| FR-09 | Smart Matching Recommendation | ✅ Complete | 100% | `runMatchingForHarvest` di `matchingEngine.ts`, trigger saat harvest baru (POST `/api/harvests`). Haversine + volume + price fit, per-commodity default weights. |
| FR-10 | Match Notification | 🟡 Partial | 50% | In-app toast. Tidak ada push/email/WhatsApp, tidak ada halaman riwayat notifikasi. |
| FR-11 | Farmer–Buyer Chat | ✅ Complete | 90% | **Dual kanal**: ChatModal in-app (persisted ke DB via `/api/conversations` & `/api/messages`) + link `wa.me` di kartu match. Belum WhatsApp Business API. |
| FR-12 | Pre-Order Agreement | ✅ Complete | 100% | `/api/pre-orders/confirm` — atomic transaction di DB (match CONFIRMED, harvest MATCHED, demand FULFILLED, insert pre_order). |
| FR-13 | Two Delivery Paths | ✅ Complete | 100% | Toggle `direct`/`consolidated`. |
| FR-14 | Distribution Priority | ✅ Complete | 100% | shelfLife + overdue + volume score, di `createHarvestBatch`. |
| FR-15 | Route Optimization (First-Mile) | ✅ Complete | 100% | **Clarke-Wright + 2-opt** (`routeOptimizer.ts`). Rekomendasi saja; status `PICKED_UP_DIRECTLY` untuk deviasi. |
| FR-16 | Payment Confirmation (Optional) | ✅ Complete | 100% | Upload proof URL via modal. Status: not_submitted → submitted → confirmed. |
| FR-17 | Reviews & Ratings | ✅ Complete | 100% | Star 1–5 + comment setelah PO COMPLETED. Persisted ke DB. |
| FR-18 | Admin Dashboard | ✅ Complete | 100% | Per-commodity weights (read-only), dispute resolution, priority queue, pre-order summary, review monitoring. |
| FR-19 | PPL/BPP Dashboard (Read-Only) | ✅ Complete | 100% | Regional aggregates, no input forms. |
| FR-20 | Dinas Dashboard (Read-Only) | ✅ Complete | 100% | 3 tabs: monitoring nasional, time-series forecasting, route optimization (VRP). |
| FR-21 | Kolektor Dashboard | ✅ Complete | 100% | Recommended routes per vehicle, update batch status, deviate via "Jemput Langsung". |
| FR-22 | No Blockchain | ✅ Complete | 100% | Tidak ada kode hash-chain/SHA-256. **Catatan:** label "Hash-Chain" di PublicDashboard hanyalah teks dekoratif. |
| FR-23 | No Third-Party Data Input | ✅ Complete | 100% | Semua `inputSource`/`inputByUserId` dihapus. PPL read-only. |
| FR-24 | Mobile-Friendly | 🟡 Partial | 50% | Responsive Tailwind. Belum ada testing device nyata, touch optimization, PWA. |

---

## Module Completion Summary

| Module | Status | Est. Progress |
|--------|--------|---------------|
| Landing Page | 🔴 Not Started | 0% |
| Authentication & RBAC | ✅ Complete | 90% |
| API Service Layer (HTTP fetch) | ✅ Complete | 100% |
| Next.js App Router + API Routes | ✅ Complete | 100% |
| Database (Drizzle + PostgreSQL) | ✅ Complete | 100% |
| Farmer Data Input | ✅ Complete | 100% |
| Harvest Forecasting | ✅ Complete | 100% |
| Price & Demand Prediction | ✅ Complete | 80% |
| Demand Management | ✅ Complete | 100% |
| Smart Matching | ✅ Complete | 100% |
| Chat (In-App + wa.me) | ✅ Complete | 90% |
| Pre-Order | ✅ Complete | 100% |
| Delivery Mode Selection | ✅ Complete | 100% |
| Distribution Priority | ✅ Complete | 100% |
| Route Optimization | ✅ Complete | 100% |
| Payment Confirmation | ✅ Complete | 100% |
| Reviews & Ratings | ✅ Complete | 100% |
| Admin Dashboard | ✅ Complete | 100% |
| PPL Dashboard | ✅ Complete | 100% |
| Kolektor Dashboard | ✅ Complete | 100% |
| Dinas Dashboard | ✅ Complete | 100% |
| Interactive Map | ✅ Complete | 100% |
| Disease Detection (CV) | ➖ Not Planned (MVP) | 0% |
| Hash-Chain Ledger | ➖ Not Planned (MVP) | 0% |
| WhatsApp Business API | ➖ Not Planned (MVP) | 0% |
| Marketplace Fallback | ➖ Not Planned (MVP) | 0% |
| AI Q&A (Public) | ➖ Not Planned (MVP) | 0% |
| Dataset Export | ➖ Not Planned (MVP) | 0% |

---

## Backend / Data Layer

| Lapisan | Status | Detail |
|---------|--------|--------|
| PostgreSQL via Docker | ✅ | `docker-compose.yml` (port 5434), `.env` DATABASE_URL |
| Drizzle ORM | ✅ | `drizzle.config.ts`, `src/db/schema.ts` (12 tabel), migrasi `drizzle/0000_*.sql` |
| API Routes (REST) | ✅ | 45+ route handlers di `app/api/` (auth, harvests, demands, matches, pre-orders, batches, conversations, messages, payments, reviews, prices) |
| Pre-Order atomic transaction | ✅ | `/api/pre-orders/confirm` pakai `db.transaction` |
| Real-time frontend sync | ✅ | `DataContext` polling `/api/*` tiap 3 detik |
| RBAC middleware (server) | 🔴 | Belum ada `middleware.ts` — proteksi role hanya client-side |

---

## Overall Completion Estimate

**Core MVP features:** ~95% complete
**Full PRD features:** ~85% complete

Biggest remaining gaps:
- Landing page (0%)
- Manual pin drag gesture di InteractiveMap (FR-04)
- Push notifications (WA/email) — baru in-app toast
- TypeScript strict errors masih beberapa (ignoreBuildErrors aktif di `next.config.mjs`)
- Password hash masih `btoa` (demo-only, perlu bcrypt/argon)
- Belum ada JWT / middleware RBAC server-side
