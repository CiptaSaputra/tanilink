# TaniLink — Code Quality Review

## Architecture

### Strengths

- **Single-responsibility components** — Each view component (FarmerView, BuyerView, etc.) manages its own UI concerns independently.
- **Context-based state** — Single `AppContext` provides centralized state management without external dependencies (Redux, Zustand).
- **Separation of logic** — Pure utility functions in `src/utils/` (forecasting, route optimization) are decoupled from UI.
- **Type-driven development** — All entities are defined in `types.ts` with clear interfaces and no `any` usage.
- **No routing library overhead** — Single-page role-switching pattern is appropriate for an MVP.

### Weaknesses

- **No backend layer** — All logic and data live in the frontend. No API routes, no database, no authentication service.
- **All-in-one context** — `AppContext.tsx` contains state, matching engine logic, localStorage sync, seed data, and UI notification state. This violates separation of concerns and will become unmanageable as the app grows.
- **No error boundary** — A component crash takes down the entire app.
- **No routing** — Navigation is limited to role switching. No deep URLs, no browser back/forward support.
- **Seed data hardcoded** — Sample harvests and demands are embedded in AppContext.tsx rather than in a separate seed file.

## Folder Structure

### Current

```
src/
├── components/     (9 components)
├── context/        (1 context)
├── utils/          (2 utilities)
├── types.ts        (all types)
├── App.tsx         (root)
├── main.tsx        (entry)
└── index.css       (tailwind theme)
```

### Observations

- ✅ Clean separation of components, context, and utilities.
- ❌ `types.ts` is a dumping ground — includes types, commodity metadata, and default weights.
- ❌ No `hooks/`, `services/`, or `api/` directories for future backend integration.
- ❌ No `constants/` directory — seed data lives in AppContext.tsx.
- ✅ Utility files are well-named and focused on one concern each.

## Naming Conventions

| Aspect | Verdict | Notes |
|--------|---------|-------|
| Components | ✅ PascalCase | All view components follow standard |
| Files | ✅ camelCase | All source files use camelCase |
| Types/interfaces | ✅ PascalCase | Harvest, Demand, Match, etc. |
| Functions | ✅ camelCase | calculateDistance, scoreMatch, etc. |
| Constants | ✅ UPPER_CASE | COMMODITY_LIST, COMMODITY_WEIGHTS |
| Props interfaces | ⚠️ Inline | Some props typed inline rather than exported |
| Event handlers | ⚠️ Inconsistent | Mix of `handleX` and inline arrow functions |

## Component Design

### Strengths

- Components are moderately sized (300–1100 lines each), with clear sections separated by comments.
- State is co-located with the component that uses it.
- Modals are rendered inline within parent components rather than at a global level.
- Motion (Framer Motion) usage is tasteful — subtle entrance animations, not excessive.

### Weaknesses

- **FarmerView (820 lines) and BuyerView (630 lines) are too large** — should be split into sub-components (PlantingForm, MatchCard, PreOrderPanel, ReviewModal, PaymentModal).
- **Modal rendering is duplicated** — Payment modal and review modal are duplicated across FarmerView and BuyerView. Should be reusable components.
- **No loading states** — All interactions are instant with no async operations. When a backend is added, every data fetch will need loading states.
- **No empty state diversity** — Empty states use a uniform "Belum ada..." pattern. Acceptable for MVP.

## TypeScript Quality

### Score: 8/10

- ✅ Zero `any` types (excellent).
- ✅ Strict interfaces for all entities.
- ✅ Discriminated unions for status fields.
- ✅ Enums-like patterns using union types.
- ⚠️ `Komoditas` is a string union but used as both type and object key — some indexing requires casting.
- ⚠️ Some components don't export their props interfaces for reuse.

## React Best Practices

### Score: 7/10

