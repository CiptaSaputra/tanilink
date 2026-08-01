# TaniLink — Code Quality Review

> Diperbarui per 2026-08-01. Sebagian besar temuan versi lama (Vite SPA) sudah diatasi sejak 1.4.0 & 1.5.0.

## Architecture

### Strengths

- **Full-stack clean layering** — `src/services/` (HTTP) → `app/api/` (REST) → Drizzle → PostgreSQL. Frontend tidak pernah menyentuh storage langsung.
- **Single-responsibility components** — setiap role view mengelola UI-nya sendiri; modals (Payment, Review, HarvestBatch) reusable.
- **Domain-separated contexts** — 5 context (UI, Data, Chat, Payment, Review) mengisolasi re-render.
- **Separation of logic** — pure utilities di `src/utils/` (forecasting, matching, routeOptimizer) terdecouple dari UI.
- **Type-driven development** — semua entity didefinisikan di `types.ts`, zero `any`.
- **Schema ↔ types alignment** — `src/db/schema.ts` mencerminkan `types.ts` (Drizzle mirror).
- **Pre-order atomicity** — transaksi DB di `/api/pre-orders/confirm`.

### Weaknesses

- **No RBAC middleware server** — proteksi role hanya client-side; endpoint API tidak memvalidasi role caller.
- **Password hash `btoa`** — demo-only, insecure untuk produksi.
- **Service layer tanpa error states** — fetch failures silent-return `[]` / generic error; tidak ada retry.
- **Beberapa route handler berisi komentar/sisa logika lama** (mis. `app/api/harvests/route.ts` GET yang masih ragu soal response shape).
- **Polling 3 detik** untuk sinkronisasi — workable untuk demo, bukan real-time push.

## Folder Structure

```
app/
├── (auth)/, dashboard/, api/ (45+ routes)
src/
├── components/     (role views + modals + shared)
├── context/        (Auth, UI, Data, Chat, Payment, Review)
├── services/       (HTTP service layer)
├── db/             (Drizzle connection, schema, seed, migrate)
├── utils/          (forecasting, matching, routeOptimizer, bmkg, geocoding)
├── constants/      (commodities.ts — runtime data)
├── data/           (seed data, demo users)
└── types.ts        (pure types)
drizzle/            (migration files)
```

### Observations

- ✅ Clean separation of components, context, services, utils.
- ✅ `types.ts` murni type — runtime data pindah ke `constants/` & `data/`.
- ✅ `services/` dan `db/` ada untuk backend integration.
- ⚠️ `app/api/harvests/route.ts` masih ada komentar TODO lama.
- ⚠️ Dependencies tidak terpakai (`@tensorflow/tfjs`, `qrcode.react`, `@google/genai`, `express`, `@vitejs/plugin-react`, `vite`) — bloat.

## Naming Conventions

| Aspect | Verdict | Notes |
|--------|---------|-------|
| Components | ✅ PascalCase | FarmerView, BuyerView, dsb. |
| Files | ✅ camelCase | Semua source file |
| Types/interfaces | ✅ PascalCase | Harvest, Demand, Match |
| Functions | ✅ camelCase | calculateDistance, scoreMatch |
| Constants | ✅ UPPER_CASE | COMMODITY_LIST, COMMODITY_WEIGHTS |
| DB schema | ✅ snake_case | `land_area`, `pre_order_id` (mapped via Drizzle) |
| Props interfaces | ⚠️ Inline | Sebagian props di-type inline |

## Component Design

### Strengths

- Components terdekomposisi (FarmerView/BuyerView sudah dipecah jadi sub-komponen + modal reusable).
- State co-located dengan komponen.
- Modals reusable (PaymentModal, ReviewModal, HarvestBatchModal) dipakai lintas role.
- ErrorBoundary membungkus semua role view.

### Weaknesses

- **InteractiveMap (~600+ baris)** masih monolith — map, sidebar, filter, geolocation dalam satu file.
- **No loading states** — semua interaksi dianggap instant; fetch async belum punya skeleton/spinner.
- **No empty state diversity** — pola "Belum ada..." seragam.
- **Form validation** sebagian besar ada di auth, tapi form planting/demand/batch belum field-level.

## TypeScript Quality

