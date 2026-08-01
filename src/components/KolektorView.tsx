/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dashboard Petugas Kolektor — melihat rute rekomendasi first-mile.
 * Urutan/rute bersifat rekomendasi, bukan kewajiban.
 * Kolektor dapat memperbarui status batch dan menyimpang dari urutan saran.
 */

import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { COMMODITY_LIST } from "../constants/commodities";
import { optimizeBatchRoutes } from "../utils/routeOptimizer";
import {
  Truck,
  MapPin,
  CheckCircle,
  Navigation,
  Calendar,
  Package,
  AlertTriangle,
  ArrowLeftRight,
  ClipboardList,
} from "lucide-react";
import RouteMap from "./shared/RouteMap";

export default function KolektorView() {
  const { harvestBatches, preOrders, updateBatchStatus, activeUser } =
    useData();

  // Ready batches for this region
  const regionalBatches = useMemo(
    () =>
      harvestBatches.filter(
        (b) =>
          b.region.toLowerCase() === activeUser.KOLEKTOR.region.toLowerCase() &&
          b.status === "READY",
      ),
    [harvestBatches, activeUser.KOLEKTOR.region],
  );

  // All batches (including in-transit/delivered)
  const allRegionalBatches = useMemo(
    () =>
      harvestBatches.filter(
        (b) =>
          b.region.toLowerCase() === activeUser.KOLEKTOR.region.toLowerCase(),
      ),
    [harvestBatches, activeUser.KOLEKTOR.region],
  );

  // Default depot coordinates per region
  const depotCoords: Record<string, { lat: number; lng: number }> = {
    Brebes: { lat: -6.871, lng: 109.042 },
    Garut: { lat: -7.227, lng: 107.908 },
    Malang: { lat: -7.982, lng: 112.63 },
    Cianjur: { lat: -6.822, lng: 107.138 },
    Lampung: { lat: -5.402, lng: 105.263 },
  };
  const depot = depotCoords[activeUser.KOLEKTOR.region] || {
    lat: -6.871,
    lng: 109.042,
  };

  // Compute route recommendation
  const optimizedRoutes = useMemo(() => {
    if (regionalBatches.length === 0) return [];

    return optimizeBatchRoutes(regionalBatches, depot.lat, depot.lng, 5000, 2);
  }, [regionalBatches, depot.lat, depot.lng]);

  const [selectedRoute, setSelectedRoute] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-100 text-xs font-bold mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>PETUGAS KOLEKTOR — FIRST-MILE COLLECTION</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {activeUser.KOLEKTOR.name}
          </h2>
          <p className="text-xs text-amber-100 mt-1">
            Wilayah:{" "}
            <span className="font-semibold text-white">
              {activeUser.KOLEKTOR.region}
            </span>{" "}
            | Rute bersifat rekomendasi
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-amber-100 uppercase tracking-wider font-semibold">
              Siap Jemput
            </p>
            <p className="text-lg font-bold">{regionalBatches.length} Batch</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-amber-100 uppercase tracking-wider font-semibold">
              Sedang Dikirim
            </p>
            <p className="text-lg font-bold text-amber-200">
              {
                allRegionalBatches.filter(
                  (b) =>
                    b.status === "IN_TRANSIT" ||
                    b.status === "PICKED_UP_DIRECTLY",
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Rute Bersifat Rekomendasi</p>
          <p className="mt-1 text-amber-800 leading-relaxed">
            Urutan penjemputan yang ditampilkan adalah{" "}
            <span className="font-semibold">saran sistem</span> berdasarkan
            jarak terpendek. Anda tetap bebas menentukan urutan sendiri sesuai
            kondisi lapangan. Gunakan tombol "Jemput Langsung" jika pembeli
            mengambil sendiri tanpa melalui titik kumpul.
          </p>
        </div>
      </div>

      {/* Route Recommendation */}
      {optimizedRoutes.length > 0 &&
      optimizedRoutes[selectedRoute]?.routeStops.length > 0 ? (
        <div id="rute" className="space-y-4 scroll-mt-28">
          {/* Route selector */}
          <div className="flex gap-2">
            {optimizedRoutes.map((r, idx) => (
              <button
                key={r.vehicleId}
                onClick={() => setSelectedRoute(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRoute === idx
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-nat-light-cream text-nat-text border border-nat-border hover:bg-nat-cream"
                }`}
              >
                {r.vehicleName} ({r.utilization}% muatan)
              </button>
            ))}
          </div>

          {/* Route detail */}
          <div className="bg-white rounded-2xl border border-nat-border overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="font-bold text-xs">
                    {optimizedRoutes[selectedRoute].vehicleName}
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    Kapasitas:{" "}
                    {optimizedRoutes[selectedRoute].capacityKg.toLocaleString(
                      "id-ID",
                    )}{" "}
                    Kg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">
                  Jarak: {optimizedRoutes[selectedRoute].totalDistanceKm} Km
                </p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-[10px] font-bold text-nat-sage uppercase tracking-wider">
                Urutan Rekomendasi Penjemputan
              </p>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-amber-100">
                {optimizedRoutes[selectedRoute].routeStops.map((stop, idx) => (
                  <div
                    key={stop.harvestId}
                    className="flex gap-3 items-start relative pl-6"
                  >
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full border border-amber-300 bg-white flex items-center justify-center text-[9px] font-bold text-amber-600">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-nat-dark">
                        {stop.farmerName}
                      </p>
                      <p className="text-[10px] text-nat-text">
                        {stop.commodity} •{" "}
                        {stop.volumeKg.toLocaleString("id-ID")} Kg
                      </p>
                      <p className="text-[9px] text-nat-sage flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> Lat:{" "}
                        {stop.latitude.toFixed(3)}, Lng:{" "}
                        {stop.longitude.toFixed(3)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Hub */}
                <div className="flex gap-3 items-start relative pl-6">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full border border-amber-500 bg-amber-50 flex items-center justify-center text-[8px] font-black text-amber-600">
                    H
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-amber-600">Titik Kumpul Hub</p>
                    <p className="text-[9px] text-nat-sage">
                      Selesai bongkar muatan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Peta Rute Jalan Aktual */}
            <RouteMap
              waypoints={[
                depot,
                ...optimizedRoutes[selectedRoute].routeStops.map((s) => ({
                  lat: s.latitude,
                  lng: s.longitude,
                })),
              ]}
              stops={[
                { id: "depot", label: `Depot ${activeUser.KOLEKTOR.region}` },
                ...optimizedRoutes[selectedRoute].routeStops.map((s) => ({
                  id: s.harvestId,
                  label: s.farmerName,
                  sub: `${s.commodity} • ${s.volumeKg.toLocaleString("id-ID")} kg`,
                })),
              ]}
              height="320px"
              depotIndex={0}
            />
          </div>

          {/* All ready batches with action buttons */}
          <div
            id="batch"
            className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm scroll-mt-28"
          >
            <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-amber-600" />
              Batch Siap Dijemput ({regionalBatches.length})
            </h3>
            <div className="space-y-3">
              {regionalBatches.map((b) => {
                const crop = COMMODITY_LIST[b.commodity];
                const linkedPO = preOrders.find((po) => po.id === b.preOrderId);
                return (
                  <div
                    key={b.id}
                    className="border border-nat-border rounded-xl p-3.5 bg-nat-light-cream/50 text-xs"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: crop?.color }}
                        />
                        <span className="font-bold text-nat-dark">
                          {b.commodity}
                        </span>
                        <span className="text-nat-sage">• {b.farmerName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          b.priorityScore >= 70
                            ? "bg-red-100 text-red-700"
                            : b.priorityScore >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-nat-light-cream text-nat-green"
                        }`}
                      >
                        Prioritas: {b.priorityScore}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-nat-sage mb-2">
                      <span>
                        Volume:{" "}
                        <span className="font-bold text-nat-dark">
                          {b.actualVolumeKg.toLocaleString("id-ID")} Kg
                        </span>
                      </span>
                      <span>
                        Umur Simpan:{" "}
                        <span className="font-bold">
                          {b.shelfLifeDays} hari
                        </span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBatchStatus(b.id, "IN_TRANSIT")}
                        className="flex-1 py-1.5 rounded-lg bg-nat-text hover:bg-nat-dark text-white text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        <Truck className="w-3 h-3 inline mr-0.5" />
                        Berangkat Jemput
                      </button>
                      <button
                        onClick={() =>
                          updateBatchStatus(b.id, "PICKED_UP_DIRECTLY")
                        }
                        className="flex-1 py-1.5 rounded-lg bg-nat-cream hover:bg-nat-border text-nat-brown text-[10px] font-bold transition-colors border border-nat-border cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3 h-3 inline mr-0.5" />
                        Jemput Langsung (Luar Rute)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-nat-border rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3 shadow-sm">
          <Package className="w-10 h-10 text-nat-sage mx-auto" />
          <h4 className="font-bold text-sm text-nat-dark">
            Tidak Ada Batch Siap Jemput
          </h4>
          <p className="text-xs text-nat-sage leading-relaxed">
            Belum ada batch panen yang siap dijemput di wilayah{" "}
            {activeUser.KOLEKTOR.region}. Petani harus menandai panen selesai
            terlebih dahulu.
          </p>
        </div>
      )}

      {/* All batches for this region */}
      {allRegionalBatches.filter(
        (b) => b.status === "IN_TRANSIT" || b.status === "DELIVERED",
      ).length > 0 && (
        <div
          id="riwayat"
          className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm scroll-mt-28"
        >
          <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
            <Package className="w-4 h-4 text-nat-green" />
            Riwayat Batch Wilayah
          </h3>
          <div className="space-y-2">
            {allRegionalBatches
              .filter((b) => b.status !== "READY")
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 bg-nat-light-cream/40 border border-nat-border rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: COMMODITY_LIST[b.commodity]?.color,
                      }}
                    />
                    <span className="font-bold text-nat-dark">
                      {b.farmerName}
                    </span>
                    <span className="text-nat-sage">
                      • {b.commodity} •{" "}
                      {b.actualVolumeKg.toLocaleString("id-ID")} Kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        b.status === "IN_TRANSIT"
                          ? "bg-nat-light-cream text-nat-dark border-nat-border"
                          : b.status === "PICKED_UP_DIRECTLY"
                            ? "bg-nat-cream text-nat-green-hover border-nat-border"
                            : "bg-nat-light-cream text-nat-green-hover border-nat-border"
                      }`}
                    >
                      {b.status === "IN_TRANSIT"
                        ? "Dalam Perjalanan"
                        : b.status === "PICKED_UP_DIRECTLY"
                          ? "Jemput Langsung"
                          : "Terkirim"}
                    </span>
                    {b.status === "IN_TRANSIT" && (
                      <button
                        onClick={() => updateBatchStatus(b.id, "DELIVERED")}
                        className="bg-nat-green text-white px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3 inline mr-0.5" />
                        Konfirmasi Tiba
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
