# TaniLink — Claude Code Instructions

## Project Overview

TaniLink is a web platform that connects small-to-medium farmers with institutional buyers (cooperatives, processors, supermarkets, institutional catering) starting from the **planting planning stage** — not only after harvest like most existing platforms. It is an **optional service** for farmers who lack established buyer networks, not a mandatory system.

The system combines: harvest forecasting, price/demand prediction, smart matching recommendations (not automatic binding), farmer–buyer chat, two delivery paths (direct or consolidated first-mile collection), distribution priority, and route optimization (recommendation only).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Map | Leaflet.js |
| State | React Context + localStorage |
| Future DB | Drizzle ORM + PostgreSQL |
| Future Auth | Better Auth |
| Future Framework | Next.js |

## Coding Standards

### Architecture Rules

1. **Components are single-responsibility.** A component should do one thing well. If a file exceeds 400 lines, consider decomposition.
2. **No backend calls yet.** All logic runs in the browser. When adding API calls, abstract through `src/services/api.ts`.
3. **Context is for shared state only.** Do not put UI-only state in context.
4. **Utilities are pure functions.** `src/utils/*` must be side-effect-free, testable, and importable anywhere.
5. **Seed data lives in `src/data/`, not in context.**
6. **Types live in `src/types/`. Runtime constants live in `src/constants/`.** Do not mix them.

### Folder Conventions

```
src/
├── components/      — React components (one per file)
├── context/         — React contexts
├── hooks/           — Custom React hooks
├── services/        — API abstraction layer
├── utils/           — Pure utility functions
├── types/           — TypeScript type definitions
├── constants/       — Runtime constants
├── data/            — Seed/mock data
├── App.tsx          — Root component
└── main.tsx         — Entry point
```

### Naming Conventions

- **Files:** camelCase (`farmerView.tsx`, `routeOptimizer.ts`)
- **Components:** PascalCase (`FarmerView`, `InteractiveMap`)
- **Types/Interfaces:** PascalCase (`Harvest`, `MatchWeights`)
- **Functions:** camelCase (`calculateDistance`, `scoreMatch`)
- **Constants:** UPPER_CASE (`COMMODITY_LIST`, `COMMODITY_WEIGHTS`)
- **Event handlers:** `handleX` prefix (`handleSubmit`, `handleCommodityChange`)
- **Props interfaces:** `XProps` suffix (`FarmerViewProps`)

### React Rules

1. Use functional components with hooks only (no class components).
2. Use `useMemo`/`useCallback` for expensive computations.
3. Use `useRef` for DOM references and stable callbacks.
4. Destructure props and context values.
5. Provide unique `key` props for list items (use IDs, not indices).
6. Do not use `any` for props or state.
7. Conditional rendering: use ternary or `&&`, not inline IIFEs except for complex blocks.

### TypeScript Rules

1. **No `any`.** Use `unknown` if the type is truly not known, then narrow with type guards.
2. Define interfaces for all entities. Use `type` for unions and simple aliases.
3. Use string unions (e.g., `'ACTIVE' | 'MATCHED' | 'HARVESTED'`) for status fields.
4. Export all shared types from `src/types/index.ts`.
5. Prefer `interface` over `type` for object shapes.

### UI Rules

1. Use the custom Tailwind theme (`nat-green`, `nat-brown`, `nat-sage`, `nat-light-cream`, etc.) — no hardcoded colors.
2. All text in Indonesian (`id-ID` locale).
3. Format numbers with `toLocaleString('id-ID')`.
4. Use `motion` (from `motion/react`) for animations — keep them subtle.
5. Use `lucide-react` icons — prefer semantic icons over decorative.
6. All interactive elements must have `cursor-pointer`.
7. Forms must have validation feedback (error messages, disabled submit on invalid).

### Data Rules

1. `Harvest.isPublished` — farmers opt-in per planting. Default: `true` in current code (likely should be `false` per PRD).
2. `COMMODITY_WEIGHTS` — per-commodity default weights. **Never allow admin to freely adjust these.**
3. Route optimization is **recommendation only**. Collectors may deviate (`PICKED_UP_DIRECTLY` status).
4. Conversations auto-create on match confirm.
5. Reviews only after pre-order `COMPLETED`.
6. No blockchain, no hash-chain, no QR trace.

### Git Workflow

1. Branch from `main` for features: `feat/short-description`.
2. Branch from `main` for fixes: `fix/short-description`.
3. Commit messages: imperative mood, capitalized, ≤72 chars.
4. Reference PRD feature IDs where applicable (`FR-09`).
5. End commit messages with `Co-Authored-By: Claude <noreply@anthropic.com>`.

### Documentation Rules

1. Update `docs/` when adding or changing features.
2. Update `CHANGELOG.md` on significant changes.
3. Keep `IMPLEMENTATION_STATUS.md` in sync with PRD.
4. Major design decisions belong in `ARCHITECTURE.md` and `PROJECT_OVERVIEW.md`.

## General Instructions

1. **Never delete existing features without user confirmation.**
2. **Never use `any` unless absolutely necessary** (and explain why).
3. **Keep components modular.** One file, one responsibility.
4. **Reuse components whenever possible** — extract modals, cards, forms.
5. **Follow existing architecture** — do not introduce new patterns without discussion.
6. **Always update documentation after major implementation.**
7. **Explain major design decisions before large refactors.**
8. **Per-commodity weights are fixed defaults, not admin-adjustable.**
9. **Farmers input their own data only** — no proxy input by PPL, family, or Gapoktan.
10. **PPL and Dinas Pertanian are read-only roles.**
11. **Blockchain is explicitly excluded from the system.**
12. **Route optimization results are recommendations, not obligations.**

## PRD Feature ID Reference

| ID | Feature |
|----|---------|
| FR-01 | Role-Based Access |
| FR-02 | Auth & Login |
| FR-03 | Farmer Planting Input |
| FR-04 | Geolocation + Pin Drag |
| FR-05 | Opt-In Publication |
| FR-06 | Harvest Forecasting |
| FR-07 | Price & Demand Prediction |
| FR-08 | Buyer Demand Listing |
| FR-09 | Smart Matching |
| FR-10 | Match Notification |
| FR-11 | Chat |
| FR-12 | Pre-Order Agreement |
| FR-13 | Two Delivery Paths |
| FR-14 | Distribution Priority |
| FR-15 | Route Optimization |
| FR-16 | Payment Confirmation |
| FR-17 | Reviews & Ratings |
| FR-18 | Admin Dashboard |
| FR-19 | PPL Dashboard |
| FR-20 | Dinas Dashboard |
| FR-21 | Kolektor Dashboard |
| FR-22 | No Blockchain |
| FR-23 | No Third-Party Input |
| FR-24 | Mobile-Friendly |