### Score: 8/10

- ✅ Zero `any`.
- ✅ Strict interfaces untuk semua entity.
- ✅ Discriminated unions untuk status fields.
- ⚠️ `Komoditas` dipakai sebagai type & object key — kadang perlu cast.
- ⚠️ Beberapa komponen tidak mengekspor props interface.
- ⚠️ `next.config.mjs` masih `ignoreBuildErrors: true` — strict errors belum dibereskan.

## React Best Practices

### Score: 8/10

| Practice | Status |
|----------|--------|
| Hooks used correctly | ✅ |
| No class components | ✅ |
| useMemo/useCallback used appropriately | ✅ |
| Key props on list items | ✅ |
| Context split untuk isolasi re-render | ✅ |
| Error boundaries | ✅ |
| Custom hooks untuk reusable logic | 🟡 (hanya hooks context: useData, useChat, dsb.) |
| Suspense boundaries | ❌ |
| Memoized components | ⚠️ sebagian |

## State Management

### Score: 7/10

- **Current:** 5 domain contexts + polling API (3s).
- **Strengths:** terisolasi per domain, data dari backend nyata (PostgreSQL), service layer swappable.
- **Weaknesses:**
  - Belum normalisasi (masih array → O(n) lookup).
  - Polling 3 detik — bukan subscription/push.
  - Tidak ada optimistic rollback pattern yang konsisten.
  - Auth session localStorage (acceptable untuk demo, bukan produksi).

## Performance

### Score: 6/10

- ✅ `useMemo` untuk computed values.
- ✅ Leaflet map state stabil via refs.
- ❌ Belum ada virtualisasi list (semua item dirender).
- ❌ Polling 3 detik fetch seluruh dataset — boros di skala besar.
- ❌ Tidak ada code splitting per-route untuk komponen besar.

## Security

### Score: 4/10

- ✅ Auth login/register via backend, password tidak pernah dikirim plaintext ke client response.
- ✅ Admin/Dinas tidak bisa self-register (server-enforced).
- ✅ Pre-order confirm pakai transaction (atomicity).
- ❌ **RBAC hanya client-side** — endpoint API tidak memeriksa role/ownership caller. Siapa pun yang tahu endpoint bisa POST data.
- ❌ **Password hash `btoa`** — dapat di-decode, tidak aman.
- ❌ Tidak ada input sanitization di semua endpoint (XSS risk pada field text/notes/chat).
- ❌ Tidak ada rate limiting / session JWT.

## Technical Debt

### Critical

1. **RBAC middleware server-side belum ada** — endpoint API tidak diverifikasi role/ownership. Ini gap terbesar menuju produksi.
2. **Password hash `btoa`** — harus bcrypt/argon + JWT session.
3. **XSS/sanitization** — content chat & notes dirender apa adanya.

### High

1. **`ignoreBuildErrors: true`** — TypeScript strict errors belum dibersihkan.
2. **Polling 3 detik full-fetch** — boros; perlu incremental/etag atau websocket.
3. **Dependencies tidak terpakai** — kurangi bundle (tfjs, qrcode, genai, express, vite).
4. **`app/api/harvests/route.ts`** — komentar/sisa logika response shape perlu dibersihkan.

### Medium

1. **InteractiveMap monolith (~600+ baris)** — perlu dipecah.
2. **Form validation** planting/demand/batch belum field-level.
3. **Loading states** belum ada untuk operasi async.
4. **State belum dinormalisasi** — O(n) array lookup.
5. **Service layer error handling** — silent fail menyembunyikan error backend.

## Recommendations (Priority Order)

1. **RBAC middleware** di Next.js (`middleware.ts`) + validasi ownership di tiap endpoint.
2. **Replace `btoa`** dengan bcrypt/argon + JWT.
3. **Sanitize input** (text fields, chat content) sebelum disimpan/rendered.
4. **Bersihkan TypeScript strict errors**, lalu matikan `ignoreBuildErrors`.
5. **Kurangi dependencies** yang tidak terpakai.
6. **Refactor InteractiveMap** — split map, sidebar, filters, geolocation.
7. **Virtualisasi list** (react-window) untuk chat & matches.
8. **Perbaiki error handling service layer** — surface backend errors ke UI.
