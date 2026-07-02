# TaniLink — Product Requirements Document (PRD)

> Product requirements only. No implementation details.

---

## Roles & Access Control

### FR-01: Role-Based Access
**Description:** System supports 6 user roles: Petani, Pembeli Institusional, PPL/BPP, Kolektor, Admin, Dinas Pertanian.
**Business Goal:** Ensure data security and appropriate access per stakeholder.
**Priority:** Critical
**Status:** ✅ Complete (partial — no login/auth; role switching via UI buttons)
**Dependencies:** None
**Acceptance Criteria:**
- Each role sees only its authorized features and data
- PPL/BPP and Dinas Pertanian are read-only
- Kolektor has write access only to batch status updates

---

## Core Features

### FR-02: Farmer Self-Registration & Login
**Description:** Farmers create accounts and log in to the system.
**Business Goal:** Establish identity for data ownership.
**Priority:** Critical
**Status:** 🔴 Not Started
**Dependencies:** FR-01

### FR-03: Farmer Inputs Own Planting Data
**Description:** Farmers input commodity, planting date, land area, location coordinates. No proxy input by third parties.
**Business Goal:** Ensure simple, clear data ownership.
**Priority:** Critical
**Status:** ✅ Complete (but `isPublished` boolean added; no proxy fields remaining)
**Dependencies:** None

### FR-04: Geolocation Auto-Fill with Manual Pin Adjustment
**Description:** Location auto-fills from device geolocation when form opens; user can adjust by dragging pin on map.
**Business Goal:** Reduce input friction, improve coordinate accuracy.
**Priority:** High
**Status:** ✅ Complete
**Dependencies:** FR-03

### FR-05: Opt-In Publication per Planting
**Description:** Farmers choose per-planting whether to publish data for matching (default: not published).
**Business Goal:** Give farmers full control over data visibility.
**Priority:** High
**Status:** ✅ Complete
**Dependencies:** FR-03

