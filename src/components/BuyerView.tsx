/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useUI } from "../context/UIContext";
import { COMMODITY_LIST } from "../constants/commodities";
import type { Komoditas, Demand, Match, PreOrder } from "../types";
import RouteMapModal from "./modals/RouteMapModal";
import {
  ShoppingBag,
  Plus,
  MapPin,
  Calendar,
  BadgePercent,
  CheckCircle,
  Activity,
  ChevronRight,
  TrendingDown,
  Info,
  DollarSign,
  ArrowRightLeft,
  QrCode,
  Scan,
  Camera,
  RefreshCw,
  MessageCircle,
  Star,
  Truck,
  Map,
  XCircle,
  AlertCircle,
  Bell,
} from "lucide-react";

import { Harvest } from "../types";
import { findCoordinatesForRegion } from "../utils/geocoding";

interface BuyerViewProps {
  mapLat?: number;
  mapLng?: number;
  mapRegion?: string;
  clearMapSelection?: () => void;
  onSelectCoords?: (lat: number, lng: number, region: string) => void;
}

export default function BuyerView({
  mapLat,
  mapLng,
  mapRegion,
  clearMapSelection,
  onSelectCoords,
}: BuyerViewProps) {
  const {
    harvests,
    demands,
    matches,
    preOrders,
    completePreOrder,
    addDemand,
    updateMatchStatus,
    activeUser,
  } = useData();
  const { showNotification } = useUI();

  // Form states
  const [commodity, setCommodity] = useState<Komoditas>("Bawang Merah");
  const [requiredVolume, setRequiredVolume] = useState<number>(10000);
  const [offerPrice, setOfferPrice] = useState<number>(27000);
  const [dateRequired, setDateRequired] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20); // typical requirement in 20 days
    return d.toISOString().split("T")[0];
  });
  const [latitude, setLatitude] = useState<number>(-6.865);
  const [longitude, setLongitude] = useState<number>(109.035);
  const [region, setRegion] = useState<string>("Brebes");
  const [notes, setNotes] = useState<string>("");

  // Harvest trace modal state
  const [selectedTraceHarvest, setSelectedTraceHarvest] =
    useState<Harvest | null>(null);

  // Route map modal
  const [routeMapPO, setRouteMapPO] = useState<PreOrder | null>(null);

  // Logistics state
  const [selectedLogistics, setSelectedLogistics] = useState<string[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [scannerBatchId, setScannerBatchId] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Initialize selected batch id for scanner if harvests are available
  useEffect(() => {
    if (harvests.length > 0 && !scannerBatchId) {
      setScannerBatchId(harvests[0].id);
    }
  }, [harvests, scannerBatchId]);

  const handleSimulatedScan = () => {
    if (!scannerBatchId) return;
    setIsScanning(true);
    setScanSuccess(false);

    // After 1.2s target lock, trigger trace modal open
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      const matchedHarvest = harvests.find((h) => h.id === scannerBatchId);
      if (matchedHarvest) {
        showNotification(
          `SCAN BERHASIL: Batch ${matchedHarvest.commodity} #${matchedHarvest.id} terverifikasi asli di Sistem!`,
          "success",
        );
        setSelectedTraceHarvest(matchedHarvest);
      } else {
        showNotification(
          "Gagal memverifikasi batch. Kode hash tidak cocok.",
          "warning",
        );
      }
    }, 1200);
  };

  // Auto update coordinates and region if selected on map
  useEffect(() => {
    if (mapLat && mapLng && mapRegion) {
      setLatitude(mapLat);
      setLongitude(mapLng);
      setRegion(mapRegion);
      showNotification(
        `Koordinat pembeli terpilih dari peta: ${mapLat}, ${mapLng} (${mapRegion})`,
        "info",
      );
    }
  }, [mapLat, mapLng, mapRegion]);

  // Real-time debounced geocoding when typing region (350ms pause)
  useEffect(() => {
    if (!region || region.trim().length < 3) return;
    const timer = setTimeout(async () => {
      const coords = await findCoordinatesForRegion(region);
      if (coords) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        if (onSelectCoords) {
          onSelectCoords(coords.lat, coords.lng, region);
        }
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [region]);

  const handleCommodityChange = (crop: Komoditas) => {
    setCommodity(crop);
    const metadata = COMMODITY_LIST[crop];
    if (metadata) {
      // Set to slightly higher than typical to stimulate good matching out of box
      setOfferPrice(Math.round(metadata.averagePricePerKg * 1.05));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addDemand({
      commodity,
      requiredVolume,
      offerPrice,
      latitude,
      longitude,
      region,
      dateRequired,
      notes,
    });

    if (clearMapSelection) clearMapSelection();
    setNotes("");
  };

  // Buyer's own demands
  const myDemands = demands.filter((d) => d.buyerId === activeUser.PEMBELI.id);

  // Matches involving this buyer's demands (include FULFILLED demands for post-PO state)
  const myMatches = matches.filter((m) => {
    const d = demands.find((dem) => dem.id === m.demandId);
    return d?.buyerId === activeUser.PEMBELI.id;
  });

  // Pre-Orders involving this buyer
  // Filter via match chain (PO → match → demand → buyerId) to handle FULFILLED demands
  const myPreOrders = preOrders.filter((po) => {
    // Primary: match via demandId (works when demand still ACTIVE)
    const d = demands.find((dem) => dem.id === po.demandId);
    if (d) return d.buyerId === activeUser.PEMBELI.id;
    // Fallback: match via matchId → match → demandId (works after demand FULFILLED)
    const m = matches.find((match) => match.id === po.matchId);
    if (m) {
      const dm = demands.find((dem) => dem.id === m.demandId);
      if (dm) return dm.buyerId === activeUser.PEMBELI.id;
    }
    // Last fallback: buyer name match
    return po.buyerName === activeUser.PEMBELI.name;
  });

  // Penawaran yang menunggu keputusan pembeli (WAITING_BUYER_APPROVAL)
  const pendingBids = myMatches.filter(m => m.status === "WAITING_BUYER_APPROVAL");

  return (
    <div className="space-y-6">
      {/* Buyer Profile Status Block */}
      <div className="bg-gradient-to-r from-nat-brown to-nat-dark rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-nat-sand text-xs font-bold mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>AKUN KOPERASI / HUB PEMBELI</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Selamat Datang, {activeUser.PEMBELI.name}
          </h2>
          <p className="text-xs text-nat-light-cream mt-1">
            Gudang Utama:{" "}
            <span className="font-semibold text-white">
              {activeUser.PEMBELI.region}, Jawa Tengah
            </span>{" "}
            | Kode Depo:{" "}
            <span className="font-mono text-nat-sand">#B-KOP-JAYA</span>
          </p>
        </div>

        {/* Aggregate demand stats */}
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-nat-light-cream uppercase tracking-wider font-semibold">
              Kebutuhan Sedia
            </p>
            <p className="text-lg font-bold">
              {myDemands.filter((d) => d.status === "ACTIVE").length} Rilis
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-nat-light-cream uppercase tracking-wider font-semibold">
              Sinergi Sukses (PO)
            </p>
            <p className="text-lg font-bold text-nat-sand">
              {myPreOrders.length} Kontrak
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 hidden sm:block">
            <p className="text-[10px] text-nat-light-cream uppercase tracking-wider font-semibold">
              Tonase Diselamatkan
            </p>
            <p className="text-lg font-bold text-emerald-300">
              {(
                myPreOrders.reduce((acc, po) => acc + po.agreedVolumeKg, 0) / 1000
              ).toLocaleString("id-ID")}{" "}
              Ton
            </p>
          </div>
        </div>
      </div>

      {/* Market intelligence info */}
      <div className="bg-nat-light-cream border border-nat-border rounded-xl p-4 flex gap-3 text-xs text-nat-dark">
        <Info className="w-5 h-5 text-nat-green shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">
            Informasi Pasokan Daerah:
          </p>
          <p className="mt-1 text-nat-text leading-relaxed">
            Data Dinas Pertanian mendeteksi adanya penumpukan surplus komoditas{" "}
            <span className="font-semibold">Tomat</span> di daerah{" "}
            <span className="font-semibold">Malang</span> minggu ini. Harga
            pasar cenderung tertekan. Koperasi disarankan merilis demand dengan
            harga wajar untuk penyerapan cepat agar hasil panen tidak membusuk
            di lahan tani!
          </p>
        </div>
      </div>

      {/* ───── PENAWARAN MASUK DARI PETANI ───── */}
      {pendingBids.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce" />
              <h3 className="font-bold text-sm">Penawaran Masuk dari Petani</h3>
            </div>
            <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingBids.length} Penawaran
            </span>
          </div>

          <div className="divide-y divide-amber-100">
            {pendingBids.map((match) => {
              const harvest = harvests.find(h => h.id === match.harvestId);
              const demand = demands.find(d => d.id === match.demandId) ||
                demands.find(d => {
                  const m = matches.find(mx => mx.id === match.id);
                  return m && d.id === m.demandId;
                });
              if (!harvest) return null;

              return (
                <div key={match.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Info komoditas */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shrink-0">
                      🌾
                    </div>
                    <div>
                      <p className="text-sm font-bold text-nat-dark">{harvest.commodity}</p>
                      <p className="text-xs text-nat-sage">{harvest.farmerName} · {harvest.region}</p>
                    </div>
                  </div>

                  {/* Detail penawaran */}
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    <div className="bg-green-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-nat-sage uppercase tracking-wider">Volume</p>
                      <p className="text-sm font-bold text-nat-dark">
                        {(match.bidVolume ?? harvest.expectedVolume).toLocaleString("id-ID")} kg
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-nat-sage uppercase tracking-wider">Harga/kg</p>
                      <p className="text-sm font-bold text-nat-dark">
                        Rp{(match.bidPrice ?? harvest.askingPrice).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-nat-sage uppercase tracking-wider">Total</p>
                      <p className="text-sm font-bold text-amber-700">
                        Rp{(
                          (match.bidVolume ?? harvest.expectedVolume) *
                          (match.bidPrice ?? harvest.askingPrice)
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateMatchStatus(match.id, "REJECTED")}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                    <button
                      onClick={() => updateMatchStatus(match.id, "CONFIRMED")}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Terima & Buat Kontrak
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & QR Scanner Simulator */}
        <div className="lg:col-span-1 space-y-6">
          {/* Form Input Demand */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-nat-green" />
              Rilis Kebutuhan Pasokan Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Pilih Komoditas
                </label>
                <select
                  value={commodity}
                  onChange={(e) =>
                    handleCommodityChange(e.target.value as Komoditas)
                  }
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                >
                  {Object.keys(COMMODITY_LIST).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-nat-text mb-1">
                    Volume Dibutuhkan (Kg)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="500"
                    value={requiredVolume}
                    onChange={(e) =>
                      setRequiredVolume(parseInt(e.target.value) || 1000)
                    }
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-nat-text mb-1">
                    Harga Penawaran (Rp/Kg)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    value={offerPrice}
                    onChange={(e) =>
                      setOfferPrice(parseInt(e.target.value) || 1000)
                    }
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Dibutuhkan Paling Lambat
                </label>
                <input
                  type="date"
                  value={dateRequired}
                  onChange={(e) => setDateRequired(e.target.value)}
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>

              {/* Coordinates Section */}
              <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border space-y-3">
                <span className="text-xs font-bold text-nat-dark flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-nat-brown" />
                  Lokasi Penerimaan Gudang
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-nat-sage font-semibold block">
                      Latitude
                    </span>
                    <input
                      type="number"
                      step="0.001"
                      value={latitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLatitude(val);
                        if (onSelectCoords && longitude) {
                          onSelectCoords(val, longitude, region);
                        }
                      }}
                      className="w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark font-mono focus:outline-none focus:ring-1 focus:ring-nat-green"
                    />
                  </div>
                  <div>
                    <span className="text-nat-sage font-semibold block">
                      Longitude
                    </span>
                    <input
                      type="number"
                      step="0.001"
                      value={longitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLongitude(val);
                        if (onSelectCoords && latitude) {
                          onSelectCoords(latitude, val, region);
                        }
                      }}
                      className="w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark font-mono focus:outline-none focus:ring-1 focus:ring-nat-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-nat-sage font-semibold block">
                      Nama Wilayah
                    </span>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Ketik kota/daerah..."
                      className="w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark font-bold focus:outline-none focus:ring-1 focus:ring-nat-green"
                    />
                  </div>
                  <div className="flex items-end">
                    <p className="text-[9px] text-nat-sage font-medium italic leading-tight">
                      *Ketik daerah atau klik peta untuk menggeser lokasi &amp; zoom
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Syarat / Catatan Mutu
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Kadar air maksimal 14%, kemasan karung rami tebal..."
                  rows={2}
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>

              <button
                type="submit"
                id="add-demand-btn"
                className="w-full bg-nat-green hover:bg-nat-green-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-nat-green/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Publikasikan Demand Pasok
              </button>
            </form>
          </div>

          {/* QR Scanner Simulator Card */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-nat-green" />
                Lacak Batch (Scanner QR)
              </h3>
              <p className="text-[11px] text-nat-sage mt-1 font-medium">
                Pindai QR Code fisik komoditas panen untuk membaca data digital
                di Sistem Food Loss.
              </p>
            </div>

            {harvests.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-nat-text uppercase tracking-wider mb-1">
                    Pilih Batch Panen Tani
                  </label>
                  <select
                    value={scannerBatchId}
                    onChange={(e) => setScannerBatchId(e.target.value)}
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                  >
                    {harvests.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id.toUpperCase()} - {h.farmerName} ({h.commodity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Simulated Camera Scanner Viewport */}
                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center text-center">
                  {/* Neon Grid Corners */}
                  <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-nat-green" />
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-nat-green" />
                  <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-nat-green" />
                  <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-nat-green" />

                  {isScanning ? (
                    <div className="space-y-2 text-center animate-pulse z-10 px-4">
                      {/* Pulsing Target Ring */}
                      <div className="w-10 h-10 rounded-full border-2 border-nat-green border-dashed animate-spin mx-auto flex items-center justify-center">
                        <Camera className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold">
                        Targeting QR Code...
                      </p>
                      {/* Laser Scrolling Line */}
                      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-nat-green to-transparent shadow-lg shadow-nat-green/50 animate-bounce" />
                    </div>
                  ) : (
                    <div className="space-y-1.5 z-10 p-4">
                      <QrCode className="w-8 h-8 text-nat-sage mx-auto" />
                      <p className="text-[10px] text-nat-sage font-semibold uppercase tracking-wider">
                        Kamera Siap Dipasangkan
                      </p>
                      <p className="text-[9px] text-nat-sage">
                        Klik tombol di bawah untuk melakukan simulasi scan laser
                      </p>
                    </div>
                  )}
                  {/* Subtle scan camera overlay lines */}
                  <div className="absolute inset-0 bg-slate-900/10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65))] " />
                </div>

                <button
                  onClick={handleSimulatedScan}
                  disabled={isScanning}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isScanning
                      ? "bg-nat-cream text-nat-sage border border-nat-border cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menganalisis Kunci Hash...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 text-emerald-400" />
                      <span>Simulasikan Scan QR Code</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-nat-sage italic text-xs">
                Belum ada batch panen terdaftar untuk dilacak.
              </div>
            )}
          </div>
        </div>

        {/* Lahan Petani Tercocokkan & Demand Aktif */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rilis Kebutuhan Saya */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-nat-green" />
              Daftar Permintaan Aktif Koperasi ({myDemands.length})
            </h3>

            {myDemands.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-nat-text">
                  <thead>
                    <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2">Komoditas</th>
                      <th className="py-2">Volume Diminta</th>
                      <th className="py-2">Batas Tanggal</th>
                      <th className="py-2">Harga Tawaran</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDemands.map((d) => {
                      const crop = COMMODITY_LIST[d.commodity];
                      return (
                        <tr
                          key={d.id}
                          className="border-b border-nat-light-cream hover:bg-nat-light-cream/35 transition-colors"
                        >
                          <td className="py-3 font-bold text-nat-dark flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded"
                              style={{ backgroundColor: crop.color }}
                            />
                            {d.commodity}
                          </td>
                          <td className="py-3 font-bold text-nat-dark">
                            {d.requiredVolume.toLocaleString("id-ID")} Kg
                          </td>
                          <td className="py-3">
                            <div className="font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-nat-sage" />
                              {d.dateRequired}
                            </div>
                          </td>
                          <td className="py-3 font-bold text-nat-dark">
                            Rp{d.offerPrice.toLocaleString("id-ID")}/Kg
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                d.status === "ACTIVE"
                                  ? "bg-nat-light-cream text-nat-green border-nat-border"
                                  : "bg-nat-cream text-nat-brown border-nat-border"
                              }`}
                            >
                              {d.status === "ACTIVE" ? "Mencari" : "Terpenuhi"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-nat-sage italic">
                Belum ada rilis kebutuhan pasokan. Silakan isi form di samping
                untuk mengaktifkan demand.
              </div>
            )}
          </div>

          {/* Pencocokan Petani Terdekat */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-light-cream">
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-nat-green" />
                Peta Potensi Panen Tani Tercocokkan (Pre-Order Engine)
              </h3>
              <span className="text-[10px] bg-nat-light-cream text-nat-green border border-nat-border font-bold px-2.5 py-0.5 rounded-full">
                {myMatches.length} Lahan Sesuai
              </span>
            </div>

            {myMatches.length > 0 ? (
              <div className="space-y-4">
                {myMatches.map((match) => {
                  const harvest = harvests.find(
                    (h) => h.id === match.harvestId,
                  )!;
                  const demand = demands.find((d) => d.id === match.demandId)!;
                  if (!harvest || !demand) return null;

                  return (
                    <div
                      key={match.id}
                      className={`border rounded-xl p-4 transition-all ${
                        match.status !== "PENDING"
                          ? "border-nat-border bg-nat-light-cream/40"
                          : "border-nat-border hover:border-nat-sage/50 bg-white hover:shadow-sm"
                      }`}
                      id={`match-card-buyer-${match.id}`}
                    >
                      {/* Match header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full"
                            style={{
                              backgroundColor:
                                COMMODITY_LIST[harvest.commodity].color,
                            }}
                          />
                          <h4 className="text-xs font-bold text-nat-dark">
                            {harvest.farmerName}
                          </h4>
                          <span className="text-[10px] text-nat-sage font-medium">
                            • Wilayah Tani: {harvest.region}
                          </span>
                        </div>

                        {/* Matching Score Circle Badge */}
                        <div className="flex items-center space-x-1">
                          <BadgePercent className="w-3.5 h-3.5 text-nat-green" />
                          <span className="text-xs font-bold text-nat-sage">
                            Skor Sinergi:{" "}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              match.score >= 80
                                ? "bg-nat-green text-white border-transparent"
                                : match.score >= 60
                                  ? "bg-nat-cream text-nat-brown border-nat-border"
                                  : "bg-nat-slate text-nat-text border-nat-border"
                            }`}
                          >
                            {match.score}%
                          </span>
                          {match.score >= 85 && (
                            <span className="ml-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-300 shadow-sm animate-pulse">
                              ✨ TOP MATCH
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Matching breakdown criteria */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-nat-light-cream p-2.5 rounded-lg text-[11px] mb-3 text-nat-text border border-nat-border">
                        {/* 1. Jarak */}
                        <div>
                          <p className="text-nat-sage font-bold uppercase text-[9px]">
                            Jarak Antar Gudang
                          </p>
                          <p className="font-bold text-nat-dark mt-0.5">
                            {match.distanceKm} Km
                          </p>
                          <div className="w-full bg-nat-cream h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-nat-green h-full rounded-full"
                              style={{
                                width: `${match.scoreDetails.distanceScore}%`,
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-nat-sage font-medium">
                            Skor: {match.scoreDetails.distanceScore}/100
                          </span>
                        </div>

                        {/* 2. Kesesuaian Volume */}
                        <div>
                          <p className="text-nat-sage font-bold uppercase text-[9px]">
                            Kesesuaian Volume
                          </p>
                          <p className="font-bold text-nat-dark mt-0.5">
                            {demand.requiredVolume.toLocaleString("id-ID")} Kg /{" "}
                            {harvest.expectedVolume.toLocaleString("id-ID")} Kg
                          </p>
                          <div className="w-full bg-nat-cream h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-nat-green h-full rounded-full"
                              style={{
                                width: `${match.scoreDetails.volumeScore}%`,
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-nat-sage font-medium">
                            Skor: {match.scoreDetails.volumeScore}/100
                          </span>
                        </div>

                        {/* 3. Kesesuaian Harga */}
                        <div>
                          <p className="text-nat-sage font-bold uppercase text-[9px]">
                            Tawaran vs Harapan
                          </p>
                          <p className="font-bold text-nat-dark mt-0.5">
                            Rp{demand.offerPrice.toLocaleString("id-ID")} / Rp
                            {harvest.askingPrice.toLocaleString("id-ID")}
                          </p>
                          <div className="w-full bg-nat-cream h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-nat-green h-full rounded-full"
                              style={{
                                width: `${match.scoreDetails.priceScore}%`,
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-nat-sage font-medium">
                            Skor: {match.scoreDetails.priceScore}/100
                          </span>
                        </div>
                      </div>

                      {harvest.notes && (
                        <p className="text-[11px] text-nat-text italic mb-3 bg-nat-light-cream/50 p-2 rounded border border-nat-border">
                          "Catatan Tani: {harvest.notes}"
                        </p>
                      )}

                      {/* Matching action workflow */}
                      <div className="flex justify-between items-center pt-2 border-t border-nat-border">
                        <div className="text-[10px] text-nat-sage font-medium">
                          Estimasi Panen Tani:{" "}
                          <span className="font-semibold text-nat-text">
                            {harvest.expectedHarvestDate}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedTraceHarvest(harvest)}
                            className="bg-nat-light-cream hover:bg-nat-cream text-nat-green-hover border border-nat-border font-bold py-1.5 px-3 rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Lacak Sertifikat & QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Lacak QR</span>
                          </button>

                          {match.status === "PENDING" ? (
                            <button
                              id={`accept-btn-buyer-${match.id}`}
                              onClick={() =>
                                updateMatchStatus(match.id, "ACCEPTED_BY_BUYER")
                              }
                              className="bg-nat-green hover:bg-nat-green-hover text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <span>Ajukan Kerja Sama</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : match.status === "ACCEPTED_BY_BUYER" ? (
                            <div className="flex items-center space-x-1.5 text-nat-brown font-bold text-[11px] bg-nat-cream px-2.5 py-1 rounded-lg border border-nat-border">
                              <span className="w-1.5 h-1.5 rounded-full bg-nat-brown animate-pulse" />
                              <span>Menunggu Persetujuan Petani</span>
                            </div>
                          ) : match.status === "WAITING_BUYER_APPROVAL" ? (
                            <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Penawaran Petani Masuk ↑</span>
                            </div>
                          ) : match.status === "CONFIRMED" ? (
                            <div className="flex items-center space-x-1.5 text-nat-green font-bold text-[11px] bg-nat-light-cream px-2.5 py-1 rounded-lg border border-nat-border">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Kontrak Sepakat (Panen Teraman)</span>
                            </div>
                          ) : (
                            <span className="text-nat-sage text-xs font-semibold">
                              {match.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-nat-sage italic text-xs">
                Belum ada ketersediaan panen aktif petani yang cocok dengan
                kebutuhan pasokan Anda.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Daftar Pre-Order Aktif (PO) */}
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-nat-green" />
          Daftar Pre-Order Aktif ({myPreOrders.length})
        </h3>
        
        {myPreOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-nat-text">
              <thead>
                <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">PO ID / Petani</th>
                  <th className="py-2">Komoditas</th>
                  <th className="py-2">Volume & Harga</th>
                  <th className="py-2">Total Nilai</th>
                  <th className="py-2 text-right">Status & Aksi</th>
                </tr>
              </thead>
              <tbody>
                {myPreOrders.map((po) => {
                  const crop = COMMODITY_LIST[po.commodity as Komoditas];
                  const totalValue = po.agreedVolumeKg * po.agreedPricePerKg;
                  return (
                    <tr
                      key={po.id}
                      className="border-b border-nat-light-cream hover:bg-nat-light-cream/35 transition-colors"
                    >
                      <td className="py-3">
                        <div className="font-bold text-nat-dark">{po.farmerName}</div>
                        <div className="text-[10px] text-nat-sage font-mono">{po.id}</div>
                      </td>
                      <td className="py-3 font-bold text-nat-dark flex items-center gap-1.5 mt-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded"
                          style={{ backgroundColor: crop?.color || "#ccc" }}
                        />
                        {po.commodity}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-nat-dark">{po.agreedVolumeKg.toLocaleString("id-ID")} Kg</div>
                        <div className="text-[10px] text-nat-sage">Rp{po.agreedPricePerKg.toLocaleString("id-ID")}/Kg</div>
                      </td>
                      <td className="py-3 font-bold text-emerald-600">
                        Rp{totalValue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex flex-col items-end gap-2">
                          {po.status === "COMPLETED" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Lunas & Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              Belum Lunas
                            </span>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={(() => {
                                const harvest = harvests.find(h => h.id === po.harvestId);
                                const farmerPhone = (harvest as any)?.farmerPhone ||
                                  activeUser.PETANI?.phone ||
                                  "62";
                                const msg = `Halo Petani ${encodeURIComponent(po.farmerName)}, saya dari Koperasi. Terkait Pre-Order ${po.commodity} seberat ${po.agreedVolumeKg}Kg dengan harga Rp${po.agreedPricePerKg.toLocaleString('id-ID')}/Kg.`;
                                return `https://wa.me/${farmerPhone}?text=${encodeURIComponent(msg)}`;
                              })()}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Chat WA
                            </a>

                            {/* Lihat Rute */}
                            {(po.status === "CONFIRMED" || po.status === "COMPLETED") && (
                              <button
                                onClick={() => setRouteMapPO(po)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Map className="w-3 h-3" />
                                Lihat Rute
                              </button>
                            )}

                            {po.status === "COMPLETED" ? (
                              <button
                                onClick={() => showNotification("Terima kasih, ulasan Anda berhasil disimpan!", "success")}
                                className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Star className="w-3 h-3" />
                                Beri Rating
                              </button>
                            ) : (
                              <button
                                onClick={() => completePreOrder(po.id)}
                                className="bg-nat-green hover:bg-nat-green-hover text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <DollarSign className="w-3 h-3" />
                                Konfirmasi Bayar
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-nat-sage italic text-xs">
            Belum ada kontrak Pre-Order (PO) yang disepakati.
          </div>
        )}
      </div>
      
      {/* Logistik & Penjemputan (Pooling) */}
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-light-cream">
          <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-nat-green" />
            Optimasi Rute Logistik Penjemputan
          </h3>
          {selectedLogistics.length > 0 && (
            <button
              onClick={() => {
                setShowRoute(true);
                showNotification(`Menghitung rute penjemputan terdekat untuk ${selectedLogistics.length} lokasi...`, "success");
              }}
              className="bg-nat-green hover:bg-nat-green-hover text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
            >
              Hitung Rute Terdekat
            </button>
          )}
        </div>
        
        {myPreOrders.filter(po => po.status === "COMPLETED").length > 0 ? (
          <div>
            {!showRoute ? (
              <div>
                <p className="text-xs text-nat-sage mb-3">Pilih Pre-Order Lunas yang ingin dijemput dalam satu rute keberangkatan hari ini:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myPreOrders.filter(po => po.status === "COMPLETED").map((po) => (
                    <div 
                      key={`logistics-${po.id}`}
                      className={`border rounded-xl p-3 cursor-pointer transition-colors ${selectedLogistics.includes(po.id) ? 'bg-nat-light-cream/40 border-nat-green' : 'bg-white border-nat-border hover:border-nat-green/50'}`}
                      onClick={() => {
                        setSelectedLogistics(prev => 
                          prev.includes(po.id) 
                            ? prev.filter(id => id !== po.id) 
                            : [...prev, po.id]
                        );
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedLogistics.includes(po.id)} 
                            readOnly 
                            className="mt-1 accent-nat-green"
                          />
                          <div>
                            <div className="text-xs font-bold text-nat-dark">{po.farmerName}</div>
                            <div className="text-[10px] text-nat-sage">{po.commodity} - {po.agreedVolumeKg}Kg</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono bg-nat-light-cream px-1.5 py-0.5 rounded text-nat-sage">{po.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-nat-light-cream/30 border border-nat-green/30 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-nat-dark mb-3">Rekomendasi Urutan Pengambilan:</h4>
                <div className="relative border-l-2 border-nat-green ml-2 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-nat-green"></div>
                    <div className="text-xs font-bold text-nat-dark">Gudang Koperasi (Titik Awal)</div>
                    <div className="text-[10px] text-nat-sage">Berangkat</div>
                  </div>
                  
                  {selectedLogistics.map((poId, index) => {
                    const po = myPreOrders.find(p => p.id === poId);
                    return (
                      <div key={`route-${poId}`} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-nat-green"></div>
                        <div className="text-xs font-bold text-nat-dark">Titik {index + 1}: Lahan Petani {po?.farmerName}</div>
                        <div className="text-[10px] text-nat-sage">Angkut: {po?.commodity} ({po?.agreedVolumeKg}Kg)</div>
                      </div>
                    );
                  })}
                  
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-nat-green"></div>
                    <div className="text-xs font-bold text-nat-dark">Gudang Koperasi (Titik Akhir)</div>
                    <div className="text-[10px] text-nat-sage">Selesai</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowRoute(false);
                    setSelectedLogistics([]);
                  }}
                  className="mt-4 text-xs text-nat-green font-semibold hover:underline"
                >
                  Rencanakan Rute Baru
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-nat-sage italic text-xs">
            Tidak ada PO berstatus Lunas untuk penjemputan logistik.
          </div>
        )}
      </div>

      {/* ───── Route Map Modal ───── */}
      {routeMapPO && (
        <RouteMapModal
          po={routeMapPO}
          harvest={harvests.find(h => h.id === routeMapPO.harvestId)}
          demand={demands.find(d => d.id === routeMapPO.demandId)}
          onClose={() => setRouteMapPO(null)}
        />
      )}
    </div>
  );
}
