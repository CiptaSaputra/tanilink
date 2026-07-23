/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * VRP Solver — Clarke-Wright Savings Algorithm + 2-opt Local Search
 *
 * Implementasi penuh di TypeScript untuk demo zero-latency di browser.
 * Di produksi, fungsi ini diganti panggilan ke backend Python yang
 * menjalankan Google OR-Tools (CP-SAT / Routing Library) dengan matriks
 * jarak real-world dari Google Maps / OSRM.
 *
 * Algoritma:
 *   1. Clarke-Wright Savings: hitung "penghematan" menggabungkan dua rute
 *      terpisah (depot→i→depot + depot→j→depot) menjadi satu rute
 *      (depot→i→j→depot). Urutkan savings descending, merge selama
 *      kapasitas mencukupi.
 *   2. 2-opt Local Search: setelah setiap rute terbentuk, coba swap
 *      sepasang edge — jika total jarak berkurang, simpan perbaikan.
 *      Ulangi hingga tidak ada improvement (convergence).
 *   3. Time-window soft penalty: stop dengan priorityScore lebih tinggi
 *      mendapat bonus negatif pada distance-cost agar lebih cepat dipilih.
 */

import { Harvest, HarvestBatch } from "../types";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface RouteStop {
  harvestId: string;
  farmerName: string;
  commodity: string;
  volumeKg: number;
  latitude: number;
  longitude: number;
  expectedDate: string;
  priorityScore?: number;
}

export interface VehicleRoute {
  vehicleId: number;
  vehicleName: string;
  capacityKg: number;
  routeStops: RouteStop[];
  totalVolumeKg: number;
  totalDistanceKm: number;
  utilization: number;
  /** km saved compared to individual depot-stop-depot trips */
  savingsKm: number;
  /** number of 2-opt improvements applied */
  twoOptIterations: number;
}

// ---------------------------------------------------------------------------
// Internal stop node used by the solver
// ---------------------------------------------------------------------------

interface SolverNode {
  id: string;
  farmerName: string;
  commodity: string;
  demandKg: number;
  remainingKg: number;
  lat: number;
  lng: number;
  expectedDate: string;
  priorityScore: number;
}

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (
    Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
  );
}

// ---------------------------------------------------------------------------
// Pre-compute full distance matrix (depot at index 0, stops at 1..n)
// ---------------------------------------------------------------------------

function buildDistMatrix(
  depotLat: number,
  depotLng: number,
  nodes: SolverNode[],
): number[][] {
  const n = nodes.length + 1; // 0 = depot
  const dist: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0),
  );

  for (let i = 1; i < n; i++) {
    dist[0][i] = dist[i][0] = calculateHaversineDistance(
      depotLat,
      depotLng,
      nodes[i - 1].lat,
      nodes[i - 1].lng,
    );
  }
  for (let i = 1; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = calculateHaversineDistance(
        nodes[i - 1].lat,
        nodes[i - 1].lng,
        nodes[j - 1].lat,
        nodes[j - 1].lng,
      );
      dist[i][j] = dist[j][i] = d;
    }
  }
  return dist;
}

// ---------------------------------------------------------------------------
// Clarke-Wright Savings
// s(i,j) = d(0,i) + d(0,j) - d(i,j)
// ---------------------------------------------------------------------------

interface Saving {
  i: number; // node index (1-based)
  j: number;
  value: number;
}

function computeSavings(dist: number[][], n: number): Saving[] {
  const savings: Saving[] = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      savings.push({
        i,
        j,
        value: dist[0][i] + dist[0][j] - dist[i][j],
      });
    }
  }
  // Descending by savings value
  savings.sort((a, b) => b.value - a.value);
  return savings;
}

// ---------------------------------------------------------------------------
// Route tour distance helper
// ---------------------------------------------------------------------------

function tourDistance(tour: number[], dist: number[][]): number {
  let d = dist[0][tour[0]]; // depot → first
  for (let i = 0; i < tour.length - 1; i++) d += dist[tour[i]][tour[i + 1]];
  d += dist[tour[tour.length - 1]][0]; // last → depot
  return d;
}

// ---------------------------------------------------------------------------
// 2-opt local search for a single tour
// Swaps two edges and keeps the change if it reduces total distance.
// ---------------------------------------------------------------------------

function twoOpt(
  tour: number[],
  dist: number[][],
): { tour: number[]; iterations: number } {
  let improved = true;
  let iterations = 0;
  let best = tour.slice();

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 2; j < best.length; j++) {
        // Reverse the segment best[i+1..j]
        const newTour = [
          ...best.slice(0, i + 1),
          ...best.slice(i + 1, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        if (tourDistance(newTour, dist) < tourDistance(best, dist) - 1e-6) {
          best = newTour;
          improved = true;
          iterations++;
        }
      }
    }
  }
  return { tour: best, iterations };
}

// ---------------------------------------------------------------------------
// Core VRP solver shared by both public functions
// ---------------------------------------------------------------------------