### FR-06: Harvest Forecasting
**Description:** System aggregates published planting data to predict harvest time and estimated volume per region.
**Business Goal:** Provide farmers and buyers with supply visibility.
**Priority:** High
**Status:** ✅ Complete (Holt's Double ES + Fourier Seasonal + Rain Factor)
**Dependencies:** FR-03

### FR-07: Price & Demand Prediction
**Description:** System analyzes historical prices, demand, and weather data to generate 1–4 week price projections and best-selling-time recommendations.
**Business Goal:** Reduce farmer dependence on middlemen through price transparency.
**Priority:** Medium
**Status:** ✅ Complete (integrated into DinasView forecasting tab)
**Dependencies:** FR-06

### FR-08: Buyer Publishes Demand Listing
**Description:** Institutional buyers publish commodity, minimum volume, offer price, and location.
**Business Goal:** Enable buyers to signal needs before harvest.
**Priority:** High
**Status:** ✅ Complete
**Dependencies:** None

### FR-09: Smart Matching (Recommendation)
**Description:** System recommends farmer–buyer matches using a composite score of location proximity (Haversine), volume fit, and price fit. Weights are commodity-specific defaults, not freely adjustable by admin.
**Business Goal:** Automate match discovery while keeping final decision with users.
**Priority:** High
**Status:** ✅ Complete (per-commodity weights implemented in `COMMODITY_WEIGHTS`)
**Dependencies:** FR-05, FR-08

### FR-10: Match Notification
**Description:** Both parties receive notification when match score is high. Pre-order only forms when both explicitly agree.
**Business Goal:** Avoid forced matching; preserve user autonomy.
**Priority:** High
**Status:** ✅ Complete (in-app notifications via `showNotification`)
**Dependencies:** FR-09

### FR-11: Farmer–Buyer Chat
**Description:** Matched farmers and buyers communicate via in-app chat for price, volume, and delivery negotiation. History persisted.
**Business Goal:** Facilitate direct negotiation without exchanging personal contacts.
**Priority:** High
**Status:** ✅ Complete (ChatModal component, localStorage persistence)
**Dependencies:** FR-09, FR-10

### FR-12: Pre-Order Agreement
**Description:** Pre-order forms only when both parties explicitly confirm. Record includes agreed price, volume, and delivery mode.
**Business Goal:** Provide commitment before harvest completion.
**Priority:** Critical
**Status:** ✅ Complete
**Dependencies:** FR-10

### FR-13: Two Delivery Paths (Direct / Consolidated)
**Description:** After pre-order, farmer chooses: direct sale (self-arranged delivery) or consolidation (join first-mile collection).
**Business Goal:** Accommodate farmers with and without distribution access.
**Priority:** High
**Status:** ✅ Complete (`deliveryMode` on PreOrder, toggle button in FarmerView)
**Dependencies:** FR-12

### FR-14: Distribution Priority
**Description:** For consolidated batches, system computes priority score from shelf life, weather prediction, and harvest schedule. Higher-priority batches collected first.
**Business Goal:** Reduce spoilage of perishable commodities.
**Priority:** Medium
**Status:** ✅ Complete (in `createHarvestBatch` — shelfLifeScore, overdueScore, volumeScore)
**Dependencies:** FR-13

### FR-15: Route Optimization — First-Mile Collection (Recommended)
**Description:** System clusters collection points geographically and **recommends** pickup order to hub using nearest-neighbor heuristic. Routes are visual on interactive map. Not mandatory — collectors may deviate.
**Business Goal:** Consolidate small-volume farmers into efficient collection routes.
**Priority:** Medium
**Status:** ✅ Complete (Clarke-Wright + 2-opt in `routeOptimizer.ts`)
**Dependencies:** FR-14

### FR-16: Payment Confirmation (Optional)
**Description:** Optional proof-of-payment upload field on each pre-order. Not a required step for order progression.
**Business Goal:** Accommodate off-system payment norms while providing optional record-keeping.
**Priority:** Low
**Status:** ✅ Complete
**Dependencies:** FR-12

### FR-17: Reviews & Ratings
**Description:** After pre-order is completed, farmers and buyers can rate each other (1–5) and leave comments. History is visible for future matches.
**Business Goal:** Build trust reputation within the platform.
**Priority:** Medium
**Status:** ✅ Complete
**Dependencies:** FR-12

---

## Dashboards

### FR-18: Admin Dashboard
**Description:** Overview of published plantings, active demands, match recommendations, and ready batches. Monitor Smart Matching default weight performance per commodity (not freely adjustable). Resolve data disputes and moderate reviews.
**Business Goal:** Platform oversight without overreach into algorithm tuning.
**Priority:** High
**Status:** ✅ Complete
**Dependencies:** FR-09, FR-14

### FR-19: PPL/BPP Dashboard (Read-Only)
**Description:** Regional data aggregates: published plantings, harvest estimates, consolidation status. No data input/modification.
**Business Goal:** Enable extension workers to monitor without creating proxy-input complexity.
**Priority:** Medium
**Status:** ✅ Complete
**Dependencies:** FR-03, FR-14

### FR-20: Dinas Pertanian Dashboard (Read-Only)
**Description:** Regional aggregates: price trends per commodity, planting distribution, surplus/deficit potential.
**Business Goal:** Data-driven regional food security policy.
**Priority:** Medium
**Status:** ✅ Complete (includes forecasting + route optimization tabs)
**Dependencies:** FR-06, FR-07

### FR-21: Kolektor Dashboard
**Description:** View recommended first-mile routes, update batch status. Route/schedule is recommendation only — collectors may deviate.
**Business Goal:** Provide guidance without mandating compliance.
**Priority:** Medium
**Status:** ✅ Complete
**Dependencies:** FR-14, FR-15

---

## Technical Constraints

### FR-22: No Blockchain
**Description:** System must not use blockchain/hash-chain traceability. Simple SHA-256 checksum per transaction record is acceptable if traceability is needed later.
**Business Goal:** Avoid unnecessary complexity. Decentralized trust is irrelevant for a single-database system.
**Priority:** Critical
**Status:** ✅ Complete (not implemented, no blockchain code exists)
**Dependencies:** None

### FR-23: No Third-Party Data Input
**Description:** Farmers always input their own data via their own account. No input proxy, no `input_source` metadata.
**Business Goal:** Keep data ownership simple and clear.
**Priority:** Critical
**Status:** ✅ Complete (all `inputSource`/`inputByUserId` fields removed)
**Dependencies:** FR-03

### FR-24: Mobile-Friendly
**Description:** All views must be responsive for mobile access (majority of farmers use phones in the field).
**Business Goal:** Maximize accessibility for target users.
**Priority:** High
**Status:** 🟡 Partial (Tailwind responsive classes present, but no dedicated mobile testing confirmed)
**Dependencies:** None