| Practice | Status |
|----------|--------|
| Hooks used correctly | ✅ |
| No class components | ✅ |
| useMemo/useCallback used appropriately | ✅ |
| useEffect dependencies correct | ✅ (verified from tsconfig) |
| Key props on list items | ✅ (unique IDs) |
| Props destructured | ✅ |
| Event handlers properly typed | ✅ |
| No prop drilling abuse | 🟡 (some props passed through App.tsx) |
| Custom hooks for reusable logic | ❌ (no custom hooks) |
| Error boundaries | ❌ |
| Suspense boundaries | ❌ |

## State Management

### Score: 5/10

- **Current:** React Context + localStorage persistence.
- **Strengths:** Simple, zero dependencies, localStorage enables page-refresh persistence.
- **Weaknesses:**
  - Entire app state in one context → every state change re-renders all consumers.
  - No state normalization — arrays are stored as-is, leading to O(n) lookups.
  - localStorage has 5MB limit — will overflow with chat messages at scale.
  - No optimistic updates, no rollback, no transaction support.
  - No backend sync — state is lost if user clears browser data.

## Performance

### Score: 6/10

- ✅ `useMemo` used for computed values (forecasts, regional stats, filtered data).
- ✅ Leaflet map state is stabilized via refs.
- ❌ No virtualization for lists (all items rendered at once).
- ❌ Page re-renders on every context change due to single-context architecture.
- ❌ SVG chart renders on every forecast computation even when hidden in other tabs.
- ❌ No lazy loading — all components mount immediately regardless of role.

## Security

### Score: 2/10

- ❌ **No authentication** — role switching is a UI toggle. Anyone can access any role.
- ❌ **No authorization** — RBAC is simulated via conditional rendering. API endpoints don't exist to enforce it.
- ❌ **No input sanitization** — form inputs are stored directly without validation.
- ❌ **No XSS protection** — message content is rendered as-is.
- ❌ **localStorage is insecure** — any browser extension or XSS can read all data.
- ✅ No passwords stored in code (but no password system at all).

## Technical Debt

### Critical

1. **Single AppContext monolith** (context/AppContext.tsx — 670 lines) must be split before backend integration.
2. **No backend** — all data is ephemeral localStorage. Real users cannot share or persist data.
3. **No authentication** — the role switcher is a mock, not a real security boundary.

### High

1. **FarmerView (820 lines) and BuyerView (630 lines) need decomposition** into smaller components.
2. **Duplicated modal patterns** — PaymentModal and ReviewModal replicated across roles.
3. **No error handling pattern** — all errors swallowed in `catch` blocks with generic messages.
4. **Seed data in AppContext** creates tight coupling between demo data and application logic.

### Medium

1. **`type.ts` contains runtime data** (`COMMODITY_LIST`, `COMMODITY_WEIGHTS`) alongside type definitions.
2. **No single source of truth for API endpoints** — backend integration will require search-and-replace across all components.
3. **`Komoditas` type requires casts** when used as object keys.
4. **InteractiveMap.tsx (660 lines)** contains geolocation, map rendering, popups, and side panel — should be split.
5. **CSS variables duplicated** between `index.css` Tailwind theme and inline styles.

## Recommendations (Priority Order)

1. **Split AppContext** into domain-specific contexts (AuthContext, DataContext, ChatContext, UIContext) or adopt Zustand for normalized state.
2. **Extract modals into reusable components** — `PaymentModal`, `ReviewModal`, `HarvestBatchModal`.
3. **Decompose FarmerView** into `PlantingForm`, `MyHarvestsTable`, `MatchCardList`, `PreOrderPanel`.
4. **Move seed data** to `src/seed/` or `src/data/` directory.
5. **Separate types from runtime data** — move `COMMODITY_LIST` and `COMMODITY_WEIGHTS` to `constants/commodities.ts`.
6. **Add error boundaries** at role-view level.
7. **Create custom hooks** — `useChat`, `useMatching`, `useGeolocation`.
8. **Abstract API layer** — create `src/services/api.ts` that wraps localStorage now and can swap to HTTP later.
9. **Normalize state** — use ID maps (`Record<string, T>`) instead of arrays for O(1) lookups.
10. **Add form validation** with error messages, not just silent catch-and-toast.
