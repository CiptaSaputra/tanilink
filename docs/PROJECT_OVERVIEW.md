# TaniLink — Project Overview

## Background

Indonesia experiences **23–48 million tons of food loss and waste annually** (2000–2019), equivalent to **Rp213–551 trillion in economic losses** per year (4–5% of GDP). Most food loss occurs **upstream** in the supply chain — at production (7–12.3 Mt/year) and post-harvest/storage (6.1–9.9 Mt/year) — *before* food ever reaches consumers.

Source: *Bappenas, Waste4Change, & WRI Indonesia (2021), "Kajian Food Loss and Waste di Indonesia," supported by UK FCDO.*

## Problem Statement

Five root causes drive upstream food loss:

1. **Farmers plant without buyer certainty** — no clarity on who will purchase harvests, leading to market mismatch.
2. **Dependence on middlemen** — lack of market price information forces farmers to sell at low prices.
3. **Simultaneous harvests without distribution coordination** — no mechanism prioritizes shipment by spoilage risk.
4. **Inefficient transport** — scattered farm plots collected without route planning.
5. **No predictive data** — farmers and buyers cannot forecast harvest timing, volume, or fair prices.

**Target users:** Small-to-medium farmers *without* established buyer networks. Farmers who already have buyers, distribution, and routes do not need TaniLink.

## Objectives

1. Connect farmers and institutional buyers **from the planting planning stage**, not only post-harvest.
2. Provide harvest forecasting and price/demand prediction as decision-support tools.
3. Enable pre-order agreements between farmers and buyers *before* harvest completion.
4. Offer two post-pre-order paths: **direct sale** (farmer arranges delivery) or **consolidation** (first-mile collection with recommended routes).
5. Build trust through reviews & ratings (no blockchain needed).
6. Provide read-only dashboards for agricultural extension workers (PPL/BPP) and regional agriculture offices (Dinas Pertanian).

## Actors (Roles)

| Role | Access |
|------|--------|
| **Petani** (Farmer) | Input own planting data, opt-in publication, view price predictions, chat with buyers, confirm pre-orders, choose delivery mode, upload payment proof (optional), give reviews & ratings |
| **Pembeli Institusional** (Institutional Buyer) | Publish demand listings, view forecast map, chat with farmers, confirm pre-orders, upload payment proof, give reviews, pick up directly or wait for consolidation |
| **PPL/BPP** (Extension Worker) | **Read-only** — monitor regional aggregated data (published plantings, harvest forecasts, consolidation status). Cannot input/modify farmer data |
| **Kolektor** (Collector) | View **recommended** first-mile collection routes (not mandatory), update batch status (picked up, arrived at hub, deviated) |
| **Dinas Pertanian** (Agriculture Office) | **Read-only** — monitor regional aggregates, price trends, surplus/deficit potential |
| **Admin** | Validate master data, monitor Smart Matching weight performance, resolve disputes, moderate reviews |

## Business Process

```
Farmer inputs own planting data (opt-in publication)
  │
  ▼
Harvest Forecasting (time & volume prediction)
  │
  ▼
Price & Demand Prediction (1–4 week price projection)
  │
  ▼
Smart Matching (recommendation, not mandatory)
  │
  ▼
Chat Farmer–Buyer (negotiation)
  │
  ▼
Farmer & Buyer Agree on Pre-Order (opt-in, both parties decide)
  │
  ├── Direct Sale (farmer arranges own delivery)
  │
  └── Consolidation (first-mile collection)
        │
        ▼
    Distribution Priority (spoilage-risk order)
        │
        ▼
    Route Optimization — First-Mile Collection
        │
        ▼
    Handover to Delivery Service (Gapoktan fleet, courier, or buyer's vehicle)
```

## Main Modules

| Module | Description |
|--------|-------------|
| **Harvest Forecasting** | Aggregates planting data to predict harvest time & volume per region |
| **Price & Demand Prediction** | Analyzes historical prices, demand, and weather data; projects 1–4 week prices |
| **Smart Matching** | Recommends farmer–buyer matches using Haversine, volume fit, and price fit scores with commodity-specific default weights |
| **Chat** | In-app messaging for price/delivery negotiation between matched farmers and buyers |
| **Pre-Order** | Binding agreement before harvest completion with `direct` or `consolidated` delivery mode |
| **Distribution Priority** | Ranks harvest batches by spoilage risk (shelf life, weather, harvest schedule) |
| **Route Optimization (First-Mile)** | Clusters collection points and recommends pickup order using Clarke-Wright + 2-opt heuristic |
| **Payment Confirmation** | Optional proof-of-payment upload (transactions occur outside the system) |
| **Reviews & Ratings** | Post-transaction 1–5 star rating between farmers and buyers |
| **Admin Dashboard** | Monitor match performance, default weights per commodity, resolve disputes, moderate reviews |
| **PPL Dashboard** | Read-only: regional planting data, forecast summary, batch status |
| **Dinas Dashboard** | Read-only: regional aggregates, price trends, surplus/deficit risk, route optimization viewer |

## Design Decisions

- **No blockchain/hash-chain traceability** — a centralized database with optional SHA-256 checksums is sufficient. Blockchain's value (trustless decentralization) is irrelevant for a single-database system.
- **No computer vision (TensorFlow.js) in MVP** — Quality Grading is a roadmap feature.
- **No payment gateway** — transactions are agreed and settled outside the system; optional proof upload only.
- **No third-party data input** — farmers always input their own data via their own account. No proxy input by family, PPL, or Gapoktan within the system.
- **Route optimization is recommendation-only** — collectors and buyers may deviate from suggested routes based on field conditions.
- **Per-commodity default weights** — not freely adjustable by admin. Commodity-specific weights encode domain knowledge (e.g., fast-spoiling crops prioritize distance).
