/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../context/DataContext";
import { useUI } from "../context/UIContext";
import { COMMODITY_LIST } from "../constants/commodities";
import type { Komoditas, Harvest, Match, PreOrder } from "../types";
import RouteMapModal from "./modals/RouteMapModal";
import RegionAutocomplete from "./RegionAutocomplete";
import {
  Sprout,
  Plus,
  MapPin,
  Calendar,
  BadgeAlert,
  BadgePercent,
  CheckCircle,
  TrendingUp,
  User,
  Activity,
  ChevronRight,
  Phone,
  ArrowRightLeft,
  QrCode,
  Camera,
  Upload,
  Star,
  RefreshCw,
  AlertCircle,
  Trash2,
  Layers,
  MessageCircle,
  Map,
  Send,
  XCircle,
} from "lucide-react";

interface FarmerViewProps {
  mapLat?: number;
  mapLng?: number;
  mapRegion?: string;
  clearMapSelection?: () => void;
  onSelectCoords?: (lat: number, lng: number, region: string) => void;
}

export default function FarmerView({
  mapLat,
  mapLng,
  mapRegion,
  clearMapSelection,
  onSelectCoords,
}: FarmerViewProps) {
  const {
    harvests,
    demands,
    matches,
    preOrders,
    addHarvest,
    updateMatchStatus,
    activeUser,
    createHarvestBatch,
    harvestBatches,
  } = useData();
  const { showNotification } = useUI();

  const [selectedTraceHarvest, setSelectedTraceHarvest] =
    useState<Harvest | null>(null);

  // Bid form modal state (Advanced mode)
  const [bidFormMatch, setBidFormMatch] = useState<Match | null>(null);
  const [bidVolume, setBidVolume] = useState<number>(0);
  const [bidPrice, setBidPrice] = useState<number>(0);

  // Route map modal
  const [routeMapPO, setRouteMapPO] = useState<PreOrder | null>(null);

  // Harvest batch creation modal states
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);
  const [actualVolume, setActualVolume] = useState<number>(0);

  // Form states
  const [commodity, setCommodity] = useState<Komoditas>("Bawang Merah");
  const [landArea, setLandArea] = useState<number>(1.0);
  const [expectedVolume, setExpectedVolume] = useState<number>(10000);
  const [askingPrice, setAskingPrice] = useState<number>(25000);
  const [plantingDate, setPlantingDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [latitude, setLatitude] = useState<number>(-6.871);
  const [longitude, setLongitude] = useState<number>(109.042);
  const [region, setRegion] = useState<string>("Brebes");
  const [notes, setNotes] = useState<string>("");

  // Auto update coordinates and region if selected on map
  useEffect(() => {
    if (mapLat && mapLng && mapRegion) {
      setLatitude(mapLat);
      setLongitude(mapLng);
      setRegion(mapRegion);
      showNotification(
        `Koordinat terpilih dari peta: ${mapLat}, ${mapLng} (${mapRegion})`,
        "info",
      );
    }
  }, [mapLat, mapLng, mapRegion]);

  // Real-time geocoding is now handled by RegionAutocomplete component

  // Handle land area changes to auto-calculate recommended yield
  const handleLandAreaChange = (val: number) => {
    setLandArea(val);
    const metadata = COMMODITY_LIST[commodity];
    if (metadata) {
      setExpectedVolume(Math.round(val * metadata.typicalYieldKgPerHectare));
    }
  };

  // Handle commodity change to auto-update typical price and recommended yield
  const handleCommodityChange = (crop: Komoditas) => {
    setCommodity(crop);
    const metadata = COMMODITY_LIST[crop];
    if (metadata) {
      setAskingPrice(metadata.averagePricePerKg);
      setExpectedVolume(
        Math.round(landArea * metadata.typicalYieldKgPerHectare),
      );
    }
  };

  // Attempt current geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Math.round(position.coords.latitude * 1000) / 1000;
          const lng = Math.round(position.coords.longitude * 1000) / 1000;
          setLatitude(lat);
          setLongitude(lng);
          showNotification("Lokasi GPS Anda berhasil disinkronkan!", "success");
        },
        (error) => {
          showNotification(
            "Gagal mendapatkan lokasi GPS. Silakan tentukan manual atau klik pada peta.",
            "warning",
          );
        },
      );
    } else {
      showNotification("Fitur GPS tidak didukung di peramban ini.", "warning");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto estimate harvest date based on typical duration
    const metadata = COMMODITY_LIST[commodity];
    const pDate = new Date(plantingDate);
    pDate.setDate(pDate.getDate() + metadata.typicalDurationDays);
    const expectedHarvestDate = pDate.toISOString().split("T")[0];

    addHarvest({
      commodity,
      landArea,
      expectedVolume,
      askingPrice,
      latitude,
      longitude,
      region,
      plantingDate,
      expectedHarvestDate,
      isPublished: true,
      notes,
    });

    // Reset coordinates picker if any
    if (clearMapSelection) clearMapSelection();
    setNotes("");
  };

  // Farmer's own harvests — exclude any legacy H-LIVE simulator entries
  const myHarvests = harvests.filter(
    (h) =>
      h.farmerId === activeUser.PETANI.id &&
      !h.id.startsWith("H-LIVE-") &&
      !h.id.startsWith("h-live-"),
  );

  // Matches involving this farmer's harvests (only PENDING & active ones)
  const myMatches = matches.filter((m) => {
    const h = harvests.find((harv) => harv.id === m.harvestId);
    return h?.farmerId === activeUser.PETANI.id;
  });

  // Pre-Orders involving this farmer
  const myPreOrders = preOrders.filter((po) => {
    const h = harvests.find((harv) => harv.id === po.harvestId);
    return h?.farmerId === activeUser.PETANI.id;
  });

  // Open bid form pre-filled with harvest defaults
  const openBidForm = (match: Match) => {
    const h = harvests.find((harv) => harv.id === match.harvestId);
    setBidVolume(h?.expectedVolume ?? 1000);
    setBidPrice(h?.askingPrice ?? 25000);
    setBidFormMatch(match);
  };

  // Submit farmer's bid
  const submitBid = async () => {
    if (!bidFormMatch) return;
    if (bidVolume <= 0 || bidPrice <= 0) {
      showNotification("Volume dan harga harus lebih dari 0", "warning");
      return;
    }
    await updateMatchStatus(bidFormMatch.id, "WAITING_BUYER_APPROVAL", {
      bidVolume,
      bidPrice,
    });
    setBidFormMatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Farmer Profile Status Block */}
      <div className="bg-gradient-to-r from-nat-dark to-nat-green rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-nat-sand text-xs font-bold mb-1">
            <User className="w-3.5 h-3.5" />
            <span>AKUN MITRA PETANI</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Selamat Datang, {activeUser.PETANI.name}
          </h2>
          <p className="text-xs text-nat-light-cream mt-1">
            Wilayah Poktan:{" "}
            <span className="font-semibold text-white">
              {activeUser.PETANI.region}, Jawa Tengah
            </span>{" "}
            | ID Anggota:{" "}
            <span className="font-mono text-nat-sand">#F-0912</span>
          </p>
        </div>

        {/* Ambient loss reduction stats */}
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-nat-light-cream uppercase tracking-wider font-semibold">
              Tanam Sedia
            </p>
            <p className="text-lg font-bold">
              {myHarvests.filter((h) => h.status === "ACTIVE").length} Lahan
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-nat-light-cream uppercase tracking-wider font-semibold">
              Berhasil Sinergi
            </p>
            <p className="text-lg font-bold text-nat-sand">
              {myHarvests.filter((h) => h.status === "MATCHED").length}{" "}
              Transaksi
            </p>
          </div>
        </div>
      </div>

      {/* Weather & Market Alerts */}
      <div className="bg-nat-light-cream border border-nat-border/60 rounded-xl p-4 flex gap-3 text-xs text-amber-900">
        <BadgeAlert className="w-5 h-5 text-nat-brown shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">
            Informasi Cuaca &amp; Panen:
          </p>
          <p className="mt-1 text-nat-brown leading-relaxed">
            Curah hujan tinggi diprediksi melanda wilayah Brebes. Komoditas Bawang Merah yang mendekati masa panen disarankan segera dihubungkan dengan pembeli terdekat!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input Lahan */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-nat-border p-5 shadow-sm flex flex-col space-y-4">
          <div className="pb-2 border-b border-nat-light-cream">
            <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-nat-green" />
              Lapor Lahan & Rencana Tanam
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date field (Shared by both) */}
            <div>
              <label className="block text-xs font-bold text-nat-text mb-1">
                Tanggal Tanam
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
              />
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Komoditas
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
                    Luas Lahan (Ha)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={landArea}
                    onChange={(e) =>
                      handleLandAreaChange(parseFloat(e.target.value) || 0.1)
                    }
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                  />
                </div>
                <div className="bg-nat-light-cream rounded-lg p-2.5 text-[11px] text-nat-green border border-nat-border flex flex-col justify-center">
                  <span className="font-bold block text-[10px] text-nat-sage uppercase tracking-wider">
                    Estimasi Panen
                  </span>
                  <span className="font-bold text-[11px] text-nat-green">
                    {(() => {
                      try {
                        const d = new Date(plantingDate);
                        d.setDate(
                          d.getDate() +
                            COMMODITY_LIST[commodity].typicalDurationDays,
                        );
                        return d.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                      } catch {
                        return "-";
                      }
                    })()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-nat-text mb-1">
                    Estimasi Hasil (Kg)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={expectedVolume}
                    onChange={(e) =>
                      setExpectedVolume(parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green font-bold"
                  />
                  <span className="text-[10px] text-nat-sage font-medium">
                    Saran: Rata-rata komoditas
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-nat-text mb-1">
                    Harga Harapan (Rp/Kg)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    value={askingPrice}
                    onChange={(e) =>
                      setAskingPrice(parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green font-bold"
                  />
                  <span className="text-[10px] text-nat-sage font-medium">
                    HPP Acuan: Rp
                    {COMMODITY_LIST[commodity].averagePricePerKg.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinates / Map Selection Section */}
            <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-nat-dark flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-nat-brown" />
                  Koordinat Lahan
                </span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-[10px] text-nat-green font-bold hover:text-nat-green-hover cursor-pointer"
                >
                  Gunakan GPS HP
                </button>
              </div>

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

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-nat-sage font-semibold block mb-0.5">
                    Wilayah / Kabupaten
                  </span>
                  <RegionAutocomplete
                    value={region}
                    onChange={(val) => setRegion(val)}
                    onSelect={(lat, lng, name) => {
                      setLatitude(lat);
                      setLongitude(lng);
                      if (onSelectCoords) {
                        onSelectCoords(lat, lng, name);
                      }
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-[9px] text-nat-sage font-medium italic leading-snug">
                    *Ketik daerah atau klik peta untuk menggeser lokasi &amp; zoom
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-nat-text mb-1">
                Catatan Kondisi Lahan & Mutu
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Sudah diasuransikan, butuh penjemputan armada..."
                rows={2}
                className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
              />
            </div>

            <button
              type="submit"
              id="add-harvest-btn"
              className="w-full bg-nat-green hover:bg-nat-green-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-nat-green/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              Laporkan Rencana Tanam
            </button>
          </form>
        </div>

        {/* Lahan Saya & Hasil Pencocokan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lahan Saya */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-nat-green" />
              Laporan Lahan Aktif Saya ({myHarvests.length})
            </h3>

            {myHarvests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-nat-text">
                  <thead>
                    <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2">Komoditas</th>
                      <th className="py-2">Luas & Estimasi Yield</th>
                      <th className="py-2">Estimasi Panen</th>
                      <th className="py-2">Hrg Harapan</th>
                      <th className="py-2">Sertifikat QR</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHarvests.map((h) => {
                      const crop = COMMODITY_LIST[h.commodity];
                      return (
                        <tr
                          key={h.id}
                          className="border-b border-nat-light-cream hover:bg-nat-light-cream/35 transition-colors"
                        >
                          <td className="py-3 font-bold text-nat-dark">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: crop.color }}
                              />
                              {h.commodity}
                            </div>
                          </td>
                          <td className="py-3 text-nat-text">
                            <div>{h.landArea} Ha</div>
                            <div className="text-[10px] text-nat-sage font-semibold">
                              {h.expectedVolume.toLocaleString("id-ID")} Kg
                            </div>
                          </td>
                          <td className="py-3 text-nat-text">
                            <div className="font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-nat-sage" />
                              {h.expectedHarvestDate}
                            </div>
                            <div className="text-[10px] text-nat-sage">
                              Tanam: {h.plantingDate}
                            </div>
                          </td>
                          <td className="py-3 font-bold text-nat-dark">
                            Rp{h.askingPrice.toLocaleString("id-ID")}/Kg
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => setSelectedTraceHarvest(h)}
                              className="px-2 py-1 rounded-lg bg-nat-light-cream hover:bg-nat-cream border border-nat-border text-nat-green-hover font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                              title="Lihat QR Code & Sertifikat Blockchain"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>QR Trace</span>
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  h.status === "ACTIVE"
                                    ? "bg-nat-light-cream text-nat-green border-nat-border"
                                    : h.status === "MATCHED"
                                      ? "bg-nat-cream text-nat-brown border-nat-border"
                                      : h.status === "HARVESTED"
                                        ? "bg-nat-cream text-nat-green-hover border-nat-border"
                                        : "bg-nat-slate text-nat-text border-nat-border"
                                }`}
                              >
                                {h.status === "ACTIVE"
                                  ? "Aktif"
                                  : h.status === "MATCHED"
                                    ? "Terhubung"
                                    : h.status === "HARVESTED"
                                      ? "Dipanen"
                                      : h.status}
                              </span>
                              {(h.status === "ACTIVE" ||
                                h.status === "MATCHED") && (
                                <button
                                  onClick={() => {
                                    setHarvestingId(h.id);
                                    setActualVolume(h.expectedVolume);
                                    setShowHarvestModal(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-nat-light-cream hover:bg-nat-cream border border-nat-border text-amber-700 font-bold text-[9px] transition-all flex items-center gap-1 cursor-pointer"
                                  title="Tandai sebagai sudah panen & buat batch kirim"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Siap Kirim
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-nat-sage italic">
                Belum ada laporan rencana tanam. Silakan gunakan form sebelah
                kiri untuk melapor.
              </div>
            )}
          </div>

          {/* Pencocokan Cerdas & Pre-Order */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-light-cream">
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-nat-green" />
                Rekomendasi Pembeli Terdekat (Skor Match Cerdas)
              </h3>
              <span className="text-[10px] bg-nat-light-cream text-nat-green border border-nat-border font-bold px-2.5 py-0.5 rounded-full">
                {myMatches.length} Penawaran Cocok
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
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      key={match.id}
                      className={`border rounded-xl p-4 transition-all ${
                        match.status !== "PENDING"
                          ? "border-nat-border bg-nat-light-cream/40"
                          : "border-nat-border hover:border-nat-sage/50 bg-white hover:shadow-sm"
                      }`}
                      id={`match-card-${match.id}`}
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
                            {demand.buyerName}
                          </h4>
                          <span className="text-[10px] text-nat-sage font-medium">
                            • Wilayah: {demand.region}
                          </span>
                        </div>

                        {/* Matching Score Circle Badge */}
                        <div className="flex items-center space-x-1">
                          <BadgePercent className="w-3.5 h-3.5 text-nat-green" />
                          <span className="text-xs font-bold text-nat-sage">
                            Kecocokan:{" "}
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
                        </div>
                      </div>

                      {/* Matching breakdown criteria */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-nat-light-cream p-2.5 rounded-lg text-[11px] mb-3 text-nat-text border border-nat-border">
                        {/* 1. Jarak */}
                        <div>
                          <p className="text-nat-sage font-bold uppercase text-[9px]">
                            Jarak Logistik
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
                            {harvest.expectedVolume.toLocaleString("id-ID")} Kg
                            / {demand.requiredVolume.toLocaleString("id-ID")} Kg
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
                            Kesesuaian Harga
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

                      {demand.notes && (
                        <p className="text-[11px] text-nat-text italic mb-3 bg-nat-light-cream/50 p-2 rounded border border-nat-border">
                          "Catatan Buyer: {demand.notes}"
                        </p>
                      )}

                      {/* Matching action workflow */}
                      <div className="flex justify-between items-center pt-2 border-t border-nat-border">
                        <div className="text-[10px] text-nat-sage font-medium">
                          Batas Kebutuhan Buyer:{" "}
                          <span className="font-semibold text-nat-text">
                            {demand.dateRequired}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <AnimatePresence mode="wait">
                            {match.status === "PENDING" ? (
                              <motion.button
                                key="pending"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                id={`bid-btn-farmer-${match.id}`}
                                onClick={() => openBidForm(match)}
                                className="bg-nat-green hover:bg-nat-green-hover text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Ajukan Penawaran</span>
                              </motion.button>
                            ) : match.status === "WAITING_BUYER_APPROVAL" ? (
                              <motion.div
                                key="waiting"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="flex flex-col items-end gap-1"
                              >
                                <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span>Menunggu Persetujuan Pembeli</span>
                                </div>
                                {match.bidVolume && match.bidPrice && (
                                  <span className="text-[10px] text-nat-sage">
                                    Penawaran: {match.bidVolume.toLocaleString("id-ID")} kg @ Rp{match.bidPrice.toLocaleString("id-ID")}/kg
                                  </span>
                                )}
                              </motion.div>
                            ) : match.status === "REJECTED" ? (
                              <motion.div
                                key="rejected"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-end gap-1.5"
                              >
                                <div className="flex items-center space-x-1.5 text-red-700 font-bold text-[11px] bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                                  <span>Penawaran Ditolak</span>
                                </div>
                                <button
                                  onClick={() => {
                                    updateMatchStatus(match.id, "PENDING");
                                    openBidForm(match);
                                  }}
                                  className="text-[10px] text-nat-green hover:underline font-semibold cursor-pointer"
                                >
                                  Ajukan ulang penawaran →
                                </button>
                              </motion.div>
                            ) : match.status === "CONFIRMED" ? (
                              <motion.div
                                key="confirmed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center space-x-1.5 text-nat-green font-bold text-[11px] bg-nat-light-cream px-2.5 py-1 rounded-lg border border-nat-border"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Kontrak Sepakat ✓</span>
                              </motion.div>
                            ) : (
                              <motion.span
                                key="other"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-nat-sage text-xs font-semibold"
                              >
                                {match.status}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-nat-sage italic text-xs">
                Belum ada komoditas panen aktif Anda yang cocok dengan kebutuhan
                pembeli saat ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daftar Pre-Order Aktif (PO) Petani */}
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-nat-green" />
          Daftar Kontrak Transaksi (PO) Anda ({myPreOrders.length})
        </h3>
        
        {myPreOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-nat-text">
              <thead>
                <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">PO ID / Koperasi</th>
                  <th className="py-2">Komoditas</th>
                  <th className="py-2">Volume & Harga</th>
                  <th className="py-2">Total Pendapatan</th>
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
                        <div className="font-bold text-nat-dark">{po.buyerName}</div>
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
                              Menunggu Pelunasan
                            </span>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                             <a
                              href={(() => {
                                // Ambil nomor WA pembeli dari activeUser jika yang login adalah pembeli tersebut
                                const buyerPhone = activeUser.PEMBELI?.phone || "62";
                                const msg = `Halo Koperasi ${encodeURIComponent(po.buyerName)}, saya petani ${po.farmerName}. Terkait PO ${po.commodity} seberat ${po.agreedVolumeKg}Kg dengan harga Rp${po.agreedPricePerKg.toLocaleString('id-ID')}/Kg.`;
                                return `https://wa.me/${buyerPhone}?text=${encodeURIComponent(msg)}`;
                              })()}
                               target="_blank"
                               rel="noreferrer"
                               className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                             >
                               <MessageCircle className="w-3 h-3" />
                               Chat Pembeli
                             </a>
                            
                            {/* Lihat Rute — muncul saat PO CONFIRMED atau COMPLETED */}
                            {(po.status === "CONFIRMED" || po.status === "COMPLETED") && (
                              <button
                                onClick={() => setRouteMapPO(po)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Map className="w-3 h-3" />
                                Lihat Rute
                              </button>
                            )}

                            {po.status === "COMPLETED" && (
                              <button
                                onClick={() => showNotification("Terima kasih, ulasan Anda telah disimpan!", "success")}
                                className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Star className="w-3 h-3" />
                                Lihat Rating
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

      {/* Harvest Batch Creation Modal */}
      <AnimatePresence>
        {showHarvestModal && harvestingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowHarvestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-nat-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-nat-dark mb-1 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-nat-green" />
                Tandai Panen Selesai & Buat Batch Distribusi
              </h3>
              <p className="text-[11px] text-nat-sage mb-4">
                Konfirmasi volume aktual panen. Sistem akan menghitung skor
                prioritas distribusi berdasarkan umur simpan komoditas.
              </p>
              {(() => {
                const h = harvests.find((x) => x.id === harvestingId);
                const crop = h ? COMMODITY_LIST[h.commodity] : null;
                return (
                  <div className="space-y-4">
                    <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border text-xs text-nat-text">
                      <p className="font-bold text-nat-dark">
                        {h?.commodity} — {h?.farmerName}
                      </p>
                      <p className="text-nat-sage mt-0.5">
                        Estimasi: {h?.expectedVolume.toLocaleString("id-ID")} Kg
                        | Umur Simpan: {crop?.shelfLifeDays} hari
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nat-text mb-1">
                        Volume Aktual Panen (Kg)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={actualVolume}
                        onChange={(e) =>
                          setActualVolume(parseInt(e.target.value) || 0)
                        }
                        className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-sm font-bold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHarvestModal(false)}
                        className="flex-1 py-2 rounded-xl bg-nat-light-cream text-nat-text text-xs font-bold border border-nat-border hover:bg-nat-cream transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => {
                          if (harvestingId && actualVolume > 0) {
                            createHarvestBatch(harvestingId, actualVolume);
                            setShowHarvestModal(false);
                            setHarvestingId(null);
                          }
                        }}
                        className="flex-1 py-2 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
                      >
                        Konfirmasi Siap Kirim
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Bid Form Modal (Advanced — Petani isi volume & harga penawaran) ───── */}
      <AnimatePresence>
        {bidFormMatch && (() => {
          const h = harvests.find(hv => hv.id === bidFormMatch.harvestId);
          const d = demands.find(dm => dm.id === bidFormMatch.demandId);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setBidFormMatch(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-nat-dark to-nat-green text-white px-5 py-4">
                  <h3 className="font-bold text-sm">📤 Ajukan Penawaran ke Pembeli</h3>
                  <p className="text-green-100 text-xs mt-0.5">
                    {h?.commodity} · {h?.region} → {d?.buyerName}
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Info permintaan pembeli */}
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs">
                    <p className="font-bold text-blue-700 mb-1">📋 Permintaan Pembeli</p>
                    <div className="grid grid-cols-2 gap-2 text-blue-800">
                      <span>Volume dibutuhkan</span><span className="font-semibold">{d?.requiredVolume?.toLocaleString("id-ID")} kg</span>
                      <span>Harga ditawarkan</span><span className="font-semibold">Rp{d?.offerPrice?.toLocaleString("id-ID")}/kg</span>
                    </div>
                  </div>

                  {/* Volume penawaran */}
                  <div>
                    <label className="block text-xs font-bold text-nat-dark mb-1.5">
                      Volume yang Anda Tawarkan (kg)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={h?.expectedVolume}
                      value={bidVolume}
                      onChange={e => setBidVolume(Number(e.target.value))}
                      className="w-full border border-nat-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nat-green"
                    />
                    <p className="text-[10px] text-nat-sage mt-1">Estimasi produksi: {h?.expectedVolume?.toLocaleString("id-ID")} kg</p>
                  </div>

                  {/* Harga penawaran */}
                  <div>
                    <label className="block text-xs font-bold text-nat-dark mb-1.5">
                      Harga per kg yang Anda Minta (Rp)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bidPrice}
                      onChange={e => setBidPrice(Number(e.target.value))}
                      className="w-full border border-nat-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nat-green"
                    />
                    <p className="text-[10px] text-nat-sage mt-1">Harga pasar saat ini: Rp{h?.askingPrice?.toLocaleString("id-ID")}/kg</p>
                  </div>

                  {/* Total estimasi */}
                  <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border">
                    <p className="text-[10px] text-nat-sage font-medium uppercase tracking-wider mb-1">Estimasi Total Nilai</p>
                    <p className="text-lg font-bold text-nat-green">
                      Rp{(bidVolume * bidPrice).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBidFormMatch(null)}
                      className="flex-1 py-2 rounded-xl border border-nat-border text-nat-text text-xs font-bold hover:bg-nat-light-cream transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={submitBid}
                      className="flex-1 py-2 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Kirim Penawaran
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

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