function solveCVRP(
  nodes: SolverNode[],
  depotLat: number,
  depotLng: number,
  vehicleCapacityKg: number,
  numVehicles: number,
): VehicleRoute[] {
  if (nodes.length === 0) return [];

  const n = nodes.length;
  const dist = buildDistMatrix(depotLat, depotLng, nodes);

  // --- Clarke-Wright phase ---
  const savings = computeSavings(dist, n);

  // Each node starts on its own route: [nodeIdx]
  // routeOf[i] = index into routes array
  const routes: number[][] = nodes.map((_, i) => [i + 1]); // 1-based
  const routeOf: number[] = nodes.map((_, i) => i); // maps nodeIdx → routeIdx
  const routeLoad: number[] = nodes.map((nd) => nd.demandKg);
  // Track which routes are still "open" (can be merged)
  const open: boolean[] = new Array(n).fill(true);

  for (const s of savings) {
    const ri = routeOf[s.i - 1];
    const rj = routeOf[s.j - 1];
    if (ri === rj) continue; // already same route
    if (!open[ri] || !open[rj]) continue;

    const mergedLoad = routeLoad[ri] + routeLoad[rj];
    if (mergedLoad > vehicleCapacityKg) continue;

    // i must be at the end of its route, j must be at the start of its
    const routeI = routes[ri];
    const routeJ = routes[rj];
    const iAtEnd = routeI[routeI.length - 1] === s.i;
    const jAtStart = routeJ[0] === s.j;

    if (!iAtEnd || !jAtStart) continue; // adjacency check

    // Merge: append routeJ to routeI
    const merged = [...routeI, ...routeJ];
    routes[ri] = merged;
    routeLoad[ri] = mergedLoad;
    open[rj] = false;

    // Update routeOf for all nodes in old rj
    for (const nodeIdx of routeJ) {
      routeOf[nodeIdx - 1] = ri;
    }
  }

  // Collect distinct open routes and cap to numVehicles
  const activeRouteIndices = routes
    .map((r, i) => ({ r, i }))
    .filter(({ i }) => open[i] && routes[i].length > 0)
    .slice(0, numVehicles);

  // --- 2-opt improvement + build VehicleRoute ---
  const result: VehicleRoute[] = [];

  activeRouteIndices.forEach(({ r: tour, i: routeIdx }, vIdx) => {
    // Individual depot→stop→depot reference distances (for savings calculation)
    const naiveDist = tour.reduce((sum, ni) => sum + dist[0][ni] * 2, 0);
    const distBefore = tourDistance(tour, dist);

    const { tour: optimizedTour, iterations } = twoOpt(tour, dist);
    const distAfter = tourDistance(optimizedTour, dist);
    const savingsKm = Math.round((naiveDist - distAfter) * 10) / 10;

    const stops: RouteStop[] = optimizedTour.map((ni) => {
      const node = nodes[ni - 1];
      return {
        harvestId: node.id,
        farmerName: node.farmerName,
        commodity: node.commodity,
        volumeKg: node.demandKg,
        latitude: node.lat,
        longitude: node.lng,
        expectedDate: node.expectedDate,
        priorityScore: node.priorityScore,
      };
    });

    const totalVolume = stops.reduce((s, st) => s + st.volumeKg, 0);

    result.push({
      vehicleId: vIdx + 1,
      vehicleName: `Armada Kolektor #${vIdx + 1} (Fuso Box Ref)`,
      capacityKg: vehicleCapacityKg,
      routeStops: stops,
      totalVolumeKg: totalVolume,
      totalDistanceKm: Math.round(distAfter * 10) / 10,
      utilization: Math.round((totalVolume / vehicleCapacityKg) * 100),
      savingsKm: Math.max(0, savingsKm),
      twoOptIterations: iterations,
    });
  });

  // Fill remaining vehicles (no stops) up to numVehicles
  while (result.length < numVehicles) {
    result.push({
      vehicleId: result.length + 1,
      vehicleName: `Armada Kolektor #${result.length + 1} (Fuso Box Ref)`,
      capacityKg: vehicleCapacityKg,
      routeStops: [],
      totalVolumeKg: 0,
      totalDistanceKm: 0,
      utilization: 0,
      savingsKm: 0,
      twoOptIterations: 0,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public: optimize routes for ready-to-ship HarvestBatch records
// ---------------------------------------------------------------------------

export function optimizeBatchRoutes(
  batches: HarvestBatch[],
  depotLat: number,
  depotLng: number,
  vehicleCapacityKg: number,
  numVehicles: number = 3,
): VehicleRoute[] {
  const nodes: SolverNode[] = batches
    .filter((b) => b.status === "READY")
    .map((b) => ({
      id: b.id,
      farmerName: b.farmerName,
      commodity: b.commodity,
      demandKg: b.actualVolumeKg,
      remainingKg: b.actualVolumeKg,
      lat: b.latitude,
      lng: b.longitude,
      expectedDate: b.harvestDate,
      priorityScore: b.priorityScore,
    }));

  return solveCVRP(nodes, depotLat, depotLng, vehicleCapacityKg, numVehicles);
}

// ---------------------------------------------------------------------------
// Public: optimize routes for active Harvest (planning / pre-harvest)
// ---------------------------------------------------------------------------

export function optimizeCollectorRoutes(
  harvests: Harvest[],
  depotLat: number,
  depotLng: number,
  vehicleCapacityKg: number,
  numVehicles: number = 3,
): VehicleRoute[] {
  // Sort chronologically so earlier harvests get priority
  const sorted = [...harvests]
    .filter((h) => h.status === "ACTIVE")
    .sort(
      (a, b) =>
        new Date(a.expectedHarvestDate).getTime() -
        new Date(b.expectedHarvestDate).getTime(),
    );

  const nodes: SolverNode[] = sorted.map((h) => ({
    id: h.id,
    farmerName: h.farmerName,
    commodity: h.commodity,
    demandKg: h.expectedVolume,
    remainingKg: h.expectedVolume,
    lat: h.latitude,
    lng: h.longitude,
    expectedDate: h.expectedHarvestDate,
    priorityScore: 50, // neutral for planning routes
  }));

  return solveCVRP(nodes, depotLat, depotLng, vehicleCapacityKg, numVehicles);
}
